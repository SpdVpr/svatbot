import { db } from '@/lib/firebase'
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore'

/**
 * Utility to clean up old Pinterest data from Firestore
 * This removes all moodboard images with source 'pinterest' or invalid Pinterest URLs
 */
export async function cleanupPinterestData() {
  try {
    console.log('🧹 Starting Pinterest data cleanup...')
    
    // Get all moodboard documents
    const moodboardRef = collection(db, 'moodboards')
    const snapshot = await getDocs(moodboardRef)
    
    let deletedCount = 0
    let totalCount = snapshot.size
    
    console.log(`📊 Found ${totalCount} moodboard documents to check`)
    
    // Process each document
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data()
      
      // Check if this is a Pinterest image or has Pinterest URL
      const isPinterestImage = (
        data.source === 'pinterest' ||
        (data.url && (
          data.url.includes('pinterest.com') ||
          data.url.includes('pinimg.com') ||
          data.sourceUrl?.includes('pinterest.com')
        ))
      )
      
      if (isPinterestImage) {
        console.log(`🗑️ Deleting Pinterest image: ${docSnapshot.id} - ${data.title || 'Untitled'}`)
        await deleteDoc(doc(db, 'moodboards', docSnapshot.id))
        deletedCount++
      }
    }
    
    console.log(`✅ Cleanup completed!`)
    console.log(`📊 Deleted ${deletedCount} Pinterest images out of ${totalCount} total documents`)
    
    return {
      success: true,
      deletedCount,
      totalCount,
      message: `Successfully deleted ${deletedCount} Pinterest images`
    }
    
  } catch (error) {
    console.error('❌ Error during Pinterest cleanup:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to cleanup Pinterest data'
    }
  }
}

/**
 * Clean up Pinterest data for a specific user/wedding
 */
export async function cleanupPinterestDataForUser(userId: string, weddingId?: string) {
  try {
    console.log(`🧹 Starting Pinterest cleanup for user: ${userId}`)
    
    let q = query(
      collection(db, 'moodboards'),
      where('userId', '==', userId)
    )
    
    if (weddingId) {
      q = query(q, where('weddingId', '==', weddingId))
    }
    
    const snapshot = await getDocs(q)
    let deletedCount = 0
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data()
      
      const isPinterestImage = (
        data.source === 'pinterest' ||
        (data.url && (
          data.url.includes('pinterest.com') ||
          data.url.includes('pinimg.com') ||
          data.sourceUrl?.includes('pinterest.com')
        ))
      )
      
      if (isPinterestImage) {
        console.log(`🗑️ Deleting Pinterest image for user ${userId}: ${docSnapshot.id}`)
        await deleteDoc(doc(db, 'moodboards', docSnapshot.id))
        deletedCount++
      }
    }
    
    console.log(`✅ User cleanup completed! Deleted ${deletedCount} Pinterest images`)
    return { success: true, deletedCount }
    
  } catch (error) {
    console.error('❌ Error during user Pinterest cleanup:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
