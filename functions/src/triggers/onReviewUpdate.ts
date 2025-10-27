import * as functions from 'firebase-functions'
import { collections, serverTimestamp, FieldValue } from '../config/firebase'

/**
 * Trigger when a review is updated (e.g., approved by admin)
 * Updates vendor rating statistics when review status changes to 'approved'
 */
const onReviewUpdate = functions
  .region('europe-west1')
  .firestore
  .document('vendorReviews/{reviewId}')
  .onUpdate(async (change, context) => {
    try {
      const reviewId = context.params.reviewId
      const beforeData = change.before.data()
      const afterData = change.after.data()

      console.log('Review updated:', reviewId)

      // Check if review was just approved
      const wasApproved = beforeData.status !== 'approved' && afterData.status === 'approved'

      if (!wasApproved) {
        console.log('Review status did not change to approved, skipping rating update')
        return null
      }

      console.log('Review approved:', reviewId, 'for vendor:', afterData.vendorId)

      // Update vendor rating statistics
      await updateVendorRating(afterData.vendorId)

      console.log('Vendor rating updated after review approval:', afterData.vendorId)
    } catch (error) {
      console.error('Error processing review update:', error)
    }
  })

/**
 * Helper function to recalculate vendor rating based on approved reviews
 */
async function updateVendorRating(vendorId: string) {
  try {
    console.log('Updating vendor rating for:', vendorId)

    // Get all approved reviews for this vendor
    const reviewsSnapshot = await collections.vendorReviews
      .where('vendorId', '==', vendorId)
      .where('status', '==', 'approved')
      .get()

    const reviews = reviewsSnapshot.docs.map(doc => doc.data())

    console.log(`Found ${reviews.length} approved reviews for vendor ${vendorId}`)

    if (reviews.length === 0) {
      // No approved reviews yet
      await collections.marketplaceVendors.doc(vendorId).update({
        'rating.overall': 0,
        'rating.count': 0,
        'rating.breakdown.quality': 0,
        'rating.breakdown.communication': 0,
        'rating.breakdown.value': 0,
        'rating.breakdown.professionalism': 0,
        updatedAt: serverTimestamp()
      })
      console.log('No approved reviews, reset rating to 0')
      return
    }

    // Calculate averages
    const overall = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    const quality = reviews.reduce((sum, review) => sum + (review.ratings?.quality || 0), 0) / reviews.length
    const communication = reviews.reduce((sum, review) => sum + (review.ratings?.communication || 0), 0) / reviews.length
    const value = reviews.reduce((sum, review) => sum + (review.ratings?.value || 0), 0) / reviews.length
    const professionalism = reviews.reduce((sum, review) => sum + (review.ratings?.professionalism || 0), 0) / reviews.length

    console.log('Calculated ratings:', {
      overall: Math.round(overall * 10) / 10,
      count: reviews.length,
      quality: Math.round(quality * 10) / 10,
      communication: Math.round(communication * 10) / 10,
      value: Math.round(value * 10) / 10,
      professionalism: Math.round(professionalism * 10) / 10
    })

    // Update vendor rating in marketplaceVendors collection
    await collections.marketplaceVendors.doc(vendorId).update({
      'rating.overall': Math.round(overall * 10) / 10,
      'rating.count': reviews.length,
      'rating.breakdown.quality': Math.round(quality * 10) / 10,
      'rating.breakdown.communication': Math.round(communication * 10) / 10,
      'rating.breakdown.value': Math.round(value * 10) / 10,
      'rating.breakdown.professionalism': Math.round(professionalism * 10) / 10,
      updatedAt: serverTimestamp()
    })

    console.log('✅ Vendor rating updated successfully:', vendorId, 'new overall:', Math.round(overall * 10) / 10)
  } catch (error) {
    console.error('❌ Error updating vendor rating:', error)
    throw error
  }
}

export default onReviewUpdate

