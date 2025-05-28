import * as functions from 'firebase-functions'
import { collections, serverTimestamp } from '../config/firebase'

// Trigger when a vendor document is updated
const onVendorUpdate = functions.firestore
  .document('vendors/{vendorId}')
  .onUpdate(async (change, context) => {
    try {
      const vendorId = context.params.vendorId
      const beforeData = change.before.data()
      const afterData = change.after.data()

      console.log('Vendor updated:', vendorId)

      // Check if vendor was verified
      if (!beforeData.verified && afterData.verified) {
        console.log('Vendor verified:', vendorId)

        // Send notification to vendor
        await collections.notifications.add({
          userId: afterData.userId,
          type: 'vendor_verified',
          title: 'Profil ověřen!',
          message: 'Váš dodavatelský profil byl úspěšně ověřen a je nyní viditelný pro zákazníky.',
          data: {
            vendorId,
            action: 'view_vendor_profile'
          },
          read: false,
          createdAt: serverTimestamp()
        })

        // Update vendor stats
        await collections.vendors.doc(vendorId).update({
          'stats.verifiedAt': serverTimestamp()
        })
      }

      // Check if vendor was featured
      if (!beforeData.featured && afterData.featured) {
        console.log('Vendor featured:', vendorId)

        // Send notification to vendor
        await collections.notifications.add({
          userId: afterData.userId,
          type: 'vendor_featured',
          title: 'Profil zvýrazněn!',
          message: 'Váš profil byl zvýrazněn a bude se zobrazovat na předních pozicích.',
          data: {
            vendorId,
            action: 'view_vendor_profile'
          },
          read: false,
          createdAt: serverTimestamp()
        })
      }

      // Check if vendor was deactivated
      if (beforeData.active && !afterData.active) {
        console.log('Vendor deactivated:', vendorId)

        // Send notification to vendor
        await collections.notifications.add({
          userId: afterData.userId,
          type: 'system_update',
          title: 'Profil deaktivován',
          message: 'Váš dodavatelský profil byl deaktivován. Pro více informací nás kontaktujte.',
          data: {
            vendorId,
            action: 'contact_support'
          },
          read: false,
          createdAt: serverTimestamp()
        })
      }

      // Update search index (if using Algolia or similar)
      // This would be where you'd update external search services

      console.log('Vendor update processing completed:', vendorId)
    } catch (error) {
      console.error('Error processing vendor update:', error)
    }
  })

export default onVendorUpdate
