'use client'

import { useState, useEffect, createContext, useContext, useRef } from 'react'
import { AdminUser, AdminSession, AdminStats } from '@/types/admin'
import { auth, db } from '@/lib/firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

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

// Helper function to get permissions based on role
function getPermissionsForRole(role: string) {
  if (role === 'super_admin') {
    return [
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
    ]
  } else if (role === 'admin') {
    return [
      {
        resource: 'vendors' as const,
        actions: ['read', 'update'] as ('read' | 'update')[]
      },
      {
        resource: 'users' as const,
        actions: ['read'] as ('read')[]
      },
      {
        resource: 'analytics' as const,
        actions: ['read'] as ('read')[]
      }
    ]
  } else if (role === 'moderator') {
    return [
      {
        resource: 'vendors' as const,
        actions: ['read', 'update'] as ('read' | 'update')[]
      },
      {
        resource: 'users' as const,
        actions: ['read'] as ('read')[]
      }
    ]
  }
  return []
}

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
  const isInitialized = useRef(false)

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized.current) return
    isInitialized.current = true

    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        // User is signed out
        setUser(null)
        setSession(null)
        localStorage.removeItem('admin_session')
        setIsLoading(false)
        return
      }

      try {
        // Check if user has admin role
        const idTokenResult = await firebaseUser.getIdTokenResult()
        const role = idTokenResult.claims.role as string
        const isAdmin = idTokenResult.claims.admin as boolean

        if (!isAdmin || !role) {
          // Not an admin, sign out
          await signOut(auth)
          setUser(null)
          setSession(null)
          localStorage.removeItem('admin_session')
          setIsLoading(false)
          return
        }

        // Get admin user data from Firestore
        const adminUserDoc = await getDoc(doc(db, 'adminUsers', firebaseUser.uid))

        if (!adminUserDoc.exists() || !adminUserDoc.data().isActive) {
          // Admin document doesn't exist or is not active
          await signOut(auth)
          setUser(null)
          setSession(null)
          localStorage.removeItem('admin_session')
          setIsLoading(false)
          return
        }

        const adminData = adminUserDoc.data()

        // Create admin user object
        const adminUser: AdminUser = {
          id: firebaseUser.uid,
          email: adminData.email,
          name: adminData.name || 'Admin',
          role: adminData.role,
          permissions: getPermissionsForRole(adminData.role),
          createdAt: adminData.createdAt?.toDate() || new Date(),
          lastLogin: new Date(),
          isActive: adminData.isActive
        }

        // Create session
        const newSession: AdminSession = {
          user: adminUser,
          token: await firebaseUser.getIdToken(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }

        setSession(newSession)
        setUser(adminUser)
        localStorage.setItem('admin_session', JSON.stringify({
          ...newSession,
          user: {
            ...adminUser,
            createdAt: adminUser.createdAt.toISOString(),
            lastLogin: adminUser.lastLogin?.toISOString()
          }
        }))
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading admin user:', error)
        setUser(null)
        setSession(null)
        localStorage.removeItem('admin_session')
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Login attempt:', { email })

      // Sign in with Firebase Authentication
      // The onAuthStateChanged listener will handle setting the user state
      await signInWithEmailAndPassword(auth, email, password)

      console.log('✅ Admin login successful')
      return true

    } catch (error: any) {
      console.error('❌ Login error:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      // signOut will trigger onAuthStateChanged which will clean up the state
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
    }
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
        // Users
        totalUsers: 1247,
        activeUsers: 856,
        onlineUsers: 42,
        newUsersToday: 12,
        newUsersThisWeek: 87,
        newUsersThisMonth: 342,

        // Vendors
        totalVendors: 11,
        activeVendors: 11,
        pendingApprovals: 3,

        // Finance
        monthlyRevenue: 45600,
        totalRevenue: 234500,
        activeSubscriptions: 156,
        trialUsers: 89,
        churnRate: 3.2,

        // Engagement
        avgSessionTime: 24.5,
        totalSessions: 5432,
        avgSessionsPerUser: 4.3,

        // Support
        openConversations: 8,
        pendingFeedback: 5,
        avgResponseTime: 2.4,

        // Top Categories
        topCategories: [
          { category: 'photographer', count: 6 },
          { category: 'venue', count: 1 },
          { category: 'catering', count: 1 },
          { category: 'music', count: 1 },
          { category: 'flowers', count: 1 },
          { category: 'dress', count: 1 }
        ],

        // Charts Data
        userGrowth: [],
        revenueGrowth: [],
        engagementTrend: []
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
