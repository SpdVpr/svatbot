'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import { useGuest } from '@/hooks/useGuest'
import GuestList from '@/components/guests/GuestList'
import GuestStats from '@/components/guests/GuestStats'
import GuestForm from '@/components/guests/GuestForm'

import { Guest, GuestFormData } from '@/types/guest'
import {
  Plus,
  Download,
  Upload,
  Settings,
  BarChart3,
  List,
  Grid3X3,
  Users,
  ArrowLeft,
  Home,
  Send,
  FileText
} from 'lucide-react'
import Link from 'next/link'

export default function GuestsPage() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const { guests, loading, createGuest, updateGuest, error, stats } = useGuest()
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'stats'>('stats')
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [guestFormLoading, setGuestFormLoading] = useState(false)

  // Check if user has any guests
  const hasGuests = guests.length > 0

  // Handle create guest
  const handleCreateGuest = async (data: GuestFormData) => {
    try {
      setGuestFormLoading(true)
      await createGuest(data)
      setShowGuestForm(false)
    } catch (error) {
      console.error('Error creating guest:', error)
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

  // Handle update guest
  const handleUpdateGuest = async (data: GuestFormData) => {
    if (!editingGuest) return

    try {
      setGuestFormLoading(true)
      await updateGuest(editingGuest.id, data)
      setShowGuestForm(false)
      setEditingGuest(null)
    } catch (error) {
      console.error('Error updating guest:', error)
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Přihlášení vyžadováno
          </h1>
          <p className="text-text-muted">
            Pro přístup ke správě hostů se musíte přihlásit.
          </p>
        </div>
      </div>
    )
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Žádná svatba
          </h1>
          <p className="text-text-muted mb-4">
            Nejdříve si vytvořte svatbu v onboarding procesu.
          </p>
          <Link href="/" className="btn-primary">
            Zpět na dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        {/* Breadcrumb - Hidden on mobile */}
        <div className="hidden sm:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Hosté</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile header */}
          <div className="sm:hidden space-y-4 py-4">
            {/* Top row - Back button and title */}
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Hosté</h1>
              </div>
            </div>

            {/* Main action button - prominent placement */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowGuestForm(true)}
                className="btn-primary flex items-center space-x-2 px-6 py-3 text-base font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Přidat hosta</span>
              </button>
            </div>

            {/* View mode toggle */}
            <div className="flex items-center justify-center">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('stats')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'stats'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop header */}
          <div className="hidden sm:flex items-center justify-between h-16">
            {/* Back button and Title */}
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Zpět na dashboard</span>
              </Link>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-2xl font-bold text-gray-900">Hosté</h1>
                <p className="text-sm text-text-muted">
                  Správa hostů pro svatbu {wedding.brideName} & {wedding.groomName}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* View mode toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('stats')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'stats'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>

              {/* Action buttons */}
              <button className="btn-outline flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span className="hidden lg:inline">Import</span>
              </button>

              <button className="btn-outline flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span className="hidden lg:inline">Export</span>
              </button>

              <button
                onClick={() => setShowGuestForm(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Přidat hosta</span>
              </button>
            </div>
          </div>
        </div>
      </div>

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

              <button className="btn-outline flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Importovat ze souboru</span>
              </button>
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
          /* Content based on view mode */
          <div className="space-y-6">
            {viewMode === 'stats' && (
              <GuestStats
                onCreateGuest={() => setShowGuestForm(true)}
                onEditGuest={handleEditGuest}
              />
            )}

            {(viewMode === 'list' || viewMode === 'grid') && (
              <GuestList
                viewMode={viewMode}
                onCreateGuest={() => setShowGuestForm(true)}
                onEditGuest={handleEditGuest}
              />
            )}
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
            dietaryRestrictions: editingGuest.dietaryRestrictions,
            dietaryNotes: editingGuest.dietaryNotes,
            accessibilityNeeds: editingGuest.accessibilityNeeds,
            accommodationNeeds: editingGuest.accommodationNeeds,
            preferredContactMethod: editingGuest.preferredContactMethod,
            language: editingGuest.language,
            notes: editingGuest.notes,
            tags: editingGuest.tags
          } : undefined}
        />
      )}
    </div>
  )
}
