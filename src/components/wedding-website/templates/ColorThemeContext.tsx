'use client'

import { createContext, useContext, ReactNode } from 'react'

export interface ColorTheme {
  name: string
  primary: string
  secondary: string
  accent: string
  bgGradientFrom: string
  bgGradientTo: string
}

export const COLOR_THEMES: Record<string, ColorTheme> = {
  amber: {
    name: 'Jantarová & Růžová',
    primary: '#f59e0b', // amber-500
    secondary: '#f43f5e', // rose-500
    accent: '#fbbf24', // amber-400
    bgGradientFrom: '#fef3c7', // amber-100
    bgGradientTo: '#fecdd3', // rose-200
  },
  purple: {
    name: 'Fialová & Růžová',
    primary: '#a855f7', // purple-500
    secondary: '#ec4899', // pink-500
    accent: '#c084fc', // purple-400
    bgGradientFrom: '#f3e8ff', // purple-100
    bgGradientTo: '#fce7f3', // pink-100
  },
  blue: {
    name: 'Modrá & Tyrkysová',
    primary: '#3b82f6', // blue-500
    secondary: '#06b6d4', // cyan-500
    accent: '#60a5fa', // blue-400
    bgGradientFrom: '#dbeafe', // blue-100
    bgGradientTo: '#cffafe', // cyan-100
  },
  green: {
    name: 'Zelená & Mátová',
    primary: '#10b981', // emerald-500
    secondary: '#14b8a6', // teal-500
    accent: '#34d399', // emerald-400
    bgGradientFrom: '#d1fae5', // emerald-100
    bgGradientTo: '#ccfbf1', // teal-100
  },
  rose: {
    name: 'Růžová & Korálová',
    primary: '#f43f5e', // rose-500
    secondary: '#fb7185', // rose-400
    accent: '#fda4af', // rose-300
    bgGradientFrom: '#ffe4e6', // rose-100
    bgGradientTo: '#fecdd3', // rose-200
  },
  burgundy: {
    name: 'Burgundská & Zlatá',
    primary: '#991b1b', // red-800
    secondary: '#d97706', // amber-600
    accent: '#b91c1c', // red-700
    bgGradientFrom: '#fee2e2', // red-100
    bgGradientTo: '#fef3c7', // amber-100
  },
  navy: {
    name: 'Námořnická & Zlatá',
    primary: '#1e3a8a', // blue-900
    secondary: '#d97706', // amber-600
    accent: '#1e40af', // blue-800
    bgGradientFrom: '#dbeafe', // blue-100
    bgGradientTo: '#fef3c7', // amber-100
  },
  sage: {
    name: 'Šalvějová & Béžová',
    primary: '#84cc16', // lime-500
    secondary: '#a8a29e', // stone-400
    accent: '#a3e635', // lime-400
    bgGradientFrom: '#ecfccb', // lime-100
    bgGradientTo: '#f5f5f4', // stone-100
  },
}

interface ColorThemeContextType {
  theme: ColorTheme
  themeName: string
}

const ColorThemeContext = createContext<ColorThemeContextType>({
  theme: COLOR_THEMES.amber,
  themeName: 'amber',
})

export const useColorTheme = () => useContext(ColorThemeContext)

interface ColorThemeProviderProps {
  children: ReactNode
  themeName?: string
  customTheme?: ColorTheme
}

export function ColorThemeProvider({ children, themeName = 'default', customTheme }: ColorThemeProviderProps) {
  // Pokud je themeName 'custom' a máme customTheme, použijeme ho
  // Pokud je themeName 'default', nepoužijeme žádnou paletu (šablona použije své vlastní barvy)
  // Jinak použijeme předpřipravenou paletu
  const theme = themeName === 'custom' && customTheme
    ? customTheme
    : themeName === 'default'
    ? null
    : (COLOR_THEMES[themeName] || null)

  return (
    <ColorThemeContext.Provider value={{ theme: theme || COLOR_THEMES.amber, themeName }}>
      {children}
    </ColorThemeContext.Provider>
  )
}

