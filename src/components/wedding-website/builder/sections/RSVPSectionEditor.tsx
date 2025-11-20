'use client'

import { useState } from 'react'
import { MessageSquare, Calendar, Users, Utensils, Music, Plus, X, Building2 } from 'lucide-react'
import type { RSVPContent } from '@/types/wedding-website'

interface RSVPSectionEditorProps {
  content: RSVPContent
  onChange: (content: RSVPContent) => void
}

export default function RSVPSectionEditor({ content, onChange }: RSVPSectionEditorProps) {
  const handleInputChange = (field: keyof RSVPContent, value: any) => {
    onChange({
      ...content,
      [field]: value
    })
  }

  const addMealOption = () => {
    const mealOptions = content.mealOptions || []
    const newOption = {
      id: Date.now().toString(),
      name: '',
      description: ''
    }
    
    handleInputChange('mealOptions', [...mealOptions, newOption])
  }

  const updateMealOption = (id: string, field: string, value: string) => {
    const mealOptions = content.mealOptions || []
    const updatedOptions = mealOptions.map(option => 
      option.id === id ? { ...option, [field]: value } : option
    )
    
    handleInputChange('mealOptions', updatedOptions)
  }

  const removeMealOption = (id: string) => {
    const mealOptions = content.mealOptions || []
    const filteredOptions = mealOptions.filter(option => option.id !== id)
    
    handleInputChange('mealOptions', filteredOptions)
  }

  const formatDateForInput = (date: Date | any | null) => {
    if (!date) return ''

    // Handle Firestore Timestamp
    if (date && typeof date.toDate === 'function') {
      return date.toDate().toISOString().split('T')[0]
    }

    // Handle Date object
    if (date instanceof Date) {
      return date.toISOString().split('T')[0]
    }

    // Handle string dates
    if (typeof date === 'string') {
      return new Date(date).toISOString().split('T')[0]
    }

    return ''
  }

  const parseInputDate = (dateString: string) => {
    return dateString ? new Date(dateString) : null
  }

  return (
    <div className="p-6 space-y-6">
      {/* Základní nastavení */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-pink-600" />
          <h3 className="text-lg font-semibold text-gray-900">Základní nastavení</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline pro RSVP
            </label>
            <div className="relative">
              <input
                type="date"
                value={formatDateForInput(content.deadline || null)}
                onChange={(e) => handleInputChange('deadline', parseInputDate(e.target.value))}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Do kdy mohou hosté potvrdit účast
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Úvodní text
            </label>
            <textarea
              value={content.message || ''}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Těšíme se na vás na naší svatbě! Prosíme, potvrďte svou účast do..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Možnosti RSVP */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-pink-600" />
          <h3 className="text-lg font-semibold text-gray-900">Možnosti pro hosty</h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={content.plusOneAllowed || false}
              onChange={(e) => handleInputChange('plusOneAllowed', e.target.checked)}
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <div>
              <span className="font-medium text-gray-900">Povolit doprovod (+1)</span>
              <p className="text-sm text-gray-600">Hosté mohou přidat doprovod k své účasti</p>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={content.mealSelection || false}
              onChange={(e) => handleInputChange('mealSelection', e.target.checked)}
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <div>
              <span className="font-medium text-gray-900">Výběr jídla</span>
              <p className="text-sm text-gray-600">Hosté si mohou vybrat z nabídky jídel</p>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={content.songRequests || false}
              onChange={(e) => handleInputChange('songRequests', e.target.checked)}
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <div>
              <span className="font-medium text-gray-900">Přání písniček</span>
              <p className="text-sm text-gray-600">Hosté mohou navrhnout písničky pro DJ</p>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={content.dietaryRestrictions || false}
              onChange={(e) => handleInputChange('dietaryRestrictions', e.target.checked)}
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <div>
              <span className="font-medium text-gray-900">Dietní omezení</span>
              <p className="text-sm text-gray-600">Pole pro alergie a dietní požadavky</p>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={content.accommodationSelection || false}
              onChange={(e) => handleInputChange('accommodationSelection', e.target.checked)}
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <div>
              <span className="font-medium text-gray-900">Rezervace ubytování</span>
              <p className="text-sm text-gray-600">Hosté si mohou vybrat a rezervovat pokoj z nabídky ubytování</p>
            </div>
          </label>
        </div>
      </div>

      {/* Výběr jídla */}
      {content.mealSelection && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-pink-600" />
              <h3 className="text-lg font-semibold text-gray-900">Menu</h3>
            </div>
            <button
              onClick={addMealOption}
              className="inline-flex items-center gap-2 bg-pink-500 text-white px-3 py-2 rounded-lg hover:bg-pink-600 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Přidat jídlo
            </button>
          </div>

          {content.mealOptions && content.mealOptions.length > 0 ? (
            <div className="space-y-4">
              {content.mealOptions.map((option) => (
                <div key={option.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={option.name}
                      onChange={(e) => updateMealOption(option.id, 'name', e.target.value)}
                      placeholder="Název jídla (např. Kuřecí steak)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    <textarea
                      value={option.description}
                      onChange={(e) => updateMealOption(option.id, 'description', e.target.value)}
                      placeholder="Popis jídla a příloh..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => removeMealOption(option.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                Zatím nemáte žádné možnosti jídla
              </p>
              <button
                onClick={addMealOption}
                className="inline-flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Přidat první jídlo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Kontaktní informace */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontakt pro dotazy</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jméno kontaktní osoby
            </label>
            <input
              type="text"
              value={content.contactName || ''}
              onChange={(e) => handleInputChange('contactName', e.target.value)}
              placeholder="Jana Nováková"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              value={content.contactPhone || ''}
              onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              placeholder="+420 123 456 789"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={content.contactEmail || ''}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              placeholder="jana@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>


    </div>
  )
}
