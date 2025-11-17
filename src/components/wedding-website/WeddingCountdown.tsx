'use client'

import { useState, useEffect } from 'react'
import { Timestamp } from 'firebase/firestore'

interface CountdownData {
  days: number
  hours: number
  minutes: number
  seconds: number
  passed: boolean
}

interface WeddingCountdownProps {
  weddingDate: any
  className?: string
  style?: 'modern' | 'classic'
  compact?: boolean
}

// Helper funkce pro konverzi data
const toDate = (date: any): Date | null => {
  if (!date) return null

  if (date instanceof Date) {
    return date
  } else if (date instanceof Timestamp) {
    return date.toDate()
  } else if (typeof date === 'string') {
    return new Date(date)
  } else if (date.seconds) {
    // Firestore Timestamp object
    return new Date(date.seconds * 1000)
  }
  
  return null
}

export default function WeddingCountdown({ weddingDate, className = '', style = 'modern', compact = false }: WeddingCountdownProps) {
  const calculateCountdown = () => {
    const now = new Date()
    const wedding = toDate(weddingDate)
    
    if (!wedding) return null

    const diffTime = wedding.getTime() - now.getTime()
    
    if (diffTime <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        passed: true
      }
    }

    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diffTime % (1000 * 60)) / 1000)

    return {
      days,
      hours,
      minutes,
      seconds,
      passed: false
    }
  }

  const initialValue = calculateCountdown() || {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    passed: false
  }

  const [countdown, setCountdown] = useState<CountdownData>(initialValue)

  useEffect(() => {
    if (!weddingDate) return

    // Aktualizace každou sekundu
    const interval = setInterval(() => {
      const newCountdown = calculateCountdown()
      if (newCountdown) setCountdown(newCountdown)
    }, 1000)

    return () => clearInterval(interval)
  }, [weddingDate])

  if (countdown.passed) {
    return (
      <div className={`text-center ${className}`}>
        <div className="text-2xl md:text-3xl font-bold text-gray-600 mb-4">
          🎉 Svatba se již konala! 🎉
        </div>
      </div>
    )
  }

  const modernStyle = style === 'modern'

  return (
    <div className={`text-center ${className}`}>
      {/* Countdown čísla */}
      <div className={`grid grid-cols-2 md:grid-cols-4 ${
        compact ? 'gap-2 md:gap-3' : 'gap-4 md:gap-6'
      } max-w-2xl mx-auto`}>
        {/* Dny */}
        <div className={`${
          modernStyle
            ? 'bg-white/30 backdrop-blur-md border border-white/40'
            : 'bg-white/30 backdrop-blur-md border border-white/40'
        } rounded-lg ${compact ? 'p-3 md:p-4' : 'p-4 md:p-6'} shadow-lg relative overflow-hidden group hover:bg-white/40 transition-all duration-300`}>
          {/* Jemný dekorativní prvek */}
          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full"></div>
          <div className={`${compact ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'} font-bold mb-1 ${
            modernStyle ? 'text-white drop-shadow-lg' : 'text-white drop-shadow-lg'
          }`} suppressHydrationWarning>
            {countdown.days}
          </div>
          <div className={`text-xs md:text-sm font-medium ${
            modernStyle ? 'text-white/90' : 'text-white/90'
          }`}>
            DNÍ
          </div>
        </div>

        {/* Hodiny */}
        <div className={`${
          modernStyle
            ? 'bg-white/30 backdrop-blur-md border border-white/40'
            : 'bg-white/30 backdrop-blur-md border border-white/40'
        } rounded-lg ${compact ? 'p-3 md:p-4' : 'p-4 md:p-6'} shadow-lg relative overflow-hidden group hover:bg-white/40 transition-all duration-300`}>
          {/* Jemný dekorativní prvek */}
          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full"></div>
          <div className={`${compact ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'} font-bold mb-1 ${
            modernStyle ? 'text-white drop-shadow-lg' : 'text-white drop-shadow-lg'
          }`} suppressHydrationWarning>
            {countdown.hours}
          </div>
          <div className={`text-xs md:text-sm font-medium ${
            modernStyle ? 'text-white/90' : 'text-white/90'
          }`}>
            HODIN
          </div>
        </div>

        {/* Minuty */}
        <div className={`${
          modernStyle
            ? 'bg-white/30 backdrop-blur-md border border-white/40'
            : 'bg-white/30 backdrop-blur-md border border-white/40'
        } rounded-lg ${compact ? 'p-3 md:p-4' : 'p-4 md:p-6'} shadow-lg relative overflow-hidden group hover:bg-white/40 transition-all duration-300`}>
          {/* Jemný dekorativní prvek */}
          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full"></div>
          <div className={`${compact ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'} font-bold mb-1 ${
            modernStyle ? 'text-white drop-shadow-lg' : 'text-white drop-shadow-lg'
          }`} suppressHydrationWarning>
            {countdown.minutes}
          </div>
          <div className={`text-xs md:text-sm font-medium ${
            modernStyle ? 'text-white/90' : 'text-white/90'
          }`}>
            MINUT
          </div>
        </div>

        {/* Sekundy */}
        <div className={`${
          modernStyle
            ? 'bg-white/30 backdrop-blur-md border border-white/40'
            : 'bg-white/30 backdrop-blur-md border border-white/40'
        } rounded-lg ${compact ? 'p-3 md:p-4' : 'p-4 md:p-6'} shadow-lg relative overflow-hidden group hover:bg-white/40 transition-all duration-300`}>
          {/* Jemný dekorativní prvek */}
          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full"></div>
          <div className={`${compact ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'} font-bold mb-1 ${
            modernStyle ? 'text-white drop-shadow-lg' : 'text-white drop-shadow-lg'
          }`} suppressHydrationWarning>
            {countdown.seconds}
          </div>
          <div className={`text-xs md:text-sm font-medium ${
            modernStyle ? 'text-white/90' : 'text-white/90'
          }`}>
            SEKUND
          </div>
        </div>
      </div>
    </div>
  )
}
