'use client'

import { ReactNode, useRef, useState, MouseEvent } from 'react'

interface CardTiltProps {
  children: ReactNode
  className?: string
  maxTilt?: number
}

export default function CardTilt({ 
  children, 
  className = '',
  maxTilt = 15 
}: CardTiltProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const deltaX = (e.clientX - centerX) / (rect.width / 2)
    const deltaY = (e.clientY - centerY) / (rect.height / 2)

    setTilt({
      x: deltaY * maxTilt,
      y: -deltaX * maxTilt
    })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  return (
    <div
      ref={cardRef}
      className={`card-tilt ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
      }}
    >
      <div className="card-tilt-inner relative">
        {children}
        <div className="card-tilt-shine" />
      </div>
    </div>
  )
}

