'use client'

import { useState } from 'react'
import { Clock, Calendar, ArrowLeft, Plus, Trash2, X, Heart, Edit2 } from 'lucide-react'
import Link from 'next/link'
import { useWeddingDayTimeline } from '@/hooks/useWeddingDayTimeline'

const PREDEFINED_ACTIVITIES = [
  { name: 'Příjezd hostů', category: 'ceremony', duration: '30 min', icon: '🚗' },
  { name: 'Welcome drink', category: 'reception', duration: '30 min', icon: '🥂' },
  { name: 'Svatební obřad', category: 'ceremony', duration: '45 min', icon: '💒' },
  { name: 'Gratulace', category: 'ceremony', duration: '30 min', icon: '🎉' },
  { name: 'Špalír', category: 'ceremony', duration: '15 min', icon: '✨' },
  { name: 'Skupinové focení', category: 'photography', duration: '45 min', icon: '📸' },
  { name: 'Přípitek', category: 'reception', duration: '15 min', icon: '🍾' },
  { name: 'Proslovy', category: 'reception', duration: '30 min', icon: '🎤' },
  { name: 'Oběd', category: 'reception', duration: '2 hod', icon: '🍽️' },
  { name: 'Krájení dortu', category: 'reception', duration: '15 min', icon: '🎂' },
  { name: 'Focení novomanželů', category: 'photography', duration: '1 hod', icon: '💑' },
  { name: 'Ubytování hostů', category: 'preparation', duration: '30 min', icon: '🏨' },
  { name: 'Házení kyticí', category: 'party', duration: '15 min', icon: '💐' },
  { name: 'První tanec', category: 'party', duration: '15 min', icon: '💃' },
  { name: 'Tanec s rodiči', category: 'party', duration: '15 min', icon: '👨‍👩‍👧' },
  { name: 'Večeře', category: 'reception', duration: '1 hod', icon: '🍴' },
  { name: 'Volná zábava', category: 'party', duration: '3 hod', icon: '🎊' },
  { name: 'Hry', category: 'party', duration: '1 hod', icon: '🎮' },
  { name: 'Kvízy', category: 'party', duration: '30 min', icon: '❓' },
  { name: 'Tradice', category: 'party', duration: '30 min', icon: '🎭' }
]

export default function SvatebniDenPage() {
  const { timeline, loading, createTimelineItem, updateTimelineItem, deleteTimelineItem } = useWeddingDayTimeline()
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<typeof PREDEFINED_ACTIVITIES[0] | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    time: '',
    activity: '',
    duration: '',
    category: 'preparation' as const,
    location: '',
    notes: ''
  })

  const handleSelectPredefined = (activity: typeof PREDEFINED_ACTIVITIES[0]) => {
    setSelectedActivity(activity)
    setFormData({
      time: '',
      activity: activity.name,
      duration: activity.duration,
      category: activity.category as any,
      location: '',
      notes: ''
    })
  }

  const handleAddPredefined = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedActivity) return

    try {
      await createTimelineItem({
        time: formData.time,
        activity: formData.activity,
        duration: formData.duration,
        category: selectedActivity.category as any,
        location: formData.location,
        participants: [],
        notes: formData.notes,
        order: timeline.length,
        isCompleted: false
      })
      setSelectedActivity(null)
      setFormData({
        time: '',
        activity: '',
        duration: '',
        category: 'preparation',
        location: '',
        notes: ''
      })
    } catch (err) {
      console.error('Error adding activity:', err)
      alert('Chyba při přidávání aktivity')
    }
  }

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTimelineItem({
        time: formData.time,
        activity: formData.activity,
        duration: formData.duration,
        category: 'preparation' as any,
        location: formData.location,
        participants: [],
        notes: formData.notes,
        order: timeline.length,
        isCompleted: false
      })
      setShowCustomForm(false)
      setFormData({
        time: '',
        activity: '',
        duration: '',
        category: 'preparation',
        location: '',
        notes: ''
      })
    } catch (err) {
      console.error('Error adding custom activity:', err)
      alert('Chyba při přidávání vlastní aktivity')
    }
  }

  const handleEdit = (item: any) => {
    setEditingId(item.id)
    setFormData({
      time: item.time,
      activity: item.activity,
      duration: item.duration,
      category: item.category,
      location: item.location,
      notes: item.notes
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return

    try {
      await updateTimelineItem(editingId, {
        time: formData.time,
        activity: formData.activity,
        duration: formData.duration,
        location: formData.location,
        notes: formData.notes
      })
      setEditingId(null)
      setFormData({
        time: '',
        activity: '',
        duration: '',
        category: 'preparation',
        location: '',
        notes: ''
      })
    } catch (err) {
      console.error('Error updating activity:', err)
      alert('Chyba při aktualizaci aktivity')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Opravdu chcete smazat tuto aktivitu?')) {
      try {
        await deleteTimelineItem(id)
      } catch (err) {
        console.error('Error deleting activity:', err)
        alert('Chyba při mazání aktivity')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
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
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h1 className="text-xl font-bold text-gray-900">Harmonogram svatebního dne</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Elegant Header with decorative elements */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center space-x-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary-300"></div>
            <Heart className="w-6 h-6 text-primary-500" fill="currentColor" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary-300"></div>
          </div>
          <h1 className="font-display text-4xl font-bold text-text-primary mb-3">Harmonogram svatebního dne</h1>
          <p className="text-text-secondary text-lg">Naplánujte si každý okamžik vašeho velkého dne</p>
        </div>

        {/* Predefined Activities - Elegant Grid */}
        <div className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-text-primary mb-6 text-center">
            Vyberte si z připravených aktivit
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {PREDEFINED_ACTIVITIES.map((activity, index) => (
              <button
                key={index}
                onClick={() => handleSelectPredefined(activity)}
                className="group relative bg-white border-2 border-primary-100 rounded-xl p-3 hover:border-primary-400 hover:shadow-wedding transition-all duration-300 text-left"
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{activity.icon}</span>
                  <div className="w-full">
                    <div className="font-display text-xs font-semibold text-text-primary group-hover:text-primary-600 transition-colors leading-tight">
                      {activity.name}
                    </div>
                    <div className="text-[10px] text-text-muted mt-1">{activity.duration}</div>
                  </div>
                </div>
                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-4 h-4 text-primary-500" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Predefined Activity Form */}
        {selectedActivity && (
          <div className="wedding-card mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl">{selectedActivity.icon}</span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-semibold text-text-primary">{selectedActivity.name}</h3>
                  <p className="text-sm text-text-muted">Doplňte detaily aktivity</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="p-2 text-text-muted hover:text-text-primary hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddPredefined} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Čas začátku *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="input-field text-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Délka trvání
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input-field"
                    placeholder="např. 1 hod"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Místo
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field"
                    placeholder="např. Zahrada"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Poznámky
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-field"
                    placeholder="Volitelné poznámky"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Přidat do harmonogramu
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedActivity(null)}
                  className="btn-outline flex-1"
                >
                  Zrušit
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Activity Form */}
        {editingId && (
          <div className="wedding-card mb-8 animate-fade-in">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-semibold text-text-primary">Upravit aktivitu</h3>
                <p className="text-sm text-text-muted">Změňte detaily aktivity</p>
              </div>
            </div>
            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Název aktivity *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.activity}
                    onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                    className="input-field"
                    placeholder="např. Příjezd fotografa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Čas začátku *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="input-field text-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Délka trvání
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input-field"
                    placeholder="např. 1 hod"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Místo
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field"
                    placeholder="např. Zahrada"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Poznámky
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-field"
                    placeholder="Volitelné poznámky"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Uložit změny
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setFormData({
                      time: '',
                      activity: '',
                      duration: '',
                      category: 'preparation',
                      location: '',
                      notes: ''
                    })
                  }}
                  className="btn-outline flex-1"
                >
                  Zrušit
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Custom Activity Button */}
        {!editingId && (
          <div className="text-center mb-8">
            <button
              onClick={() => setShowCustomForm(!showCustomForm)}
              className="inline-flex items-center space-x-2 px-8 py-3 border-2 border-primary-300 text-primary-600 hover:bg-primary-50 font-button font-medium rounded-xl transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Přidat vlastní aktivitu</span>
            </button>
          </div>
        )}

        {showCustomForm && (
          <div className="wedding-card mb-8 animate-fade-in">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-semibold text-text-primary">Vlastní aktivita</h3>
                <p className="text-sm text-text-muted">Vytvořte si aktivitu na míru</p>
              </div>
            </div>
            <form onSubmit={handleAddCustom} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Název aktivity *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.activity}
                    onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                    className="input-field"
                    placeholder="např. Příjezd fotografa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Čas začátku *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="input-field text-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Délka trvání
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input-field"
                    placeholder="např. 1 hod"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Místo
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field"
                    placeholder="např. Zahrada"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Poznámky
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-field"
                    placeholder="Volitelné poznámky"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Přidat aktivitu
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomForm(false)}
                  className="btn-outline flex-1"
                >
                  Zrušit
                </button>
              </div>
            </form>
          </div>
        )}

        {timeline.length > 0 && (
          <div className="wedding-card">
            {/* Header with decorative line */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center space-x-3 mb-4">
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-primary-300 to-primary-300"></div>
                <Calendar className="w-6 h-6 text-primary-500" />
                <div className="h-px w-16 bg-gradient-to-l from-primary-300 via-primary-300 to-transparent"></div>
              </div>
              <h2 className="font-display text-3xl font-bold text-text-primary mb-2">Váš harmonogram</h2>
              <p className="text-text-muted">{timeline.length} {timeline.length === 1 ? 'aktivita' : timeline.length < 5 ? 'aktivity' : 'aktivit'}</p>
            </div>

            {/* Timeline */}
            <div className="space-y-0">
              {[...timeline].sort((a, b) => {
                if (!a.time) return 1
                if (!b.time) return -1
                return a.time.localeCompare(b.time)
              }).map((item, index, sortedArray) => {
                const isLast = index === sortedArray.length - 1

                return (
                  <div key={item.id} className="group relative">
                    {/* Timeline row */}
                    <div className="flex items-start">
                      {/* Time column */}
                      <div className="w-32 flex-shrink-0 pt-6">
                        <div className="text-right pr-8">
                          <div className="font-display text-2xl font-bold text-primary-600">{item.time}</div>
                          {item.duration && (
                            <div className="text-xs text-text-muted mt-1">{item.duration}</div>
                          )}
                        </div>
                      </div>

                      {/* Timeline dot and line */}
                      <div className="relative flex flex-col items-center flex-shrink-0">
                        <div className="w-4 h-4 rounded-full bg-primary-500 ring-4 ring-primary-100 z-10 mt-7"></div>
                        {!isLast && (
                          <div className="w-0.5 h-full bg-gradient-to-b from-primary-200 to-primary-100 absolute top-11"></div>
                        )}
                      </div>

                      {/* Content column */}
                      <div className="flex-1 pl-8 pb-12">
                        <div className="bg-neutral-50 border border-primary-100 rounded-xl p-6 hover:shadow-soft hover:border-primary-300 transition-all duration-300 group-hover:bg-white">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-display text-xl font-semibold text-text-primary mb-3 capitalize">
                                {item.activity.toLowerCase()}
                              </h3>

                              {(item.location || item.notes) && (
                                <div className="space-y-2">
                                  {item.location && (
                                    <div className="flex items-center space-x-2 text-sm text-text-secondary">
                                      <span className="text-primary-500">📍</span>
                                      <span>{item.location}</span>
                                    </div>
                                  )}
                                  {item.notes && (
                                    <div className="flex items-start space-x-2 text-sm text-text-muted">
                                      <span className="text-accent-500 mt-0.5">💭</span>
                                      <span className="flex-1 italic">{item.notes}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Edit and Delete buttons */}
                            <div className="ml-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-2 text-text-muted hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                                title="Upravit"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                title="Smazat"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {timeline.length === 0 && (
          <div className="wedding-card text-center py-16">
            <div className="w-32 h-32 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-16 h-16 text-primary-400" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-text-primary mb-3">
              Začněte plánovat váš velký den
            </h3>
            <p className="text-text-secondary text-lg mb-8 max-w-md mx-auto">
              Vyberte si z připravených aktivit výše nebo vytvořte vlastní harmonogram na míru
            </p>
            <div className="inline-flex items-center space-x-3">
              <div className="h-px w-8 bg-primary-200"></div>
              <Heart className="w-5 h-5 text-primary-500" fill="currentColor" />
              <div className="h-px w-8 bg-primary-200"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

