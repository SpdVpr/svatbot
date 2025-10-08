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
  const [countdown, setCountdown] = useState<CountdownData | null>(null)

  useEffect(() => {
    if (!weddingDate) return

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

    // Počáteční výpočet
    setCountdown(calculateCountdown())

    // Aktualizace každou sekundu
    const interval = setInterval(() => {
      setCountdown(calculateCountdown())
    }, 1000)

    return () => clearInterval(interval)
  }, [weddingDate])

  if (!countdown) return null

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
      {/* Hlavní text */}
      {!compact && (
        <div className="mb-6">
          <h3 className={`text-lg md:text-xl font-semibold mb-2 ${
            modernStyle ? 'text-gray-700' : 'text-gray-800'
          }`}>
            DO SVATBY ZBÝVÁ
          </h3>
        </div>
      )}

      {compact && (
        <div className="mb-3">
          <p className={`text-sm font-medium ${
            modernStyle ? 'text-gray-600' : 'text-gray-700'
          }`}>
            Do svatby zbývá
          </p>
        </div>
      )}

      {/* Countdown čísla */}
      <div className={`grid grid-cols-2 md:grid-cols-4 ${
        compact ? 'gap-2 md:gap-3' : 'gap-4 md:gap-6'
      } max-w-2xl mx-auto`}>
        {/* Dny */}
        <div className={`${
          modernStyle
            ? 'bg-white bg-opacity-90 backdrop-blur-sm border border-gray-200'
            : 'bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200'
        } rounded-lg ${compact ? 'p-3 md:p-4' : 'p-4 md:p-6'} shadow-sm`}>
          <div className={`${compact ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'} font-bold mb-1 ${
            modernStyle ? 'text-gray-900' : 'text-pink-600'
          }`}>
            {countdown.days}
          </div>
          <div className={`text-xs md:text-sm font-medium ${
            modernStyle ? 'text-gray-600' : 'text-pink-700'
          }`}>
            DNÍ
          </div>
        </div>

        {/* Hodiny */}
        <div className={`${
          modernStyle
            ? 'bg-white bg-opacity-90 backdrop-blur-sm border border-gray-200'
            : 'bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200'
        } rounded-lg ${compact ? 'p-3 md:p-4' : 'p-4 md:p-6'} shadow-sm`}>
          <div className={`${compact ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'} font-bold mb-1 ${
            modernStyle ? 'text-gray-900' : 'text-pink-600'
          }`}>
            {countdown.hours}
          </div>
          <div className={`text-xs md:text-sm font-medium ${
            modernStyle ? 'text-gray-600' : 'text-pink-700'
          }`}>
            HODIN
          </div>
        </div>

        {/* Minuty */}
        <div className={`${
          modernStyle
            ? 'bg-white bg-opacity-90 backdrop-blur-sm border border-gray-200'
            : 'bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200'
        } rounded-lg ${compact ? 'p-3 md:p-4' : 'p-4 md:p-6'} shadow-sm`}>
          <div className={`${compact ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'} font-bold mb-1 ${
            modernStyle ? 'text-gray-900' : 'text-pink-600'
          }`}>
            {countdown.minutes}
          </div>
          <div className={`text-xs md:text-sm font-medium ${
            modernStyle ? 'text-gray-600' : 'text-pink-700'
          }`}>
            MINUT
          </div>
        </div>

        {/* Sekundy */}
        <div className={`${
          modernStyle
            ? 'bg-white bg-opacity-90 backdrop-blur-sm border border-gray-200'
            : 'bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200'
        } rounded-lg ${compact ? 'p-3 md:p-4' : 'p-4 md:p-6'} shadow-sm`}>
          <div className={`${compact ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'} font-bold mb-1 ${
            modernStyle ? 'text-gray-900' : 'text-pink-600'
          }`}>
            {countdown.seconds}
          </div>
          <div className={`text-xs md:text-sm font-medium ${
            modernStyle ? 'text-gray-600' : 'text-pink-700'
          }`}>
            SEKUND
          </div>
        </div>
      </div>
    </div>
  )
}
