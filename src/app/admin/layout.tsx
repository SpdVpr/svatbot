'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAdmin, AdminProvider } from '@/hooks/useAdmin'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { Loader2 } from 'lucide-react'

function AdminLayoutContent({
  children,
  adminHook,
}: {
  children: React.ReactNode
  adminHook: ReturnType<typeof useAdmin>
}) {
  const { isAuthenticated, isLoading } = adminHook
  const router = useRouter()
  const pathname = usePathname()
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) return

    if (!isLoading && !isAuthenticated && pathname !== '/admin/login') {
      hasRedirected.current = true
      router.push('/admin/login')
    }
  }, [isAuthenticated, isLoading, pathname, router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  // Show login page
  if (!isAuthenticated && pathname === '/admin/login') {
    return children
  }

  // Show admin dashboard layout
  if (isAuthenticated) {
    return (
      <div className="min-h-screen">
        <AdminSidebar />
        <div className="lg:pl-64">
          <AdminHeader />
          <main className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Fallback loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const adminHook = useAdmin()

  return (
    <AdminProvider value={adminHook}>
      <AdminLayoutContent adminHook={adminHook}>{children}</AdminLayoutContent>
    </AdminProvider>
  )
}
