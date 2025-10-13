'use client'

import { useState, useRef, MouseEvent, ReactNode } from 'react'

interface RippleButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  rippleColor?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

interface Ripple {
  x: number
  y: number
  size: number
  id: number
}

export default function RippleButton({
  children,
  onClick,
  className = '',
  rippleColor = 'rgba(255, 255, 255, 0.6)',
  disabled = false,
  type = 'button'
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const buttonRef = useRef<HTMLButtonElement>(null)
  const rippleIdRef = useRef(0)

  const createRipple = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return

    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    const newRipple: Ripple = {
      x,
      y,
      size,
      id: rippleIdRef.current++
    }

    setRipples(prev => [...prev, newRipple])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id))
    }, 600)

    // Call onClick handler
    if (onClick) {
      onClick()
    }
  }

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={createRipple}
      disabled={disabled}
      className={`relative overflow-hidden ${className}`}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            background: rippleColor
          }}
        />
      ))}
    </button>
  )
}

