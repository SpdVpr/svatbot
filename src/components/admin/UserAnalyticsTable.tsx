'use client'

import { useState } from 'react'
import { useUserAnalytics } from '@/hooks/useAdminDashboard'
import { UserAnalytics } from '@/types/admin'
import { db } from '@/config/firebase'
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'
import {
  User,
  Clock,
  Activity,
  Calendar,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Eye,
  TrendingUp
} from 'lucide-react'

type SortField = 'lastActivity' | 'loginCount' | 'sessionTime' | 'aiQueries'
type SortDirection = 'asc' | 'desc'

export default function UserAnalyticsTable() {
  const { users, loading } = useUserAnalytics()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterOnline, setFilterOnline] = useState<'all' | 'online' | 'offline'>('all')
  const [sortBy, setSortBy] = useState<SortField>('lastActivity')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [fixing, setFixing] = useState(false)
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new field with default desc direction
      setSortBy(field)
      setSortDirection('desc')
    }
  }

  const filteredUsers = users
    .filter(user => {
      const matchesSearch =
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilter =
        filterOnline === 'all' ||
        (filterOnline === 'online' && user.isOnline) ||
        (filterOnline === 'offline' && !user.isOnline)

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'lastActivity':
          comparison = (b.lastActivityAt?.toMillis() || 0) - (a.lastActivityAt?.toMillis() || 0)
          break
        case 'loginCount':
          comparison = (b.loginCount || 0) - (a.loginCount || 0)
          break
        case 'sessionTime':
          comparison = (b.totalSessionTime || 0) - (a.totalSessionTime || 0)
          break
        case 'aiQueries':
          comparison = (b.aiQueriesCount || 0) - (a.aiQueriesCount || 0)
          break
        default:
          comparison = 0
      }

      return sortDirection === 'asc' ? -comparison : comparison
    })

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Nikdy'
    const date = timestamp.toDate()
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Právě teď'
    if (diff < 3600000) return `Před ${Math.floor(diff / 60000)} min`
    if (diff < 86400000) return `Před ${Math.floor(diff / 3600000)} h`
    
    return date.toLocaleDateString('cs-CZ', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes: number | undefined | null) => {
    // Handle undefined, null, or 0
    if (!minutes || minutes === 0) return '0 min'

    if (minutes < 60) return `${Math.round(minutes)} min`
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}m`
  }

  const fixUserAnalytics = async () => {
    if (!confirm('Opravit chybějící email, displayName a totalSessionTime v userAnalytics? Toto může trvat několik sekund.')) {
      return
    }

    setFixing(true)
    try {
      const analyticsSnapshot = await getDocs(collection(db, 'userAnalytics'))
      let fixed = 0
      let skipped = 0
      let sessionTimeFixed = 0

      for (const analyticsDoc of analyticsSnapshot.docs) {
        const data = analyticsDoc.data()
        const userId = analyticsDoc.id
        const updates: any = {}

        // Check if email or displayName is missing
        if (!data.email || !data.displayName || data.displayName === 'Unknown') {
          try {
            const userDoc = await getDoc(doc(db, 'users', userId))

            if (userDoc.exists()) {
              const userData = userDoc.data()

              if (!data.email && userData.email) {
                updates.email = userData.email
              }

              if ((!data.displayName || data.displayName === 'Unknown') && userData.displayName) {
                updates.displayName = userData.displayName
              } else if ((!data.displayName || data.displayName === 'Unknown') && userData.email) {
                updates.displayName = userData.email.split('@')[0]
              }
            }
          } catch (error) {
            console.error(`Error loading user data for ${userId}:`, error)
          }
        }

        // Check if totalSessionTime needs to be calculated from sessions
        if ((!data.totalSessionTime || data.totalSessionTime === 0) && data.sessions && data.sessions.length > 0) {
          // Calculate total session time from all sessions
          let calculatedTime = 0
          data.sessions.forEach((session: any) => {
            if (session.duration && session.duration > 0) {
              calculatedTime += session.duration
            } else if (session.startTime && session.endTime) {
              // Calculate duration from start and end time
              const start = session.startTime.toDate ? session.startTime.toDate() : new Date(session.startTime)
              const end = session.endTime.toDate ? session.endTime.toDate() : new Date(session.endTime)
              const duration = Math.floor((end.getTime() - start.getTime()) / 1000 / 60)
              if (duration > 0) {
                calculatedTime += duration
              }
            }
          })

          if (calculatedTime > 0) {
            updates.totalSessionTime = calculatedTime
            sessionTimeFixed++
          }
        }

        // Apply updates if any
        if (Object.keys(updates).length > 0) {
          try {
            await updateDoc(doc(db, 'userAnalytics', userId), updates)
            fixed++
          } catch (error) {
            console.error(`Error updating user ${userId}:`, error)
          }
        } else {
          skipped++
        }
      }

      alert(`Opraveno: ${fixed} záznamů\nCelkový čas opraven: ${sessionTimeFixed} uživatelů\nPřeskočeno: ${skipped} záznamů`)
    } catch (error) {
      console.error('Error fixing analytics:', error)
      alert('Chyba při opravě dat')
    } finally {
      setFixing(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['Email', 'Jméno', 'Registrace', 'Poslední aktivita', 'Počet přihlášení', 'Celkový čas (min)', 'Ø čas/session (min)', 'AI dotazy', 'Online']
    const rows = filteredUsers.map(user => {
      const sessionCount = user.sessions?.length || 0
      const totalTime = user.totalSessionTime || 0
      const avgTime = sessionCount > 0 ? Math.round(totalTime / sessionCount) : 0

      return [
        user.email,
        user.displayName,
        user.registeredAt?.toDate().toLocaleDateString('cs-CZ') || '',
        user.lastActivityAt?.toDate().toLocaleDateString('cs-CZ') || '',
        user.loginCount || 0,
        totalTime,
        avgTime,
        user.aiQueriesCount || 0,
        user.isOnline ? 'Ano' : 'Ne'
      ]
    })

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `user-analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            Uživatelská analytika
          </h2>
          <div className="flex gap-2">
            <button
              onClick={fixUserAnalytics}
              disabled={fixing}
              className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 md:w-4 md:h-4 ${fixing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{fixing ? 'Opravuji...' : 'Opravit data'}</span>
              <span className="sm:hidden">Opravit</span>
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm"
            >
              <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Hledat uživatele..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterOnline}
              onChange={(e) => setFilterOnline(e.target.value as any)}
              className="flex-1 sm:flex-none px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Všichni</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden">
        <div className="divide-y divide-gray-100">
          {filteredUsers.map((user) => (
            <MobileUserCard
              key={user.id}
              user={user}
              formatDate={formatDate}
              formatDuration={formatDuration}
              isExpanded={expandedUserId === user.id}
              onToggle={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
            />
          ))}
        </div>
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 px-4">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Žádní uživatelé nenalezeni</p>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uživatel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('lastActivity')}
              >
                <div className="flex items-center gap-2">
                  Poslední aktivita
                  {sortBy === 'lastActivity' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                  ) : (
                    <ArrowUpDown className="w-4 h-4 opacity-30" />
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('loginCount')}
              >
                <div className="flex items-center gap-2">
                  Přihlášení
                  {sortBy === 'loginCount' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                  ) : (
                    <ArrowUpDown className="w-4 h-4 opacity-30" />
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('sessionTime')}
              >
                <div className="flex items-center gap-2">
                  Celkový čas
                  {sortBy === 'sessionTime' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                  ) : (
                    <ArrowUpDown className="w-4 h-4 opacity-30" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ø čas/session
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('aiQueries')}
              >
                <div className="flex items-center gap-2">
                  AI dotazy
                  {sortBy === 'aiQueries' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                  ) : (
                    <ArrowUpDown className="w-4 h-4 opacity-30" />
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <>
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button className="mr-2 text-gray-400 hover:text-gray-600">
                        {expandedUserId === user.id ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.displayName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.isOnline
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}></span>
                      {user.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatDate(user.lastActivityAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-gray-400" />
                      {user.loginCount || 0}×
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={user.totalSessionTime && user.totalSessionTime > 0 ? 'font-semibold text-blue-600' : 'text-gray-400'}>
                      {formatDuration(user.totalSessionTime || 0)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(() => {
                      const sessionCount = user.sessions?.length || 0
                      const totalTime = user.totalSessionTime || 0
                      const avgTime = sessionCount > 0 ? totalTime / sessionCount : 0
                      return formatDuration(avgTime)
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      {user.aiQueriesCount || 0}
                    </div>
                  </td>
                </tr>

                {/* Expanded Details Row */}
                {expandedUserId === user.id && (
                  <tr key={`${user.id}-details`}>
                    <td colSpan={7} className="px-6 py-4 bg-gray-50">
                      <UserDetailPanel user={user} />
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Žádní uživatelé nenalezeni</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-100 bg-gray-50">
        <p className="text-xs md:text-sm text-gray-600">
          Zobrazeno {filteredUsers.length} z {users.length} uživatelů
        </p>
      </div>
    </div>
  )
}

// Mobile User Card Component
function MobileUserCard({
  user,
  formatDate,
  formatDuration,
  isExpanded,
  onToggle
}: {
  user: UserAnalytics
  formatDate: (timestamp: any) => string
  formatDuration: (minutes: number | undefined | null) => string
  isExpanded: boolean
  onToggle: () => void
}) {
  const sessionCount = user.sessions?.length || 0
  const totalTime = user.totalSessionTime || 0
  const avgTime = sessionCount > 0 ? totalTime / sessionCount : 0

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-3" onClick={onToggle}>
        <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-base">
            {user.displayName.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {user.displayName}
              </h3>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                user.isOnline
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}></span>
                {user.isOnline ? 'Online' : 'Offline'}
              </span>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDate(user.lastActivityAt)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Activity className="w-3.5 h-3.5" />
              <span>{user.loginCount || 0}× přihlášení</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={totalTime && totalTime > 0 ? 'font-semibold text-blue-600' : 'text-gray-400'}>
                {formatDuration(totalTime)} celkem
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{user.aiQueriesCount || 0} AI dotazů</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <UserDetailPanel user={user} />
        </div>
      )}
    </div>
  )
}

// User Detail Panel Component
function UserDetailPanel({ user }: { user: UserAnalytics }) {
  const avgSessionTime = user.sessions && user.sessions.length > 0
    ? (user.totalSessionTime || 0) / user.sessions.length
    : 0

  const formatDuration = (minutes: number | undefined | null) => {
    if (!minutes || minutes === 0) return '0 min'
    if (minutes < 60) return `${Math.round(minutes)} min`
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}m`
  }

  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get most visited pages
  const pageViews = user.pageViews || {}
  const topPages = Object.entries(pageViews)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)

  // Get recent sessions (last 10)
  const recentSessions = user.sessions
    ? [...user.sessions]
        .sort((a, b) => {
          const aTime = a.startTime?.toMillis ? a.startTime.toMillis() : 0
          const bTime = b.startTime?.toMillis ? b.startTime.toMillis() : 0
          return bTime - aTime
        })
        .slice(0, 10)
    : []

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <Clock className="w-4 h-4" />
            Průměrná session
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatDuration(avgSessionTime)}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <Activity className="w-4 h-4" />
            Celkem sessions
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {user.sessions?.length || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <Eye className="w-4 h-4" />
            Zobrazené stránky
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {Object.keys(pageViews).length}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <Calendar className="w-4 h-4" />
            Registrace
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {user.registeredAt ? formatDateTime(user.registeredAt) : 'N/A'}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Poslední sessions
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentSessions.length > 0 ? (
              recentSessions.map((session, idx) => (
                <div key={session.sessionId || idx} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600">
                      {formatDateTime(session.startTime)}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatDuration(session.duration)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Žádné sessions</p>
            )}
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Nejnavštěvovanější stránky
          </h4>
          <div className="space-y-2">
            {topPages.length > 0 ? (
              topPages.map(([page, count]) => (
                <div key={page} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded text-sm">
                  <span className="text-gray-600 truncate flex-1">
                    {page.replace(/_/g, '/')}
                  </span>
                  <span className="font-semibold text-gray-900 ml-2">
                    {count}× zobrazení
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Žádná data</p>
            )}
          </div>
        </div>
      </div>

      {/* Features Used */}
      {user.featuresUsed && user.featuresUsed.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Použité funkce</h4>
          <div className="flex flex-wrap gap-2">
            {user.featuresUsed.map((feature, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

