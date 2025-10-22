'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Home, LucideIcon, Menu } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import MobileMenu from '@/components/navigation/MobileMenu'

interface ModuleHeaderProps {
  /** Icon component from lucide-react */
  icon: LucideIcon
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
}

export default function ModuleHeader({
  icon: Icon,
  title,
  subtitle,
  iconGradient = 'from-purple-500 to-pink-500',
  iconColor,
  actions,
  stats
}: ModuleHeaderProps) {
  const router = useRouter()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container-desktop py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Navigation and Title */}
            <div className="flex items-center space-x-3">
              {/* Mobile Menu button (visible only on mobile) */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors group flex-shrink-0"
                title="Menu"
              >
                <Menu className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
              </button>

              {/* Back button (visible only on desktop) */}
              <button
                onClick={() => router.push('/')}
                className="hidden sm:block p-2 hover:bg-gray-100 rounded-lg transition-colors group flex-shrink-0"
                title="Zpět na dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
              </button>

              {/* Home icon */}
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                title="Dashboard"
              >
                <Home className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </Link>

            {/* Module icon in square */}
            <div
              className={`w-12 h-12 ${
                iconGradient ? `bg-gradient-to-br ${iconGradient}` : 'bg-gray-100'
              } rounded-lg flex items-center justify-center flex-shrink-0`}
            >
              <Icon className={`w-6 h-6 ${iconColor || 'text-white'}`} />
            </div>

            {/* Title and subtitle */}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{title}</h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">{subtitle}</p>
            </div>
          </div>

          {/* Right side - Stats and Actions */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {stats && <div className="hidden lg:block">{stats}</div>}
            {actions && <div>{actions}</div>}
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

