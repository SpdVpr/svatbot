'use client'

import { useState } from 'react'
import { MessageSquare, Calendar, Users, Building2 } from 'lucide-react'
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
