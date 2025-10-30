'use client'

import React, { useState, useEffect } from 'react'
import { X, Save, StickyNote, Palette, Lock } from 'lucide-react'
import { useNotes } from '@/hooks/useNotes'
import { useDemoLock } from '@/hooks/useDemoLock'
import { getViewTransitionName } from '@/hooks/useViewTransition'

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
  const { isLocked } = useDemoLock()
  const [content, setContent] = useState('')
  const [selectedColor, setSelectedColor] = useState<'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange'>('yellow')
  const [isSaving, setIsSaving] = useState(false)

  // Load existing note if any
  useEffect(() => {
    if (isOpen && notes.length > 0) {
      const mainNote = notes[0]
      setContent(mainNote.content)
      setSelectedColor(mainNote.color || 'yellow')
    } else if (isOpen && notes.length === 0 && !loading) {
      // Clear content if no notes exist
      setContent('')
      setSelectedColor('yellow')
    }
  }, [isOpen, notes, loading])

  const handleSave = async () => {
    if (isSaving || isLocked) return

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
    if (isLocked) return

    setSelectedColor(color)
    // Auto-save color change if note exists
    if (notes.length > 0) {
      updateNote(notes[0].id, { color }).catch(console.error)
    }
  }

  // Zabránit scrollování pozadí když je modal otevřený
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const colorConfig = COLORS.find(c => c.name === selectedColor) || COLORS[0]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in">
      {/* Backdrop with View Transition - Solid to prevent content showing through */}
      <div
        className="absolute inset-0 bg-black/50"
        style={getViewTransitionName('notes-modal-backdrop')}
        onClick={onClose}
      />

      {/* Modal Content with View Transition */}
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl h-[90vh] sm:h-[80vh] flex flex-col relative"
        style={getViewTransitionName('notes-modal')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <StickyNote className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Poznámkový blok</h2>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Color picker */}
            <div className="flex items-center space-x-1">
              <Palette className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 hidden sm:block" />
              {COLORS.map(color => (
                <button
                  key={color.name}
                  onClick={() => handleColorChange(color.name)}
                  disabled={Boolean(isLocked)}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 ${selectedColor === color.name ? 'border-gray-400' : 'border-gray-200'} ${color.bg} disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isLocked ? 'Zamčeno' : color.name}
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
        <div className={`flex-1 p-3 sm:p-4 ${colorConfig.bg} relative`}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-sm sm:text-base text-gray-500">Načítání...</div>
            </div>
          ) : (
            <>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={isLocked ? "Demo účet je zamčený - poznámky nelze upravovat" : "Začněte psát své poznámky..."}
                disabled={Boolean(isLocked)}
                className={`w-full h-full resize-none border-none outline-none bg-transparent ${colorConfig.text} placeholder-gray-500 text-xs sm:text-sm leading-relaxed disabled:cursor-not-allowed disabled:opacity-60`}
                style={{ fontFamily: 'inherit' }}
              />
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-5 pointer-events-none">
                  <div className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-3 pointer-events-auto">
                    <Lock className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Demo účet je zamčený</p>
                      <p className="text-xs text-gray-600">Poznámky nelze upravovat</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {content.length} znaků
          </div>
          <button
            onClick={handleSave}
            disabled={Boolean(isSaving || isLocked)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-xs sm:text-sm"
          >
            {isLocked ? (
              <>
                <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Zamčeno</span>
              </>
            ) : (
              <>
                <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{isSaving ? 'Ukládání...' : 'Uložit'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
