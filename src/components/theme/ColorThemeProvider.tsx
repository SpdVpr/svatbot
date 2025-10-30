'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import { useIsDemoUser } from '@/hooks/useDemoSettings'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { ColorTheme, COLOR_PALETTES, ColorPalette } from '@/types/colorTheme'
import logger from '@/lib/logger'

interface ColorThemeContextType {
  colorTheme: ColorTheme
  currentPalette: ColorPalette
  changeTheme: (theme: ColorTheme) => void
  loading: boolean
  canChangeTheme: boolean
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined)

export function useColorThemeContext() {
  const context = useContext(ColorThemeContext)
  if (!context) {
    throw new Error('useColorThemeContext must be used within ColorThemeProvider')
  }
  return context
}

export default function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const { isLocked: isDemoLocked } = useIsDemoUser(user?.id)

  const [colorTheme, setColorTheme] = useState<ColorTheme>('rose')
  const [loading, setLoading] = useState(true)

  const currentPalette = COLOR_PALETTES[colorTheme]
  const canChangeTheme = !isDemoLocked

  // Load theme from Firebase
  useEffect(() => {
    if (!user?.id || !wedding?.id) {
      setLoading(false)
      return
    }

    const loadTheme = async () => {
      try {
        const themeDocId = `${user.id}_${wedding.id}`
        const themeDoc = await getDoc(doc(db, 'colorThemes', themeDocId))

        if (themeDoc.exists()) {
          const theme = themeDoc.data().theme as ColorTheme
          logger.log('🎨 Loaded color theme from Firebase:', theme)
          setColorTheme(theme)
        } else {
          // Try localStorage fallback
          const localTheme = localStorage.getItem(`svatbot-color-theme-${user.id}`)
          if (localTheme && localTheme in COLOR_PALETTES) {
            setColorTheme(localTheme as ColorTheme)
          }
        }
      } catch (error) {
        logger.warn('Failed to load color theme:', error)
        // Try localStorage fallback
        const localTheme = localStorage.getItem(`svatbot-color-theme-${user.id}`)
        if (localTheme && localTheme in COLOR_PALETTES) {
          setColorTheme(localTheme as ColorTheme)
        }
      } finally {
        setLoading(false)
      }
    }

    loadTheme()
  }, [user?.id, wedding?.id])

  // Apply CSS variables when theme changes
  useEffect(() => {
    if (!currentPalette) return

    const root = document.documentElement
    const colors = currentPalette.colors

    logger.log('🎨 Applying color theme:', colorTheme, colors)

    // Apply all CSS variables for primary colors
    root.style.setProperty('--color-primary', colors.primary)
    root.style.setProperty('--color-primary-light', colors.primaryLight)
    root.style.setProperty('--color-primary-dark', colors.primaryDark)
    root.style.setProperty('--color-primary-200', colors.primary200)
    root.style.setProperty('--color-primary-300', colors.primary300)
    root.style.setProperty('--color-primary-400', colors.primary400)
    root.style.setProperty('--color-primary-600', colors.primary600)
    root.style.setProperty('--color-primary-700', colors.primary700)
    root.style.setProperty('--color-primary-800', colors.primary800)
    root.style.setProperty('--color-primary-900', colors.primary900)

    // Apply all CSS variables for secondary colors
    root.style.setProperty('--color-secondary', colors.secondary)
    root.style.setProperty('--color-secondary-light', colors.secondaryLight)
    root.style.setProperty('--color-secondary-200', colors.secondary200)
    root.style.setProperty('--color-secondary-300', colors.secondary300)
    root.style.setProperty('--color-secondary-400', colors.secondary400)
    root.style.setProperty('--color-secondary-600', colors.secondary600)
    root.style.setProperty('--color-secondary-700', colors.secondary700)
    root.style.setProperty('--color-secondary-800', colors.secondary800)
    root.style.setProperty('--color-secondary-900', colors.secondary900)

    // Apply all CSS variables for accent colors
    root.style.setProperty('--color-accent', colors.accent)
    root.style.setProperty('--color-accent-light', colors.accentLight)
    root.style.setProperty('--color-accent-200', colors.accent200)
    root.style.setProperty('--color-accent-300', colors.accent300)
    root.style.setProperty('--color-accent-400', colors.accent400)
    root.style.setProperty('--color-accent-600', colors.accent600)
    root.style.setProperty('--color-accent-700', colors.accent700)
    root.style.setProperty('--color-accent-800', colors.accent800)
    root.style.setProperty('--color-accent-900', colors.accent900)

    // Update body background gradient
    const body = document.body
    const currentClasses = body.className
    // Remove old gradient classes
    const newClasses = currentClasses.replace(
      /bg-gradient-to-br\s+from-\S+\s+via-\S+\s+to-\S+/g,
      ''
    ).trim()

    // Add new gradient classes
    body.className = `${newClasses} bg-gradient-to-br ${colors.background}`.trim()

    logger.log('🎨 Background updated:', body.className)
  }, [currentPalette, colorTheme])

  // Change theme function
  const changeTheme = useCallback(async (theme: ColorTheme) => {
    if (!canChangeTheme) {
      logger.warn('Cannot change theme - demo account is locked')
      return
    }

    logger.log('🎨 Changing color theme to:', theme)
    setColorTheme(theme)

    // Save to localStorage immediately
    if (user?.id) {
      localStorage.setItem(`svatbot-color-theme-${user.id}`, theme)
    }

    // Save to Firebase
    if (user?.id && wedding?.id) {
      try {
        logger.log('🎨 Saving color theme to Firebase:', theme)
        const themeDocId = `${user.id}_${wedding.id}`
        await setDoc(doc(db, 'colorThemes', themeDocId), {
          theme,
          userId: user.id,
          weddingId: wedding.id,
          updatedAt: new Date()
        })
        logger.log('✅ Color theme saved to Firebase')
      } catch (error) {
        logger.warn('⚠️ Failed to save color theme to Firebase:', error)
      }
    }
  }, [user?.id, wedding?.id, canChangeTheme])

  const value: ColorThemeContextType = {
    colorTheme,
    currentPalette,
    changeTheme,
    loading,
    canChangeTheme
  }

  return (
    <ColorThemeContext.Provider value={value}>
      {children}
    </ColorThemeContext.Provider>
  )
}

