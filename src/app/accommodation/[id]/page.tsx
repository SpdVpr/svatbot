'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Bed,
  Users,
  Plus,
  Edit,
  Trash2,
  Star,
  Wifi,
  Car,
  Coffee
} from 'lucide-react'
import { useAccommodationWithGuests } from '@/hooks/useAccommodationWithGuests'
import type { Room } from '@/types'
import RoomImageGallery, { useRoomImageGallery } from '@/components/accommodation/RoomImageGallery'

interface AccommodationDetailPageProps {
  params: {
    id: string
  }
}

export default function AccommodationDetailPage({ params }: AccommodationDetailPageProps) {
  const router = useRouter()
  const { getAccommodationWithOccupancy, loading } = useAccommodationWithGuests()
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'reservations'>('overview')
  const { isOpen, images, roomName, initialIndex, openGallery, closeGallery } = useRoomImageGallery()

  const accommodation = getAccommodationWithOccupancy(params.id)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8" />
      </div>
    )
  }

  if (!accommodation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ubytování nenalezeno</h2>
          <p className="text-gray-600 mb-4">Požadované ubytování neexistuje nebo bylo smazáno.</p>
          <button
            onClick={() => router.push('/accommodation')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Zpět na přehled
          </button>
        </div>
      </div>
    )
  }

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase()
    if (lower.includes('wifi') || lower.includes('internet')) return <Wifi className="w-4 h-4" />
    if (lower.includes('parking') || lower.includes('parkování')) return <Car className="w-4 h-4" />
    if (lower.includes('breakfast') || lower.includes('snídaně')) return <Coffee className="w-4 h-4" />
    return <Star className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Zpět na dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-primary-600" />
                  {accommodation.name}
                </h1>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {accommodation.address.city}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/accommodation/${accommodation.id}/edit`)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Upravit
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Přehled
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rooms'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pokoje ({accommodation.rooms.length})
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reservations'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rezervace
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Accommodation Images */}
              {accommodation.images.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Fotky ubytování</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {accommodation.images.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => openGallery(accommodation.images, accommodation.name, index)}
                      >
                        <img
                          src={image}
                          alt={`${accommodation.name} - fotka ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {accommodation.description && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Popis</h3>
                  <p className="text-gray-700">{accommodation.description}</p>
                </div>
              )}

              {/* Amenities */}
              {accommodation.amenities.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vybavení</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {accommodation.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        {getAmenityIcon(amenity)}
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Adresa
                </h3>
                <div className="text-gray-700">
                  <p>{accommodation.address.street}</p>
                  <p>{accommodation.address.postalCode} {accommodation.address.city}</p>
                  <p>{accommodation.address.country}</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontakt</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${accommodation.contactInfo.phone}`} className="text-primary-600 hover:text-primary-700">
                      {accommodation.contactInfo.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${accommodation.contactInfo.email}`} className="text-primary-600 hover:text-primary-700">
                      {accommodation.contactInfo.email}
                    </a>
                  </div>
                  {accommodation.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a 
                        href={accommodation.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        Webové stránky
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiky obsazenosti</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Celkem pokojů</span>
                    <span className="font-semibold">{accommodation.rooms.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Obsazené hosty</span>
                    <span className="font-semibold text-red-600">
                      {accommodation.occupiedRooms}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Dostupné pokoje</span>
                    <span className="font-semibold text-green-600">
                      {accommodation.availableRooms}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Obsazenost</span>
                    <span className="font-semibold text-orange-600">
                      {accommodation.occupancyRate}%
                    </span>
                  </div>
                </div>

                {/* Occupied Rooms Details */}
                {accommodation.occupiedRooms > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Obsazené pokoje:</h4>
                    <div className="space-y-2">
                      {accommodation.roomOccupancies
                        .filter(r => r.isOccupied)
                        .map(room => (
                          <div key={room.roomId} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{room.roomName}</span>
                            <span className="font-medium text-gray-900">
                              {room.occupiedBy?.guestName}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Pokoje</h2>
              <button
                onClick={() => router.push(`/accommodation/${accommodation.id}/rooms/new`)}
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Přidat pokoj
              </button>
            </div>

            {accommodation.rooms.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Bed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné pokoje</h3>
                <p className="text-gray-600 mb-6">
                  Přidejte první pokoj do tohoto ubytování.
                </p>
                <button
                  onClick={() => router.push(`/accommodation/${accommodation.id}/rooms/new`)}
                  className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Přidat první pokoj
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accommodation.rooms.map((room) => {
                  const roomOccupancy = accommodation.roomOccupancies.find(r => r.roomId === room.id)
                  return (
                  <div key={room.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Room Image */}
                    <div
                      className={`h-48 bg-gray-200 relative ${
                        room.images.length > 0 ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
                      }`}
                      onClick={() => room.images.length > 0 && openGallery(room.images, room.name, 0)}
                    >
                      {room.images.length > 0 ? (
                        <>
                          <img
                            src={room.images[0]}
                            alt={room.name}
                            className="w-full h-full object-cover"
                          />
                          {room.images.length > 1 && (
                            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                              +{room.images.length - 1} fotek
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Bed className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          roomOccupancy?.isOccupied
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {roomOccupancy?.isOccupied ? 'Obsazený' : 'Dostupný'}
                        </span>
                      </div>
                    </div>

                    {/* Room Info */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{room.name}</h3>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{room.capacity} osob</span>
                        </div>
                        <div className="font-semibold text-primary-600">
                          {room.pricePerNight.toLocaleString()} Kč/noc
                        </div>
                      </div>

                      {/* Occupancy Info */}
                      {roomOccupancy?.isOccupied && roomOccupancy.occupiedBy && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-red-600" />
                            <span className="text-red-800 font-medium">Obsazeno:</span>
                            <span className="text-red-700">{roomOccupancy.occupiedBy.guestName}</span>
                          </div>
                          {roomOccupancy.occupiedBy.guestEmail && (
                            <div className="text-xs text-red-600 mt-1 ml-6">
                              {roomOccupancy.occupiedBy.guestEmail}
                            </div>
                          )}
                        </div>
                      )}

                      {room.description && (
                        <p className="text-sm text-gray-600 mb-4">
                          {room.description.length > 100
                            ? `${room.description.substring(0, 100)}...`
                            : room.description
                          }
                        </p>
                      )}

                      {/* Room Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/accommodation/${accommodation.id}/rooms/${room.id}/edit`)}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                        >
                          <Edit className="w-3 h-3" />
                          Upravit
                        </button>
                        <button className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Rezervace</h3>
            <p className="text-gray-600">
              Správa rezervací bude implementována v další fázi.
            </p>
          </div>
        )}
      </div>

      {/* Room Image Gallery */}
      <RoomImageGallery
        images={images}
        roomName={roomName}
        isOpen={isOpen}
        onClose={closeGallery}
        initialIndex={initialIndex}
      />
    </div>
  )
}
