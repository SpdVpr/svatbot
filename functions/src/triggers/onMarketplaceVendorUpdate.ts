import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { sendVendorApprovalEmail } from '../services/emailService'

/**
 * Trigger when a marketplace vendor is updated
 * Sends approval email when status changes from 'pending' to 'approved'
 */
export default functions
  .region('europe-west1')
  .firestore
  .document('marketplaceVendors/{vendorId}')
  .onUpdate(async (change, context) => {
    try {
      const beforeData = change.before.data()
      const afterData = change.after.data()
      const vendorId = context.params.vendorId

      // Check if status changed from 'pending' to 'approved'
      const wasApproved = beforeData.status === 'pending' && afterData.status === 'approved'

      if (!wasApproved) {
        // Status didn't change to approved, nothing to do
        return null
      }

      console.log('Vendor approved:', vendorId)

      // Check if vendor has email and editToken
      if (!afterData.email) {
        console.warn('Vendor has no email, skipping approval email')
        return null
      }

      if (!afterData.editToken) {
        console.warn('Vendor has no editToken, skipping approval email')
        return null
      }

      // Send approval email
      const emailSent = await sendVendorApprovalEmail(
        afterData.email,
        afterData.name,
        afterData.editToken
      )

      if (emailSent) {
        console.log('✅ Approval email sent to vendor:', afterData.email)
      } else {
        console.error('❌ Failed to send approval email to vendor:', afterData.email)
      }

      return null
    } catch (error) {
      console.error('Error in onMarketplaceVendorUpdate trigger:', error)
      // Don't throw error - we don't want to fail the vendor update
      return null
    }
  })

