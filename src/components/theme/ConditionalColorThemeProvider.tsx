'use client'

import { usePathname } from 'next/navigation'
import ColorThemeProvider from './ColorThemeProvider'
import { ReactNode } from 'react'

interface ConditionalColorThemeProviderProps {
  children: ReactNode
}

/**
 * Wrapper that conditionally applies ColorThemeProvider
 * Skips it for wedding websites to prevent interference with their own theme system
 */
export default function ConditionalColorThemeProvider({ children }: ConditionalColorThemeProviderProps) {
  const pathname = usePathname()
  
  // Skip ColorThemeProvider for wedding websites
  const isWeddingWebsite = pathname?.startsWith('/wedding/') || pathname?.startsWith('/w/')
  
  if (isWeddingWebsite) {
    return <>{children}</>
  }
  
  return <ColorThemeProvider>{children}</ColorThemeProvider>
}

