'use client'

import { Heart, Sparkles, Loader2 } from 'lucide-react'

interface AdvancedLoaderProps {
  type?: 'hearts' | 'sparkles' | 'pulse' | 'dots' | 'rings'
  size?: 'sm' | 'md' | 'lg'
  color?: string
  text?: string
}

export default function AdvancedLoader({
  type = 'hearts',
  size = 'md',
  color = 'text-primary-500',
  text
}: AdvancedLoaderProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const renderLoader = () => {
    switch (type) {
      case 'hearts':
        return (
          <div className="relative">
            <Heart
              className={`${sizeClasses[size]} ${color} heartbeat`}
              fill="currentColor"
            />
            <Heart
              className={`${sizeClasses[size]} ${color} absolute inset-0 heartbeat opacity-50`}
              fill="currentColor"
              style={{ animationDelay: '0.3s' }}
            />
          </div>
        )

      case 'sparkles':
        return (
          <div className="relative">
            <Sparkles
              className={`${sizeClasses[size]} ${color} float-rotate`}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-2 h-2 bg-current rounded-full pulse-glow ${color}`} />
            </div>
          </div>
        )

      case 'pulse':
        return (
          <div className="relative flex items-center justify-center">
            <div className={`${sizeClasses[size]} rounded-full border-4 border-current ${color} pulse-glow`} />
            <div className={`${sizeClasses[size]} absolute rounded-full border-4 border-current ${color} opacity-50 scale-in`} />
          </div>
        )

      case 'dots':
        return (
          <div className="flex space-x-2">
            <div className={`w-3 h-3 rounded-full bg-current ${color} wave`} />
            <div className={`w-3 h-3 rounded-full bg-current ${color} wave`} style={{ animationDelay: '0.1s' }} />
            <div className={`w-3 h-3 rounded-full bg-current ${color} wave`} style={{ animationDelay: '0.2s' }} />
            <div className={`w-3 h-3 rounded-full bg-current ${color} wave`} style={{ animationDelay: '0.3s' }} />
          </div>
        )

      case 'rings':
        return (
          <div className="relative flex items-center justify-center">
            <div className={`${sizeClasses[size]} rounded-full border-4 border-t-current border-r-transparent border-b-transparent border-l-transparent ${color} animate-spin`} />
            <div className={`${sizeClasses[size]} absolute rounded-full border-4 border-t-transparent border-r-current border-b-transparent border-l-transparent ${color} animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
          </div>
        )

      default:
        return <Loader2 className={`${sizeClasses[size]} ${color} animate-spin`} />
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {renderLoader()}
      {text && (
        <p className={`text-sm font-medium ${color} animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  )
}

