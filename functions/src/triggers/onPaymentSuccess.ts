import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { sendPaymentSuccessEmail } from '../services/emailService'

const db = admin.firestore()

/**
 * Trigger when a payment is successful
 * Listens to Firestore subscriptions collection for status changes
 */
const onPaymentSuccess = functions
  .region('europe-west1')
  .firestore
  .document('subscriptions/{subscriptionId}')
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data()
      const after = change.after.data()

      // Check if subscription status changed to active
      if (before.status !== 'active' && after.status === 'active') {
        console.log('Payment successful for subscription:', context.params.subscriptionId)

        // Get user data
        const userId = after.userId
        const userDoc = await db.collection('users').doc(userId).get()
        
        if (!userDoc.exists) {
          console.error('User not found:', userId)
          return
        }

        const userData = userDoc.data()
        if (!userData) {
          console.error('User data is empty:', userId)
          return
        }

        // Send payment success email
        if (userData.email && userData.firstName) {
          try {
            await sendPaymentSuccessEmail(
              userData.email,
              userData.firstName,
              userId,
              after.plan || 'premium',
              after.amount || 0,
              after.currency || 'CZK'
            )
            console.log('Payment success email sent to:', userData.email)
          } catch (emailError) {
            console.error('Error sending payment email:', emailError)
          }
        }

        // Create notification
        await db.collection('notifications').add({
          userId,
          type: 'payment_success',
          title: 'Platba úspěšně přijata',
          message: 'Váš Premium přístup byl aktivován. Děkujeme!',
          data: {
            subscriptionId: context.params.subscriptionId,
            plan: after.plan,
            amount: after.amount
          },
          read: false,
          createdAt: admin.firestore.Timestamp.now()
        })
      }
    } catch (error) {
      console.error('Error in onPaymentSuccess trigger:', error)
    }
  })

export default onPaymentSuccess

