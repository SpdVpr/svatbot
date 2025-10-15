import { useState, useEffect, useRef } from 'react'

export function useRecommendationRotation<T>(items: T[], intervalMs: number = 5000) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const itemsRef = useRef(items)
  const hasInitialized = useRef(false)

  // Update items ref
  useEffect(() => {
    itemsRef.current = items
  }, [items])

  // Initialize with random index (only once)
  useEffect(() => {
    if (hasInitialized.current) return
    if (items.length === 0) return

    // Set random starting index
    const randomIndex = Math.floor(Math.random() * items.length)
    setCurrentIndex(randomIndex)
    hasInitialized.current = true
  }, [items.length])

  // Separate effect for rotation interval
  useEffect(() => {
    // Don't start interval if not initialized or only one item
    if (!hasInitialized.current) return
    if (items.length <= 1) return

    // Start interval
    const interval = setInterval(() => {
      // Start fade out
      setIsTransitioning(true)

      // After fade, change index
      setTimeout(() => {
        setCurrentIndex(prev => {
          const currentItems = itemsRef.current
          const nextIndex = currentItems.length > 0 ? (prev + 1) % currentItems.length : 0
          return nextIndex
        })
        setIsTransitioning(false)
      }, 300)
    }, intervalMs)

    // Cleanup
    return () => {
      clearInterval(interval)
    }
  }, [items.length, intervalMs, hasInitialized.current])

  return {
    currentIndex,
    currentItem: items[currentIndex],
    isTransitioning
  }
}

