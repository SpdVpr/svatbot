'use client'

import { useState } from 'react'
import { Clock, Calendar, ArrowLeft, Plus, Trash2, X, CheckCircle, Circle, Loader2, List } from 'lucide-react'
import Link from 'next/link'
import { useWeddingDayTimeline, WeddingDayTimelineItem } from '@/hooks/useWeddingDayTimeline'
import TimelineGraphView from '@/components/timeline/TimelineGraphView'

const categoryColors = {
  preparation: 'bg-blue-100 text-blue-600 border-blue-200',
  ceremony: 'bg-pink-100 text-pink-600 border-pink-200',
  photography: 'bg-purple-100 text-purple-600 border-purple-200',
  reception: 'bg-green-100 text-green-600 border-green-200',
  party: 'bg-orange-100 text-orange-600 border-orange-200'
}

const categoryLabels = {
  preparation: 'Příprava',
  ceremony: 'Obřad',
  photography: 'Fotografie',
  reception: 'Hostina',
  party: 'Zábava'
}

export default function SvatebniDenPage() {
  const { timeline, stats, loading, createTimelineItem, updateTimelineItem, deleteTimelineItem, toggleComplete } = useWeddingDayTimeline()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    time: '',
    activity: '',
    duration: '',
    category: 'preparation' as const,
    location: '',
    participants: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTimelineItem({
        ...formData,
        participants: formData.participants.split(',').map(p => p.trim()).filter(Boolean),
        order: timeline.length,
        isCompleted: false
      })
      setShowAddForm(false)
      setFormData({
        time: '',
        activity: '',
        duration: '',
        category: 'preparation',
        location: '',
        participants: '',
        notes: ''
      })
    } catch (err) {
      console.error('Error creating timeline item:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Opravdu chcete smazat tuto položku?')) {
      try {
        await deleteTimelineItem(id)
      } catch (err) {
        console.error('Error deleting timeline item:', err)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
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
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Přidat aktivitu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Celkem aktivit</div>
          </div>
          {Object.entries(categoryLabels).map(([key, label]) => {
            const count = stats.byCategory[key] || 0
            return (
              <div key={key} className={`p-4 rounded-lg border ${categoryColors[key as keyof typeof categoryColors]}`}>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm">{label}</div>
              </div>
            )
          })}
        </div>

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Přidat aktivitu</h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Čas *
                      </label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trvání *
                      </label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="např. 30 min, 1 hod"
                        className="input-field"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aktivita *
                    </label>
                    <input
                      type="text"
                      value={formData.activity}
                      onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                      placeholder="např. Příjezd hostů"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategorie *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="input-field"
                      required
                    >
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Místo
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="např. Château Mcely - zahrada"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Účastníci (oddělené čárkou)
                    </label>
                    <input
                      type="text"
                      value={formData.participants}
                      onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                      placeholder="např. Nevěsta, Ženich, Fotograf"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Poznámky
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Další informace..."
                      className="input-field"
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button type="submit" className="btn-primary flex-1">
                      Přidat aktivitu
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="btn-outline flex-1"
                    >
                      Zrušit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Graph View - Always show at top if there are items */}
        {timeline.length > 0 && (
          <div className="mb-8">
            <TimelineGraphView timeline={timeline} />
          </div>
        )}

        {/* List View - Always show below graph if there are items */}
        {timeline.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <List className="w-5 h-5 text-purple-600" />
                <span>Seznam aktivit</span>
              </h2>
              <div className="space-y-4">
                {timeline.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleComplete(item.id)}
                      className="flex-shrink-0 mt-1"
                    >
                      {item.isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                      )}
                    </button>

                    {/* Time */}
                    <div className="flex-shrink-0 w-20">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{item.time}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{item.duration}</div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className={item.isCompleted ? 'opacity-50' : ''}>
                          <h3 className="font-semibold text-gray-900">{item.activity}</h3>
                          {item.location && (
                            <p className="text-sm text-gray-600 mt-1">📍 {item.location}</p>
                          )}
                          {item.participants && item.participants.length > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                              👥 {item.participants.join(', ')}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-sm text-gray-500 mt-2 italic">{item.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[item.category]}`}>
                            {categoryLabels[item.category]}
                          </span>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {timeline.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Zatím nemáte naplánovaný harmonogram
            </h3>
            <p className="text-gray-600 mb-6">
              Vytvořte si detailní časový plán pro váš svatební den
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Přidat první aktivitu</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
