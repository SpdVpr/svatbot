'use client'

import { useState, useEffect } from 'react'
import { Clock, Plus, X, Calendar, MapPin, Sparkles, User } from 'lucide-react'
import { useWeddingStore } from '@/stores/weddingStore'
import { useWeddingDayTimeline } from '@/hooks/useWeddingDayTimeline'
import type { ScheduleContent, ScheduleItem } from '@/types/wedding-website'

interface ScheduleSectionEditorProps {
  content: ScheduleContent
  onChange: (content: ScheduleContent) => void
}

export default function ScheduleSectionEditor({ content, onChange }: ScheduleSectionEditorProps) {
  const { currentWedding: wedding } = useWeddingStore()
  const { manualTimeline, aiTimeline, loading: timelineLoading } = useWeddingDayTimeline()
  const [importing, setImporting] = useState(false)

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

  // Map category to icon
  const getCategoryIcon = (category: string): string => {
    const iconMap: Record<string, string> = {
      'preparation': '💄',
      'ceremony': '⛪',
      'photography': '📸',
      'reception': '🍽️',
      'party': '🎵'
    }
    return iconMap[category] || '⛪'
  }

  // Import from manual timeline
  const importManualTimeline = () => {
    if (!manualTimeline || manualTimeline.length === 0) {
      alert('Nemáte žádný ručně vytvořený harmonogram')
      return
    }

    setImporting(true)

    const importedItems: ScheduleItem[] = manualTimeline.map(item => ({
      time: item.time,
      title: item.activity,
      description: item.notes || item.location || '',
      icon: getCategoryIcon(item.category)
    }))

    const updatedContent: ScheduleContent = {
      ...content,
      enabled: true,
      items: importedItems
    }

    onChange(updatedContent)
    setImporting(false)
    alert(`✅ Naimportováno ${importedItems.length} položek z ručního harmonogramu`)
  }

  // Import from AI timeline
  const importAITimeline = () => {
    if (!aiTimeline || aiTimeline.length === 0) {
      alert('Nemáte žádný AI vygenerovaný harmonogram')
      return
    }

    setImporting(true)

    const importedItems: ScheduleItem[] = aiTimeline.map(item => ({
      time: item.time,
      title: item.activity,
      description: item.notes || item.location || '',
      icon: getCategoryIcon(item.category)
    }))

    const updatedContent: ScheduleContent = {
      ...content,
      enabled: true,
      items: importedItems
    }

    onChange(updatedContent)
    setImporting(false)
    alert(`✅ Naimportováno ${importedItems.length} položek z AI harmonogramu`)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Import Options */}
      {wedding && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 mb-3">
            Importovat harmonogram
          </h4>

          {/* Import Manual Timeline */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <h5 className="font-semibold text-blue-900 mb-1">
                    Můj harmonogram
                  </h5>
                  <p className="text-sm text-blue-700">
                    {manualTimeline.length > 0
                      ? `Naimportovat ${manualTimeline.length} položek z ručně vytvořeného harmonogramu`
                      : 'Nemáte žádný ručně vytvořený harmonogram'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={importManualTimeline}
                disabled={manualTimeline.length === 0 || importing || timelineLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? 'Importuji...' : 'Importovat'}
              </button>
            </div>
          </div>

          {/* Import AI Timeline */}
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <div>
                  <h5 className="font-semibold text-purple-900 mb-1">
                    AI harmonogram
                  </h5>
                  <p className="text-sm text-purple-700">
                    {aiTimeline.length > 0
                      ? `Naimportovat ${aiTimeline.length} položek z AI vygenerovaného harmonogramu`
                      : 'Nemáte žádný AI vygenerovaný harmonogram'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={importAITimeline}
                disabled={aiTimeline.length === 0 || importing || timelineLoading}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? 'Importuji...' : 'Importovat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Harmonogram svatby */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-pink-600" />
            <h3 className="text-lg font-semibold text-gray-900">Harmonogram svatby</h3>
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
              Harmonogram svatby
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
