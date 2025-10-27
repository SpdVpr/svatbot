import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { sendVendorRegistrationEmail } from '../services/emailService'

/**
 * Trigger when a new marketplace vendor is created
 * Sends registration confirmation email with edit link
 */
export default functions
  .region('europe-west1')
  .firestore
  .document('marketplaceVendors/{vendorId}')
  .onCreate(async (snap, context) => {
    try {
      const vendorData = snap.data()
      const vendorId = context.params.vendorId

      console.log('New marketplace vendor created:', vendorId)

      // Check if vendor has email and editToken
      if (!vendorData.email) {
        console.warn('Vendor has no email, skipping registration email')
        return
      }

      if (!vendorData.editToken) {
        console.warn('Vendor has no editToken, skipping registration email')
        return
      }

      // Send registration confirmation email
      const emailSent = await sendVendorRegistrationEmail(
        vendorData.email,
        vendorData.name,
        vendorData.editToken
      )

      if (emailSent) {
        console.log('✅ Registration email sent to vendor:', vendorData.email)
      } else {
        console.error('❌ Failed to send registration email to vendor:', vendorData.email)
      }

      return null
    } catch (error) {
      console.error('Error in onMarketplaceVendorCreate trigger:', error)
      // Don't throw error - we don't want to fail the vendor creation
      return null
    }
  })

