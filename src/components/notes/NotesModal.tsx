'use client'

import { useState, useEffect } from 'react'
import { useNotes } from '@/hooks/useNotes'
import { Note, NoteFormData } from '@/types/notes'
import {
  X,
  Plus,
  Search,
  Pin,
  PinOff,
  Edit3,
  Trash2,
  Tag,
  Palette,
  StickyNote,
  Filter
} from 'lucide-react'

interface NotesModalProps {
  isOpen: boolean
  onClose: () => void
}

const NOTE_COLORS = [
  { value: 'yellow', label: 'Žlutá', bg: 'bg-yellow-100', border: 'border-yellow-200', text: 'text-yellow-800' },
  { value: 'blue', label: 'Modrá', bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-800' },
  { value: 'green', label: 'Zelená', bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-800' },
  { value: 'pink', label: 'Růžová', bg: 'bg-pink-100', border: 'border-pink-200', text: 'text-pink-800' },
  { value: 'purple', label: 'Fialová', bg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-800' },
  { value: 'orange', label: 'Oranžová', bg: 'bg-orange-100', border: 'border-orange-200', text: 'text-orange-800' }
] as const

export default function NotesModal({ isOpen, onClose }: NotesModalProps) {
  const { notes, loading, createNote, updateNote, deleteNote, togglePin, getAllTags, stats } = useNotes()
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)
  const [formData, setFormData] = useState<NoteFormData>({
    title: '',
    content: '',
    tags: [],
    color: 'yellow',
    isPinned: false
  })

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowForm(false)
      setEditingNote(null)
      setFormData({
        title: '',
        content: '',
        tags: [],
        color: 'yellow',
        isPinned: false
      })
    }
  }, [isOpen])

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchTerm || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesColor = !selectedColor || note.color === selectedColor
    const matchesPinned = !showPinnedOnly || note.isPinned
    
    return matchesSearch && matchesColor && matchesPinned
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) return

    try {
      if (editingNote) {
        await updateNote(editingNote.id, formData)
      } else {
        await createNote(formData)
      }
      
      setShowForm(false)
      setEditingNote(null)
      setFormData({
        title: '',
        content: '',
        tags: [],
        color: 'yellow',
        isPinned: false
      })
    } catch (error) {
      console.error('Error saving note:', error)
    }
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      color: note.color || 'yellow',
      isPinned: note.isPinned || false
    })
    setShowForm(true)
  }

  const handleDelete = async (noteId: string) => {
    if (confirm('Opravdu chcete smazat tuto poznámku?')) {
      try {
        await deleteNote(noteId)
      } catch (error) {
        console.error('Error deleting note:', error)
      }
    }
  }

  const getColorClasses = (color: string) => {
    const colorConfig = NOTE_COLORS.find(c => c.value === color) || NOTE_COLORS[0]
    return colorConfig
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <StickyNote className="w-6 h-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Poznámky</h2>
              <p className="text-sm text-gray-500">
                {stats.total} poznámek • {stats.pinned} připnutých
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-80 border-r border-gray-200 p-4 overflow-y-auto">
            {/* Search and filters */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Hledat poznámky..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Všechny barvy</option>
                  {NOTE_COLORS.map(color => (
                    <option key={color.value} value={color.value}>{color.label}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showPinnedOnly}
                  onChange={(e) => setShowPinnedOnly(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Pouze připnuté</span>
              </label>
            </div>

            {/* Add note button */}
            <button
              onClick={() => setShowForm(true)}
              className="w-full mb-4 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nová poznámka</span>
            </button>

            {/* Notes list */}
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Načítání...</p>
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="text-center py-8">
                  <StickyNote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    {searchTerm || selectedColor || showPinnedOnly ? 'Žádné poznámky nevyhovují filtrům' : 'Zatím žádné poznámky'}
                  </p>
                </div>
              ) : (
                filteredNotes.map(note => {
                  const colorConfig = getColorClasses(note.color || 'yellow')
                  return (
                    <div
                      key={note.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer hover:shadow-sm transition-all ${colorConfig.bg} ${colorConfig.border}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-medium text-sm ${colorConfig.text} line-clamp-1`}>
                          {note.title}
                        </h4>
                        <div className="flex items-center space-x-1 ml-2">
                          {note.isPinned && (
                            <Pin className="w-3 h-3 text-gray-500" />
                          )}
                          <button
                            onClick={() => togglePin(note.id)}
                            className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                          >
                            {note.isPinned ? (
                              <PinOff className="w-3 h-3 text-gray-500" />
                            ) : (
                              <Pin className="w-3 h-3 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(note)}
                            className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                          >
                            <Edit3 className="w-3 h-3 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDelete(note.id)}
                            className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      </div>
                      
                      {note.content && (
                        <p className={`text-xs ${colorConfig.text} opacity-80 line-clamp-2 mb-2`}>
                          {note.content}
                        </p>
                      )}
                      
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {note.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-white bg-opacity-50"
                            >
                              <Tag className="w-2 h-2 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 3 && (
                            <span className="text-xs opacity-60">+{note.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                      
                      <div className="text-xs opacity-60 mt-2">
                        {note.updatedAt.toLocaleDateString('cs-CZ')}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Main content - Form */}
          {showForm && (
            <div className="flex-1 p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">
                    {editingNote ? 'Upravit poznámku' : 'Nová poznámka'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingNote(null)
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Název
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Název poznámky..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Obsah
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Obsah poznámky..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barva
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {NOTE_COLORS.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                          className={`w-8 h-8 rounded-full border-2 ${color.bg} ${
                            formData.color === color.value ? 'border-gray-800' : 'border-gray-300'
                          } hover:scale-110 transition-transform`}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 mt-6">
                      <input
                        type="checkbox"
                        checked={formData.isPinned}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Připnout poznámku</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingNote(null)
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Zrušit
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {editingNote ? 'Uložit změny' : 'Vytvořit poznámku'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Empty state when no form is shown */}
          {!showForm && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <StickyNote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Vyberte poznámku</h3>
                <p className="text-gray-500 mb-4">
                  Klikněte na poznámku pro úpravu nebo vytvořte novou
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Nová poznámka
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
