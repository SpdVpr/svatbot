/**
 * Script to manually update vendor ratings based on approved reviews
 * Run with: node scripts/update-vendor-ratings.js
 */

const admin = require('firebase-admin')

// Initialize Firebase Admin (uses default credentials from Firebase CLI)
admin.initializeApp({
  projectId: 'svatbot-app'
})

const db = admin.firestore()

async function updateVendorRating(vendorId) {
  try {
    console.log(`\n📊 Updating rating for vendor: ${vendorId}`)

    // Get all approved reviews for this vendor
    const reviewsSnapshot = await db.collection('vendorReviews')
      .where('vendorId', '==', vendorId)
      .where('status', '==', 'approved')
      .get()

    const reviews = reviewsSnapshot.docs.map(doc => doc.data())

    console.log(`   Found ${reviews.length} approved reviews`)

    if (reviews.length === 0) {
      // No approved reviews yet
      await db.collection('marketplaceVendors').doc(vendorId).update({
        'rating.overall': 0,
        'rating.count': 0,
        'rating.breakdown.quality': 0,
        'rating.breakdown.communication': 0,
        'rating.breakdown.value': 0,
        'rating.breakdown.professionalism': 0,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })
      console.log('   ✅ Rating reset to 0 (no approved reviews)')
      return
    }

    // Calculate averages
    const overall = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    const quality = reviews.reduce((sum, review) => sum + (review.ratings?.quality || 0), 0) / reviews.length
    const communication = reviews.reduce((sum, review) => sum + (review.ratings?.communication || 0), 0) / reviews.length
    const value = reviews.reduce((sum, review) => sum + (review.ratings?.value || 0), 0) / reviews.length
    const professionalism = reviews.reduce((sum, review) => sum + (review.ratings?.professionalism || 0), 0) / reviews.length

    const newRating = {
      overall: Math.round(overall * 10) / 10,
      count: reviews.length,
      breakdown: {
        quality: Math.round(quality * 10) / 10,
        communication: Math.round(communication * 10) / 10,
        value: Math.round(value * 10) / 10,
        professionalism: Math.round(professionalism * 10) / 10
      }
    }

    console.log('   New rating:', newRating)

    // Update vendor rating in marketplaceVendors collection
    await db.collection('marketplaceVendors').doc(vendorId).update({
      'rating.overall': newRating.overall,
      'rating.count': newRating.count,
      'rating.breakdown.quality': newRating.breakdown.quality,
      'rating.breakdown.communication': newRating.breakdown.communication,
      'rating.breakdown.value': newRating.breakdown.value,
      'rating.breakdown.professionalism': newRating.breakdown.professionalism,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    console.log('   ✅ Vendor rating updated successfully')
  } catch (error) {
    console.error(`   ❌ Error updating vendor rating:`, error)
    throw error
  }
}

async function main() {
  try {
    console.log('🚀 Starting vendor ratings update...\n')

    // Get all vendors with reviews
    const reviewsSnapshot = await db.collection('vendorReviews')
      .where('status', '==', 'approved')
      .get()

    const vendorIds = new Set()
    reviewsSnapshot.docs.forEach(doc => {
      vendorIds.add(doc.data().vendorId)
    })

    console.log(`Found ${vendorIds.size} vendors with approved reviews\n`)

    // Update rating for each vendor
    for (const vendorId of vendorIds) {
      await updateVendorRating(vendorId)
    }

    console.log('\n✅ All vendor ratings updated successfully!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

main()

