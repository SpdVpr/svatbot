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
  PieChart,
  Send,
  Building2
} from 'lucide-react'
import { getGuestCategoryLabel } from '@/utils/guestCategories'

interface GuestStatsProps {
  guests: Guest[]
  stats: any
  updateGuest: (guestId: string, updates: Partial<Guest>) => Promise<void>
  updateRSVP?: (guestId: string, rsvpStatus: Guest['rsvpStatus']) => Promise<void>
  deleteGuest?: (guestId: string) => Promise<void>
  compact?: boolean
  showProgress?: boolean
  showGuestList?: boolean
  onCreateGuest?: () => void
  onEditGuest?: (guest: Guest) => void
  getAccommodationById?: (id: string) => any
}

export default function GuestStats({
  guests,
  stats,
  updateGuest,
  updateRSVP,
  deleteGuest,
  compact = false,
  showProgress = true,
  showGuestList = true,
  onCreateGuest,
  onEditGuest,
  getAccommodationById
}: GuestStatsProps) {

  // Calculate additional stats with proper +1 handling
  const totalRespondedPeople = guests.reduce((total, guest) => {
    let count = 0
    // Count the guest if they responded
    if (guest.rsvpStatus !== 'pending') {
      count += 1
      // Count +1 if they have one - they automatically follow main guest's response
      if (guest.hasPlusOne) {
        count += 1
      }
      // Count children (they follow main guest's RSVP)
      if (guest.hasChildren && guest.children) {
        count += guest.children.length
      }
    }
    return total + count
  }, 0)

  const totalAttendingPeople = guests.reduce((total, guest) => {
    let count = 0
    // Count the guest if they're attending
    if (guest.rsvpStatus === 'attending') {
      count += 1
      // Count +1 if they have one - they automatically attend with main guest
      if (guest.hasPlusOne) {
        count += 1
      }
      // Count children (they follow main guest's RSVP)
      if (guest.hasChildren && guest.children) {
        count += guest.children.length
      }
    }
    return total + count
  }, 0)

  const responseRate = stats.total > 0 ?
    Math.round((totalRespondedPeople / stats.total) * 100) : 0

  const attendanceRate = stats.total > 0 ?
    Math.round((totalAttendingPeople / stats.total) * 100) : 0

  const guestsWithChildren = guests.filter(g => g.hasChildren && g.children && g.children.length > 0).length
  const guestsWithDietaryRestrictions = guests.filter(g => g.dietaryRestrictions.length > 0).length
  const guestsWithAccommodationPaidByCouple = guests.filter(g =>
    g.accommodationInterest === 'interested' && g.accommodationPayment === 'paid_by_couple'
  ).length

  // Invitation statistics (count only main guests, not +1 or children)
  const totalMainGuests = guests.length // Total number of main guests
  const invitationsSent = guests.filter(g => g.invitationSent && g.invitationMethod === 'sent').length
  const invitationsDeliveredPersonally = guests.filter(g => g.invitationSent && g.invitationMethod === 'delivered_personally').length
  const totalInvitationsSent = invitationsSent + invitationsDeliveredPersonally
  const invitationsRemaining = totalMainGuests - totalInvitationsSent

  // Accommodation statistics
  const guestsInterestedInAccommodation = guests.filter(g => g.accommodationInterest === 'interested').length
  const guestsNotInterestedInAccommodation = guests.filter(g => g.accommodationInterest === 'not_interested').length
  const paidByGuest = guests.filter(g => g.accommodationInterest === 'interested' && g.accommodationPayment === 'paid_by_guest').length
  const paidByCouple = guests.filter(g => g.accommodationInterest === 'interested' && g.accommodationPayment === 'paid_by_couple').length


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
              {stats.totalChildren > 0 && (
                <p className="text-xs text-gray-400">{stats.totalChildren} dětí</p>
              )}
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
              <p className="text-sm font-medium text-text-muted">Celkem lidí</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="flex items-center text-sm">
              <span className="text-text-muted">
                {guests.length} hlavních hostů
              </span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-text-muted">
                {stats.totalWithPlusOnes} s doprovodem
              </span>
            </div>
            {stats.totalChildren > 0 && (
              <div className="flex items-center text-sm">
                <span className="text-gray-400">
                  {stats.totalChildren} dětí
                </span>
              </div>
            )}
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

      {/* Invitations section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Accommodation */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21l4-4 4 4" />
            </svg>
            <span>Ubytování</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Má zájem o ubytování</span>
              <span className="font-medium">{guestsInterestedInAccommodation}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Nemá zájem</span>
              <span className="font-medium">{guestsNotInterestedInAccommodation}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Platí host</span>
              <span className="font-medium">{paidByGuest}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Platí novomanželé</span>
              <span className="font-medium">{paidByCouple}</span>
            </div>

          </div>
        </div>

        {/* Invitation status */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Send className="w-5 h-5" />
            <span>Stav pozvánek</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Celkem doručeno</span>
              <span className="font-medium">{totalInvitationsSent}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Odeslané</span>
              <span className="font-medium">{invitationsSent}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Předané osobně</span>
              <span className="font-medium">{invitationsDeliveredPersonally}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Zbývá doručit</span>
              <span className="font-medium">{invitationsRemaining}</span>
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
                <Users className="w-4 h-4 text-green-500" />
                <span className="text-gray-700">Hostů s dětmi</span>
              </div>
              <span className="font-medium">{guestsWithChildren}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-pink-500" />
                <span className="text-gray-700">Celkem dětí</span>
              </div>
              <span className="font-medium">{stats.totalChildren}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Utensils className="w-4 h-4 text-orange-500" />
                <span className="text-gray-700">Dietní omezení</span>
              </div>
              <span className="font-medium">{guestsWithDietaryRestrictions}</span>
            </div>

            {guestsWithAccommodationPaidByCouple > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-700">Ubytování platí novomanželé</span>
                </div>
                <span className="font-medium">{guestsWithAccommodationPaidByCouple}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      </div>





      {/* Guest List */}
      {showGuestList && (
        <div className="mt-8">
          <GuestList
            guests={guests}
            stats={stats}
            updateGuest={updateGuest}
            updateRSVP={updateRSVP}
            deleteGuest={deleteGuest}
            showHeader={false}
            showFilters={true}
            maxHeight="800px"
            compact={false}
            viewMode="list"
            onCreateGuest={onCreateGuest}
            onEditGuest={onEditGuest}
            getAccommodationById={getAccommodationById}
          />
        </div>
      )}
    </div>
  )
}
