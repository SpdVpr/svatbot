'use client'

import { useState } from 'react'
import { Guest, GuestFilters, GuestViewOptions } from '@/types/guest'
import { useGuest } from '@/hooks/useGuest'
import GuestCard from './GuestCard'
import {
  Search,
  Filter,
  Plus,
  Users,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  X,
  AlertTriangle,
  MoreHorizontal,
  Edit,
  Trash2,
  Send
} from 'lucide-react'

interface GuestListProps {
  showHeader?: boolean
  showFilters?: boolean
  maxHeight?: string
  compact?: boolean
  viewMode?: 'list' | 'grid'
  onCreateGuest?: () => void
  onEditGuest?: (guest: Guest) => void
}

export default function GuestList({
  showHeader = true,
  showFilters = true,
  maxHeight = '600px',
  compact = false,
  viewMode = 'list',
  onCreateGuest,
  onEditGuest
}: GuestListProps) {
  const {
    guests,
    loading,
    error,
    stats,
    updateRSVP,
    deleteGuest,
    clearError
  } = useGuest()

  const [filters, setFilters] = useState<GuestFilters>({})
  const [viewOptions, setViewOptions] = useState<GuestViewOptions>({
    groupBy: 'category',
    sortBy: 'name',
    sortOrder: 'asc',
    showPlusOnes: true,
    showContactInfo: true,
    showNotes: false
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [selectedGuests, setSelectedGuests] = useState<string[]>([])

  // Filter and sort guests
  const filteredGuests = guests.filter(guest => {
    // Search filter
    if (searchTerm && !`${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Category filter
    if (filters.category && !filters.category.includes(guest.category)) {
      return false
    }

    // RSVP status filter
    if (filters.rsvpStatus && !filters.rsvpStatus.includes(guest.rsvpStatus)) {
      return false
    }

    // Invitation type filter
    if (filters.invitationType && !filters.invitationType.includes(guest.invitationType)) {
      return false
    }

    // Plus one filter
    if (filters.hasPlusOne !== undefined && guest.hasPlusOne !== filters.hasPlusOne) {
      return false
    }

    return true
  })

  // Group guests
  const groupedGuests = groupGuestsBy(filteredGuests, viewOptions.groupBy)

  // Get RSVP status display
  const getRSVPDisplay = (status: string) => {
    switch (status) {
      case 'attending':
        return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', label: 'Přijde' }
      case 'declined':
        return { icon: X, color: 'text-red-500', bg: 'bg-red-50', label: 'Nepřijde' }
      case 'maybe':
        return { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Možná' }
      case 'pending':
        return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50', label: 'Čeká' }
      default:
        return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50', label: 'Čeká' }
    }
  }

  // Get category display name
  const getCategoryName = (category: string) => {
    const categoryNames = {
      'family-bride': 'Rodina nevěsty',
      'family-groom': 'Rodina ženicha',
      'friends-bride': 'Přátelé nevěsty',
      'friends-groom': 'Přátelé ženicha',
      'colleagues-bride': 'Kolegové nevěsty',
      'colleagues-groom': 'Kolegové ženicha',
      'other': 'Ostatní'
    }
    return categoryNames[category as keyof typeof categoryNames] || category
  }

  // Handle RSVP status change
  const handleRSVPChange = async (guestId: string, status: Guest['rsvpStatus']) => {
    try {
      await updateRSVP(guestId, status)
    } catch (error) {
      console.error('Error updating RSVP:', error)
    }
  }

  // Handle guest selection
  const toggleGuestSelection = (guestId: string) => {
    setSelectedGuests(prev =>
      prev.includes(guestId)
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 loading-spinner" />
          <span className="text-text-muted">Načítání hostů...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="heading-2">Hosté</h2>
            <p className="body-small text-text-muted">
              {stats.attending} potvrzených z {stats.total} pozvaných
            </p>
          </div>
          {onCreateGuest && (
            <button
              onClick={onCreateGuest}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Přidat hosta</span>
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="space-y-3">
          {/* Search and filter toggle */}
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Hledat hosty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`btn-outline flex items-center space-x-2 ${showFiltersPanel ? 'bg-primary-50 border-primary-300' : ''}`}
            >
              <Filter className="w-4 h-4" />
              <span>Filtry</span>
            </button>
          </div>

          {/* Filters panel */}
          {showFiltersPanel && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategorie
                  </label>
                  <select
                    value={filters.category?.[0] || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      category: e.target.value ? [e.target.value as any] : undefined
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Všechny kategorie</option>
                    <option value="family-bride">Rodina nevěsty</option>
                    <option value="family-groom">Rodina ženicha</option>
                    <option value="friends-bride">Přátelé nevěsty</option>
                    <option value="friends-groom">Přátelé ženicha</option>
                    <option value="colleagues-bride">Kolegové nevěsty</option>
                    <option value="colleagues-groom">Kolegové ženicha</option>
                    <option value="other">Ostatní</option>
                  </select>
                </div>

                {/* RSVP status filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RSVP stav
                  </label>
                  <select
                    value={filters.rsvpStatus?.[0] || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      rsvpStatus: e.target.value ? [e.target.value as any] : undefined
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Všechny stavy</option>
                    <option value="attending">Přijde</option>
                    <option value="declined">Nepřijde</option>
                    <option value="maybe">Možná</option>
                    <option value="pending">Čeká na odpověď</option>
                  </select>
                </div>

                {/* Plus one filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doprovod
                  </label>
                  <select
                    value={filters.hasPlusOne === undefined ? '' : filters.hasPlusOne.toString()}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      hasPlusOne: e.target.value === '' ? undefined : e.target.value === 'true'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Všichni</option>
                    <option value="true">S doprovodem</option>
                    <option value="false">Bez doprovodu</option>
                  </select>
                </div>
              </div>

              {/* View options */}
              <div className="flex items-center space-x-4 pt-2 border-t border-gray-200">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={viewOptions.showPlusOnes}
                    onChange={(e) => setViewOptions(prev => ({
                      ...prev,
                      showPlusOnes: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Zobrazit doprovody</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={viewOptions.showContactInfo}
                    onChange={(e) => setViewOptions(prev => ({
                      ...prev,
                      showContactInfo: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Zobrazit kontakty</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guest list */}
      <div
        className="space-y-4 overflow-y-auto"
        style={{ maxHeight }}
      >
        {Object.entries(groupedGuests).map(([groupKey, groupGuests]) => (
          <div key={groupKey} className="space-y-2">
            {/* Group header */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">
                {viewOptions.groupBy === 'category' ? getCategoryName(groupKey) : groupKey}
              </h3>
              <span className="text-sm text-text-muted">
                {groupGuests.length} hostů
              </span>
            </div>

            {/* Guests in group */}
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-2'
            }>
              {groupGuests.map((guest) => {
                if (viewMode === 'grid') {
                  return (
                    <GuestCard
                      key={guest.id}
                      guest={guest}
                      showContactInfo={viewOptions.showContactInfo}
                      isSelected={selectedGuests.includes(guest.id)}
                      onSelect={toggleGuestSelection}
                      onEdit={onEditGuest}
                    />
                  )
                }

                // List view (original code)
                const rsvpDisplay = getRSVPDisplay(guest.rsvpStatus)

                return (
                  <div
                    key={guest.id}
                    className="p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      {/* Guest info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedGuests.includes(guest.id)}
                              onChange={() => toggleGuestSelection(guest.id)}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <h4 className="font-medium text-gray-900">
                              {guest.firstName} {guest.lastName}
                            </h4>
                          </div>

                          {/* RSVP Status */}
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${rsvpDisplay.bg}`}>
                            <rsvpDisplay.icon className={`w-3 h-3 ${rsvpDisplay.color}`} />
                            <span className={`text-xs font-medium ${rsvpDisplay.color}`}>
                              {rsvpDisplay.label}
                            </span>
                          </div>

                          {/* Plus one indicator */}
                          {guest.hasPlusOne && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              +1 {guest.plusOneName && `(${guest.plusOneName})`}
                            </span>
                          )}
                        </div>

                        {/* Contact info */}
                        {viewOptions.showContactInfo && (guest.email || guest.phone) && (
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            {guest.email && (
                              <div className="flex items-center space-x-1">
                                <Mail className="w-3 h-3" />
                                <span>{guest.email}</span>
                              </div>
                            )}
                            {guest.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-3 h-3" />
                                <span>{guest.phone}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Dietary restrictions */}
                        {guest.dietaryRestrictions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {guest.dietaryRestrictions.map((restriction) => (
                              <span
                                key={restriction}
                                className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full"
                              >
                                {restriction}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Tags */}
                        {guest.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {guest.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {/* RSVP Quick Actions */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleRSVPChange(guest.id, 'attending')}
                            className={`p-1 rounded ${guest.rsvpStatus === 'attending' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                            title="Označit jako přijde"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRSVPChange(guest.id, 'declined')}
                            className={`p-1 rounded ${guest.rsvpStatus === 'declined' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-red-600'}`}
                            title="Označit jako nepřijde"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* More actions */}
                        <div className="relative">
                          <button
                            onClick={() => onEditGuest?.(guest)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Upravit hosta"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {filteredGuests.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {guests.length === 0 ? 'Žádní hosté' : 'Žádní hosté nevyhovují filtrům'}
            </h3>
            <p className="text-text-muted">
              {guests.length === 0
                ? 'Začněte přidáním prvního hosta.'
                : 'Zkuste upravit filtry nebo vyhledávání.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Bulk actions */}
      {selectedGuests.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {selectedGuests.length} vybraných hostů
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={async () => {
                  try {
                    // TODO: Implement send invitations
                    console.log('Sending invitations to:', selectedGuests)
                    alert('Funkce "Poslat pozvánky" bude implementována v další verzi')
                  } catch (error) {
                    console.error('Error sending invitations:', error)
                  }
                }}
                className="btn-outline btn-sm flex items-center space-x-1"
              >
                <Send className="w-3 h-3" />
                <span>Poslat pozvánky</span>
              </button>
              <button
                onClick={() => {
                  // TODO: Implement bulk edit
                  console.log('Bulk editing:', selectedGuests)
                  alert('Funkce "Hromadná úprava" bude implementována v další verzi')
                }}
                className="btn-outline btn-sm flex items-center space-x-1"
              >
                <Edit className="w-3 h-3" />
                <span>Upravit</span>
              </button>
              <button
                onClick={async () => {
                  if (window.confirm(`Opravdu chcete smazat ${selectedGuests.length} hostů?`)) {
                    try {
                      for (const guestId of selectedGuests) {
                        await deleteGuest(guestId)
                      }
                      setSelectedGuests([])
                    } catch (error) {
                      console.error('Error deleting guests:', error)
                    }
                  }
                }}
                className="btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50 flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Smazat</span>
              </button>
            </div>
            <button
              onClick={() => setSelectedGuests([])}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to group guests
function groupGuestsBy(guests: Guest[], groupBy: string): Record<string, Guest[]> {
  const grouped: Record<string, Guest[]> = {}

  guests.forEach(guest => {
    let key: string

    switch (groupBy) {
      case 'category':
        key = guest.category
        break
      case 'rsvp-status':
        key = guest.rsvpStatus
        break
      case 'invitation-type':
        key = guest.invitationType
        break
      default:
        key = 'Všichni'
    }

    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(guest)
  })

  // Sort guests within each group
  Object.keys(grouped).forEach(key => {
    grouped[key].sort((a, b) => {
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    })
  })

  return grouped
}
