'use client'

import { useColorThemeContext } from './ColorThemeProvider'

/**
 * PNG Pattern component with wedding-themed motifs
 * Uses pattern1.png from public folder with color adjustments
 */
export default function WeddingPattern() {
  const { currentPalette } = useColorThemeContext()

  // Helper function to adjust pattern color based on theme
  const getHueRotation = (primaryColor: string): number => {
    // Map primary colors to hue rotation values
    const colorMap: { [key: string]: number } = {
      '#f8bbd9': 0,    // rose - no rotation
      '#e9d5ff': 30,   // lavender
      '#bfdbfe': 180,  // sky
      '#bbf7d0': 120,  // mint
      '#fed7aa': 20,   // peach
    }

    return colorMap[primaryColor.toLowerCase()] || 0
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: 'url(/pattern3.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto',
        opacity: 0.15,
        mixBlendMode: 'multiply',
        filter: `hue-rotate(${getHueRotation(currentPalette.colors.primary)}deg) saturate(1.2)`
      }}
    />
  )
}

