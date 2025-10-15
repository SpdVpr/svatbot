'use client'

import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  tx: number
  ty: number
  delay: number
  duration: number
}

interface AmbientParticlesProps {
  count?: number
  className?: string
}

export default function AmbientParticles({ 
  count = 20,
  className = '' 
}: AmbientParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const newParticles: Particle[] = []
    
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        tx: (Math.random() - 0.5) * 200,
        ty: (Math.random() - 0.5) * 200,
        delay: Math.random() * 10,
        duration: 10 + Math.random() * 10
      })
    }

    setParticles(newParticles)
  }, [count])

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map(particle => (
        <div
          key={particle.id}
          className="ambient-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            // @ts-ignore
            '--tx': `${particle.tx}px`,
            '--ty': `${particle.ty}px`
          }}
        />
      ))}
    </div>
  )
}

