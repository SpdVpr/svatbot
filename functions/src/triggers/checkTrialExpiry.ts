import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { sendTrialReminderEmail } from '../services/emailService'

const db = admin.firestore()

/**
 * Scheduled function to check for expiring trials
 * Runs daily at 9:00 AM CET
 * Sends reminder emails 2 days before trial expiry
 *
 * IMPORTANT: Only sends emails for FREE TRIAL users, not for active paid subscriptions
 * Paid subscriptions renew automatically via Stripe, so no reminder is needed
 */
const checkTrialExpiry = functions
  .region('europe-west1')
  .pubsub
  .schedule('0 9 * * *') // Every day at 9:00 AM
  .timeZone('Europe/Prague')
  .onRun(async (context) => {
    try {
      console.log('Starting trial expiry check...')

      const now = new Date()
      const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

      // Query subscriptions that are in FREE TRIAL (not paid) and expiring in 2 days
      // We only send reminders for trial users, not for active paid subscriptions
      // because paid subscriptions renew automatically via Stripe
      const subscriptionsSnapshot = await db
        .collection('subscriptions')
        .where('status', '==', 'trialing') // Only trial status
        .where('plan', '==', 'free_trial') // Only free trial plan (not premium_monthly or premium_yearly)
        .where('isTrialActive', '==', true)
        .where('trialEndDate', '>=', admin.firestore.Timestamp.fromDate(twoDaysFromNow))
        .where('trialEndDate', '<', admin.firestore.Timestamp.fromDate(threeDaysFromNow))
        .get()

      console.log(`Found ${subscriptionsSnapshot.size} FREE TRIAL subscriptions expiring in 2 days`)

      // Process each subscription
      const emailPromises: Promise<void>[] = []

      for (const subscriptionDoc of subscriptionsSnapshot.docs) {
        const subscription = subscriptionDoc.data()
        const userId = subscription.userId

        // Double-check: Skip if not free trial (safety check)
        if (subscription.plan !== 'free_trial') {
          console.log(`Skipping user ${userId} - not on free trial (plan: ${subscription.plan})`)
          continue
        }

        // Check if reminder was already sent
        const reminderSentField = 'trialReminderSent'
        if (subscription[reminderSentField]) {
          console.log(`Reminder already sent for FREE TRIAL user ${userId}`)
          continue
        }

        // Get user data
        const userDoc = await db.collection('users').doc(userId).get()
        if (!userDoc.exists) {
          console.error('User not found:', userId)
          continue
        }

        const userData = userDoc.data()
        if (!userData) {
          console.error('User data is empty:', userId)
          continue
        }

        // Send reminder email
        if (userData.email && userData.firstName) {
          const emailPromise = (async () => {
            try {
              const trialEndDate = subscription.trialEndDate.toDate()
              await sendTrialReminderEmail(
                userData.email,
                userData.firstName,
                userId,
                trialEndDate
              )

              // Mark reminder as sent
              await subscriptionDoc.ref.update({
                [reminderSentField]: true,
                trialReminderSentAt: admin.firestore.Timestamp.now()
              })

              // Create notification
              await db.collection('notifications').add({
                userId,
                type: 'trial_expiring',
                title: 'Zkušební období brzy končí',
                message: `Vaše zkušební období končí ${trialEndDate.toLocaleDateString('cs-CZ')}. Přejděte na Premium pro pokračování.`,
                data: {
                  subscriptionId: subscriptionDoc.id,
                  trialEndDate: trialEndDate.toISOString()
                },
                read: false,
                createdAt: admin.firestore.Timestamp.now()
              })

              console.log('✅ FREE TRIAL reminder sent to:', userData.email)
            } catch (error) {
              console.error(`Error sending trial reminder to ${userData.email}:`, error)
            }
          })()

          emailPromises.push(emailPromise)
        }
      }

      // Wait for all emails to be sent
      await Promise.all(emailPromises)

      console.log(`✅ Trial expiry check completed. Sent ${emailPromises.length} FREE TRIAL reminders.`)
      console.log('ℹ️ Note: Paid subscriptions (premium_monthly/premium_yearly) are NOT included - they renew automatically via Stripe')

      // Log statistics
      await db.collection('emailStats').add({
        type: 'trial_reminder_batch',
        count: emailPromises.length,
        timestamp: admin.firestore.Timestamp.now(),
        date: now.toISOString().split('T')[0],
        note: 'Only free trial users - paid subscriptions renew automatically'
      })

      return null
    } catch (error) {
      console.error('Error in checkTrialExpiry:', error)
      throw error
    }
  })

export default checkTrialExpiry

