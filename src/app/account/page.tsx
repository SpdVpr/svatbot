'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import AccountModal from '@/components/account/AccountModal'
import { Loader2 } from 'lucide-react'

type TabType = 'profile' | 'subscription' | 'payments' | 'statistics' | 'settings' | 'feedback'

function AccountPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()
  const [initialTab, setInitialTab] = useState<TabType>('profile')

  useEffect(() => {
    // Get tab from URL
    const tab = searchParams.get('tab') as TabType
    if (tab && ['profile', 'subscription', 'payments', 'statistics', 'settings', 'feedback'].includes(tab)) {
      setInitialTab(tab)
    }
  }, [searchParams])

  // Redirect to login if not authenticated (after loading completes)
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, router])

  const handleClose = () => {
    // Redirect to dashboard after closing
    router.push('/')
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Načítání...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <AccountModalWrapper
        onClose={handleClose}
        initialTab={initialTab}
      />
    </div>
  )
}

// Wrapper component to pass initialTab to AccountModal
function AccountModalWrapper({
  onClose,
  initialTab
}: {
  onClose: () => void
  initialTab: TabType
}) {
  return <AccountModal onClose={onClose} initialTab={initialTab} />
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Main component with Suspense boundary
export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Načítání...</p>
        </div>
      </div>
    }>
      <AccountPageContent />
    </Suspense>
  )
}

