import * as functions from 'firebase-functions'
import { collections, serverTimestamp, FieldValue } from '../config/firebase'

// Trigger when a new inquiry is created
const onInquiryCreate = functions.firestore
  .document('inquiries/{inquiryId}')
  .onCreate(async (snap, context) => {
    try {
      const inquiryId = context.params.inquiryId
      const inquiryData = snap.data()

      console.log('New inquiry created:', inquiryId, 'for vendor:', inquiryData.vendorId)

      // Get vendor data
      const vendorDoc = await collections.vendors.doc(inquiryData.vendorId).get()
      if (!vendorDoc.exists) {
        console.error('Vendor not found:', inquiryData.vendorId)
        return
      }

      const vendorData = vendorDoc.data()!

      // Send notification to vendor
      await collections.notifications.add({
        userId: vendorData.userId,
        type: 'inquiry_received',
        title: 'Nová poptávka!',
        message: `Obdrželi jste novou poptávku od ${inquiryData.name}.`,
        data: {
          inquiryId,
          vendorId: inquiryData.vendorId,
          customerName: inquiryData.name,
          weddingDate: inquiryData.weddingDate,
          action: 'view_inquiry'
        },
        read: false,
        createdAt: serverTimestamp()
      })

      // Update vendor stats
      await collections.vendors.doc(inquiryData.vendorId).update({
        'stats.inquiries': FieldValue.increment(1),
        updatedAt: serverTimestamp()
      })

      // Track analytics
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const analyticsRef = collections.analytics.doc(`${inquiryData.vendorId}_${today.toISOString().split('T')[0]}`)
      
      await analyticsRef.set({
        vendorId: inquiryData.vendorId,
        date: today,
        inquiries: FieldValue.increment(1)
      }, { merge: true })

      // Determine inquiry priority based on wedding date and budget
      let priority = 'normal'
      
      if (inquiryData.weddingDate) {
        const weddingDate = inquiryData.weddingDate.toDate()
        const daysUntilWedding = Math.ceil((weddingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        
        if (daysUntilWedding <= 30) {
          priority = 'urgent'
        } else if (daysUntilWedding <= 90) {
          priority = 'high'
        }
      }

      if (inquiryData.budget && inquiryData.budget > 100000) {
        priority = priority === 'normal' ? 'high' : priority
      }

      // Update inquiry with calculated priority
      await collections.inquiries.doc(inquiryId).update({
        priority,
        updatedAt: serverTimestamp()
      })

      // Send email notification to vendor (if email service is configured)
      // This would be where you'd integrate with your email service
      console.log('Would send email to:', vendorData.email)

      console.log('Inquiry processing completed:', inquiryId, 'priority:', priority)
    } catch (error) {
      console.error('Error processing new inquiry:', error)
    }
  })

export default onInquiryCreate
