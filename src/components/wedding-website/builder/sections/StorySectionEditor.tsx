'use client'

import { useState } from 'react'
import { Heart, Plus, X, Calendar, MapPin } from 'lucide-react'
import { useWeddingStore } from '@/stores/weddingStore'
import type { StoryContent } from '@/types/wedding-website'

interface StorySectionEditorProps {
  content: StoryContent
  onChange: (content: StoryContent) => void
}

export default function StorySectionEditor({ content, onChange }: StorySectionEditorProps) {
  const { currentWedding: wedding } = useWeddingStore()

  const handleInputChange = (field: keyof StoryContent, value: any) => {
    onChange({
      ...content,
      [field]: value
    })
  }

  const addTimelineItem = () => {
    const timeline = content.timeline || []
    const newItem = {
      id: Date.now().toString(),
      date: '',
      title: '',
      description: '',
      icon: '💕'
    }
    
    handleInputChange('timeline', [...timeline, newItem])
  }

  const updateTimelineItem = (id: string, field: string, value: string) => {
    const timeline = content.timeline || []
    const updatedTimeline = timeline.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    )
    
    handleInputChange('timeline', updatedTimeline)
  }

  const removeTimelineItem = (id: string) => {
    const timeline = content.timeline || []
    const filteredTimeline = timeline.filter(item => item.id !== id)
    
    handleInputChange('timeline', filteredTimeline)
  }

  // Auto-import dat ze svatby
  const importFromWedding = () => {
    if (!wedding) return

    const updatedContent: StoryContent = {
      ...content,
      enabled: true,
      title: 'Náš příběh',
      subtitle: 'Jak to všechno začalo...',
      // Můžeme přidat základní timeline pokud neexistuje
      timeline: content.timeline && content.timeline.length > 0 ? content.timeline : [
        {
          id: '1',
          date: '',
          title: 'První setkání',
          description: 'Kdy a kde jsme se poznali',
          icon: '👫'
        },
        {
          id: '2',
          date: '',
          title: 'První rande',
          description: 'Naše první společné chvíle',
          icon: '💕'
        },
        {
          id: '3',
          date: '',
          title: 'Zásnuby',
          description: 'Nezapomenutelný moment',
          icon: '💍'
        }
      ]
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
                Vytvořit základní příběh
              </h4>
              <p className="text-sm text-blue-700">
                Vytvoří základní strukturu vašeho příběhu lásky
              </p>
            </div>
            <button
              onClick={importFromWedding}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Vytvořit
            </button>
          </div>
        </div>
      )}

      {/* Základní nastavení */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-pink-600" />
          <h3 className="text-lg font-semibold text-gray-900">Základní informace</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nadpis sekce
            </label>
            <input
              type="text"
              value={content.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Náš příběh"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Podnadpis
            </label>
            <input
              type="text"
              value={content.subtitle || ''}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              placeholder="Jak to všechno začalo..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Úvodní text
            </label>
            <textarea
              value={content.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Napište krátký úvod k vašemu příběhu..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-600" />
            <h3 className="text-lg font-semibold text-gray-900">Timeline příběhu</h3>
          </div>
          <button
            onClick={addTimelineItem}
            className="inline-flex items-center gap-2 bg-pink-500 text-white px-3 py-2 rounded-lg hover:bg-pink-600 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Přidat moment
          </button>
        </div>

        {content.timeline && content.timeline.length > 0 ? (
          <div className="space-y-4">
            {content.timeline.map((item, index) => (
              <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">{item.icon}</span>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateTimelineItem(item.id, 'title', e.target.value)}
                      placeholder="Název momentu (např. První setkání)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={item.date}
                      onChange={(e) => updateTimelineItem(item.id, 'date', e.target.value)}
                      placeholder="Datum (např. Léto 2020)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  
                  <textarea
                    value={item.description}
                    onChange={(e) => updateTimelineItem(item.id, 'description', e.target.value)}
                    placeholder="Popis tohoto momentu..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Ikona:</label>
                    <div className="flex gap-2">
                      {['👫', '💕', '💍', '🌹', '❤️', '💒', '🥂', '✨'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => updateTimelineItem(item.id, 'icon', emoji)}
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
                  onClick={() => removeTimelineItem(item.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              Zatím nemáte žádné momenty v timeline
            </p>
            <button
              onClick={addTimelineItem}
              className="inline-flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Přidat první moment
            </button>
          </div>
        )}
      </div>

      {/* Náhled */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Náhled sekce</h4>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {content.title || 'Náš příběh'}
            </h3>
            {content.subtitle && (
              <p className="text-gray-600">{content.subtitle}</p>
            )}
          </div>
          
          {content.description && (
            <p className="text-gray-700 mb-8 text-center max-w-2xl mx-auto">
              {content.description}
            </p>
          )}

          {content.timeline && content.timeline.length > 0 && (
            <div className="space-y-6">
              {content.timeline.slice(0, 3).map((item, index) => (
                <div key={item.id} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">{item.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    {item.date && (
                      <p className="text-sm text-pink-600 mb-1">{item.date}</p>
                    )}
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
              
              {content.timeline.length > 3 && (
                <p className="text-center text-gray-500 text-sm">
                  ... a další {content.timeline.length - 3} momentů
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
