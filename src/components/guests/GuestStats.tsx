'use client'

import GuestList from './GuestList'
import { Guest } from '@/types/guest'
import {
  Users,
  CheckCircle2,
  X,
  Clock,
  AlertTriangle,
  UserPlus,
  Mail,
  Phone,
  Utensils,
  TrendingUp,
  PieChart
} from 'lucide-react'
import { getGuestCategoryLabel } from '@/utils/guestCategories'

interface GuestStatsProps {
  guests: Guest[]
  stats: any
  updateGuest: (guestId: string, updates: Partial<Guest>) => Promise<void>
  compact?: boolean
  showProgress?: boolean
  showGuestList?: boolean
  onCreateGuest?: () => void
  onEditGuest?: (guest: Guest) => void
}

export default function GuestStats({
  guests,
  stats,
  updateGuest,
  compact = false,
  showProgress = true,
  showGuestList = true,
  onCreateGuest,
  onEditGuest
}: GuestStatsProps) {

  // Calculate additional stats
  const responseRate = stats.total > 0 ? 
    Math.round(((stats.attending + stats.declined + stats.maybe) / stats.total) * 100) : 0

  const attendanceRate = stats.total > 0 ? 
    Math.round((stats.attending / stats.total) * 100) : 0

  const guestsWithContact = guests.filter(g => g.email || g.phone).length
  const guestsWithDietaryRestrictions = guests.filter(g => g.dietaryRestrictions.length > 0).length

  // Get response rate color
  const getResponseRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100'
    if (rate >= 60) return 'text-blue-600 bg-blue-100'
    if (rate >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total guests */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-text-muted">Celkem</p>
            </div>
          </div>
        </div>

        {/* Attending */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.attending}</p>
              <p className="text-sm text-text-muted">Přijde</p>
            </div>
          </div>
        </div>

        {/* Declined */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <X className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.declined}</p>
              <p className="text-sm text-text-muted">Nepřijde</p>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
              <p className="text-sm text-text-muted">Čeká</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total guests */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Celkem hostů</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-text-muted">
              {stats.totalWithPlusOnes} s doprovodem
            </span>
          </div>
        </div>

        {/* Attending */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Přijde</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.attending}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">{attendanceRate}% účast</span>
          </div>
        </div>

        {/* Declined */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Nepřijde</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.declined}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <X className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {stats.maybe > 0 ? (
              <span className="text-yellow-600">{stats.maybe} možná</span>
            ) : (
              <span className="text-text-muted">Definitivní odpovědi</span>
            )}
          </div>
        </div>

        {/* Pending responses */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Čeká na odpověď</p>
              <p className="text-3xl font-bold text-gray-600 mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {stats.pending > 0 ? (
              <span className="text-orange-600">Vyžaduje pozornost</span>
            ) : (
              <span className="text-green-600">Všichni odpověděli</span>
            )}
          </div>
        </div>
      </div>

      {/* Response progress */}
      {showProgress && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Míra odpovědí</h3>
            <span className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${getResponseRateColor(responseRate)}
            `}>
              {responseRate}% odpovědělo
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div className="flex h-3 rounded-full overflow-hidden">
              <div 
                className="bg-green-500"
                style={{ width: `${(stats.attending / stats.total) * 100}%` }}
              ></div>
              <div 
                className="bg-red-500"
                style={{ width: `${(stats.declined / stats.total) * 100}%` }}
              ></div>
              <div 
                className="bg-yellow-500"
                style={{ width: `${(stats.maybe / stats.total) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Progress breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="font-medium text-green-600">{stats.attending}</p>
              <p className="text-text-muted">Přijde</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-red-600">{stats.declined}</p>
              <p className="text-text-muted">Nepřijde</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-yellow-600">{stats.maybe}</p>
              <p className="text-text-muted">Možná</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-600">{stats.pending}</p>
              <p className="text-text-muted">Čeká</p>
            </div>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Invitation types */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <PieChart className="w-5 h-5" />
            <span>Typy pozvánek</span>
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Obřad + hostina</span>
              <span className="font-medium">{stats.ceremonyAndReception}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Pouze obřad</span>
              <span className="font-medium">{stats.ceremonyOnly}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Pouze hostina</span>
              <span className="font-medium">{stats.receptionOnly}</span>
            </div>
          </div>
        </div>

        {/* Additional info */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dodatečné informace</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-blue-500" />
                <span className="text-gray-700">Doprovody</span>
              </div>
              <span className="font-medium">{stats.totalWithPlusOnes}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-green-500" />
                <span className="text-gray-700">S kontaktem</span>
              </div>
              <span className="font-medium">{guestsWithContact}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Utensils className="w-4 h-4 text-orange-500" />
                <span className="text-gray-700">Dietní omezení</span>
              </div>
              <span className="font-medium">{guestsWithDietaryRestrictions}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-purple-500" />
                <span className="text-gray-700">Pozvánky odeslány</span>
              </div>
              <span className="font-medium">{stats.invited}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories breakdown */}
      {Object.keys(stats.byCategory).length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Kategorie hostů</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(stats.byCategory).map(([category, categoryStats]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{getGuestCategoryLabel(category)}</span>
                <span className="font-medium text-gray-900">{categoryStats.total} hostů</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's insights */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-blue-900">Účast</h4>
          </div>
          <p className="text-2xl font-bold text-blue-600">{attendanceRate}%</p>
          <p className="text-sm text-blue-700">
            {stats.attending} z {stats.total} hostů
          </p>
        </div>

        {/* Response rate */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-green-900">Odpovědi</h4>
          </div>
          <p className="text-2xl font-bold text-green-600">{responseRate}%</p>
          <p className="text-sm text-green-700">
            {stats.total - stats.pending} odpovědělo
          </p>
        </div>

        {/* Action needed */}
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h4 className="font-medium text-orange-900">Akce</h4>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
          <p className="text-sm text-orange-700">
            {stats.pending > 0 ? 'hostů čeká na připomenutí' : 'všichni odpověděli'}
          </p>
        </div>
      </div>

      {/* Guest List */}
      {showGuestList && (
        <div className="mt-8">
          <GuestList
            guests={guests}
            stats={stats}
            updateGuest={updateGuest}
            showHeader={false}
            showFilters={true}
            maxHeight="800px"
            compact={false}
            viewMode="list"
            onCreateGuest={onCreateGuest}
            onEditGuest={onEditGuest}
          />
        </div>
      )}
    </div>
  )
}
