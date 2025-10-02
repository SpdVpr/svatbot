'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  Plus,
  Search,
  Filter,
  MapPin,
  Bed,
  Users,
  Phone,
  Mail,
  Globe,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Home,
  ChevronRight
} from 'lucide-react'
import { useAccommodationWithGuests, type AccommodationStatsWithGuests } from '@/hooks/useAccommodationWithGuests'
import type { Accommodation } from '@/types'

export default function AccommodationPage() {
  const router = useRouter()
  const { accommodations, stats, loading, deleteAccommodation } = useAccommodationWithGuests()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null)

  // Filter accommodations based on search
  const filteredAccommodations = accommodations.filter(acc =>
    acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.address.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (confirm('Opravdu chcete smazat toto ubytování? Tato akce je nevratná.')) {
      try {
        await deleteAccommodation(id)
      } catch (error) {
        console.error('Error deleting accommodation:', error)
        alert('Chyba při mazání ubytování')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        {/* Breadcrumb - Hidden on mobile */}
        <div className="hidden sm:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Ubytování</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile header */}
          <div className="sm:hidden space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Zpět</span>
              </Link>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary-600" />
                Správa ubytování
              </h1>
              <p className="text-sm text-gray-600">
                Spravujte ubytování pro vaše svatební hosty
              </p>
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
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-primary-600" />
                  Správa ubytování
                </h1>
                <p className="text-sm text-gray-600">
                  Spravujte ubytování pro vaše svatební hosty
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/accommodation/new')}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Přidat ubytování
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ubytování</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAccommodations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Bed className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Celkem pokojů</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRooms}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dostupné pokoje</p>
                <p className="text-2xl font-bold text-gray-900">{stats.availableRooms}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Obsazené pokoje</p>
                <p className="text-2xl font-bold text-gray-900">{stats.occupiedRooms}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Obsazenost</p>
                <p className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Hledat ubytování..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filtry
            </button>
          </div>
        </div>

        {/* Accommodations List */}
        {filteredAccommodations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {accommodations.length === 0 ? 'Žádné ubytování' : 'Žádné výsledky'}
            </h3>
            <p className="text-gray-600 mb-6">
              {accommodations.length === 0 
                ? 'Začněte přidáním prvního ubytování pro vaše hosty.'
                : 'Zkuste upravit vyhledávací kritéria.'
              }
            </p>
            {accommodations.length === 0 && (
              <button
                onClick={() => router.push('/accommodation/new')}
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Přidat první ubytování
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAccommodations.map((accommodation) => (
              <div key={accommodation.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Image */}
                <div className="h-48 bg-gray-200 relative">
                  {accommodation.images.length > 0 ? (
                    <img
                      src={accommodation.images[0]}
                      alt={accommodation.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      accommodation.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {accommodation.isActive ? 'Aktivní' : 'Neaktivní'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {accommodation.name}
                  </h3>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{accommodation.address.city}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      <span>{accommodation.rooms.length} pokojů</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">{accommodation.availableRooms} dostupných</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-red-600" />
                      <span className="text-red-600">{accommodation.occupiedRooms} obsazených</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 mb-4">
                    {accommodation.contactInfo.phone && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span>{accommodation.contactInfo.phone}</span>
                      </div>
                    )}
                    {accommodation.contactInfo.email && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span>{accommodation.contactInfo.email}</span>
                      </div>
                    )}
                    {accommodation.website && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Globe className="w-3 h-3" />
                        <a 
                          href={accommodation.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-primary-600"
                        >
                          Web
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/accommodation/${accommodation.id}`)}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                    >
                      <Eye className="w-3 h-3" />
                      Detail
                    </button>
                    <button
                      onClick={() => router.push(`/accommodation/${accommodation.id}/edit`)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(accommodation.id)}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
