'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface AppTemplateProps {
  children: React.ReactNode
}

export default function AppTemplate({ children }: AppTemplateProps) {
  const pathname = usePathname()
  const [displayPath, setDisplayPath] = useState(pathname)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    // Mark as not initial load after first render
    if (isInitialLoad) {
      setIsInitialLoad(false)
    }
  }, [])

  useEffect(() => {
    // Smooth page transition with View Transitions API fallback
    const updatePath = () => {
      setDisplayPath(pathname)
    }

    // Use View Transitions API if available
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      // @ts-ignore - View Transitions API
      document.startViewTransition(() => {
        updatePath()
      })
    } else {
      // Fallback to immediate update
      updatePath()
    }
  }, [pathname])

  // Skip animation on initial load (dashboard)
  if (isInitialLoad || pathname === '/') {
    return <div className="w-full">{children}</div>
  }

  return (
    <>
      {/* Smooth page content transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={displayPath}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  )
}

