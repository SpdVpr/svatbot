'use client'

import { useState } from 'react'
import { Clock, Calendar, Settings, Download, Plus, Edit3, Trash2, ArrowLeft, Loader2, AlertCircle, Save, X } from 'lucide-react'
import Link from 'next/link'
import { useAITimeline, AITimelineItem } from '@/hooks/useAITimeline'
import AddTimelineItemForm from '@/components/timeline/AddTimelineItemForm'
import TimelineGraphView from '@/components/timeline/TimelineGraphView'

const categoryColors = {
  preparation: 'bg-blue-100 text-blue-600 border-blue-200',
  ceremony: 'bg-pink-100 text-pink-600 border-pink-200',
  reception: 'bg-green-100 text-green-600 border-green-200',
  party: 'bg-purple-100 text-purple-600 border-purple-200',
  other: 'bg-gray-100 text-gray-600 border-gray-200'
}

const categoryIcons = {
  preparation: '💄',
  ceremony: '💒',
  reception: '🍽️',
  party: '🎉',
  other: '📋'
}

export default function SvatebniDenPage() {
  const {
    timeline,
    settings,
    loading,
    error,
    createTimelineItem,
    updateTimelineItem,
    deleteTimelineItem,
    reorderTimeline,
    updateSettings,
    exportTimeline,
    clearError
  } = useAITimeline()

  const [showSettings, setShowSettings] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverItem, setDragOverItem] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)



  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', itemId)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const handleDragOver = (e: React.DragEvent, itemId?: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (itemId && itemId !== draggedItem) {
      setDragOverItem(itemId)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverItem(null)
    }
  }

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    setDragOverItem(null)

    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null)
      return
    }

    const draggedIndex = timeline.findIndex(item => item.id === draggedItem)
    const targetIndex = timeline.findIndex(item => item.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null)
      return
    }

    const newTimeline = [...timeline]
    const [draggedItemData] = newTimeline.splice(draggedIndex, 1)
    newTimeline.splice(targetIndex, 0, draggedItemData)

    await reorderTimeline(newTimeline)
    setDraggedItem(null)
  }

  // Add new timeline item manually
  const handleAddTimelineItem = async (itemData: {
    time: string
    activity: string
    duration: string
    category: AITimelineItem['category']
    location?: string
    notes?: string
  }) => {
    try {
      await createTimelineItem({
        ...itemData,
        order: timeline.length,
        isCompleted: false
      })
      setShowAddForm(false)
    } catch (err) {
      console.error('Failed to add timeline item:', err)
    }
  }

  // Export timeline
  const handleExportTimeline = () => {
    const timelineText = exportTimeline()

    const blob = new Blob([timelineText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `svatebni-timeline-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Zpět na dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                <span>Harmonogram svatebního dne</span>
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${
                  showSettings ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Nastavení"
              >
                <Settings className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowAddForm(true)}
                className="btn-outline flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Přidat aktivitu</span>
              </button>

              <button
                onClick={handleExportTimeline}
                className="btn-outline flex items-center space-x-2"
                disabled={timeline.length === 0}
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Panel */}
          {showSettings && (
            <div className="lg:col-span-1">
              <div className="wedding-card sticky top-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  <span>Nastavení Timeline</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Začátek dne
                      </label>
                      <input
                        type="time"
                        value={settings.startTime}
                        onChange={(e) => updateSettings({startTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Obřad
                      </label>
                      <input
                        type="time"
                        value={settings.ceremonyTime}
                        onChange={(e) => updateSettings({ceremonyTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hostina
                      </label>
                      <input
                        type="time"
                        value={settings.receptionTime}
                        onChange={(e) => updateSettings({receptionTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Konec
                      </label>
                      <input
                        type="time"
                        value={settings.endTime}
                        onChange={(e) => updateSettings({endTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.includePreparation}
                        onChange={(e) => updateSettings({includePreparation: e.target.checked})}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Zahrnout přípravu</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.includeAfterParty}
                        onChange={(e) => updateSettings({includeAfterParty: e.target.checked})}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Zahrnout after party</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.autoAdjust}
                        onChange={(e) => updateSettings({autoAdjust: e.target.checked})}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Automaticky upravit časy</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline Content */}
          <div className={showSettings ? 'lg:col-span-3' : 'lg:col-span-4'}>

            {/* Error State */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-600">{error}</p>
                    <button
                      onClick={clearError}
                      className="text-xs text-red-500 hover:text-red-700 mt-1"
                    >
                      Zavřít
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {timeline.length === 0 && !loading && (
              <div className="wedding-card text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Žádný plán</h3>
                <p className="text-gray-600 mb-6">
                  Začněte plánováním průběhu svatebního dne přidáním aktivit
                </p>
              </div>
            )}

            {/* Timeline Content */}
            {timeline.length > 0 && (
              <div className="space-y-8">
                {/* Grafická Timeline */}
                <TimelineGraphView
                  timeline={timeline}
                  onEdit={(itemId) => setEditingItem(itemId)}
                  onDelete={deleteTimelineItem}
                  onReorder={reorderTimeline}
                />

                {/* Seznam aktivit */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Seznam aktivit</h3>
                  <div className="space-y-4">
                    {timeline.map((item, index) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, item.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, item.id)}
                        className={`wedding-card group cursor-move transition-all duration-200 ${
                          draggedItem === item.id ? 'opacity-30 scale-95 shadow-2xl z-10' : ''
                        } ${
                          dragOverItem === item.id ? 'transform scale-102 shadow-lg border-purple-300' : ''
                        } ${
                          draggedItem && draggedItem !== item.id ? 'opacity-70' : 'hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          {/* Time */}
                          <div className="flex-shrink-0 text-center">
                            <div className="text-lg font-bold text-gray-900">{item.time}</div>
                            <div className="text-xs text-gray-500">{item.duration}</div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">{item.activity}</h4>
                                {item.location && (
                                  <p className="text-sm text-gray-600 mb-1">📍 {item.location}</p>
                                )}
                                {item.participants && item.participants.length > 0 && (
                                  <p className="text-sm text-gray-600 mb-1">
                                    👥 {item.participants.join(', ')}
                                  </p>
                                )}
                                {item.notes && (
                                  <p className="text-sm text-gray-500 italic">{item.notes}</p>
                                )}
                              </div>

                              {/* Category & Actions */}
                              <div className="flex items-center space-x-2 ml-4">
                                <span className={`px-2 py-1 text-xs rounded-full border ${categoryColors[item.category]}`}>
                                  {categoryIcons[item.category]} {item.category}
                                </span>
                                <button
                                  onClick={() => setEditingItem(item.id)}
                                  className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteTimelineItem(item.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Timeline Item Form */}
      {showAddForm && (
        <AddTimelineItemForm
          onAdd={handleAddTimelineItem}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Edit Timeline Item Form */}
      {editingItem && (
        <AddTimelineItemForm
          item={timeline.find(item => item.id === editingItem)}
          onAdd={(updatedItem) => {
            updateTimelineItem(editingItem, updatedItem)
            setEditingItem(null)
          }}
          onCancel={() => setEditingItem(null)}
          isEditing={true}
        />
      )}
    </div>
  )
}
