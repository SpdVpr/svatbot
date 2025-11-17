'use client'

import { useEffect, useRef, useState } from 'react'

interface UseScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useScrollReveal(options: UseScrollRevealOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true
  } = options

  const ref = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce) {
            observer.unobserve(element)
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce])

  return { ref, isVisible }
}

interface UseScrollRevealListOptions extends UseScrollRevealOptions {
  staggerDelay?: number
}

export function useScrollRevealList(count: number, options: UseScrollRevealListOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
    staggerDelay = 100
  } = options

  const refs = useRef<(HTMLElement | null)[]>([])
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(count).fill(false))

  useEffect(() => {
    const observers = refs.current.map((element, index) => {
      if (!element) return null

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisibleItems(prev => {
                const newState = [...prev]
                newState[index] = true
                return newState
              })
            }, index * staggerDelay)

            if (triggerOnce) {
              observer.unobserve(element)
            }
          } else if (!triggerOnce) {
            setVisibleItems(prev => {
              const newState = [...prev]
              newState[index] = false
              return newState
            })
          }
        },
        { threshold, rootMargin }
      )

      observer.observe(element)
      return observer
    })

    return () => {
      observers.forEach(observer => observer?.disconnect())
    }
  }, [count, threshold, rootMargin, triggerOnce, staggerDelay])

  const setRef = (index: number) => (element: HTMLElement | null) => {
    refs.current[index] = element
  }

  return { setRef, visibleItems }
}
