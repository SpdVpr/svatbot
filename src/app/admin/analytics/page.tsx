'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminAnalytics() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard - analytics is now integrated there
    router.replace('/admin/dashboard')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}

