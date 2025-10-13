'use client'

import { Heart } from 'lucide-react'
import { cn } from '@/utils'

interface LoadingScreenProps {
  message?: string
  className?: string
}

export default function LoadingScreen({
  message = 'Načítáme vaši svatbu...',
  className
}: LoadingScreenProps) {
  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center wedding-gradient',
      className
    )}>
      <div className="text-center space-y-6 px-4 scale-in">
        {/* Animated logo */}
        <div className="relative">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <Heart
              className="w-20 h-20 text-primary-500 heartbeat"
              fill="currentColor"
            />
            <div className="absolute inset-0 w-20 h-20 border-4 border-primary-200 rounded-full animate-spin border-t-primary-500 pulse-glow" />
          </div>
        </div>

        {/* Loading text */}
        <div className="space-y-2">
          <h2 className="heading-3 text-text-primary">
            SvatBot.cz
          </h2>
          <p className="body-normal text-text-secondary">
            {message}
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-primary-400 rounded-full wave" />
          <div className="w-3 h-3 bg-secondary-400 rounded-full wave" />
          <div className="w-3 h-3 bg-accent-400 rounded-full wave" />
        </div>
      </div>
    </div>
  )
}
