'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { AdminUser, AdminSession, AdminStats } from '@/types/admin'

interface AdminContextType {
  user: AdminUser | null
  session: AdminSession | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  checkPermission: (resource: string, action: string) => boolean
}

const AdminContext = createContext<AdminContextType | null>(null)

// Mock admin users for development
const MOCK_ADMIN_USERS = [
  {
    id: 'admin-001',
    email: 'admin@svatbot.cz',
    name: 'Admin SvatBot',
    role: 'super_admin' as const,
    permissions: [
      {
        resource: 'vendors' as const,
        actions: ['create', 'read', 'update', 'delete'] as ('create' | 'read' | 'update' | 'delete')[]
      },
      {
        resource: 'users' as const,
        actions: ['create', 'read', 'update', 'delete'] as ('create' | 'read' | 'update' | 'delete')[]
      },
      {
        resource: 'orders' as const,
        actions: ['read', 'update'] as ('read' | 'update')[]
      },
      {
        resource: 'analytics' as const,
        actions: ['read'] as ('read')[]
      },
      {
        resource: 'settings' as const,
        actions: ['read', 'update'] as ('read' | 'update')[]
      }
    ],
    createdAt: new Date('2024-01-01'),
    isActive: true
  },
  {
    id: 'admin-002',
    email: 'moderator@svatbot.cz',
    name: 'Moderátor SvatBot',
    role: 'moderator' as const,
    permissions: [
      {
        resource: 'vendors' as const,
        actions: ['read', 'update'] as ('read' | 'update')[]
      },
      {
        resource: 'users' as const,
        actions: ['read'] as ('read')[]
      }
    ],
    createdAt: new Date('2024-01-01'),
    isActive: true
  }
]

export function useAdmin() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [session, setSession] = useState<AdminSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedSession = localStorage.getItem('admin_session')
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession)
        if (new Date(parsedSession.expiresAt) > new Date()) {
          setSession(parsedSession)
          setUser(parsedSession.user)
        } else {
          localStorage.removeItem('admin_session')
        }
      } catch (error) {
        localStorage.removeItem('admin_session')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Mock authentication - in production, this would be a real API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const adminUser = MOCK_ADMIN_USERS.find(u => u.email === email)

    if (adminUser && password === 'admin123') {
      const newSession: AdminSession = {
        user: { ...adminUser, lastLogin: new Date() },
        token: 'mock-jwt-token-' + Date.now(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }

      setSession(newSession)
      setUser(newSession.user)
      localStorage.setItem('admin_session', JSON.stringify(newSession))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    setSession(null)
    localStorage.removeItem('admin_session')
  }

  const checkPermission = (resource: string, action: string): boolean => {
    if (!user) return false

    const permission = user.permissions.find(p => p.resource === resource)
    return permission ? permission.actions.includes(action as any) : false
  }

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkPermission
  }
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock stats - in production, this would fetch from API
    setTimeout(() => {
      setStats({
        totalVendors: 11,
        activeVendors: 11,
        pendingApprovals: 3,
        totalUsers: 1247,
        monthlyRevenue: 45600,
        topCategories: [
          { category: 'photographer', count: 6 },
          { category: 'venue', count: 1 },
          { category: 'catering', count: 1 },
          { category: 'music', count: 1 },
          { category: 'flowers', count: 1 },
          { category: 'dress', count: 1 }
        ]
      })
      setLoading(false)
    }, 500)
  }, [])

  return { stats, loading }
}

export const AdminProvider = AdminContext.Provider
export const useAdminContext = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdminContext must be used within AdminProvider')
  }
  return context
}
