'use client'

import { useScrollReveal } from '@/hooks/useScrollReveal'
import { ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'none'
  delay?: number
  threshold?: number
  duration?: number
}

export default function ScrollReveal({
  children,
  className = '',
  animation = 'fade',
  delay = 0,
  threshold = 0.1,
  duration = 700
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal({ threshold })

  const getAnimationClasses = () => {
    if (animation === 'none') return ''
    
    const baseClasses = `transition-all`
    const durationClass = `duration-${duration}`
    const delayClass = delay > 0 ? `delay-${delay}` : ''
    
    const visibleClasses = 'opacity-100 translate-x-0 translate-y-0 scale-100'
    const hiddenClasses = {
      'fade': 'opacity-0',
      'slide-up': 'opacity-0 translate-y-10',
      'slide-down': 'opacity-0 -translate-y-10',
      'slide-left': 'opacity-0 translate-x-10',
      'slide-right': 'opacity-0 -translate-x-10',
      'scale': 'opacity-0 scale-75'
    }

    return `${baseClasses} ${durationClass} ${delayClass} ${
      isVisible ? visibleClasses : hiddenClasses[animation]
    }`
  }

  return (
    <div ref={ref as any} className={`${getAnimationClasses()} ${className}`}>
      {children}
    </div>
  )
}
