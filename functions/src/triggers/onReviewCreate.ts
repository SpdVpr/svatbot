import * as functions from 'firebase-functions'
import { collections, serverTimestamp, FieldValue } from '../config/firebase'

// Trigger when a new review is created
const onReviewCreate = functions.firestore
  .document('reviews/{reviewId}')
  .onCreate(async (snap, context) => {
    try {
      const reviewId = context.params.reviewId
      const reviewData = snap.data()

      console.log('New review created:', reviewId, 'for vendor:', reviewData.vendorId)

      // Get vendor data
      const vendorDoc = await collections.vendors.doc(reviewData.vendorId).get()
      if (!vendorDoc.exists) {
        console.error('Vendor not found:', reviewData.vendorId)
        return
      }

      const vendorData = vendorDoc.data()!

      // Send notification to vendor
      await collections.notifications.add({
        userId: vendorData.userId,
        type: 'review_received',
        title: 'Nové hodnocení!',
        message: `Obdrželi jste nové hodnocení s ${reviewData.rating} hvězdičkami.`,
        data: {
          reviewId,
          vendorId: reviewData.vendorId,
          rating: reviewData.rating,
          action: 'view_review'
        },
        read: false,
        createdAt: serverTimestamp()
      })

      // Update vendor rating statistics
      await updateVendorRating(reviewData.vendorId)

      // Update vendor stats
      await collections.vendors.doc(reviewData.vendorId).update({
        'stats.reviews': FieldValue.increment(1),
        updatedAt: serverTimestamp()
      })

      console.log('Review processing completed:', reviewId)
    } catch (error) {
      console.error('Error processing new review:', error)
    }
  })

// Helper function to recalculate vendor rating
async function updateVendorRating(vendorId: string) {
  try {
    // Get all verified reviews for this vendor
    const reviewsSnapshot = await collections.reviews
      .where('vendorId', '==', vendorId)
      .where('verified', '==', true)
      .get()

    const reviews = reviewsSnapshot.docs.map(doc => doc.data())

    if (reviews.length === 0) {
      // No reviews yet
      await collections.vendors.doc(vendorId).update({
        rating: {
          overall: 0,
          count: 0,
          breakdown: {
            quality: 0,
            communication: 0,
            value: 0,
            professionalism: 0
          }
        },
        updatedAt: serverTimestamp()
      })
      return
    }

    // Calculate averages
    const overall = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    const quality = reviews.reduce((sum, review) => sum + review.quality, 0) / reviews.length
    const communication = reviews.reduce((sum, review) => sum + review.communication, 0) / reviews.length
    const value = reviews.reduce((sum, review) => sum + review.value, 0) / reviews.length
    const professionalism = reviews.reduce((sum, review) => sum + review.professionalism, 0) / reviews.length

    // Update vendor rating
    await collections.vendors.doc(vendorId).update({
      rating: {
        overall: Math.round(overall * 10) / 10,
        count: reviews.length,
        breakdown: {
          quality: Math.round(quality * 10) / 10,
          communication: Math.round(communication * 10) / 10,
          value: Math.round(value * 10) / 10,
          professionalism: Math.round(professionalism * 10) / 10
        }
      },
      updatedAt: serverTimestamp()
    })

    console.log('Vendor rating updated:', vendorId, 'new overall:', overall)
  } catch (error) {
    console.error('Error updating vendor rating:', error)
  }
}

export default onReviewCreate
