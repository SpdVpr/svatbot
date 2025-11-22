'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Home, LucideIcon, Menu } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import MobileMenu from '@/components/navigation/MobileMenu'

interface ModuleHeaderProps {
  /** Icon component from lucide-react or emoji string */
  icon: LucideIcon | string
  /** Module title (e.g., "Úkoly", "Hosté", "Rozpočet") */
  title: string
  /** Subtitle/description text */
  subtitle: string
  /** Icon background gradient colors (e.g., "from-blue-500 to-purple-500") */
  iconGradient?: string
  /** Icon color if not using gradient (e.g., "text-blue-600") */
  iconColor?: string
  /** Additional actions to display on the right side */
  actions?: React.ReactNode
  /** Stats to display on the right side (desktop only) */
  stats?: React.ReactNode
  /** Hide the default back button (useful when actions contains a custom back button) */
  hideBackButton?: boolean
  /** Use full width container instead of max-w-7xl */
  fullWidth?: boolean
  /** Custom max width (e.g., "max-w-[1600px]") */
  maxWidth?: string
}

export default function ModuleHeader({
  icon,
  title,
  subtitle,
  iconGradient = 'from-purple-500 to-pink-500',
  iconColor,
  actions,
  stats,
  hideBackButton = false,
  fullWidth = false,
  maxWidth
}: ModuleHeaderProps) {
  const router = useRouter()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Check if icon is a string (emoji) or a component
  const isEmojiIcon = typeof icon === 'string'
  const Icon = !isEmojiIcon ? icon as LucideIcon : null

  // Determine container class based on props
  const containerClass = fullWidth
    ? `px-4 md:px-6 lg:px-8 mx-auto ${maxWidth || 'max-w-[1600px]'}`
    : 'container-desktop'

  return (
    <>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className={`${containerClass} py-2 sm:py-4`}>
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left side - Navigation and Title */}
            <div className="flex items-center gap-1 sm:gap-3 min-w-0 flex-1">
              {/* Mobile Menu button (visible only on mobile) */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className="sm:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors group flex-shrink-0"
                title="Menu"
              >
                <Menu className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
              </button>

              {/* Module icon in square */}
              <div
                className="w-8 h-8 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0"
              >
                {isEmojiIcon ? (
                  <span className="text-lg sm:text-2xl">{icon}</span>
                ) : Icon ? (
                  <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-primary-600" />
                ) : null}
              </div>

              {/* Title and subtitle */}
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">{title}</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate hidden sm:block">{subtitle}</p>
              </div>
            </div>

            {/* Right side - Stats and Actions */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {stats && <div className="hidden lg:block">{stats}</div>}
              {actions && <div className="flex-shrink-0">{actions}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
      />
    </>
  )
}

