'use client'

import { useEffect, useRef } from 'react'
import { collection, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from '@/config/firebase'
import logger from '@/lib/logger'

/**
 * Hook for prefetching dashboard data in parallel
 * This loads essential data upfront to improve perceived performance
 */
export function useDataPrefetch(userId: string | undefined, weddingId: string | undefined) {
  const hasPrefetched = useRef(false)

  useEffect(() => {
    if (!userId || !weddingId || hasPrefetched.current) {
      return
    }

    hasPrefetched.current = true

    // Prefetch all essential data in parallel
    const prefetchData = async () => {
      try {
        logger.log('🚀 Starting data prefetch...')
        const startTime = performance.now()

        // Create all queries
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('weddingId', '==', weddingId),
          limit(50) // Limit to first 50 tasks for faster initial load
        )

        const guestsQuery = query(
          collection(db, 'guests'),
          where('weddingId', '==', weddingId),
          limit(100) // Limit to first 100 guests
        )

        const budgetQuery = query(
          collection(db, 'budgetItems'),
          where('weddingId', '==', weddingId),
          limit(50)
        )

        const vendorsQuery = query(
          collection(db, 'vendors'),
          where('weddingId', '==', weddingId),
          limit(30)
        )

        const dashboardQuery = query(
          collection(db, 'dashboards'),
          where('userId', '==', userId),
          limit(1)
        )

        // Execute all queries in parallel
        const [
          tasksSnapshot,
          guestsSnapshot,
          budgetSnapshot,
          vendorsSnapshot,
          dashboardSnapshot
        ] = await Promise.all([
          getDocs(tasksQuery),
          getDocs(guestsQuery),
          getDocs(budgetQuery),
          getDocs(vendorsQuery),
          getDocs(dashboardQuery)
        ])

        const endTime = performance.now()
        const duration = Math.round(endTime - startTime)

        logger.log('✅ Data prefetch complete:', {
          duration: `${duration}ms`,
          tasks: tasksSnapshot.size,
          guests: guestsSnapshot.size,
          budget: budgetSnapshot.size,
          vendors: vendorsSnapshot.size,
          dashboard: dashboardSnapshot.size
        })

        // Data is now cached by Firestore SDK and will be instantly available
        // when individual hooks request it
      } catch (error) {
        logger.warn('⚠️ Data prefetch failed:', error)
        // Don't throw - prefetch is optional optimization
      }
    }

    prefetchData()
  }, [userId, weddingId])
}

