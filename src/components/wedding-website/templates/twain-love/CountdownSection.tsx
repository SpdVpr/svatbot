'use client'

import { useEffect, useState } from 'react'

interface CountdownSectionProps {
  weddingDate: Date
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function CountdownSection({ weddingDate }: CountdownSectionProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(weddingDate).getTime() - new Date().getTime()
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [weddingDate])

  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
          {/* Days */}
          <div
            className="flex flex-col items-center justify-center w-[195px] h-[200px] relative pb-6"
            style={{
              backgroundImage: 'url(/templates/twain-love/vector2.png)',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              paddingTop: '2rem'
            }}
          >
            <div className="text-4xl font-semibold text-gray-800" style={{ fontFamily: 'Great Vibes, cursive' }}>
              {String(timeLeft.days).padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-600 uppercase tracking-wider mt-1">
              DNY
            </div>
          </div>

          {/* Hours */}
          <div
            className="flex flex-col items-center justify-center w-[195px] h-[200px] relative pb-6"
            style={{
              backgroundImage: 'url(/templates/twain-love/vector2.png)',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              paddingTop: '2rem'
            }}
          >
            <div className="text-4xl font-semibold text-gray-800" style={{ fontFamily: 'Great Vibes, cursive' }}>
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-600 uppercase tracking-wider mt-1">
              HODINY
            </div>
          </div>

          {/* Minutes */}
          <div
            className="flex flex-col items-center justify-center w-[195px] h-[200px] relative pb-6"
            style={{
              backgroundImage: 'url(/templates/twain-love/vector2.png)',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              paddingTop: '2rem'
            }}
          >
            <div className="text-4xl font-semibold text-gray-800" style={{ fontFamily: 'Great Vibes, cursive' }}>
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-600 uppercase tracking-wider mt-1">
              MINUTY
            </div>
          </div>

          {/* Seconds */}
          <div
            className="flex flex-col items-center justify-center w-[195px] h-[200px] relative pb-6"
            style={{
              backgroundImage: 'url(/templates/twain-love/vector2.png)',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              paddingTop: '2rem'
            }}
          >
            <div className="text-4xl font-semibold text-gray-800" style={{ fontFamily: 'Great Vibes, cursive' }}>
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-600 uppercase tracking-wider mt-1">
              SEKUNDY
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

