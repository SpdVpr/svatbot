import { NextRequest, NextResponse } from 'next/server'
import { getPaymentStatus } from '@/lib/gopay-server'
import { getAdminDb } from '@/config/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import { getNextInvoiceNumber, generateVariableSymbol } from '@/lib/invoiceNumbering'

/**
 * GoPay Webhook Handler
 * 
 * This endpoint receives notifications from GoPay when payment status changes
 * URL format: /api/gopay/webhook?id=<payment_id>
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const paymentId = searchParams.get('id')
    const parentId = searchParams.get('parent_id') // For recurring payments

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Missing payment ID' },
        { status: 400 }
      )
    }

    if (parentId) {
      console.log('📥 GoPay webhook - RECURRING payment:', paymentId, 'parent:', parentId)
    } else {
      console.log('📥 GoPay webhook - INITIAL payment:', paymentId)
    }

    // Get payment status from GoPay
    const payment = await getPaymentStatus(parseInt(paymentId))

    console.log('Payment state:', payment.state)

    // Get admin Firestore instance
    const adminDb = getAdminDb()

    // For recurring payments, we need to find the parent payment to get user info
    let userId: string
    let plan: string
    let isRecurring = false

    if (parentId) {
      // This is a recurring payment - find parent payment
      isRecurring = true
      const parentSnapshot = await adminDb.collection('payments')
        .where('goPayId', '==', parseInt(parentId))
        .limit(1)
        .get()

      if (parentSnapshot.empty) {
        console.error('Parent payment not found:', parentId)
        return NextResponse.json(
          { error: 'Parent payment not found' },
          { status: 404 }
        )
      }

      const parentData = parentSnapshot.docs[0].data()
      userId = parentData.userId
      plan = parentData.plan

      console.log('📋 Found parent payment - userId:', userId, 'plan:', plan)

      // Create new payment record for this recurring payment
      await adminDb.collection('payments').add({
        userId,
        userEmail: parentData.userEmail,
        goPayId: payment.id,
        parentGoPayId: parseInt(parentId),
        orderNumber: payment.order_number,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.state === 'PAID' ? 'succeeded' : 'pending',
        plan,
        isRecurring: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })

      console.log('✅ Created new payment record for recurring payment')
    } else {
      // This is an initial payment - find it in Firestore
      const paymentsRef = adminDb.collection('payments')
      const snapshot = await paymentsRef
        .where('goPayId', '==', payment.id)
        .limit(1)
        .get()

      if (snapshot.empty) {
        console.error('Payment not found in Firestore:', payment.id)
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        )
      }

      const paymentDoc = snapshot.docs[0]
      const paymentData = paymentDoc.data()
      userId = paymentData.userId
      plan = paymentData.plan

      // Map GoPay state to our status
      let status = 'pending'
      if (payment.state === 'PAID') {
        status = 'succeeded'
      } else if (payment.state === 'CANCELED' || payment.state === 'TIMEOUTED') {
        status = 'failed'
      } else if (payment.state === 'REFUNDED') {
        status = 'refunded'
      }

      // Update payment in Firestore
      await paymentDoc.ref.update({
        status,
        state: payment.state,
        last4: payment.payer?.payment_card?.card_number?.slice(-4) || null,
        paymentMethod: 'card',
        updatedAt: Timestamp.now(),
        ...(status === 'succeeded' && { paidAt: Timestamp.now() })
      })

      console.log('✅ Payment updated:', paymentDoc.id, status)
    }

    // If payment succeeded, update subscription and create invoice
    if (payment.state === 'PAID') {
      const now = new Date()
      const periodEnd = new Date(now)

      if (plan === 'premium_monthly') {
        periodEnd.setMonth(periodEnd.getMonth() + 1)
      } else if (plan === 'test_daily') {
        periodEnd.setDate(periodEnd.getDate() + 1) // Add 1 day for testing
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1)
      }

      const subscriptionRef = adminDb.collection('subscriptions').doc(userId)
      const subscriptionDoc = await subscriptionRef.get()

      if (subscriptionDoc.exists) {
        // Update existing subscription
        await subscriptionRef.update({
          plan,
          status: 'active',
          amount: payment.amount / 100,
          currency: payment.currency,
          currentPeriodStart: Timestamp.fromDate(now),
          currentPeriodEnd: Timestamp.fromDate(periodEnd),
          isTrialActive: false,
          cancelAtPeriodEnd: false,
          goPayPaymentId: payment.id.toString(),
          ...(parentId && { goPayParentPaymentId: parentId }),
          updatedAt: Timestamp.now()
        })
      } else {
        // Create new subscription
        await subscriptionRef.set({
          userId,
          plan,
          status: 'active',
          amount: payment.amount / 100,
          currency: payment.currency,
          currentPeriodStart: Timestamp.fromDate(now),
          currentPeriodEnd: Timestamp.fromDate(periodEnd),
          isTrialActive: false,
          cancelAtPeriodEnd: false,
          goPayPaymentId: payment.id.toString(),
          ...(parentId && { goPayParentPaymentId: parentId }),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })
      }

      if (isRecurring) {
        console.log('✅ Subscription RENEWED (recurring payment) for user:', userId)
      } else {
        console.log('✅ Subscription ACTIVATED (initial payment) for user:', userId)
      }

      // Create invoice automatically
      try {
        await createInvoiceForPayment(adminDb, payment, userId, plan)
        console.log('✅ Invoice created for payment:', payment.id)
      } catch (invoiceError) {
        console.error('❌ Error creating invoice:', invoiceError)
        // Don't fail the webhook if invoice creation fails
      }
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error handling GoPay webhook:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Create invoice for successful payment
 */
async function createInvoiceForPayment(
  adminDb: any,
  payment: any,
  userId: string,
  plan: string
) {
  try {
    // Get user email
    const userDoc = await adminDb.collection('users').doc(userId).get()
    const userEmail = userDoc.exists ? userDoc.data().email : 'unknown@svatbot.cz'

    // Generate invoice number and variable symbol using sequential numbering
    const now = new Date()
    const invoiceNumber = await getNextInvoiceNumber(now)
    const variableSymbol = generateVariableSymbol(invoiceNumber)

    // Determine plan name
    let planName = 'Premium předplatné'
    if (plan === 'premium_monthly') {
      planName = 'Premium předplatné - měsíční'
    } else if (plan === 'premium_yearly') {
      planName = 'Premium předplatné - roční'
    }

    const amount = payment.amount / 100 // Convert from cents

    // Company info for SvatBot.cz (only include defined values)
    const supplierInfo = {
      supplierName: 'SvatBot.cz',
      supplierAddress: 'Michal Vesecky, Zapska 1149, Nehvizdy',
      supplierCity: '',
      supplierZip: '25081',
      supplierCountry: '',
      supplierICO: '88320090',
      supplierEmail: 'info@svatbot.cz'
    }

    // Create invoice document
    const invoice = {
      invoiceNumber,
      paymentId: payment.id.toString(),
      userId,
      userEmail,

      // Customer details
      customerName: userEmail,

      // Dates
      issueDate: Timestamp.fromDate(now),
      dueDate: Timestamp.fromDate(now), // Already paid
      taxableDate: Timestamp.fromDate(now),

      // Items
      items: [
        {
          description: planName,
          quantity: 1,
          unitPrice: amount,
          vatRate: 0,
          total: amount
        }
      ],

      // Amounts
      subtotal: amount,
      vatRate: 0,
      vatAmount: 0,
      total: amount,
      currency: payment.currency,

      // Payment info
      paymentMethod: 'Platební karta',
      variableSymbol,
      status: 'paid',
      paidAt: Timestamp.fromDate(now),

      // Supplier info
      ...supplierInfo,

      // Metadata
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }

    // Save invoice to Firestore
    const invoiceRef = await adminDb.collection('invoices').add(invoice)

    console.log('Invoice created:', invoiceRef.id, invoiceNumber)

    // Note: PDF generation will be done on-demand when user requests download
    // This keeps the webhook fast and reliable

    return invoiceRef.id
  } catch (error) {
    console.error('Error creating invoice:', error)
    throw error
  }
}

