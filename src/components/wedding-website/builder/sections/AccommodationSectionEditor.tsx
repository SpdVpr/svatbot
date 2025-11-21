'use client'

import { useState } from 'react'
import { Building2, Phone, Mail, Eye, EyeOff, DollarSign, Users, Download, Trash2, Edit2 } from 'lucide-react'
import { useAccommodation } from '@/hooks/useAccommodation'
import type { AccommodationContent, WebsiteAccommodation, WebsiteRoom } from '@/types/wedding-website'

interface AccommodationSectionEditorProps {
  content?: AccommodationContent
  onChange: (content: AccommodationContent) => void
  onSave?: () => Promise<void>
}

export default function AccommodationSectionEditor({ content, onChange, onSave }: AccommodationSectionEditorProps) {
  const { accommodations, loading } = useAccommodation()
  const totalRooms = accommodations.reduce((sum, acc) => sum + acc.rooms.length, 0)
  const [importing, setImporting] = useState(false)

  // Use content directly from props, no local state needed
  const currentContent: AccommodationContent = {
    enabled: content?.enabled || false,
    title: content?.title || 'Ubytování',
    description: content?.description || 'Doporučujeme následující ubytování pro naše svatební hosty.',
    showPrices: content?.showPrices ?? true,
    showAvailability: content?.showAvailability ?? true,
    accommodations: content?.accommodations || [],
    contactInfo: content?.contactInfo || {
      name: '',
      phone: '',
      email: '',
      message: 'Pro rezervaci kontaktujte přímo ubytování nebo nás.'
    }
  }

  const updateContent = (updates: Partial<AccommodationContent> | AccommodationContent) => {
    const newContent = { ...currentContent, ...updates }
    console.log('🔄 updateContent called with:', updates)
    console.log('📦 New content:', newContent)
    onChange(newContent)
    console.log('✅ onChange called')
  }

  const updateContactInfo = (field: string, value: string) => {
    const newContactInfo = {
      ...currentContent.contactInfo!,
      [field]: value
    }
    updateContent({ contactInfo: newContactInfo })
  }

  const importFromAccommodation = () => {
    setImporting(true)

    try {
      console.log('🔄 Starting import...', { accommodationsCount: accommodations.length })

      // Group identical rooms and convert to website format
      const websiteAccommodations: WebsiteAccommodation[] = accommodations
        .filter(acc => acc.isActive)
        .map(acc => {
          // Group identical rooms
          const roomGroups: Record<string, WebsiteRoom> = {}

          acc.rooms.forEach(room => {
            // Create unique key based on room properties
            const baseName = room.name.replace(/\s*\d+$/, '') // Remove trailing numbers
            const key = `${baseName}-${room.pricePerNight}-${room.capacity}-${room.description || ''}`

            if (!roomGroups[key]) {
              roomGroups[key] = {
                name: baseName,
                description: room.description,
                pricePerNight: room.pricePerNight,
                capacity: room.capacity,
                count: 1
              }
            } else {
              roomGroups[key].count++
            }
          })

          return {
            id: acc.id,
            name: acc.name,
            description: acc.description,
            address: `${acc.address.street}, ${acc.address.city} ${acc.address.postalCode}`.trim(),
            phone: acc.contactInfo.phone,
            email: acc.contactInfo.email,
            website: acc.website,
            image: acc.images?.[0],
            rooms: Object.values(roomGroups)
          }
        })

      console.log('✅ Import completed:', {
        websiteAccommodationsCount: websiteAccommodations.length,
        roomTypesCount: websiteAccommodations.reduce((sum, acc) => sum + acc.rooms.length, 0)
      })
      console.log('📦 Imported data:', websiteAccommodations)

      const newContent = {
        ...currentContent,
        enabled: true,
        accommodations: websiteAccommodations
      }

      console.log('💾 Updating content with:', newContent)
      updateContent(newContent)

      // Automaticky uložit po importu
      setTimeout(async () => {
        if (onSave) {
          console.log('💾 Auto-saving after import...')
          try {
            await onSave()
            console.log('✅ Auto-save completed')
          } catch (error) {
            console.error('❌ Auto-save failed:', error)
          }
        }
        setImporting(false)
        alert(`✅ Naimportováno ${websiteAccommodations.length} ubytování s ${websiteAccommodations.reduce((sum, acc) => sum + acc.rooms.length, 0)} typy pokojů`)
      }, 500)
    } catch (error) {
      console.error('❌ Error importing accommodations:', error)
      setImporting(false)
      alert('❌ Chyba při importu ubytování')
    }
  }

  return (
    <div className="space-y-6">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-primary-600" />
          <div>
            <h3 className="font-medium text-gray-900">Sekce Ubytování</h3>
            <p className="text-sm text-gray-600">
              Zobrazit doporučené ubytování pro hosty
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={currentContent.enabled}
            onChange={(e) => updateContent({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
      </div>

      {currentContent.enabled && (
        <>
          {/* Import from Accommodation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">
                  Importovat z modulu Ubytování
                </h4>
                <p className="text-sm text-blue-700">
                  {accommodations.length > 0
                    ? `Nalezeno ${accommodations.length} ubytování s ${totalRooms} typy pokojů. Data se automaticky zobrazí na webu.`
                    : 'Zatím nemáte přidané žádné ubytování. Přidejte je v sekci /accommodation.'}
                </p>
              </div>
              {accommodations.length > 0 && (
                <button
                  onClick={importFromAccommodation}
                  disabled={importing || loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap ml-4 flex items-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {importing ? 'Importováno ✓' : 'Importovat'}
                </button>
              )}
            </div>
          </div>

          {/* Basic Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Základní nastavení</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nadpis sekce
                </label>
                <input
                  type="text"
                  value={currentContent.title}
                  onChange={(e) => updateContent({ title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ubytování"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Popis
                </label>
                <textarea
                  value={currentContent.description}
                  onChange={(e) => updateContent({ description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Krátký popis pro hosty..."
                />
              </div>
            </div>
          </div>

          {/* Display Options */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Možnosti zobrazení</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Zobrazit ceny</p>
                    <p className="text-sm text-gray-600">Ukázat ceny pokojů na webu</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentContent.showPrices}
                    onChange={(e) => updateContent({ showPrices: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Zobrazit dostupnost</p>
                    <p className="text-sm text-gray-600">Ukázat počet dostupných pokojů</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentContent.showAvailability}
                    onChange={(e) => updateContent({ showAvailability: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Kontaktní informace</h4>
            <p className="text-sm text-gray-600 mb-4">
              Volitelné kontaktní informace pro rezervace (pokud nechcete, aby hosté kontaktovali přímo ubytování)
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jméno kontaktní osoby
                </label>
                <input
                  type="text"
                  value={currentContent.contactInfo?.name || ''}
                  onChange={(e) => updateContactInfo('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Jana Nováková"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={currentContent.contactInfo?.phone || ''}
                  onChange={(e) => updateContactInfo('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="+420 123 456 789"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={currentContent.contactInfo?.email || ''}
                  onChange={(e) => updateContactInfo('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="jana@example.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zpráva pro hosty
                </label>
                <textarea
                  value={currentContent.contactInfo?.message || ''}
                  onChange={(e) => updateContactInfo('message', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Pro rezervaci kontaktujte přímo ubytování nebo nás."
                />
              </div>
            </div>
          </div>

          {/* Imported Accommodations */}
          {currentContent.accommodations && currentContent.accommodations.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Importovaná ubytování ({currentContent.accommodations.length})
              </h4>

              <div className="space-y-4">
                {currentContent.accommodations.map((acc, accIndex) => (
                  <div key={acc.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">{acc.name}</h5>
                        <p className="text-sm text-gray-600 mt-1">{acc.address}</p>
                        {acc.description && (
                          <p className="text-sm text-gray-600 mt-1">{acc.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          const newAccommodations = currentContent.accommodations!.filter((_, i) => i !== accIndex)
                          updateContent({ accommodations: newAccommodations })
                        }}
                        className="text-red-600 hover:text-red-700 p-2"
                        title="Odstranit ubytování"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Rooms */}
                    <div className="mt-3 space-y-2">
                      <h6 className="text-sm font-medium text-gray-700">
                        Pokoje ({acc.rooms.length} typů)
                      </h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {acc.rooms.map((room, roomIndex) => (
                          <div key={roomIndex} className="bg-gray-50 rounded p-3 text-sm">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{room.name}</p>
                                {room.description && (
                                  <p className="text-xs text-gray-600 mt-1">{room.description}</p>
                                )}
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                                  <span>👥 {room.capacity} {room.capacity === 1 ? 'osoba' : room.capacity < 5 ? 'osoby' : 'osob'}</span>
                                  <span>🛏️ {room.count}× k dispozici</span>
                                </div>
                              </div>
                              <span className="text-primary-600 font-semibold whitespace-nowrap ml-2">
                                {room.pricePerNight.toLocaleString('cs-CZ')} Kč
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Note */}
          {(!currentContent.accommodations || currentContent.accommodations.length === 0) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-blue-900 mb-1">Žádná ubytování</h5>
                  <p className="text-sm text-blue-700">
                    Klikněte na tlačítko "Importovat" výše pro načtení ubytování z modulu Ubytování.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
