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
    // Start navigation animation
    setIsNavigating(true)

    // Update display path after fade out
    const pathTimer = setTimeout(() => {
      setDisplayPath(pathname)
    }, 150)

    // Complete navigation after fade in
    const timer = setTimeout(() => {
      setIsNavigating(false)
    }, 300)

    return () => {
      clearTimeout(pathTimer)
      clearTimeout(timer)
    }
  }, [pathname])

  return (
    <>
      {/* Smooth fade overlay during navigation - no loading text or icons */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9998] bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Page content with smooth transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={displayPath}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeInOut' }}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  )
}

