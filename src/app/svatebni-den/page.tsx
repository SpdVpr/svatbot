'use client'

import { useState } from 'react'
import { Clock, Calendar, ArrowLeft, Plus, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { useWeddingDayTimeline } from '@/hooks/useWeddingDayTimeline'

const PREDEFINED_ACTIVITIES = [
  { name: 'PŘÍJEZD HOSTŮ', category: 'ceremony', duration: '30 min', icon: '🚗' },
  { name: 'WELCOME DRINK', category: 'reception', duration: '30 min', icon: '🥂' },
  { name: 'SVATEBNÍ OBŘAD', category: 'ceremony', duration: '45 min', icon: '💒' },
  { name: 'GRATULACE', category: 'ceremony', duration: '30 min', icon: '🎉' },
  { name: 'ŠPALÍR', category: 'ceremony', duration: '15 min', icon: '✨' },
  { name: 'SKUPINOVÉ FOCENÍ', category: 'photography', duration: '45 min', icon: '📸' },
  { name: 'PŘÍPITEK', category: 'reception', duration: '15 min', icon: '🍾' },
  { name: 'PROSLOVY', category: 'reception', duration: '30 min', icon: '🎤' },
  { name: 'OBĚD', category: 'reception', duration: '2 hod', icon: '🍽️' },
  { name: 'KRÁJENÍ DORTU', category: 'reception', duration: '15 min', icon: '🎂' },
  { name: 'FOCENÍ NOVOMANŽELŮ', category: 'photography', duration: '1 hod', icon: '💑' },
  { name: 'UBYTOVÁNÍ HOSTŮ', category: 'preparation', duration: '30 min', icon: '🏨' },
  { name: 'HÁZENÍ KYTICÍ', category: 'party', duration: '15 min', icon: '💐' },
  { name: 'PRVNÍ TANEC', category: 'party', duration: '15 min', icon: '💃' },
  { name: 'TANEC S RODIČI', category: 'party', duration: '15 min', icon: '👨‍👩‍👧' },
  { name: 'VEČEŘE', category: 'reception', duration: '1 hod', icon: '🍴' },
  { name: 'VOLNÁ ZÁBAVA', category: 'party', duration: '3 hod', icon: '🎊' },
  { name: 'HRY', category: 'party', duration: '1 hod', icon: '🎮' },
  { name: 'KVÍZY', category: 'party', duration: '30 min', icon: '❓' }
]

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
  const { timeline, loading, createTimelineItem, deleteTimelineItem } = useWeddingDayTimeline()
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<typeof PREDEFINED_ACTIVITIES[0] | null>(null)
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">💡 Tip</h2>
          <p className="text-blue-800">
            Vyberte si z připravených aktivit níže nebo přidejte vlastní. Můžete upravit čas, místo a další detaily každé aktivity.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Připravené aktivity</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {PREDEFINED_ACTIVITIES.map((activity, index) => (
              <button
                key={index}
                onClick={() => handleSelectPredefined(activity)}
                className="flex items-center space-x-2 p-3 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
              >
                <span className="text-2xl">{activity.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{activity.name}</div>
                  <div className="text-xs text-gray-500">{activity.duration}</div>
                </div>
                <Plus className="w-4 h-4 text-purple-600 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Predefined Activity Form */}
        {selectedActivity && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{selectedActivity.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900">{selectedActivity.name}</h3>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddPredefined} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Čas začátku *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Délka trvání
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input"
                    placeholder="např. 1 hod"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Místo
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input"
                    placeholder="např. Zahrada"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Poznámky
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input"
                    placeholder="Volitelné poznámky"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
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

        <div className="mb-6">
          <button
            onClick={() => setShowCustomForm(!showCustomForm)}
            className="btn-outline w-full flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Přidat vlastní aktivitu</span>
          </button>
        </div>

        {showCustomForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vlastní aktivita</h3>
            <form onSubmit={handleAddCustom} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Název aktivity *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.activity}
                    onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                    className="input"
                    placeholder="např. Příjezd fotografa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Čas začátku *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Délka trvání
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input"
                    placeholder="např. 1 hod"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Místo
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input"
                    placeholder="např. Zahrada"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Poznámky
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input"
                    placeholder="Volitelné poznámky"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Váš harmonogram ({timeline.length})</h2>
            <div className="space-y-2">
              {[...timeline].sort((a, b) => {
                if (!a.time) return 1
                if (!b.time) return -1
                return a.time.localeCompare(b.time)
              }).map((item, index, sortedArray) => {
                const prevItem = index > 0 ? sortedArray[index - 1] : null
                const showTimeDivider = !prevItem || (prevItem.time && item.time && prevItem.time !== item.time)

                return (
                  <div key={item.id}>
                    {showTimeDivider && item.time && (
                      <div className="flex items-center space-x-3 mt-4 mb-2">
                        <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full">
                          <Clock className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-2xl font-bold text-gray-900">{item.time}</div>
                        </div>
                      </div>
                    )}
                    <div className="ml-20 relative">
                      {index < sortedArray.length - 1 && (
                        <div className="absolute left-[-52px] top-0 bottom-0 w-0.5 bg-purple-200" />
                      )}
                      <div
                        className={`p-4 rounded-lg border-2 ${categoryColors[item.category as keyof typeof categoryColors]} mb-2`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="font-bold text-lg">{item.activity}</span>
                              {item.duration && (
                                <>
                                  <span className="text-sm text-gray-400">•</span>
                                  <span className="text-sm text-gray-600">{item.duration}</span>
                                </>
                              )}
                            </div>
                            {item.location && (
                              <div className="text-sm mb-1">📍 {item.location}</div>
                            )}
                            {item.notes && (
                              <div className="text-sm text-gray-600">💭 {item.notes}</div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Smazat"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Zatím nemáte naplánovaný harmonogram
            </h3>
            <p className="text-gray-600 mb-6">
              Začněte výběrem z připravených aktivit výše nebo přidejte vlastní
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

