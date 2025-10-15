'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'

interface TextRevealProps {
  children: string
  mode?: 'line' | 'char'
  className?: string
  delay?: number
}

export default function TextReveal({
  children,
  mode = 'line',
  className = '',
  delay = 0
}: TextRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (textRef.current) {
      observer.observe(textRef.current)
    }

    return () => {
      if (textRef.current) {
        observer.unobserve(textRef.current)
      }
    }
  }, [])

  if (mode === 'char') {
    const chars = children.split('')
    return (
      <div ref={textRef} className={className}>
        {chars.map((char, index) => (
          <span
            key={index}
            className={isVisible ? 'text-reveal-char' : 'opacity-0'}
            style={{
              animationDelay: `${delay + index * 30}ms`
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div
      ref={textRef}
      className={`${isVisible ? 'text-reveal-line' : 'opacity-0'} ${className}`}
      style={{
        animationDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

