'use client'

import { useState } from 'react'
import { Building2, Phone, Mail, Eye, EyeOff, DollarSign, Users, Download } from 'lucide-react'
import { useAccommodation } from '@/hooks/useAccommodation'
import type { AccommodationContent } from '@/types/wedding-website'

interface AccommodationSectionEditorProps {
  content?: AccommodationContent
  onChange: (content: AccommodationContent) => void
}

export default function AccommodationSectionEditor({ content, onChange }: AccommodationSectionEditorProps) {
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
    contactInfo: content?.contactInfo || {
      name: '',
      phone: '',
      email: '',
      message: 'Pro rezervaci kontaktujte přímo ubytování nebo nás.'
    }
  }

  const updateContent = (updates: Partial<AccommodationContent>) => {
    const newContent = { ...currentContent, ...updates }
    onChange(newContent)
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

    // Import se provede automaticky - data se načítají z useAccommodation hooku
    // a zobrazují se v template při renderování

    setTimeout(() => {
      setImporting(false)
    }, 500)
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

          {/* Preview Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-900 mb-1">Náhled ubytování</h5>
                <p className="text-sm text-blue-700">
                  Ubytování se automaticky načítají z vaší správy ubytování. 
                  Přidejte ubytování v sekci "Ubytování" na hlavním dashboardu.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
