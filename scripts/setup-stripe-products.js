/**
 * Setup Stripe Products and Prices
 * 
 * This script creates the necessary products and prices in Stripe
 * Run with: node scripts/setup-stripe-products.js
 */

const Stripe = require('stripe')
require('dotenv').config({ path: '.env.local' })

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover'
})

async function setupProducts() {
  console.log('🚀 Setting up Stripe products...\n')

  try {
    // 1. Create Premium Monthly Product
    console.log('📦 Creating Premium Monthly product...')
    const monthlyProduct = await stripe.products.create({
      name: 'SvatBot Premium - Měsíční',
      description: 'Měsíční předplatné SvatBot Premium s přístupem ke všem funkcím',
      metadata: {
        plan: 'premium_monthly',
        app: 'svatbot'
      }
    })
    console.log('✅ Product created:', monthlyProduct.id)

    // Create price for monthly product
    const monthlyPrice = await stripe.prices.create({
      product: monthlyProduct.id,
      unit_amount: 29900, // 299 CZK in cents
      currency: 'czk',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan: 'premium_monthly'
      }
    })
    console.log('✅ Price created:', monthlyPrice.id)
    console.log('   Amount: 299 CZK/month\n')

    // 2. Create Premium Yearly Product
    console.log('📦 Creating Premium Yearly product...')
    const yearlyProduct = await stripe.products.create({
      name: 'SvatBot Premium - Roční',
      description: 'Roční předplatné SvatBot Premium s přístupem ke všem funkcím (úspora 589 Kč)',
      metadata: {
        plan: 'premium_yearly',
        app: 'svatbot'
      }
    })
    console.log('✅ Product created:', yearlyProduct.id)

    // Create price for yearly product
    const yearlyPrice = await stripe.prices.create({
      product: yearlyProduct.id,
      unit_amount: 299900, // 2999 CZK in cents
      currency: 'czk',
      recurring: {
        interval: 'year'
      },
      metadata: {
        plan: 'premium_yearly'
      }
    })
    console.log('✅ Price created:', yearlyPrice.id)
    console.log('   Amount: 2999 CZK/year\n')

    // 3. Print summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ Setup complete!\n')
    console.log('📋 Add these to your .env.local:\n')
    console.log(`STRIPE_PRICE_MONTHLY=${monthlyPrice.id}`)
    console.log(`STRIPE_PRICE_YEARLY=${yearlyPrice.id}\n`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // 4. Update stripe.ts config
    console.log('📝 Update src/lib/stripe.ts with these Price IDs:')
    console.log(`
products: {
  premium_monthly: {
    priceId: '${monthlyPrice.id}',
    amount: 299,
    currency: 'CZK',
    interval: 'month'
  },
  premium_yearly: {
    priceId: '${yearlyPrice.id}',
    amount: 2999,
    currency: 'CZK',
    interval: 'year'
  }
}
`)

  } catch (error) {
    console.error('❌ Error setting up products:', error.message)
    process.exit(1)
  }
}

setupProducts()

