'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useFloatingTransition, getViewTransitionName } from '@/hooks/useViewTransition'

interface ViewTransitionModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  transitionName?: string
}

/**
 * Modal komponenta s View Transitions API
 * 
 * Tato komponenta demonstruje použití View Transitions API v Next.js 16
 * pro plynulé animace při otevírání a zavírání modalu.
 * 
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false)
 * 
 * <ViewTransitionModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Můj Modal"
 *   transitionName="my-modal"
 * >
 *   <p>Obsah modalu</p>
 * </ViewTransitionModal>
 * ```
 */
export default function ViewTransitionModal({
  isOpen,
  onClose,
  title,
  children,
  transitionName = 'modal'
}: ViewTransitionModalProps) {
  const { animateModal, isSupported } = useFloatingTransition()

  // Zavřít modal při stisku Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Zabránit scrollování pozadí když je modal otevřený
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleClose = () => {
    if (isSupported) {
      animateModal(() => {
        onClose()
      })
    } else {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        style={getViewTransitionName(`${transitionName}-backdrop`)}
      />

      {/* Modal Content */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        style={getViewTransitionName(transitionName)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
          <h2 className="text-2xl font-bold text-gray-900">
            {title}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            aria-label="Zavřít"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * Toast komponenta s View Transitions API
 */
interface ViewTransitionToastProps {
  isVisible: boolean
  type?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  onClose: () => void
  transitionName?: string
}

export function ViewTransitionToast({
  isVisible,
  type = 'info',
  title,
  message,
  onClose,
  transitionName = 'toast'
}: ViewTransitionToastProps) {
  const { animateToast, isSupported } = useFloatingTransition()

  const typeColors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const handleClose = () => {
    if (isSupported) {
      animateToast(() => {
        onClose()
      })
    } else {
      onClose()
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg border-l-4 p-4 ${typeColors[type]}`}
      style={getViewTransitionName(transitionName)}
    >
      <div className="flex items-start">
        <div className="flex-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-sm mt-1 opacity-90">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/**
 * Floating Button komponenta s View Transitions API
 */
interface ViewTransitionFloatingButtonProps {
  isVisible: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  transitionName?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

export function ViewTransitionFloatingButton({
  isVisible,
  onClick,
  icon,
  label,
  transitionName = 'floating-button',
  position = 'bottom-right'
}: ViewTransitionFloatingButtonProps) {
  const { animateFloat, isSupported } = useFloatingTransition()

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  }

  const handleClick = () => {
    if (isSupported) {
      animateFloat(() => {
        onClick()
      })
    } else {
      onClick()
    }
  }

  if (!isVisible) return null

  return (
    <button
      onClick={handleClick}
      className={`fixed ${positionClasses[position]} z-40 w-14 h-14 bg-gradient-to-r from-primary-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group`}
      style={getViewTransitionName(transitionName)}
      aria-label={label}
      title={label}
    >
      {icon}
      
      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {label}
      </span>
    </button>
  )
}

