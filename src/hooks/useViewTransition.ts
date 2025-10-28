'use client'

import { useCallback, useRef } from 'react'

/**
 * Hook pro použití View Transitions API v Next.js 16
 * 
 * View Transitions API umožňuje plynulé animace mezi stavy UI
 * bez nutnosti složitých animačních knihoven.
 * 
 * @example
 * ```tsx
 * const { startTransition, isSupported } = useViewTransition()
 * 
 * const handleClick = () => {
 *   startTransition(() => {
 *     setIsOpen(!isOpen)
 *   })
 * }
 * ```
 */
export function useViewTransition() {
  const isSupported = useRef(
    typeof document !== 'undefined' && 
    'startViewTransition' in document
  )

  /**
   * Spustí view transition s fallbackem pro nepodporované prohlížeče
   * 
   * @param callback - Funkce, která mění stav UI
   * @returns Promise, který se vyřeší po dokončení transition
   */
  const startTransition = useCallback(async (callback: () => void) => {
    if (!isSupported.current || !(document as any).startViewTransition) {
      // Fallback pro nepodporované prohlížeče
      callback()
      return Promise.resolve()
    }

    try {
      const transition = (document as any).startViewTransition(() => {
        callback()
      })
      
      return transition.finished
    } catch (error) {
      console.warn('View Transition failed, falling back to instant update:', error)
      callback()
      return Promise.resolve()
    }
  }, [])

  /**
   * Spustí view transition s custom animací
   * 
   * @param callback - Funkce, která mění stav UI
   * @param options - Možnosti pro transition
   * @returns Promise, který se vyřeší po dokončení transition
   */
  const startTransitionWithOptions = useCallback(async (
    callback: () => void,
    options?: {
      duration?: number
      easing?: string
    }
  ) => {
    if (!isSupported.current || !(document as any).startViewTransition) {
      callback()
      return Promise.resolve()
    }

    try {
      // Dočasně nastavit CSS proměnné pro custom animaci
      if (options?.duration) {
        document.documentElement.style.setProperty('--vt-duration', `${options.duration}ms`)
      }
      if (options?.easing) {
        document.documentElement.style.setProperty('--vt-easing', options.easing)
      }

      const transition = (document as any).startViewTransition(() => {
        callback()
      })
      
      await transition.finished

      // Vyčistit CSS proměnné
      if (options?.duration) {
        document.documentElement.style.removeProperty('--vt-duration')
      }
      if (options?.easing) {
        document.documentElement.style.removeProperty('--vt-easing')
      }

      return transition.finished
    } catch (error) {
      console.warn('View Transition failed, falling back to instant update:', error)
      callback()
      return Promise.resolve()
    }
  }, [])

  return {
    startTransition,
    startTransitionWithOptions,
    isSupported: isSupported.current
  }
}

/**
 * Hook pro animaci floating elementů s View Transitions
 * 
 * @example
 * ```tsx
 * const { animateFloat } = useFloatingTransition()
 * 
 * <div 
 *   style={{ viewTransitionName: 'modal-1' }}
 *   onClick={() => animateFloat(() => setIsOpen(true))}
 * >
 *   Open Modal
 * </div>
 * ```
 */
export function useFloatingTransition() {
  const { startTransitionWithOptions, isSupported } = useViewTransition()

  const animateFloat = useCallback((callback: () => void) => {
    return startTransitionWithOptions(callback, {
      duration: 400,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    })
  }, [startTransitionWithOptions])

  const animateModal = useCallback((callback: () => void) => {
    return startTransitionWithOptions(callback, {
      duration: 300,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
    })
  }, [startTransitionWithOptions])

  const animateToast = useCallback((callback: () => void) => {
    return startTransitionWithOptions(callback, {
      duration: 250,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    })
  }, [startTransitionWithOptions])

  return {
    animateFloat,
    animateModal,
    animateToast,
    isSupported
  }
}

/**
 * Utility funkce pro přidání view-transition-name k elementu
 * 
 * @param name - Unikátní název pro view transition
 * @returns Style objekt s view-transition-name
 * 
 * @example
 * ```tsx
 * <div style={getViewTransitionName('my-element')}>
 *   Content
 * </div>
 * ```
 */
export function getViewTransitionName(name: string): React.CSSProperties {
  return {
    viewTransitionName: name
  } as React.CSSProperties
}

/**
 * Utility funkce pro podmíněné přidání view-transition-name
 * 
 * @param name - Unikátní název pro view transition
 * @param condition - Podmínka, kdy přidat view-transition-name
 * @returns Style objekt s view-transition-name nebo prázdný objekt
 */
export function getConditionalViewTransitionName(
  name: string, 
  condition: boolean
): React.CSSProperties {
  return condition ? getViewTransitionName(name) : {}
}

