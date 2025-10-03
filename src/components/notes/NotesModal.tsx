'use client'

import React, { useState, useEffect } from 'react'
import { X, Save, StickyNote, Palette } from 'lucide-react'
import { useNotes } from '@/hooks/useNotes'

interface NotesModalProps {
  isOpen: boolean
  onClose: () => void
}

const COLORS = [
  { name: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  { name: 'blue', bg: 'bg-blue-100', text: 'text-blue-800' },
  { name: 'green', bg: 'bg-green-100', text: 'text-green-800' },
  { name: 'pink', bg: 'bg-pink-100', text: 'text-pink-800' },
  { name: 'purple', bg: 'bg-purple-100', text: 'text-purple-800' },
  { name: 'orange', bg: 'bg-orange-100', text: 'text-orange-800' }
] as const

export default function NotesModal({ isOpen, onClose }: NotesModalProps) {
  const { notes, loading, createNote, updateNote } = useNotes()
  const [content, setContent] = useState('')
  const [selectedColor, setSelectedColor] = useState<'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange'>('yellow')
  const [isSaving, setIsSaving] = useState(false)

  // Load existing note if any
  useEffect(() => {
    if (isOpen && notes.length > 0) {
      const mainNote = notes[0]
      setContent(mainNote.content)
      setSelectedColor(mainNote.color || 'yellow')
    }
  }, [isOpen, notes])

  const handleSave = async () => {
    if (isSaving) return

    setIsSaving(true)
    try {
      if (notes.length > 0) {
        // Update existing note
        await updateNote(notes[0].id, {
          content,
          color: selectedColor,
          title: 'Poznámky'
        })
      } else {
        // Create new note
        await createNote({
          title: 'Poznámky',
          content,
          color: selectedColor
        })
      }
    } catch (error) {
      console.error('Error saving note:', error)
      alert('Chyba při ukládání poznámky')
    } finally {
      setIsSaving(false)
    }
  }

  const handleColorChange = (color: typeof selectedColor) => {
    setSelectedColor(color)
    // Auto-save color change if note exists
    if (notes.length > 0) {
      updateNote(notes[0].id, { color }).catch(console.error)
    }
  }

  if (!isOpen) return null

  const colorConfig = COLORS.find(c => c.name === selectedColor) || COLORS[0]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <StickyNote className="w-5 h-5 text-yellow-600" />
            <h2 className="text-lg font-semibold text-gray-900">Poznámkový blok</h2>
          </div>
          <div className="flex items-center space-x-2">
            {/* Color picker */}
            <div className="flex items-center space-x-1">
              <Palette className="w-4 h-4 text-gray-500" />
              {COLORS.map(color => (
                <button
                  key={color.name}
                  onClick={() => handleColorChange(color.name)}
                  className={`w-6 h-6 rounded-full border-2 ${selectedColor === color.name ? 'border-gray-400' : 'border-gray-200'} ${color.bg}`}
                  title={color.name}
                />
              ))}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 p-4 ${colorConfig.bg}`}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Načítání...</div>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Začněte psát své poznámky..."
              className={`w-full h-full resize-none border-none outline-none bg-transparent ${colorConfig.text} placeholder-gray-500 text-sm leading-relaxed`}
              style={{ fontFamily: 'inherit' }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {content.length} znaků
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Ukládání...' : 'Uložit'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
