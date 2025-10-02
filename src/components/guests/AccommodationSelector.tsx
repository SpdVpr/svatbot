'use client'

import { useState } from 'react'
import { useAccommodationWithGuests } from '@/hooks/useAccommodationWithGuests'
import { Building2, Bed, X, AlertCircle, Plus } from 'lucide-react'
import { Guest } from '@/types/guest'

interface AccommodationSelectorProps {
  guest: Guest
  onUpdate: (guestId: string, updates: Partial<Guest>) => Promise<void>
  onClose: () => void
}

export default function AccommodationSelector({
  guest,
  onUpdate,
  onClose
}: AccommodationSelectorProps) {
  const { accommodations } = useAccommodationWithGuests()
  const [selectedAccommodationId, setSelectedAccommodationId] = useState(guest.accommodationId || '')
  const [selectedRoomId, setSelectedRoomId] = useState(guest.roomId || '')
  const [saving, setSaving] = useState(false)

  const selectedAccommodation = accommodations.find(acc => acc.id === selectedAccommodationId)
  const availableRooms = selectedAccommodation?.rooms || []

  const handleSave = async () => {
    setSaving(true)

    const updates = {
      accommodationId: selectedAccommodationId || undefined,
      roomId: selectedRoomId || undefined,
      accommodationInterest: selectedAccommodationId ? 'interested' : guest.accommodationInterest
    }

    try {
      await onUpdate(guest.id, updates)
      onClose()
    } catch (error) {
      console.error('Error updating accommodation:', error)
      alert('Chyba při ukládání ubytování')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Přiřadit ubytování
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Guest info */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <p className="font-medium text-gray-900">
            {guest.firstName} {guest.lastName}
          </p>
          {guest.email && (
            <p className="text-sm text-gray-600">{guest.email}</p>
          )}
        </div>

        {/* Accommodation selection */}
        {accommodations.length > 0 ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="accommodation" className="block text-sm font-medium text-gray-700 mb-2">
                Ubytování
              </label>
              <select
                id="accommodation"
                value={selectedAccommodationId}
                onChange={(e) => {
                  setSelectedAccommodationId(e.target.value)
                  setSelectedRoomId('') // Reset room selection
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={saving}
              >
                <option value="">-- Žádné ubytování --</option>
                {accommodations.map(accommodation => (
                  <option key={accommodation.id} value={accommodation.id}>
                    {accommodation.name} - {accommodation.address.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Room selection */}
            {selectedAccommodationId && (
              <div>
                <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-2">
                  Pokoj
                </label>
                {availableRooms.length > 0 ? (
                  <div className="space-y-2">
                    <select
                      id="room"
                      value={selectedRoomId}
                      onChange={(e) => setSelectedRoomId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      disabled={saving}
                    >
                      <option value="">-- Vyberte pokoj --</option>
                      {availableRooms.map(room => {
                        const roomOccupancy = selectedAccommodation?.roomOccupancies?.find(r => r.roomId === room.id)
                        const isOccupied = roomOccupancy?.isOccupied || false
                        const occupiedBy = roomOccupancy?.occupiedBy?.guestName

                        return (
                          <option key={room.id} value={room.id}>
                            {isOccupied ? '🔴' : '🟢'} {room.name} - {room.capacity} osob
                            {room.pricePerNight && ` (${room.pricePerNight} Kč/noc)`}
                            {isOccupied && occupiedBy ? ` - Obsazeno: ${occupiedBy}` : ''}
                          </option>
                        )
                      })}
                    </select>

                    {/* Legend */}
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <span>🟢</span>
                        <span>Volný</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🔴</span>
                        <span>Obsazený</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    V tomto ubytování nejsou zatím žádné pokoje.
                  </div>
                )}
              </div>
            )}

            {/* Current selection preview */}
            {selectedAccommodationId && selectedRoomId && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 text-green-800">
                  <Building2 className="w-4 h-4" />
                  <span className="font-medium">{selectedAccommodation?.name}</span>
                  <Bed className="w-4 h-4" />
                  <span>{availableRooms.find(r => r.id === selectedRoomId)?.name}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 mb-1">
                  Žádné ubytování není k dispozici
                </h4>
                <p className="text-sm text-yellow-700 mb-3">
                  Nejprve si založte ubytování ve správě ubytování.
                </p>
                <button
                  type="button"
                  onClick={() => window.open('/accommodation/new', '_blank')}
                  className="inline-flex items-center space-x-2 text-sm bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-md hover:bg-yellow-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Přidat ubytování</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={saving}
          >
            Zrušit
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            disabled={saving}
          >
            {saving ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 loading-spinner" />
                <span>Ukládání...</span>
              </div>
            ) : (
              'Uložit'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
