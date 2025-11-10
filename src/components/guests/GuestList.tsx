'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
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
  Send,
  GripVertical,
  HelpCircle,
  Bed
} from 'lucide-react'
import {
  getGuestCategoryLabel,
  getInvitationTypeLabel,
  getInvitationTypeColor,
  getInvitationTypeIcon,
  getDietaryRestrictionLabel
} from '@/utils/guestCategories'

interface GuestListProps {
  guests?: Guest[]
  stats?: any
  updateGuest?: (guestId: string, updates: Partial<Guest>) => Promise<void>
  updateRSVP?: (guestId: string, rsvpStatus: Guest['rsvpStatus']) => Promise<void>
  deleteGuest?: (guestId: string) => Promise<void>
  showHeader?: boolean
  showFilters?: boolean
  compact?: boolean
  viewMode?: 'list' | 'grid'
  onCreateGuest?: () => void
  onEditGuest?: (guest: Guest) => void
  onGuestReorder?: (guests: Guest[]) => void | Promise<void>
  getAccommodationById?: (id: string) => any
}

export default function GuestList({
  guests: propGuests,
  stats: propStats,
  updateGuest: propUpdateGuest,
  updateRSVP: propUpdateRSVP,
  deleteGuest: propDeleteGuest,
  showHeader = true,
  showFilters = true,
  compact = false,
  viewMode = 'list',
  onCreateGuest,
  onEditGuest,
  onGuestReorder,
  getAccommodationById
}: GuestListProps) {

  // Use props if provided, otherwise fallback to hook
  const hookData = (propGuests && propStats && propUpdateGuest) ? null : useGuest()
  const guests = propGuests || hookData?.guests || []
  const stats = propStats || hookData?.stats || {}
  const updateGuest = propUpdateGuest || hookData?.updateGuest
  const updateRSVP = propUpdateRSVP || hookData?.updateRSVP
  const deleteGuest = propDeleteGuest || hookData?.deleteGuest
  const loading = hookData?.loading || false
  const error = hookData?.error || null
  const clearError = hookData?.clearError

  console.log('🔧 GuestList render:', {
    viewMode,
    guestsCount: guests.length,
    onGuestReorder: !!onGuestReorder
  })

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

  // Drag and drop state
  const [draggedGuest, setDraggedGuest] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null)
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const onGuestReorderRef = useRef(onGuestReorder)

  // Keep ref updated
  useEffect(() => {
    console.log('🔄 Updating onGuestReorderRef:', {
      onGuestReorder: !!onGuestReorder,
      type: typeof onGuestReorder
    })
    onGuestReorderRef.current = onGuestReorder
  }, [onGuestReorder])

  // Sort guests by sortOrder first (to preserve drag and drop order), then alphabetically
  const sortedGuests = [...guests].sort((a, b) => {
    const orderA = a.sortOrder ?? 999999
    const orderB = b.sortOrder ?? 999999

    // If sortOrder is the same, sort alphabetically by lastName, then firstName
    if (orderA === orderB) {
      const lastNameCompare = a.lastName.localeCompare(b.lastName, 'cs')
      if (lastNameCompare !== 0) return lastNameCompare
      return a.firstName.localeCompare(b.firstName, 'cs')
    }

    return orderA - orderB
  })

  // Filter and sort guests
  const filteredGuests = sortedGuests.filter(guest => {
    // Search filter - search in guest name, plus one name, and children names
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const guestName = `${guest.firstName} ${guest.lastName}`.toLowerCase()
      const plusOneName = guest.plusOneName?.toLowerCase() || ''
      const childrenNames = guest.children?.map(child => child.name.toLowerCase()).join(' ') || ''

      const matchesSearch = guestName.includes(searchLower) ||
                           plusOneName.includes(searchLower) ||
                           childrenNames.includes(searchLower)

      if (!matchesSearch) {
        return false
      }
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

    // Children filter
    if (filters.hasChildren !== undefined && guest.hasChildren !== filters.hasChildren) {
      return false
    }

    // Dietary restrictions filter
    if (filters.hasDietaryRestrictions !== undefined && (guest.dietaryRestrictions.length > 0) !== filters.hasDietaryRestrictions) {
      return false
    }

    // Specific dietary restrictions filter
    if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0 && !filters.dietaryRestrictions.some(dr => guest.dietaryRestrictions.includes(dr))) {
      return false
    }

    // Accommodation interest filter
    if (filters.accommodationInterest && !filters.accommodationInterest.includes(guest.accommodationInterest || 'not_interested')) {
      return false
    }

    // Accommodation payment filter
    if (filters.accommodationPayment && guest.accommodationInterest === 'interested' && !filters.accommodationPayment.includes(guest.accommodationPayment || 'paid_by_guest')) {
      return false
    }

    // Invitation sent filter
    if (filters.invitationSent !== undefined && guest.invitationSent !== filters.invitationSent) {
      return false
    }

    // Invitation method filter
    if (filters.invitationMethod && guest.invitationSent && !filters.invitationMethod.includes(guest.invitationMethod || 'sent')) {
      return false
    }

    return true
  })

  // Group guests (preserving sortOrder within groups)
  const groupedGuests = groupGuestsBy(filteredGuests, viewOptions.groupBy, true)

  // Get RSVP status display
  const getRSVPDisplay = (status: string) => {
    switch (status) {
      case 'attending':
        return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', label: 'Přijde' }
      case 'declined':
        return { icon: X, color: 'text-red-500', bg: 'bg-red-50', label: 'Nepřijde' }
      case 'maybe':
        return { icon: HelpCircle, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Možná' }
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
    if (!updateGuest) return

    try {
      console.log('🔄 RSVP change:', guestId, status)
      await updateGuest(guestId, {
        rsvpStatus: status,
        rsvpDate: new Date()
      })
      console.log('✅ RSVP updated successfully')
    } catch (error) {
      console.error('❌ Error updating RSVP:', error)
    }
  }



  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, guestId: string, index: number) => {
    console.log('🚀 DRAG START:', { guestId, index, viewMode })

    // Only enable drag and drop in list view
    if (viewMode !== 'list') {
      console.log('❌ Not in list view, cancelling drag')
      return
    }

    console.log('✅ Starting drag operation')
    setDraggedGuest(guestId)
    setIsDragging(true)
    setDragOverIndex(null)

    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', guestId)

    // Clear any existing timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
  }, [viewMode])

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    console.log('🏁 DRAG END')
    dragTimeoutRef.current = setTimeout(() => {
      setDraggedGuest(null)
      setDragOverIndex(null)
      setIsDragging(false)
    }, 50)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    console.log('📍 DRAG OVER:', index)
    e.preventDefault()
    e.stopPropagation()

    if (!draggedGuest || !isDragging || viewMode !== 'list') {
      console.log('❌ Drag over cancelled:', { draggedGuest, isDragging, viewMode })
      return
    }

    e.dataTransfer.dropEffect = 'move'

    if (dragOverIndex !== index) {
      console.log('✅ Setting drag over index:', index)
      setDragOverIndex(index)
    }
  }, [draggedGuest, isDragging, dragOverIndex, viewMode])

  const handleDrop = useCallback(async (e: React.DragEvent, dropIndex: number) => {
    console.log('🎯 DROP EVENT:', dropIndex)
    e.preventDefault()
    e.stopPropagation()

    if (!draggedGuest || !isDragging || viewMode !== 'list') {
      console.log('❌ Drop cancelled:', { draggedGuest, isDragging, viewMode })
      return
    }

    // Find indices in the DISPLAYED filtered list
    const draggedIndexInFiltered = filteredGuests.findIndex(g => g.id === draggedGuest)
    console.log('📊 Drop indices in filtered list:', { draggedIndexInFiltered, dropIndex })

    if (draggedIndexInFiltered === -1 || draggedIndexInFiltered === dropIndex) {
      setDraggedGuest(null)
      setDragOverIndex(null)
      setIsDragging(false)
      return
    }

    // Get the guest IDs at the drag positions in filtered list
    const draggedGuestId = filteredGuests[draggedIndexInFiltered].id
    const targetGuestId = filteredGuests[dropIndex].id

    // Now reorder in the FULL guests array (not just filtered)
    const allGuests = [...guests]
    const draggedIndexInAll = allGuests.findIndex(g => g.id === draggedGuestId)
    const targetIndexInAll = allGuests.findIndex(g => g.id === targetGuestId)

    console.log('📊 Indices in full array:', { draggedIndexInAll, targetIndexInAll })

    if (draggedIndexInAll === -1 || targetIndexInAll === -1) {
      console.log('❌ Guest not found in full array')
      setDraggedGuest(null)
      setDragOverIndex(null)
      setIsDragging(false)
      return
    }

    // Reorder in full array
    const [removed] = allGuests.splice(draggedIndexInAll, 1)
    allGuests.splice(targetIndexInAll, 0, removed)

    console.log('✅ Reordered guests, calling callback with', allGuests.length, 'guests')

    // Call reorder callback with FULL array (await if it's a promise)
    if (onGuestReorder && typeof onGuestReorder === 'function') {
      try {
        await onGuestReorder(allGuests)
        console.log('✅ onGuestReorder completed successfully')
      } catch (error) {
        console.error('❌ Error in onGuestReorder:', error)
      }
    }

    // Clear states
    setDraggedGuest(null)
    setDragOverIndex(null)
    setIsDragging(false)

    // Clear timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
  }, [draggedGuest, isDragging, viewMode, filteredGuests, guests, onGuestReorder])

  // Touch handlers for mobile with long press detection
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const touchMoveDistanceRef = useRef(0)

  const handleTouchStart = useCallback((e: React.TouchEvent, guestId: string) => {
    if (viewMode !== 'list') return

    const touch = e.touches[0]
    setTouchStartY(touch.clientY)
    setTouchCurrentY(touch.clientY)
    touchMoveDistanceRef.current = 0

    // Start long press timer (500ms)
    longPressTimerRef.current = setTimeout(() => {
      // Only activate drag if user hasn't moved much (not scrolling)
      if (touchMoveDistanceRef.current < 10) {
        setDraggedGuest(guestId)
        setIsDragging(true)

        // Add haptic feedback on supported devices
        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }

        // Add visual feedback class
        const element = e.currentTarget as HTMLElement
        element.classList.add('haptic-feedback')
        setTimeout(() => {
          element.classList.remove('haptic-feedback')
        }, 100)
      }
    }, 500) // 500ms long press
  }, [viewMode])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]

    // Track movement distance to detect scrolling
    if (touchStartY) {
      touchMoveDistanceRef.current = Math.abs(touch.clientY - touchStartY)
    }

    // If moved more than 10px before long press completes, cancel drag
    if (touchMoveDistanceRef.current > 10 && longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
      return
    }

    // Only handle drag if already dragging
    if (!draggedGuest || !touchStartY || viewMode !== 'list' || !isDragging) return

    e.preventDefault()
    setTouchCurrentY(touch.clientY)

    // Calculate which guest we're over
    const elements = document.querySelectorAll('[data-guest-index]')
    let newDragOverIndex = null

    elements.forEach((element, index) => {
      const rect = element.getBoundingClientRect()
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        newDragOverIndex = index
      }
    })

    if (newDragOverIndex !== null && newDragOverIndex !== dragOverIndex) {
      setDragOverIndex(newDragOverIndex)
    }
  }, [draggedGuest, touchStartY, dragOverIndex, viewMode, isDragging])

  const handleTouchEnd = useCallback(async (e: React.TouchEvent) => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    if (!draggedGuest || viewMode !== 'list') {
      // Reset states
      setDraggedGuest(null)
      setIsDragging(false)
      setDragOverIndex(null)
      setTouchStartY(null)
      setTouchCurrentY(null)
      return
    }

    if (isDragging && dragOverIndex !== null) {
      // Find indices in the DISPLAYED filtered list
      const draggedIndexInFiltered = filteredGuests.findIndex(g => g.id === draggedGuest)

      if (draggedIndexInFiltered !== -1 && draggedIndexInFiltered !== dragOverIndex) {
        // Get the guest IDs at the drag positions in filtered list
        const draggedGuestId = filteredGuests[draggedIndexInFiltered].id
        const targetGuestId = filteredGuests[dragOverIndex].id

        // Now reorder in the FULL guests array (not just filtered)
        const allGuests = [...guests]
        const draggedIndexInAll = allGuests.findIndex(g => g.id === draggedGuestId)
        const targetIndexInAll = allGuests.findIndex(g => g.id === targetGuestId)

        if (draggedIndexInAll !== -1 && targetIndexInAll !== -1) {
          // Reorder in full array
          const [removed] = allGuests.splice(draggedIndexInAll, 1)
          allGuests.splice(targetIndexInAll, 0, removed)

          // Call reorder callback with FULL array
          if (onGuestReorder) {
            try {
              await onGuestReorder(allGuests)
              console.log('✅ Touch reorder completed successfully')
            } catch (error) {
              console.error('❌ Error in touch reorder:', error)
            }
          }

          // Add success haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate([50, 50, 50])
          }
        }
      }
    }

    // Clear all drag states
    setDraggedGuest(null)
    setDragOverIndex(null)
    setIsDragging(false)
    setTouchStartY(null)
    setTouchCurrentY(null)
  }, [draggedGuest, isDragging, dragOverIndex, filteredGuests, guests, onGuestReorder, viewMode])

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
    <div className={`space-y-4 ${isDragging ? 'dragging-active' : ''}`}>
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



      {/* Drag and drop hint for list view */}
      {viewMode === 'list' && filteredGuests.length > 1 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600 flex items-center space-x-2">
            <GripVertical className="w-3 h-3" />
            <span>Klikněte a přetáhněte hosty pro změnu pořadí</span>
          </p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

                {/* Children filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Děti
                  </label>
                  <select
                    value={filters.hasChildren === undefined ? '' : filters.hasChildren.toString()}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      hasChildren: e.target.value === '' ? undefined : e.target.value === 'true'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Všichni</option>
                    <option value="true">S dětmi</option>
                    <option value="false">Bez dětí</option>
                  </select>
                </div>

                {/* Dietary restrictions filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stravovací omezení
                  </label>
                  <select
                    value={filters.hasDietaryRestrictions === undefined ? '' : filters.hasDietaryRestrictions.toString()}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      hasDietaryRestrictions: e.target.value === '' ? undefined : e.target.value === 'true'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Všichni</option>
                    <option value="true">Má omezení</option>
                    <option value="false">Bez omezení</option>
                  </select>
                </div>

                {/* Accommodation interest filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubytování
                  </label>
                  <select
                    value={filters.accommodationInterest?.[0] || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      accommodationInterest: e.target.value ? [e.target.value as any] : undefined
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Všichni</option>
                    <option value="interested">Má zájem</option>
                    <option value="not_interested">Nemá zájem</option>
                  </select>
                </div>

                {/* Accommodation payment filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platba ubytování
                  </label>
                  <select
                    value={filters.accommodationPayment?.[0] || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      accommodationPayment: e.target.value ? [e.target.value as any] : undefined
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Všechny</option>
                    <option value="paid_by_guest">Platí host</option>
                    <option value="paid_by_couple">Platí novomanželé</option>

                  </select>
                </div>

                {/* Invitation method filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Způsob pozvánky
                  </label>
                  <select
                    value={filters.invitationMethod?.[0] || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      invitationMethod: e.target.value ? [e.target.value as any] : undefined
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Všechny</option>
                    <option value="sent">Odeslané</option>
                    <option value="delivered_personally">Předané osobně</option>
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
      <div className="space-y-4">
        {Object.entries(groupedGuests).map(([groupKey, groupGuests]) => {
          // Calculate total people in this group (including +1 and children)
          const totalPeopleInGroup = groupGuests.reduce((total, guest) => {
            let count = 1 // The guest themselves
            if (guest.hasPlusOne) count += 1 // Add plus one
            if (guest.hasChildren && guest.children) {
              count += guest.children.length // Add children
            }
            return total + count
          }, 0)

          return (
          <div key={groupKey} className="space-y-3">
            {/* Group header */}
            <div className="bg-primary-50 px-4 py-3 rounded-lg border border-primary-200 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {viewOptions.groupBy === 'category' ? getCategoryName(groupKey) : groupKey}
                </h3>
                <span className="text-sm font-medium text-primary-700">
                  {totalPeopleInGroup} {totalPeopleInGroup === 1 ? 'host' : 'hostů'}
                </span>
              </div>
            </div>

            {/* Guests in group */}
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'
            }>
              {groupGuests.map((guest, groupIndex) => {
                if (viewMode === 'grid') {
                  return (
                    <GuestCard
                      key={guest.id}
                      guest={guest}
                      showContactInfo={viewOptions.showContactInfo}
                      onEdit={onEditGuest}
                      updateGuest={updateGuest}
                      getAccommodationById={getAccommodationById}
                    />
                  )
                }

                // List view with drag and drop
                // Get the global index in filteredGuests array
                const globalIndex = filteredGuests.findIndex(g => g.id === guest.id)
                const rsvpDisplay = getRSVPDisplay(guest.rsvpStatus)
                const isDraggedItem = draggedGuest === guest.id
                const isDragOver = dragOverIndex === globalIndex

                return (
                  <div
                    key={guest.id}
                    data-guest-index={globalIndex}
                    data-testid={`guest-item-${guest.id}`}
                    title={viewMode === 'list' ? 'Klikněte a přetáhněte pro změnu pořadí' : undefined}
                    className={`
                      wedding-card p-3 sm:p-4 guest-list-item touch-drag-item touch-feedback
                      ${isDraggedItem ? 'dragging' : ''}
                      ${isDragOver ? 'drag-over' : ''}
                      ${viewMode === 'list' ? 'cursor-move select-none' : ''}
                      ${isDragging && !isDraggedItem ? 'moving' : ''}
                    `}
                    draggable={viewMode === 'list'}
                    onDragStart={(e) => handleDragStart(e, guest.id, globalIndex)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, globalIndex)}
                    onDrop={(e) => handleDrop(e, globalIndex)}
                    onTouchStart={(e) => handleTouchStart(e, guest.id)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={() => console.log('🖱️ MOUSE DOWN on guest:', guest.firstName)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      {/* Guest info */}
                      <div className="flex-1 min-w-0">
                        <div className="mb-2">
                          {/* Name and Room - First Row */}
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h4 className="font-medium text-gray-900 truncate">
                              {guest.firstName} {guest.lastName}
                            </h4>
                            {guest.accommodationId && guest.roomId && getAccommodationById && (
                              (() => {
                                const accommodation = getAccommodationById(guest.accommodationId)
                                const room = accommodation?.rooms.find((r: any) => r.id === guest.roomId)
                                return room ? (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center space-x-1 flex-shrink-0">
                                    <Bed className="w-3 h-3" />
                                    <span className="hidden sm:inline">{room.name}</span>
                                    <span className="sm:hidden">{room.name.length > 8 ? room.name.substring(0, 8) + '...' : room.name}</span>
                                  </span>
                                ) : null
                              })()
                            )}
                          </div>

                          {/* Badges - Second Row with wrapping */}
                          <div className="flex items-center flex-wrap gap-2">
                            {/* RSVP Status */}
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${rsvpDisplay.bg} flex-shrink-0`}>
                              <rsvpDisplay.icon className={`w-3 h-3 ${rsvpDisplay.color}`} />
                              <span className={`text-xs font-medium ${rsvpDisplay.color} whitespace-nowrap`}>
                                {rsvpDisplay.label}
                              </span>
                            </div>

                            {/* Plus one indicator */}
                            {guest.hasPlusOne && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap">
                                +1 {guest.plusOneName && `(${guest.plusOneName})`}
                              </span>
                            )}

                            {/* Children indicator */}
                            {guest.hasChildren && guest.children && guest.children.length > 0 && (
                              <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap">
                                {guest.children.length} {guest.children.length === 1 ? 'dítě' : 'děti'}
                              </span>
                            )}

                            {/* Invitation type indicator */}
                            {guest.invitationType && (
                              <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap ${getInvitationTypeColor(guest.invitationType)}`}>
                                {getInvitationTypeIcon(guest.invitationType)} {getInvitationTypeLabel(guest.invitationType)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Contact info - Stack on mobile */}
                        {viewOptions.showContactInfo && (guest.email || guest.phone) && (
                          <div className="space-y-1 sm:space-y-0 sm:flex sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-600 mb-2">
                            {guest.email && (
                              <div className="flex items-center space-x-1 min-w-0">
                                <Mail className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{guest.email}</span>
                              </div>
                            )}
                            {guest.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-3 h-3 flex-shrink-0" />
                                <span className="whitespace-nowrap">{guest.phone}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Children details */}
                        {guest.hasChildren && guest.children && guest.children.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs text-gray-600 mb-1">Děti:</div>
                            <div className="flex flex-wrap gap-1">
                              {guest.children.map((child, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full"
                                >
                                  {child.name} ({child.age} let)
                                </span>
                              ))}
                            </div>
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
                                {getDietaryRestrictionLabel(restriction)}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Invitation status */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {guest.invitationSent && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                guest.invitationMethod === 'sent'
                                  ? 'bg-cyan-100 text-cyan-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {guest.invitationMethod === 'sent' ? 'Pozvánka odeslána' : 'Pozvánka předána'}
                            </span>
                          )}
                          {guest.accommodationInterest === 'interested' && guest.accommodationType && (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                              🏨 {guest.accommodationType}
                            </span>
                          )}
                        </div>

                        {/* Notes and Accommodation Payment tags */}
                        {(guest.notes?.trim() || guest.accommodationPayment) && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {/* Notes tag */}
                            {guest.notes && guest.notes.trim() && (
                              <span
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1"
                                title={guest.notes}
                              >
                                📝 {guest.notes.length > 30 ? guest.notes.substring(0, 30) + '...' : guest.notes}
                              </span>
                            )}

                            {/* Accommodation payment tag */}
                            {guest.accommodationPayment && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                                  guest.accommodationPayment === 'paid_by_couple'
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                💰 {guest.accommodationPayment === 'paid_by_couple' ? 'Platíme my' : 'Platí host'}
                              </span>
                            )}
                          </div>
                        )}

                      </div>

                      {/* Actions - Desktop only (side) */}
                      <div className="hidden sm:flex items-center space-x-2 flex-shrink-0">
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
                            onClick={() => handleRSVPChange(guest.id, 'maybe')}
                            className={`p-1 rounded ${guest.rsvpStatus === 'maybe' ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400 hover:text-yellow-600'}`}
                            title="Označit jako možná"
                          >
                            <HelpCircle className="w-4 h-4" />
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

                    {/* Mobile Actions - Bottom bar */}
                    <div className="sm:hidden flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                      {/* RSVP Quick Actions */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleRSVPChange(guest.id, 'attending')}
                          className={`p-1.5 rounded ${guest.rsvpStatus === 'attending' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                          title="Označit jako přijde"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRSVPChange(guest.id, 'maybe')}
                          className={`p-1.5 rounded ${guest.rsvpStatus === 'maybe' ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400 hover:text-yellow-600'}`}
                          title="Označit jako možná"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRSVPChange(guest.id, 'declined')}
                          className={`p-1.5 rounded ${guest.rsvpStatus === 'declined' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-red-600'}`}
                          title="Označit jako nepřijde"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Edit button */}
                      <button
                        onClick={() => onEditGuest?.(guest)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Upravit</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          )
        })}

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


    </div>
  )
}

// Helper function to group guests
function groupGuestsBy(guests: Guest[], groupBy: string, preserveSortOrder: boolean = false): Record<string, Guest[]> {
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

  // Sort guests within each group alphabetically by lastName, then firstName
  Object.keys(grouped).forEach(key => {
    grouped[key].sort((a, b) => {
      const lastNameCompare = a.lastName.localeCompare(b.lastName, 'cs')
      if (lastNameCompare !== 0) return lastNameCompare
      return a.firstName.localeCompare(b.firstName, 'cs')
    })
  })

  return grouped
}
