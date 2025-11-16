/**
 * GoPay Payment Gateway Integration - Server-side only
 * 
 * This module contains server-side GoPay functions that use Firebase Admin SDK.
 * DO NOT import this file in client-side code!
 * 
 * Documentation: https://doc.gopay.com/
 */

import { getAdminDb } from '@/config/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

// Re-export config from main gopay file
export { GOPAY_CONFIG } from './gopay'
export type { CheckoutSessionParams, GoPayPayment } from './gopay'

/**
 * Get OAuth2 Access Token from GoPay
 * Required for all API calls
 */
async function getAccessToken(scope: 'payment-create' | 'payment-all' = 'payment-all'): Promise<string> {
  const { GOPAY_CONFIG } = await import('./gopay')

  // Validate credentials
  if (!GOPAY_CONFIG.clientId || !GOPAY_CONFIG.clientSecret) {
    console.error('❌ Missing GoPay credentials:', {
      hasClientId: !!GOPAY_CONFIG.clientId,
      hasClientSecret: !!GOPAY_CONFIG.clientSecret,
      environment: GOPAY_CONFIG.environment
    })
    throw new Error('Chybí GoPay credentials. Zkontrolujte environment variables.')
  }

  console.log('🔑 Getting GoPay access token...', {
    clientId: GOPAY_CONFIG.clientId,
    environment: GOPAY_CONFIG.environment,
    apiUrl: GOPAY_CONFIG.apiUrl,
    scope
  })

  const credentials = Buffer.from(`${GOPAY_CONFIG.clientId}:${GOPAY_CONFIG.clientSecret}`).toString('base64')

  const response = await fetch(`${GOPAY_CONFIG.apiUrl}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`
    },
    body: `grant_type=client_credentials&scope=${scope}`
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('❌ GoPay OAuth error:', {
      status: response.status,
      statusText: response.statusText,
      error
    })
    throw new Error(`Nepodařilo se získat přístupový token: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  console.log('✅ GoPay access token obtained')
  return data.access_token
}

/**
 * Create GoPay Payment (Server-side)
 * This is called from the API route
 */
export async function createGoPayPaymentServer(params: {
  userId: string
  userEmail: string
  plan: 'premium_monthly' | 'premium_yearly'
  successUrl: string
  cancelUrl: string
}): Promise<any> {
  const { userId, userEmail, plan, successUrl, cancelUrl } = params
  const { GOPAY_CONFIG } = await import('./gopay')
  const product = GOPAY_CONFIG.products[plan]

  // Get access token
  const accessToken = await getAccessToken('payment-create')

  // Prepare payment data
  const paymentData: any = {
    payer: {
      default_payment_instrument: 'PAYMENT_CARD',
      allowed_payment_instruments: ['PAYMENT_CARD', 'BANK_ACCOUNT'],
      contact: {
        email: userEmail
      }
    },
    target: {
      type: 'ACCOUNT',
      goid: GOPAY_CONFIG.goId
    },
    amount: product.amount,
    currency: product.currency,
    order_number: `${userId}_${Date.now()}`,
    order_description: product.name,
    items: [
      {
        name: product.name,
        amount: product.amount,
        count: 1
      }
    ],
    callback: {
      return_url: successUrl,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://svatbot.cz'}/api/gopay/webhook`
    },
    lang: 'CS',
    additional_params: [
      {
        name: 'userId',
        value: userId
      },
      {
        name: 'plan',
        value: plan
      }
    ]
  }

  console.log('💳 Creating GoPay payment with data:', {
    goId: GOPAY_CONFIG.goId,
    amount: product.amount,
    currency: product.currency,
    plan,
    apiUrl: GOPAY_CONFIG.apiUrl
  })

  // Add recurrence for monthly subscription (automatic recurring payments)
  if (plan === 'premium_monthly') {
    paymentData.recurrence = {
      recurrence_cycle: 'MONTH',      // Monthly cycle
      recurrence_period: 1,            // Every 1 month
      recurrence_date_to: '2099-12-31' // Valid until end of century
    }
    console.log('🔄 Setting up automatic recurring payment for monthly subscription')
  } else {
    console.log('💰 One-time payment for yearly subscription')
  }

  // Create payment
  console.log('📤 Sending payment request to GoPay API...')
  const response = await fetch(`${GOPAY_CONFIG.apiUrl}/payments/payment`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(paymentData)
  })

  const responseText = await response.text()
  console.log('📥 GoPay API response:', {
    status: response.status,
    statusText: response.statusText,
    body: responseText
  })

  if (!response.ok) {
    console.error('❌ GoPay payment creation error:', {
      status: response.status,
      statusText: response.statusText,
      error: responseText
    })

    // Try to parse error details
    let errorDetails = responseText
    try {
      const errorJson = JSON.parse(responseText)
      errorDetails = JSON.stringify(errorJson, null, 2)
    } catch (e) {
      // Keep as text if not JSON
    }

    throw new Error(`GoPay API error (${response.status}): ${errorDetails}`)
  }

  const payment = JSON.parse(responseText)
  console.log('✅ Payment created:', { id: payment.id, state: payment.state })

  // Store payment info in Firestore using Admin SDK
  const adminDb = getAdminDb()
  const paymentDoc: any = {
    userId,
    userEmail,
    goPayId: payment.id,
    orderNumber: payment.order_number,
    amount: product.amount, // Store in cents (haléře) for consistency
    currency: product.currency,
    status: 'pending',
    plan,
    createdAt: Timestamp.now()
  }

  // Mark if this payment has recurrence (for easier cancellation later)
  if (plan === 'premium_monthly') {
    paymentDoc.hasRecurrence = true
    console.log('📌 Marking payment as having recurrence')
  }

  await adminDb.collection('payments').add(paymentDoc)

  return payment
}

/**
 * Get payment status from GoPay
 */
export async function getPaymentStatus(paymentId: number): Promise<any> {
  const accessToken = await getAccessToken('payment-all')
  const { GOPAY_CONFIG } = await import('./gopay')

  const response = await fetch(`${GOPAY_CONFIG.apiUrl}/payments/payment/${paymentId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('GoPay payment status error:', error)
    throw new Error('Nepodařilo se získat stav platby')
  }

  return await response.json()
}

/**
 * Cancel/Refund a payment
 */
export async function refundPayment(paymentId: number, amount?: number): Promise<void> {
  const accessToken = await getAccessToken('payment-all')
  const { GOPAY_CONFIG } = await import('./gopay')

  const refundData = amount ? { amount } : {}

  const response = await fetch(`${GOPAY_CONFIG.apiUrl}/payments/payment/${paymentId}/refund`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(refundData)
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('GoPay refund error:', error)
    throw new Error('Nepodařilo se vrátit platbu')
  }
}

/**
 * Stop recurring payments for a payment
 * This cancels all future automatic recurring payments
 */
export async function stopRecurrence(paymentId: number): Promise<void> {
  const accessToken = await getAccessToken('payment-all')
  const { GOPAY_CONFIG } = await import('./gopay')

  console.log('🛑 Stopping recurrence for payment:', paymentId)

  const response = await fetch(`${GOPAY_CONFIG.apiUrl}/payments/payment/${paymentId}/void_recurrence`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('GoPay stop recurrence error:', {
      status: response.status,
      statusText: response.statusText,
      error
    })

    // Try to parse error details
    let errorMessage = error
    try {
      const errorJson = JSON.parse(error)
      errorMessage = JSON.stringify(errorJson, null, 2)
    } catch (e) {
      // Keep as text if not JSON
    }

    throw new Error(`GoPay API error (${response.status}): ${errorMessage}`)
  }

  const result = await response.text()
  console.log('✅ Recurrence stopped successfully:', result)
}

