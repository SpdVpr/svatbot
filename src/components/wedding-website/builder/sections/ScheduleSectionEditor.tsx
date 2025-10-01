'use client'

import { useState } from 'react'
import { Clock, Plus, X, Calendar, MapPin } from 'lucide-react'
import { useWeddingStore } from '@/stores/weddingStore'
import type { ScheduleContent, ScheduleItem } from '@/types/wedding-website'

interface ScheduleSectionEditorProps {
  content: ScheduleContent
  onChange: (content: ScheduleContent) => void
}

export default function ScheduleSectionEditor({ content, onChange }: ScheduleSectionEditorProps) {
  const { currentWedding: wedding } = useWeddingStore()

  const handleInputChange = (field: keyof ScheduleContent, value: any) => {
    onChange({
      ...content,
      [field]: value
    })
  }

  const addScheduleItem = () => {
    const items = content.items || []
    const newItem: ScheduleItem = {
      time: '',
      title: '',
      description: '',
      icon: '⛪'
    }
    
    handleInputChange('items', [...items, newItem])
  }

  const updateScheduleItem = (index: number, field: keyof ScheduleItem, value: string) => {
    const items = content.items || []
    const updatedItems = items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    )
    
    handleInputChange('items', updatedItems)
  }

  const removeScheduleItem = (index: number) => {
    const items = content.items || []
    const filteredItems = items.filter((_, i) => i !== index)
    
    handleInputChange('items', filteredItems)
  }

  // Auto-import dat ze svatby
  const importFromWedding = () => {
    if (!wedding) return

    const weddingDate = wedding.weddingDate
    const ceremonyTime = typeof wedding.venue === 'object' ? wedding.venue.ceremonyTime : '14:00'
    const receptionTime = typeof wedding.venue === 'object' ? wedding.venue.receptionTime : '18:00'

    const defaultSchedule: ScheduleItem[] = [
      {
        time: ceremonyTime || '14:00',
        title: 'Svatební obřad',
        description: typeof wedding.venue === 'string' ? wedding.venue : wedding.venue?.name || 'Místo obřadu',
        icon: '⛪'
      },
      {
        time: '15:00',
        title: 'Fotografování',
        description: 'Společné fotky s rodinou a přáteli',
        icon: '📸'
      },
      {
        time: '17:00',
        title: 'Příjezd hostů',
        description: 'Vítání hostů na hostině',
        icon: '🚗'
      },
      {
        time: receptionTime || '18:00',
        title: 'Svatební hostina',
        description: 'Slavnostní večeře',
        icon: '🍽️'
      },
      {
        time: '21:00',
        title: 'První tanec',
        description: 'Otevření tanečního parketu',
        icon: '💃'
      },
      {
        time: '22:00',
        title: 'Zábava do rána',
        description: 'DJ a živá hudba',
        icon: '🎵'
      }
    ]

    const updatedContent: ScheduleContent = {
      ...content,
      enabled: true,
      items: content.items && content.items.length > 0 ? content.items : defaultSchedule
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
                Vytvoří základní program svatby na základě vašich údajů
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

      {/* Program svatby */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-pink-600" />
            <h3 className="text-lg font-semibold text-gray-900">Program svatby</h3>
          </div>
          <button
            onClick={addScheduleItem}
            className="inline-flex items-center gap-2 bg-pink-500 text-white px-3 py-2 rounded-lg hover:bg-pink-600 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Přidat položku
          </button>
        </div>

        {content.items && content.items.length > 0 ? (
          <div className="space-y-4">
            {content.items.map((item, index) => (
              <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">{item.icon}</span>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="time"
                      value={item.time}
                      onChange={(e) => updateScheduleItem(index, 'time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateScheduleItem(index, 'title', e.target.value)}
                      placeholder="Název události (např. Svatební obřad)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  
                  <textarea
                    value={item.description || ''}
                    onChange={(e) => updateScheduleItem(index, 'description', e.target.value)}
                    placeholder="Popis události..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Ikona:</label>
                    <div className="flex gap-2">
                      {['⛪', '📸', '🚗', '🍽️', '💃', '🎵', '🥂', '🎉', '💒', '🌹'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => updateScheduleItem(index, 'icon', emoji)}
                          className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center hover:border-pink-300 transition-colors ${
                            item.icon === emoji ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => removeScheduleItem(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              Zatím nemáte žádné položky v programu
            </p>
            <button
              onClick={addScheduleItem}
              className="inline-flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Přidat první položku
            </button>
          </div>
        )}
      </div>

      {/* Náhled */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Náhled programu</h4>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Program svatby
            </h3>
            <p className="text-gray-600">Jak bude náš velký den probíhat</p>
          </div>

          {content.items && content.items.length > 0 ? (
            <div className="space-y-6">
              {content.items.slice(0, 4).map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-sm font-medium">
                        {item.time}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
              
              {content.items.length > 4 && (
                <p className="text-center text-gray-500 text-sm">
                  ... a další {content.items.length - 4} událostí
                </p>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              Přidejte položky do programu pro zobrazení náhledu
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
