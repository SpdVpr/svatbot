'use client'

import { useState, useEffect, createContext, useContext, useRef } from 'react'
import { AdminUser, AdminSession, AdminStats } from '@/types/admin'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'

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

  useEffect(() => {
    console.log('🚀 useAdmin effect running')

    // Set timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn('⚠️ Admin auth check timeout (5s) - stopping loading state')
      setIsLoading(false)
    }, 5000) // 5 seconds timeout

    // Set up Firebase auth state listener
    console.log('📡 Setting up Firebase auth listener')
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔄 Auth state changed, user:', firebaseUser?.uid || 'none')
      clearTimeout(loadingTimeout) // Clear timeout when auth state changes

      if (!firebaseUser) {
        // User is signed out
        console.log('👤 No user signed in - setting loading to false')
        setUser(null)
        setSession(null)
        localStorage.removeItem('admin_session')
        setIsLoading(false)
        return
      }

      try {
        console.log('🔍 Checking admin claims for user:', firebaseUser.uid)
        console.log('📧 User email:', firebaseUser.email)

        // Check if user has admin role with timeout
        const idTokenResult = await Promise.race([
          firebaseUser.getIdTokenResult(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Token fetch timeout')), 3000)
          )
        ]) as any

        const role = idTokenResult.claims.role as string
        const isAdmin = idTokenResult.claims.admin as boolean

        console.log('📋 User claims:', {
          role,
          isAdmin,
          allClaims: idTokenResult.claims
        })

        if (!isAdmin || !role) {
          // Not an admin, just set loading to false (don't sign out regular users!)
          console.warn('❌ User does not have admin claims - not an admin')
          console.warn('💡 To fix: Run "node functions/setAdminClaims.js ' + firebaseUser.uid + ' super_admin"')
          // DON'T sign out - this would log out regular users!
          // await signOut(auth)
          setUser(null)
          setSession(null)
          localStorage.removeItem('admin_session')
          setIsLoading(false)
          return
        }

        console.log('✅ Admin user authenticated with role:', role)

        // Create admin user object from Firebase Auth claims
        const adminUser: AdminUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'Admin',
          role: role as 'super_admin' | 'admin' | 'moderator',
          permissions: getPermissionsForRole(role),
          createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
          lastLogin: new Date(),
          isActive: true
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
        console.log('✅ Admin session created, setting loading to false')
        setIsLoading(false)
      } catch (error) {
        console.error('❌ Error loading admin user:', error)
        setUser(null)
        setSession(null)
        localStorage.removeItem('admin_session')
        console.log('❌ Error occurred, setting loading to false')
        setIsLoading(false)
      }
    })

    console.log('✅ Firebase auth listener set up')

    return () => {
      console.log('🧹 Cleaning up useAdmin hook')
      clearTimeout(loadingTimeout)
      unsubscribe()
    }
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get Firebase auth token
        const user = auth.currentUser
        if (!user) {
          throw new Error('Not authenticated')
        }

        const token = await user.getIdToken()

        // Fetch real stats from API with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

        try {
          const response = await fetch(
            'https://europe-west1-svatbot-app.cloudfunctions.net/api/v1/admin/dashboard/stats',
            {
              headers: {
                'Authorization': `Bearer ${token}`
              },
              signal: controller.signal
            }
          )

          clearTimeout(timeoutId)

          if (!response.ok) {
            throw new Error('Failed to fetch stats')
          }

          const data = await response.json()
          setStats(data.data)
        } catch (fetchError) {
          clearTimeout(timeoutId)
          throw fetchError
        }
      } catch (err) {
        console.error('Error fetching admin stats:', err)
        setError(err instanceof Error ? err.message : 'Failed to load statistics')

        // Fallback to empty stats on error
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          onlineUsers: 0,
          newUsersToday: 0,
          newUsersThisWeek: 0,
          newUsersThisMonth: 0,
          totalVendors: 0,
          activeVendors: 0,
          pendingApprovals: 0,
          monthlyRevenue: 0,
          totalRevenue: 0,
          activeSubscriptions: 0,
          trialUsers: 0,
          churnRate: 0,
          avgSessionTime: 0,
          totalSessions: 0,
          avgSessionsPerUser: 0,
          openConversations: 0,
          pendingFeedback: 0,
          avgResponseTime: 0,
          topCategories: [],
          userGrowth: [],
          revenueGrowth: [],
          engagementTrend: []
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}

export const AdminProvider = AdminContext.Provider
export const useAdminContext = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdminContext must be used within AdminProvider')
  }
  return context
}
