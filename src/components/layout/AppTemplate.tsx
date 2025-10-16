'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface AppTemplateProps {
  children: React.ReactNode
}

export default function AppTemplate({ children }: AppTemplateProps) {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)
  const [displayPath, setDisplayPath] = useState(pathname)

  useEffect(() => {
    // Start navigation animation - MUCH FASTER
    setIsNavigating(true)

    // Update display path after fade out - 50ms instead of 150ms
    const pathTimer = setTimeout(() => {
      setDisplayPath(pathname)
    }, 50)

    // Complete navigation after fade in - 100ms instead of 300ms
    const timer = setTimeout(() => {
      setIsNavigating(false)
    }, 100)

    return () => {
      clearTimeout(pathTimer)
      clearTimeout(timer)
    }
  }, [pathname])

  return (
    <>
      {/* Ultra-fast fade overlay - no visible white screen */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.05 }}
            className="fixed inset-0 z-[9998] bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Page content with instant transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={displayPath}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.05, ease: 'easeInOut' }}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  )
}

