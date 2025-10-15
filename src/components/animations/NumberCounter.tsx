'use client'

import { useEffect, useState, useRef } from 'react'

interface NumberCounterProps {
  end: number
  duration?: number
  start?: number
  className?: string
  prefix?: string
  suffix?: string
  decimals?: number
}

export default function NumberCounter({
  end,
  duration = 2000,
  start = 0,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0
}: NumberCounterProps) {
  const [count, setCount] = useState(start)
  const [isVisible, setIsVisible] = useState(false)
  const counterRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (counterRef.current) {
      observer.observe(counterRef.current)
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current)
      }
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    const startTime = Date.now()
    const difference = end - start

    const easeOutQuart = (t: number): number => {
      return 1 - Math.pow(1 - t, 4)
    }

    const updateCount = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      const easedProgress = easeOutQuart(progress)
      const currentCount = start + difference * easedProgress

      setCount(currentCount)

      if (progress < 1) {
        requestAnimationFrame(updateCount)
      } else {
        setCount(end)
      }
    }

    requestAnimationFrame(updateCount)
  }, [isVisible, start, end, duration])

  return (
    <span ref={counterRef} className={`number-counter ${className}`}>
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  )
}

