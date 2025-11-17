'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import { useRobustGuests } from '@/hooks/useRobustGuests'
import { useAccommodation } from '@/hooks/useAccommodation'
import GuestList from '@/components/guests/GuestList'
import GuestStats from '@/components/guests/GuestStats'
import GuestForm from '@/components/guests/GuestForm'
import ModuleHeader from '@/components/common/ModuleHeader'
import Link from 'next/link'
import logger from '@/lib/logger'
import { Guest, GuestFormData } from '@/types/guest'
import {
  Plus,
  Download,
  Users,
  Send,
  FileText,
  Upload,
  Home,
  BarChart3
} from 'lucide-react'

export default function GuestsPage() {
  logger.log('🏠 GuestsPage render START')
  const { user } = useAuth()
  const { wedding } = useWedding()

  // Use robust hook
  const { guests, loading, createGuest, updateGuest, deleteGuest, updateRSVP, error, stats, reorderGuests } = useRobustGuests()
  const { getAccommodationById } = useAccommodation()

  logger.log('🏠 Using ROBUST hook')
  logger.log('🏠 useGuest result:', { reorderGuests: !!reorderGuests, type: typeof reorderGuests })
  // Removed viewMode - using stats view as default (most informative)
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [guestFormLoading, setGuestFormLoading] = useState(false)

  // Check if user has any guests
  const hasGuests = guests.length > 0

  logger.log('🏠 Guests page:', {
    hasGuests,
    guestsCount: guests.length,
    loading,
    guests: guests.map(g => g.firstName)
  })

  // Handle create guest
  const handleCreateGuest = async (data: GuestFormData) => {
    try {
      setGuestFormLoading(true)
      await createGuest(data)
      setShowGuestForm(false)
    } catch (error) {
      logger.error('Error creating guest:', error)
      throw error // Re-throw to show error in form
    } finally {
      setGuestFormLoading(false)
    }
  }

  // Handle edit guest
  const handleEditGuest = (guest: Guest) => {
    setEditingGuest(guest)
    setShowGuestForm(true)
  }

  // Simple test function
  const handleGuestReorder = async (reorderedGuests: Guest[]) => {
    logger.log('🔄 handleGuestReorder called with:', reorderedGuests.length, 'guests')
    try {
      await reorderGuests(reorderedGuests)
      logger.log('✅ Reorder completed')
    } catch (error) {
      logger.error('❌ Error reordering guests:', error)
    }
  }

  logger.log('🏠 handleGuestReorder created:', {
    handleGuestReorder: !!handleGuestReorder,
    handleGuestReorderType: typeof handleGuestReorder,
    reorderGuests: !!reorderGuests,
    reorderGuestsType: typeof reorderGuests
  })

  const handleShowGuestForm = useCallback(() => setShowGuestForm(true), [])



  // Handle update guest
  const handleUpdateGuest = async (data: GuestFormData) => {
    if (!editingGuest) return



    try {
      setGuestFormLoading(true)
      await updateGuest(editingGuest.id, data)

      setShowGuestForm(false)
      setEditingGuest(null)
    } catch (error) {
      logger.error('Error updating guest:', error)
      throw error // Re-throw to show error in form
    } finally {
      setGuestFormLoading(false)
    }
  }

  // Handle form submit (create or update)
  const handleFormSubmit = async (data: GuestFormData) => {
    if (editingGuest) {
      await handleUpdateGuest(data)
    } else {
      await handleCreateGuest(data)
    }
  }

  // Handle form cancel
  const handleFormCancel = () => {
    setShowGuestForm(false)
    setEditingGuest(null)
  }

  // Don't show auth check - let AppTemplate handle transitions smoothly
  if (!user || !wedding) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <ModuleHeader
        icon={Users}
        title="Hosté"
        subtitle={`${stats.total} hostů • ${stats.attending} potvrzeno`}
        iconGradient="from-pink-500 to-rose-500"
        actions={
          <button
            onClick={() => setShowGuestForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Přidat hosta</span>
            <span className="sm:hidden">Přidat</span>
          </button>
        }
      />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 loading-spinner" />
              <span className="text-text-muted">Načítání hostů...</span>
            </div>
          </div>
        ) : !hasGuests ? (
          /* Empty state */
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center">
              <Users className="w-12 h-12 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Začněte se správou hostů
            </h2>
            <p className="text-text-muted mb-8 max-w-md mx-auto">
              Přidejte hosty pro vaši svatbu, spravujte RSVP odpovědi a sledujte
              kdo přijde na váš velký den.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setShowGuestForm(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Přidat prvního hosta</span>
              </button>

              <Link
                href="/guests/import"
                className="btn-outline flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Importovat ze souboru</span>
              </Link>
            </div>

            {/* Quick navigation */}
            <div className="mt-8 text-center">
              <Link
                href="/"
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Zpět na hlavní obrazovku</span>
              </Link>
            </div>

            {/* Features preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Správa hostů</h3>
                <p className="text-sm text-text-muted">
                  Kompletní databáze hostů s kontakty a preferencemi
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                  <Send className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">RSVP systém</h3>
                <p className="text-sm text-text-muted">
                  Online potvrzování účasti s automatickými připomínkami
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Statistiky</h3>
                <p className="text-sm text-text-muted">
                  Přehled odpovědí, účasti a speciálních požadavků
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Stats view - most informative display */
          <div className="space-y-6">
            <GuestStats
              guests={guests}
              stats={stats}
              updateGuest={updateGuest}
              updateRSVP={updateRSVP}
              deleteGuest={deleteGuest}
              onGuestReorder={handleGuestReorder}
              onCreateGuest={() => setShowGuestForm(true)}
              onEditGuest={handleEditGuest}
              getAccommodationById={getAccommodationById}
            />
          </div>
        )}
      </div>

      {/* Guest Form Modal */}
      {showGuestForm && (
        <GuestForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={guestFormLoading}
          error={error || undefined}
          initialData={editingGuest ? {
            firstName: editingGuest.firstName,
            lastName: editingGuest.lastName,
            email: editingGuest.email,
            phone: editingGuest.phone,
            address: editingGuest.address,
            category: editingGuest.category,
            invitationType: editingGuest.invitationType,
            hasPlusOne: editingGuest.hasPlusOne,
            plusOneName: editingGuest.plusOneName,
            hasChildren: editingGuest.hasChildren,
            children: editingGuest.children,
            dietaryRestrictions: editingGuest.dietaryRestrictions,
            dietaryNotes: editingGuest.dietaryNotes,
            accessibilityNeeds: editingGuest.accessibilityNeeds,
            accommodationNeeds: editingGuest.accommodationNeeds,
            preferredContactMethod: editingGuest.preferredContactMethod,
            language: editingGuest.language,
            notes: editingGuest.notes,
            accommodationInterest: editingGuest.accommodationInterest,
            accommodationType: editingGuest.accommodationType,
            accommodationPayment: editingGuest.accommodationPayment,
            accommodationId: editingGuest.accommodationId,
            roomId: editingGuest.roomId,
            invitationSent: editingGuest.invitationSent,
            invitationMethod: editingGuest.invitationMethod
          } : undefined}
        />
      )}
    </div>
  )
}
