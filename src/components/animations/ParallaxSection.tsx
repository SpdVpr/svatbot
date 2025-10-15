'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'

interface ParallaxSectionProps {
  children: ReactNode
  speed?: 'slow' | 'medium' | 'fast'
  className?: string
}

export default function ParallaxSection({
  children,
  speed = 'medium',
  className = ''
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return

      const rect = sectionRef.current.getBoundingClientRect()
      const scrollPercent = (window.innerHeight - rect.top) / (window.innerHeight + rect.height)

      let speedMultiplier = 0.5
      if (speed === 'slow') speedMultiplier = 0.3
      if (speed === 'fast') speedMultiplier = 0.7

      const newOffset = scrollPercent * 100 * speedMultiplier

      setOffset(newOffset)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [speed])

  return (
    <div
      ref={sectionRef}
      className={`parallax-${speed} ${className}`}
      style={{
        transform: `translateY(${offset}px)`
      }}
    >
      {children}
    </div>
  )
}

