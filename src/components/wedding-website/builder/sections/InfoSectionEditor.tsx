'use client'

import { useState } from 'react'
import { MapPin, Clock, Shirt, Car, Plus, X } from 'lucide-react'
import { useWeddingStore } from '@/stores/weddingStore'
import type { InfoContent } from '@/types/wedding-website'

interface InfoSectionEditorProps {
  content: InfoContent
  onChange: (content: InfoContent) => void
}

export default function InfoSectionEditor({ content, onChange }: InfoSectionEditorProps) {
  const { currentWedding: wedding } = useWeddingStore()

  const handleInputChange = (field: keyof InfoContent, value: any) => {
    onChange({
      ...content,
      [field]: value
    })
  }

  const addCustomInfo = () => {
    const customInfo = content.customInfo || []
    const newInfo = {
      id: Date.now().toString(),
      title: '',
      description: '',
      icon: 'info'
    }
    
    handleInputChange('customInfo', [...customInfo, newInfo])
  }

  const updateCustomInfo = (id: string, field: string, value: string) => {
    const customInfo = content.customInfo || []
    const updatedInfo = customInfo.map(info => 
      info.id === id ? { ...info, [field]: value } : info
    )
    
    handleInputChange('customInfo', updatedInfo)
  }

  const removeCustomInfo = (id: string) => {
    const customInfo = content.customInfo || []
    const filteredInfo = customInfo.filter(info => info.id !== id)
    
    handleInputChange('customInfo', filteredInfo)
  }

  // Auto-import dat ze svatby
  const importFromWedding = () => {
    if (!wedding) return

    const updatedContent: InfoContent = {
      ...content,
      enabled: true,
      ceremony: {
        time: content.ceremony?.time || '',
        venue: typeof wedding.venue === 'string' ? wedding.venue : wedding.venue?.name || content.ceremony?.venue || '',
        address: typeof wedding.venue === 'object' && wedding.venue?.address
          ? `${wedding.venue.address.street}, ${wedding.venue.address.city} ${wedding.venue.address.postalCode}`.trim()
          : content.ceremony?.address || '',
        coordinates: content.ceremony?.coordinates
      }
    }

    onChange(updatedContent)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Auto-import */}
      {wedding && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                Importovat ze svatby
              </h4>
              <p className="text-sm text-blue-700">
                Automaticky vyplnit místo konání z vašich svatebních údajů
              </p>
            </div>
            <button
              onClick={importFromWedding}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Importovat
            </button>
          </div>
        </div>
      )}

      {/* Obřad */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-pink-600" />
          <h3 className="text-lg font-semibold text-gray-900">Obřad</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Místo konání *
            </label>
            <input
              type="text"
              value={content.ceremony?.venue || ''}
              onChange={(e) => handleInputChange('ceremony', { 
                ...content.ceremony, 
                venue: e.target.value 
              })}
              placeholder="Kostel sv. Václava"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Čas
            </label>
            <input
              type="time"
              value={content.ceremony?.time || ''}
              onChange={(e) => handleInputChange('ceremony', { 
                ...content.ceremony, 
                time: e.target.value 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresa
            </label>
            <input
              type="text"
              value={content.ceremony?.address || ''}
              onChange={(e) => handleInputChange('ceremony', { 
                ...content.ceremony, 
                address: e.target.value 
              })}
              placeholder="Václavské náměstí 1, Praha 1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Hostina */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-pink-600" />
          <h3 className="text-lg font-semibold text-gray-900">Hostina</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Místo konání
            </label>
            <input
              type="text"
              value={content.reception?.venue || ''}
              onChange={(e) => handleInputChange('reception', { 
                ...content.reception, 
                venue: e.target.value 
              })}
              placeholder="Hotel Grand"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Čas
            </label>
            <input
              type="time"
              value={content.reception?.time || ''}
              onChange={(e) => handleInputChange('reception', { 
                ...content.reception, 
                time: e.target.value 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresa
            </label>
            <input
              type="text"
              value={content.reception?.address || ''}
              onChange={(e) => handleInputChange('reception', { 
                ...content.reception, 
                address: e.target.value 
              })}
              placeholder="Národní třída 10, Praha 1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Dress Code */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shirt className="w-5 h-5 text-pink-600" />
          <h3 className="text-lg font-semibold text-gray-900">Dress Code & Barevná paleta</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Požadované oblečení
            </label>
            <select
              value={content.dressCode || ''}
              onChange={(e) => handleInputChange('dressCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">Vyberte dress code</option>
              <option value="formal">Formální (oblek/večerní šaty)</option>
              <option value="semi-formal">Poloformální (košile/koktejlové šaty)</option>
              <option value="casual">Neformální</option>
              <option value="cocktail">Koktejlové oblečení</option>
              <option value="black-tie">Black tie</option>
              <option value="custom">Vlastní požadavky</option>
            </select>

            {content.dressCode === 'custom' && (
              <textarea
                value={content.dressCodeDetails || ''}
                onChange={(e) => handleInputChange('dressCodeDetails', e.target.value)}
                placeholder="Popište požadavky na oblečení..."
                rows={3}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            )}
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Barevná paleta svatby
            </label>
            <div className="space-y-2">
              {(content.colorPalette || []).map((color, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const newPalette = [...(content.colorPalette || [])]
                      newPalette[index] = e.target.value
                      handleInputChange('colorPalette', newPalette)
                    }}
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => {
                      const newPalette = [...(content.colorPalette || [])]
                      newPalette[index] = e.target.value
                      handleInputChange('colorPalette', newPalette)
                    }}
                    placeholder="#000000"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newPalette = (content.colorPalette || []).filter((_, i) => i !== index)
                      handleInputChange('colorPalette', newPalette)
                    }}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Odstranit
                  </button>
                </div>
              ))}

              {(!content.colorPalette || content.colorPalette.length < 6) && (
                <button
                  type="button"
                  onClick={() => {
                    const newPalette = [...(content.colorPalette || []), '#000000']
                    handleInputChange('colorPalette', newPalette)
                  }}
                  className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-pink-500 hover:text-pink-600 transition-colors"
                >
                  + Přidat barvu
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Přidejte barvy, které se budou objevovat na vaší svatbě (max. 6 barev)
            </p>
          </div>
        </div>
      </div>

      {/* Parkování */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Car className="w-5 h-5 text-pink-600" />
          <h3 className="text-lg font-semibold text-gray-900">Parkování</h3>
        </div>

        <textarea
          value={content.parking || ''}
          onChange={(e) => handleInputChange('parking', e.target.value)}
          placeholder="Informace o parkování - kde zaparkovat, zda je parkování zdarma, atd."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      {/* Vlastní informace */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Další informace</h3>
          <button
            onClick={addCustomInfo}
            className="inline-flex items-center gap-2 bg-pink-500 text-white px-3 py-2 rounded-lg hover:bg-pink-600 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Přidat
          </button>
        </div>

        {content.customInfo && content.customInfo.length > 0 ? (
          <div className="space-y-4">
            {content.customInfo.map((info) => (
              <div key={info.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={info.title}
                    onChange={(e) => updateCustomInfo(info.id, 'title', e.target.value)}
                    placeholder="Nadpis (např. Doprava)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <textarea
                    value={info.description}
                    onChange={(e) => updateCustomInfo(info.id, 'description', e.target.value)}
                    placeholder="Popis informace..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => removeCustomInfo(info.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Zatím nemáte žádné další informace. Klikněte na "Přidat" pro vytvoření nové.
          </p>
        )}
      </div>
    </div>
  )
}
