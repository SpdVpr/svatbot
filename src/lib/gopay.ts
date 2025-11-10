/**
 * GoPay Payment Gateway Integration
 *
 * This module provides GoPay payment integration for the application.
 * Supports both test and production environments.
 *
 * Documentation: https://doc.gopay.com/
 * Help: https://help.gopay.com/cs/tema/integrace-platebni-brany
 *
 * NOTE: This file contains both client-side and server-side code.
 * Server-side functions use dynamic imports to avoid bundling issues.
 */

// GoPay configuration
export const GOPAY_CONFIG = {
  goId: process.env.NEXT_PUBLIC_GOPAY_GOID || '8340144076',
  clientId: process.env.NEXT_PUBLIC_GOPAY_CLIENT_ID || '1510449039',
  clientSecret: process.env.GOPAY_CLIENT_SECRET || 'h4trTFwx',
  environment: (process.env.NEXT_PUBLIC_GOPAY_ENVIRONMENT || 'production') as 'test' | 'production',
  
  // API URLs
  get apiUrl() {
    return this.environment === 'production' 
      ? 'https://gate.gopay.cz/api'
      : 'https://gw.sandbox.gopay.com/api'
  },
  
  get gatewayUrl() {
    return this.environment === 'production'
      ? 'https://gate.gopay.cz/gp-gw/js/embed.js'
      : 'https://gw.sandbox.gopay.com/gp-gw/js/embed.js'
  },

  // Product pricing
  products: {
    premium_monthly: {
      amount: 29900, // 299 CZK in cents
      currency: 'CZK',
      interval: 'month',
      name: 'Premium Měsíční'
    },
    premium_yearly: {
      amount: 299900, // 2999 CZK in cents
      currency: 'CZK',
      interval: 'year',
      name: 'Premium Roční'
    },
    test_daily: {
      amount: 1000, // 10 CZK in cents
      currency: 'CZK',
      interval: 'day',
      name: 'Test Denní'
    }
  }
}

export interface CheckoutSessionParams {
  userId: string
  userEmail: string
  plan: 'premium_monthly' | 'premium_yearly' | 'test_daily'
  successUrl: string
  cancelUrl: string
}

export interface GoPayAccessToken {
  token_type: string
  access_token: string
  expires_in: number
}

export interface GoPayPayment {
  id: number
  order_number: string
  state: string
  amount: number
  currency: string
  payer?: {
    payment_card?: {
      card_number?: string
    }
  }
  gw_url: string
}

/**
 * Get OAuth2 Access Token from GoPay
 * Required for all API calls
 */
async function getAccessToken(scope: 'payment-create' | 'payment-all' = 'payment-all'): Promise<string> {
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
    console.error('GoPay OAuth error:', error)
    throw new Error('Nepodařilo se získat přístupový token')
  }

  const data: GoPayAccessToken = await response.json()
  return data.access_token
}

/**
 * Create a GoPay Payment
 * 
 * Creates a payment in GoPay system and returns payment URL
 */
export async function createGoPayPayment(params: CheckoutSessionParams): Promise<string> {
  const { userId, userEmail, plan, successUrl, cancelUrl } = params
  const product = GOPAY_CONFIG.products[plan]

  try {
    console.log('🔄 Creating GoPay payment:', { userId, plan })

    // Call our API route to create payment
    const response = await fetch('/api/gopay/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        userEmail,
        plan,
        successUrl,
        cancelUrl
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create payment')
    }

    const data = await response.json()

    if (!data.gw_url) {
      throw new Error('No payment URL returned')
    }

    console.log('✅ GoPay payment created:', data.id)
    return data.gw_url
  } catch (error) {
    console.error('Error creating GoPay payment:', error)
    throw new Error('Nepodařilo se vytvořit platbu')
  }
}

// Note: Server-side functions (createGoPayPaymentServer, getPaymentStatus, refundPayment)
// have been moved to gopay-server.ts to avoid bundling Firebase Admin SDK in client code

