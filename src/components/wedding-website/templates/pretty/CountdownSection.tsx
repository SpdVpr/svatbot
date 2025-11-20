'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

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

  const formattedDate = format(new Date(weddingDate), 'd MMMM yyyy', { locale: cs })

  return (
    <section className="py-20" style={{ background: 'linear-gradient(to bottom, #faf8f3 0%, #ffffff 100%)' }}>
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 
            className="text-4xl md:text-5xl mb-8 text-gray-800"
            style={{ fontFamily: 'Great Vibes, cursive' }}
          >
            Save the date
          </h2>
          <h3 className="text-2xl md:text-3xl mb-12 text-gray-700 font-semibold">
            {formattedDate}
          </h3>
          
          {/* Countdown Clock */}
          <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
            <div 
              className="relative w-24 h-24 md:w-32 md:h-32 flex flex-col items-center justify-center rounded-full"
              style={{
                backgroundImage: 'url(/templates/pretty/images/clock-bg.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <span className="text-3xl md:text-4xl font-bold" style={{ color: '#b19a56' }}>
                {timeLeft.days}
              </span>
              <span className="text-sm text-gray-600 uppercase">Dní</span>
            </div>

            <div
              className="relative w-24 h-24 md:w-32 md:h-32 flex flex-col items-center justify-center rounded-full"
              style={{
                backgroundImage: 'url(/templates/pretty/images/clock-bg.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <span className="text-3xl md:text-4xl font-bold" style={{ color: '#b19a56' }}>
                {timeLeft.hours}
              </span>
              <span className="text-sm text-gray-600 uppercase">Hodin</span>
            </div>
            
            <div 
              className="relative w-24 h-24 md:w-32 md:h-32 flex flex-col items-center justify-center rounded-full"
              style={{
                backgroundImage: 'url(/templates/pretty/images/clock-bg.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <span className="text-3xl md:text-4xl font-bold" style={{ color: '#b19a56' }}>
                {timeLeft.minutes}
              </span>
              <span className="text-sm text-gray-600 uppercase">Minut</span>
            </div>

            <div
              className="relative w-24 h-24 md:w-32 md:h-32 flex flex-col items-center justify-center rounded-full"
              style={{
                backgroundImage: 'url(/templates/pretty/images/clock-bg.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <span className="text-3xl md:text-4xl font-bold" style={{ color: '#b19a56' }}>
                {timeLeft.seconds}
              </span>
              <span className="text-sm text-gray-600 uppercase">Sekund</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

