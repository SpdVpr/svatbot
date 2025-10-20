/**
 * Stripe Integration Module
 * 
 * This module provides Stripe payment integration for the application.
 * Currently configured for mock/test mode - ready for production Stripe integration.
 * 
 * To enable real Stripe:
 * 1. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local
 * 2. Install Stripe Firebase Extension
 * 3. Configure Stripe products in Stripe Dashboard
 * 4. Update createCheckoutSession to use real Stripe API
 */

import { db } from '@/config/firebase'
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore'

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock',
  enabled: true, // ✅ ENABLED - Using real Stripe in test mode

  // Product IDs (will be set after running setup-stripe-products.js)
  products: {
    premium_monthly: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_premium_monthly_mock',
      amount: 299,
      currency: 'CZK',
      interval: 'month'
    },
    premium_yearly: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || 'price_premium_yearly_mock',
      amount: 2999,
      currency: 'CZK',
      interval: 'year'
    }
  }
}

export interface CheckoutSessionParams {
  userId: string
  userEmail: string
  plan: 'premium_monthly' | 'premium_yearly'
  successUrl: string
  cancelUrl: string
}

/**
 * Create a Stripe Checkout Session
 *
 * Calls the Next.js API route to create a Stripe Checkout Session
 * and returns the URL to redirect the user to Stripe
 */
export async function createCheckoutSession(params: CheckoutSessionParams): Promise<string> {
  const { userId, userEmail, plan, successUrl, cancelUrl } = params

  if (!STRIPE_CONFIG.enabled) {
    // Mock mode - simulate checkout
    console.log('🔄 Mock Stripe Checkout:', { userId, plan })
    return simulateMockCheckout(params)
  }

  // Real Stripe integration
  try {
    console.log('🔄 Creating Stripe Checkout Session:', { userId, plan })

    const response = await fetch('/api/stripe/create-checkout-session', {
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
      throw new Error(error.error || 'Failed to create checkout session')
    }

    const data = await response.json()

    if (!data.url) {
      throw new Error('No checkout URL returned')
    }

    console.log('✅ Checkout session created:', data.sessionId)
    return data.url
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw new Error('Nepodařilo se vytvořit platební session')
  }
}

/**
 * Simulate mock checkout for testing
 * This creates mock payment and subscription records
 */
async function simulateMockCheckout(params: CheckoutSessionParams): Promise<string> {
  const { userId, userEmail, plan, successUrl } = params
  const product = STRIPE_CONFIG.products[plan]
  
  try {
    // Create mock payment record
    const paymentRef = await addDoc(collection(db, 'payments'), {
      userId,
      userEmail,
      subscriptionId: userId, // Using userId as subscription ID for simplicity
      amount: product.amount,
      currency: product.currency,
      status: 'succeeded',
      paymentMethod: 'card',
      last4: '4242',
      plan,
      invoiceNumber: `INV-${Date.now()}`,
      invoiceUrl: null,
      stripePaymentIntentId: `pi_mock_${Date.now()}`,
      stripeInvoiceId: `in_mock_${Date.now()}`,
      createdAt: Timestamp.now(),
      paidAt: Timestamp.now()
    })
    
    // Update subscription
    const now = new Date()
    const periodEnd = new Date(now)
    if (product.interval === 'month') {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    }
    
    const subscriptionRef = doc(db, 'subscriptions', userId)
    await updateDoc(subscriptionRef, {
      plan,
      status: 'active',
      amount: product.amount,
      currency: product.currency,
      currentPeriodStart: Timestamp.fromDate(now),
      currentPeriodEnd: Timestamp.fromDate(periodEnd),
      isTrialActive: false,
      cancelAtPeriodEnd: false,
      stripeCustomerId: `cus_mock_${userId}`,
      stripeSubscriptionId: `sub_mock_${Date.now()}`,
      updatedAt: Timestamp.now()
    })
    
    console.log('✅ Mock payment created:', paymentRef.id)
    
    // Return success URL with mock session ID
    return `${successUrl}?session_id=mock_${paymentRef.id}`
  } catch (error) {
    console.error('Error simulating mock checkout:', error)
    throw new Error('Nepodařilo se vytvořit mock platbu')
  }
}

/**
 * Cancel a subscription
 *
 * Marks the subscription to cancel at the end of the current period
 */
export async function cancelSubscription(userId: string, subscriptionId: string): Promise<void> {
  if (!STRIPE_CONFIG.enabled) {
    // Mock mode
    console.log('🔄 Mock cancel subscription:', { userId, subscriptionId })

    const subscriptionRef = doc(db, 'subscriptions', userId)
    await updateDoc(subscriptionRef, {
      cancelAtPeriodEnd: true,
      canceledAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    return
  }

  // Real Stripe integration
  try {
    console.log('🔄 Canceling Stripe subscription:', { userId, subscriptionId })

    // Call Stripe API via Next.js API route
    const response = await fetch('/api/stripe/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        subscriptionId
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to cancel subscription')
    }

    console.log('✅ Subscription canceled')

    // Update Firestore
    const subscriptionRef = doc(db, 'subscriptions', userId)
    await updateDoc(subscriptionRef, {
      cancelAtPeriodEnd: true,
      canceledAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw new Error('Nepodařilo se zrušit předplatné')
  }
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(userId: string, subscriptionId: string): Promise<void> {
  if (!STRIPE_CONFIG.enabled) {
    // Mock mode
    console.log('🔄 Mock reactivate subscription:', { userId, subscriptionId })

    const subscriptionRef = doc(db, 'subscriptions', userId)
    await updateDoc(subscriptionRef, {
      cancelAtPeriodEnd: false,
      canceledAt: null,
      updatedAt: Timestamp.now()
    })

    return
  }

  // Real Stripe integration
  try {
    console.log('🔄 Reactivating Stripe subscription:', { userId, subscriptionId })

    // Call Stripe API via Next.js API route
    const response = await fetch('/api/stripe/reactivate-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        subscriptionId
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to reactivate subscription')
    }

    console.log('✅ Subscription reactivated')

    // Update Firestore
    const subscriptionRef = doc(db, 'subscriptions', userId)
    await updateDoc(subscriptionRef, {
      cancelAtPeriodEnd: false,
      canceledAt: null,
      updatedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error reactivating subscription:', error)
    throw new Error('Nepodařilo se obnovit předplatné')
  }
}

/**
 * Get customer portal URL
 * 
 * In production, this creates a Stripe Customer Portal session
 * where users can manage their subscription, payment methods, and invoices
 */
export async function getCustomerPortalUrl(userId: string, returnUrl: string): Promise<string> {
  if (!STRIPE_CONFIG.enabled) {
    // Mock mode - return to account page
    return returnUrl
  }
  
  // Real Stripe integration (when enabled)
  // This would create a Stripe Customer Portal session
  throw new Error('Real Stripe integration not yet enabled')
}

/**
 * Webhook handler for Stripe events
 * 
 * This should be called from a Next.js API route or Firebase Function
 * to handle Stripe webhook events
 */
export async function handleStripeWebhook(event: any): Promise<void> {
  console.log('📥 Stripe webhook event:', event.type)
  
  switch (event.type) {
    case 'checkout.session.completed':
      // Handle successful checkout
      break
      
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      // Handle subscription changes
      break
      
    case 'customer.subscription.deleted':
      // Handle subscription cancellation
      break
      
    case 'invoice.payment_succeeded':
      // Handle successful payment
      break
      
    case 'invoice.payment_failed':
      // Handle failed payment
      break
      
    default:
      console.log('Unhandled event type:', event.type)
  }
}

