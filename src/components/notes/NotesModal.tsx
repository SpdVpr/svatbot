'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, Save, StickyNote, Palette, Lock, Check } from 'lucide-react'
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
  const [isInitialized, setIsInitialized] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastLoadedNoteIdRef = useRef<string | null>(null)

  // Stable save function
  const performSave = useCallback(async (contentToSave: string, colorToSave: typeof selectedColor) => {
    try {
      if (notes.length > 0) {
        // Update existing note
        await updateNote(notes[0].id, {
          content: contentToSave,
          color: colorToSave,
          title: 'Poznámky'
        })
      } else {
        // Create new note
        await createNote({
          title: 'Poznámky',
          content: contentToSave,
          color: colorToSave
        })
      }
      return true
    } catch (error) {
      console.error('Error saving note:', error)
      return false
    }
  }, [notes, createNote, updateNote])

  // Handle modal close with save
  const handleClose = useCallback(async () => {
    // If there's a pending save, execute it immediately
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      await performSave(content, selectedColor)
    }
    onClose()
  }, [content, selectedColor, performSave, onClose])

  // Load existing note when modal opens or when notes update
  useEffect(() => {
    if (!isOpen) {
      // Reset initialization flag when modal closes
      setIsInitialized(false)
      lastLoadedNoteIdRef.current = null
      // Clear any pending save timeouts
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      return
    }

    // Modal is open
    if (loading) {
      return
    }

    if (notes.length > 0) {
      const mainNote = notes[0]

      // Only update content if:
      // 1. Not initialized yet, OR
      // 2. The note ID changed (different note loaded)
      if (!isInitialized || lastLoadedNoteIdRef.current !== mainNote.id) {
        setContent(mainNote.content)
        setSelectedColor(mainNote.color || 'yellow')
        lastLoadedNoteIdRef.current = mainNote.id
        setIsInitialized(true)
      }
    } else if (!isInitialized) {
      setContent('')
      setSelectedColor('yellow')
      setIsInitialized(true)
    }
  }, [isOpen, notes, loading, isInitialized])

  // Update only color when it changes in the database (but keep content unchanged)
  useEffect(() => {
    if (isOpen && isInitialized && notes.length > 0) {
      const mainNote = notes[0]
      // Only update color if it's different, don't touch content
      if (mainNote.color && mainNote.color !== selectedColor) {
        setSelectedColor(mainNote.color)
      }
    }
  }, [notes, isOpen, isInitialized, selectedColor])

  // Auto-save content with debounce
  useEffect(() => {
    if (!isInitialized || isLocked || !isOpen) {
      return
    }

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Save after 500ms of inactivity (fast auto-save)
    saveTimeoutRef.current = setTimeout(async () => {
      await performSave(content, selectedColor)
    }, 500)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [content, selectedColor, isInitialized, isLocked, isOpen, performSave])

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[150] p-2 sm:p-4 animate-fade-in">
      {/* Backdrop with View Transition - Solid to prevent content showing through */}
      <div
        className="absolute inset-0 bg-black/50"
        style={getViewTransitionName('notes-modal-backdrop')}
        onClick={handleClose}
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
              onClick={handleClose}
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

          {/* Auto-save status indicator */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            {isLocked ? (
              <>
                <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Zamčeno</span>
              </>
            ) : (
              <>
                <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Uloženo</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
