import { db } from '@/lib/firebase'
import { collection, getDocs, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore'

/**
 * Utility to clean up duplicate notifications from Firestore
 * This removes duplicate notifications based on type, title, and message
 */
export async function cleanupDuplicateNotifications(userId?: string) {
  try {
    console.log('🧹 Starting duplicate notifications cleanup...')
    
    // Get all notifications (or for specific user)
    let notificationsQuery = query(
      collection(db, 'weddingNotifications'),
      orderBy('createdAt', 'desc')
    )
    
    if (userId) {
      notificationsQuery = query(
        collection(db, 'weddingNotifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
    }
    
    const snapshot = await getDocs(notificationsQuery)
    
    let deletedCount = 0
    let totalCount = snapshot.size
    const seen = new Set<string>()
    const toDelete: string[] = []
    
    console.log(`📊 Found ${totalCount} notifications to check`)
    
    // Process each notification
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data()
      
      // Create a unique key based on userId, type, title, and message
      const uniqueKey = `${data.userId}_${data.type}_${data.title}_${data.message}`
      
      if (seen.has(uniqueKey)) {
        // This is a duplicate, mark for deletion
        toDelete.push(docSnapshot.id)
        console.log(`🗑️ Marking duplicate notification for deletion: ${docSnapshot.id} - ${data.title}`)
      } else {
        // First occurrence, add to seen set
        seen.add(uniqueKey)
      }
    }
    
    // Delete duplicates in batches
    console.log(`🗑️ Deleting ${toDelete.length} duplicate notifications...`)
    
    for (const notificationId of toDelete) {
      await deleteDoc(doc(db, 'weddingNotifications', notificationId))
      deletedCount++
    }
    
    console.log(`✅ Cleanup completed!`)
    console.log(`📊 Deleted ${deletedCount} duplicate notifications out of ${totalCount} total notifications`)
    
    return {
      success: true,
      deletedCount,
      totalCount,
      message: `Successfully deleted ${deletedCount} duplicate notifications`
    }
    
  } catch (error) {
    console.error('❌ Error during notifications cleanup:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to cleanup duplicate notifications'
    }
  }
}

/**
 * Clean up old notifications (older than specified days)
 */
export async function cleanupOldNotifications(daysOld: number = 30, userId?: string) {
  try {
    console.log(`🧹 Starting cleanup of notifications older than ${daysOld} days...`)
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    
    let notificationsQuery = query(
      collection(db, 'weddingNotifications'),
      orderBy('createdAt', 'desc')
    )
    
    if (userId) {
      notificationsQuery = query(
        collection(db, 'weddingNotifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
    }
    
    const snapshot = await getDocs(notificationsQuery)
    let deletedCount = 0
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data()
      const createdAt = data.createdAt?.toDate()
      
      if (createdAt && createdAt < cutoffDate) {
        console.log(`🗑️ Deleting old notification: ${docSnapshot.id} - ${data.title} (${createdAt.toLocaleDateString()})`)
        await deleteDoc(doc(db, 'weddingNotifications', docSnapshot.id))
        deletedCount++
      }
    }
    
    console.log(`✅ Old notifications cleanup completed! Deleted ${deletedCount} notifications`)
    return { success: true, deletedCount }
    
  } catch (error) {
    console.error('❌ Error during old notifications cleanup:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Clean up all notifications for a specific user
 */
export async function cleanupAllUserNotifications(userId: string) {
  try {
    console.log(`🧹 Starting cleanup of all notifications for user: ${userId}`)
    
    const q = query(
      collection(db, 'weddingNotifications'),
      where('userId', '==', userId)
    )
    
    const snapshot = await getDocs(q)
    let deletedCount = 0
    
    for (const docSnapshot of snapshot.docs) {
      console.log(`🗑️ Deleting notification: ${docSnapshot.id}`)
      await deleteDoc(doc(db, 'weddingNotifications', docSnapshot.id))
      deletedCount++
    }
    
    console.log(`✅ User notifications cleanup completed! Deleted ${deletedCount} notifications`)
    return { success: true, deletedCount }
    
  } catch (error) {
    console.error('❌ Error during user notifications cleanup:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
