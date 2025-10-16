'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface PageTransitionProps {
  children: React.ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => setIsTransitioning(false), 300)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          duration: 0.2,
          ease: [0.4, 0, 0.2, 1]
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Smooth fade transition
export function FadeTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.15,
          ease: 'easeInOut'
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Slide transition
export function SlideTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -20, opacity: 0 }}
        transition={{
          duration: 0.2,
          ease: [0.4, 0, 0.2, 1]
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Scale transition (modern and smooth)
export function ScaleTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.04, opacity: 0 }}
        transition={{
          duration: 0.2,
          ease: [0.4, 0, 0.2, 1]
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

