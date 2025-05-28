import { useState, useEffect } from 'react'
import { httpsCallable } from 'firebase/functions'
import { auth } from '../lib/firebase'
import { useMarketplaceAuth } from './useAuth'

interface AdminStats {
  users: {
    total: number
    active: number
    verified: number
    new: number
  }
  vendors: {
    total: number
    active: number
    verified: number
    featured: number
    pending: number
  }
  inquiries: {
    total: number
    today: number
    pending: number
  }
  reviews: {
    total: number
    average: number
  }
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAdmin } = useMarketplaceAuth()

  const fetchStats = async () => {
    if (!isAdmin) return

    try {
      setLoading(true)
      setError(null)

      const token = await auth.currentUser?.getIdToken()
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch admin stats')
      }

      const data = await response.json()
      setStats(data.data.stats)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [isAdmin])

  return { stats, loading, error, refresh: fetchStats }
}

export function useAdminVendors() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAdmin } = useMarketplaceAuth()

  const fetchVendors = async (filters = {}) => {
    if (!isAdmin) return

    try {
      setLoading(true)
      setError(null)

      const token = await auth.currentUser?.getIdToken()
      const queryParams = new URLSearchParams(filters).toString()

      const response = await fetch(`/api/admin/vendors?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch vendors')
      }

      const data = await response.json()
      setVendors(data.data.vendors)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const verifyVendor = async (vendorId: string, verified: boolean) => {
    if (!isAdmin) return

    try {
      const token = await auth.currentUser?.getIdToken()
      const response = await fetch(`/api/admin/vendors/${vendorId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ verified })
      })

      if (!response.ok) {
        throw new Error('Failed to verify vendor')
      }

      // Refresh vendors list
      await fetchVendors()

      return true
    } catch (err: any) {
      setError(err.message)
      return false
    }
  }

  const featureVendor = async (vendorId: string, featured: boolean) => {
    if (!isAdmin) return

    try {
      const token = await auth.currentUser?.getIdToken()
      const response = await fetch(`/api/admin/vendors/${vendorId}/feature`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ featured })
      })

      if (!response.ok) {
        throw new Error('Failed to feature vendor')
      }

      // Refresh vendors list
      await fetchVendors()

      return true
    } catch (err: any) {
      setError(err.message)
      return false
    }
  }

  return {
    vendors,
    loading,
    error,
    fetchVendors,
    verifyVendor,
    featureVendor
  }
}

// Hook for system health monitoring
export function useSystemHealth() {
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { isAdmin } = useMarketplaceAuth()

  const checkHealth = async () => {
    if (!isAdmin) return

    try {
      setLoading(true)

      const token = await auth.currentUser?.getIdToken()
      const response = await fetch('/api/admin/system/health', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to check system health')
      }

      const data = await response.json()
      setHealth(data.data)
    } catch (error) {
      console.error('Health check error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()

    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [isAdmin])

  return { health, loading, checkHealth }
}
