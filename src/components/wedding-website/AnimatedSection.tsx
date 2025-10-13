'use client'

import { ReactNode } from 'react'

interface AnimatedSectionProps {
  children: ReactNode
  animation?: 'fade-in' | 'slide-up' | 'slide-in-left' | 'slide-in-right' | 'slide-in-bottom' | 'scale-in' | 'bounce-in' | 'rotate-in' | 'flip-in' | 'elastic-bounce' | 'zoom-in'
  delay?: number // delay in milliseconds
  className?: string
}

/**
 * AnimatedSection - Wrapper komponenta pro snadné přidání animací do svatebních webů
 * 
 * @example
 * <AnimatedSection animation="slide-in-left" delay={300}>
 *   <h1>Nadpis</h1>
 * </AnimatedSection>
 */
export default function AnimatedSection({
  children,
  animation = 'fade-in',
  delay = 0,
  className = ''
}: AnimatedSectionProps) {
  const animationClass = `animate-${animation}`
  
  return (
    <div 
      className={`${animationClass} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/**
 * AnimatedList - Komponenta pro stagger animace seznamů
 * 
 * @example
 * <AnimatedList staggerDelay={100}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </AnimatedList>
 */
interface AnimatedListProps {
  children: ReactNode
  staggerDelay?: number // delay between each item in ms
  className?: string
}

export function AnimatedList({
  children,
  staggerDelay = 100,
  className = ''
}: AnimatedListProps) {
  const childrenArray = Array.isArray(children) ? children : [children]
  
  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <div
          key={index}
          className="stagger-item"
          style={{ animationDelay: `${index * staggerDelay}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

/**
 * FloatingElement - Komponenta pro plovoucí efekt
 * 
 * @example
 * <FloatingElement rotate={true}>
 *   <Heart className="w-8 h-8" />
 * </FloatingElement>
 */
interface FloatingElementProps {
  children: ReactNode
  rotate?: boolean
  className?: string
}

export function FloatingElement({
  children,
  rotate = false,
  className = ''
}: FloatingElementProps) {
  return (
    <div className={`${rotate ? 'float-rotate' : 'float'} ${className}`}>
      {children}
    </div>
  )
}

/**
 * PulsingElement - Komponenta pro pulzující efekt
 * 
 * @example
 * <PulsingElement glow={true}>
 *   <Heart className="w-8 h-8" />
 * </PulsingElement>
 */
interface PulsingElementProps {
  children: ReactNode
  glow?: boolean
  heartbeat?: boolean
  className?: string
}

export function PulsingElement({
  children,
  glow = false,
  heartbeat = false,
  className = ''
}: PulsingElementProps) {
  const pulseClass = glow ? 'pulse-glow' : heartbeat ? 'heartbeat' : 'animate-pulse'
  
  return (
    <div className={`${pulseClass} ${className}`}>
      {children}
    </div>
  )
}

/**
 * ShimmerEffect - Komponenta pro shimmer efekt
 * 
 * @example
 * <ShimmerEffect>
 *   <div className="bg-gradient-to-r from-primary-100 to-secondary-100">
 *     Loading...
 *   </div>
 * </ShimmerEffect>
 */
interface ShimmerEffectProps {
  children: ReactNode
  className?: string
}

export function ShimmerEffect({
  children,
  className = ''
}: ShimmerEffectProps) {
  return (
    <div className={`shimmer ${className}`}>
      {children}
    </div>
  )
}

/**
 * WaveAnimation - Komponenta pro vlnovou animaci
 * 
 * @example
 * <WaveAnimation count={5} />
 */
interface WaveAnimationProps {
  count?: number
  color?: string
  className?: string
}

export function WaveAnimation({
  count = 3,
  color = 'bg-primary-500',
  className = ''
}: WaveAnimationProps) {
  return (
    <div className={`flex space-x-2 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`w-2 h-8 ${color} rounded-full wave`}
          style={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
    </div>
  )
}

/**
 * AnimatedGradient - Komponenta pro animovaný gradient
 * 
 * @example
 * <AnimatedGradient from="primary-400" via="secondary-400" to="accent-400">
 *   <h1>Nadpis s animovaným gradientem</h1>
 * </AnimatedGradient>
 */
interface AnimatedGradientProps {
  children: ReactNode
  from?: string
  via?: string
  to?: string
  className?: string
}

export function AnimatedGradient({
  children,
  from = 'primary-400',
  via = 'secondary-400',
  to = 'accent-400',
  className = ''
}: AnimatedGradientProps) {
  return (
    <div className={`gradient-animate bg-gradient-to-r from-${from} via-${via} to-${to} ${className}`}>
      {children}
    </div>
  )
}

/**
 * HoverScaleCard - Komponenta pro kartu s hover efektem
 * 
 * @example
 * <HoverScaleCard>
 *   <div className="p-6">
 *     <h3>Karta</h3>
 *   </div>
 * </HoverScaleCard>
 */
interface HoverScaleCardProps {
  children: ReactNode
  scale?: number // 1.05 = 105%
  className?: string
}

export function HoverScaleCard({
  children,
  scale = 1.05,
  className = ''
}: HoverScaleCardProps) {
  return (
    <div 
      className={`transition-all duration-300 hover:shadow-lg ${className}`}
      style={{ 
        transform: 'scale(1)',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = `scale(${scale})`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      {children}
    </div>
  )
}

