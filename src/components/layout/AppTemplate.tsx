'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ScaleTransition } from '@/components/ui/PageTransition'

interface AppTemplateProps {
  children: React.ReactNode
}

export default function AppTemplate({ children }: AppTemplateProps) {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Start navigation animation
    setIsNavigating(true)
    setProgress(0)

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 20)

    // Complete navigation after content loads
    const timer = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsNavigating(false)
        setProgress(0)
      }, 200)
    }, 200)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(timer)
    }
  }, [pathname])

  return (
    <>
      {/* Navigation progress bar - smooth and modern */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent">
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 transition-all duration-200 ease-out shadow-lg shadow-pink-500/50"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Page content with transition */}
      <ScaleTransition>
        {children}
      </ScaleTransition>
    </>
  )
}

