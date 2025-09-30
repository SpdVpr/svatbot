'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAdmin } from '@/hooks/useAdmin'
import {
  LayoutDashboard,
  Store,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Plus,
  Heart,
  Menu,
  X,
  CheckCircle
} from 'lucide-react'

interface NavigationItem {
  name: string
  href: string
  icon: any
  permission: { resource: string; action: string }
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    permission: { resource: 'analytics', action: 'read' }
  },
  {
    name: 'Dodavatelé',
    href: '/admin/vendors',
    icon: Store,
    permission: { resource: 'vendors', action: 'read' }
  },
  {
    name: 'Přidat dodavatele',
    href: '/admin/vendors/new',
    icon: Plus,
    permission: { resource: 'vendors', action: 'create' }
  },
  {
    name: 'Marketplace registrace',
    href: '/admin/marketplace',
    icon: CheckCircle,
    permission: { resource: 'vendors', action: 'read' }
  },
  {
    name: 'Uživatelé',
    href: '/admin/users',
    icon: Users,
    permission: { resource: 'users', action: 'read' }
  },
  {
    name: 'Objednávky',
    href: '/admin/orders',
    icon: ShoppingCart,
    permission: { resource: 'orders', action: 'read' }
  },
  {
    name: 'Analytika',
    href: '/admin/analytics',
    icon: BarChart3,
    permission: { resource: 'analytics', action: 'read' }
  },
  {
    name: 'Nastavení',
    href: '/admin/settings',
    icon: Settings,
    permission: { resource: 'settings', action: 'read' }
  }
]

export default function AdminSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { checkPermission } = useAdmin()

  const filteredNavigation = navigation.filter(item =>
    checkPermission(item.permission.resource, item.permission.action)
  )

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 flex z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent navigation={filteredNavigation} pathname={pathname} />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <SidebarContent navigation={filteredNavigation} pathname={pathname} />
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          type="button"
          className="fixed top-4 left-4 z-50 bg-white p-2 rounded-md shadow-lg border border-gray-200"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6 text-gray-600" />
        </button>
      </div>
    </>
  )
}

function SidebarContent({
  navigation,
  pathname
}: {
  navigation: NavigationItem[]
  pathname: string
}) {
  return (
    <>
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-600">
        <div className="flex items-center space-x-3">
          <Heart className="h-8 w-8 text-white" />
          <div>
            <h1 className="text-white font-bold text-lg">SvatBot</h1>
            <p className="text-primary-200 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
