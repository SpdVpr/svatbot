'use client'

import { useDemoLock } from '@/hooks/useDemoLock'
import { useAuth } from '@/hooks/useAuth'
import { usePathname } from 'next/navigation'
import { Lock } from 'lucide-react'

/**
 * Global banner that shows when demo account is locked
 * Displays at the top of the page to inform users that changes are not allowed
 */
export default function DemoLockBanner() {
  const { isLocked, loading } = useDemoLock()
  const { logout } = useAuth()
  const pathname = usePathname()

  // List of public pages where banner should not be shown
  const publicPages = [
    '/marketplace', // Marketplace is public
    '/affiliate/register',
    '/wedding/', // Wedding website public pages
    '/w/', // Short wedding website URLs
    '/cookies',
    '/gdpr',
    '/obchodni-podminky',
    '/ochrana-soukromi',
    '/podminky-sluzby',
  ]

  // Check if current page is public
  const isPublicPage = publicPages.some(page => pathname.startsWith(page))

  // Don't show banner while loading, if not locked, or on public pages
  if (loading || !isLocked || isPublicPage) {
    return null
  }

  const handleRegisterClick = async () => {
    // Logout from demo account and redirect to home page for registration
    await logout()
    window.location.href = '/'
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-2 text-yellow-800">
          <Lock className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium text-center">
            🔒 DEMO účet je zamčený - změny nejsou povoleny.{' '}
            <button
              onClick={handleRegisterClick}
              className="underline hover:text-yellow-900 font-semibold cursor-pointer"
            >
              Zaregistrujte si vlastní účet zdarma!
            </button>
          </span>
        </div>
      </div>
    </div>
  )
}

