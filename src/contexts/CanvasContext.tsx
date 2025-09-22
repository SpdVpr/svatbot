'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type CanvasWidth = 'normal' | 'wide' | 'ultra-wide' | 'full-screen'

const CANVAS_CONFIGS = {
  'normal': { maxWidth: 'max-w-7xl', label: 'Normální šířka', description: 'Standardní šířka pro většinu monitorů' },
  'wide': { maxWidth: 'max-w-[1600px]', label: 'Široká plocha', description: 'Rozšířená plocha pro široké monitory' },
  'ultra-wide': { maxWidth: 'max-w-[2000px]', label: 'Ultra široká plocha', description: 'Maximální využití ultra-wide monitorů' },
  'full-screen': { maxWidth: 'max-w-none', label: 'Celá obrazovka', description: 'Využití celé šířky obrazovky' }
}

interface CanvasContextType {
  canvasWidth: CanvasWidth
  setCanvasWidth: (width: CanvasWidth) => void
  getCanvasConfig: () => typeof CANVAS_CONFIGS[CanvasWidth]
  getCanvasMaxWidth: () => string
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined)

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [canvasWidth, setCanvasWidth] = useState<CanvasWidth>('normal')

  const getCanvasConfig = () => CANVAS_CONFIGS[canvasWidth]
  const getCanvasMaxWidth = () => CANVAS_CONFIGS[canvasWidth].maxWidth

  return (
    <CanvasContext.Provider value={{
      canvasWidth,
      setCanvasWidth,
      getCanvasConfig,
      getCanvasMaxWidth
    }}>
      {children}
    </CanvasContext.Provider>
  )
}

export function useCanvas() {
  const context = useContext(CanvasContext)
  if (context === undefined) {
    throw new Error('useCanvas must be used within a CanvasProvider')
  }
  return context
}

export { CANVAS_CONFIGS }
export type { CanvasWidth }
