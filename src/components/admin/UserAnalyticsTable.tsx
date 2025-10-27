'use client'

import { useState } from 'react'
import { useUserAnalytics } from '@/hooks/useAdminDashboard'
import { UserAnalytics } from '@/types/admin'
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
  Sparkles
} from 'lucide-react'

type SortField = 'lastActivity' | 'loginCount' | 'sessionTime' | 'aiQueries'
type SortDirection = 'asc' | 'desc'

export default function UserAnalyticsTable() {
  const { users, loading } = useUserAnalytics()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterOnline, setFilterOnline] = useState<'all' | 'online' | 'offline'>('all')
  const [sortBy, setSortBy] = useState<SortField>('lastActivity')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)} min`
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}m`
  }

  const exportToCSV = () => {
    const headers = ['Email', 'Jméno', 'Registrace', 'Poslední aktivita', 'Počet přihlášení', 'Celkový čas', 'Sessions', 'AI dotazy', 'Online']
    const rows = filteredUsers.map(user => [
      user.email,
      user.displayName,
      user.registeredAt?.toDate().toLocaleDateString('cs-CZ') || '',
      user.lastActivityAt?.toDate().toLocaleDateString('cs-CZ') || '',
      user.loginCount || 0,
      user.totalSessionTime || 0,
      user.sessions?.length || 0,
      user.aiQueriesCount || 0,
      user.isOnline ? 'Ano' : 'Ne'
    ])

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
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Uživatelská analytika
          </h2>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Hledat uživatele..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterOnline}
              onChange={(e) => setFilterOnline(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Všichni</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
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
                Sessions
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
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
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
                  {formatDuration(user.totalSessionTime || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.sessions?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    {user.aiQueriesCount || 0}
                  </div>
                </td>
              </tr>
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
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
        <p className="text-sm text-gray-600">
          Zobrazeno {filteredUsers.length} z {users.length} uživatelů
        </p>
      </div>
    </div>
  )
}

