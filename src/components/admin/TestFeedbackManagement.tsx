'use client'

import { useState, useEffect } from 'react'
import { Star, User, Calendar, MessageSquare, TrendingUp, FileText, Filter } from 'lucide-react'

interface ModuleRating {
  rating: number
  comment: string
}

interface TestFeedback {
  id: string
  testerName: string
  createdAt: any
  frontPage: ModuleRating
  aiCoach: ModuleRating
  quickActions: ModuleRating
  taskManagement: ModuleRating
  guestManagement: ModuleRating
  seatingPlan: ModuleRating
  vendorManagement: ModuleRating
  weddingChecklist: ModuleRating
  budgetTracking: ModuleRating
  timelinePlanning: ModuleRating
  marketplace: ModuleRating
  moodboard: ModuleRating
  weddingDayTimeline: ModuleRating
  foodDrinks: ModuleRating
  musicPlaylist: ModuleRating
  shoppingList: ModuleRating
  accommodation: ModuleRating
  weddingWebsite: ModuleRating
  overallDesign: ModuleRating
  generalComment: string
  status: string
}

const modules = [
  { id: 'frontPage', label: 'Úvodní stránka' },
  { id: 'aiCoach', label: 'Svatbot - Váš AI Kouč' },
  { id: 'quickActions', label: 'Rychlé akce' },
  { id: 'taskManagement', label: 'Správa úkolů' },
  { id: 'guestManagement', label: 'Správa hostů' },
  { id: 'seatingPlan', label: 'Rozmístění hostů' },
  { id: 'vendorManagement', label: 'Dodavatelé' },
  { id: 'weddingChecklist', label: 'Svatební checklist' },
  { id: 'budgetTracking', label: 'Rozpočet' },
  { id: 'timelinePlanning', label: 'Časová osa' },
  { id: 'marketplace', label: 'Najít dodavatele' },
  { id: 'moodboard', label: 'Moodboard' },
  { id: 'weddingDayTimeline', label: 'Harmonogram dne' },
  { id: 'foodDrinks', label: 'Jídlo a Pití' },
  { id: 'musicPlaylist', label: 'Svatební hudba' },
  { id: 'shoppingList', label: 'Nákupní seznam' },
  { id: 'accommodation', label: 'Ubytování' },
  { id: 'weddingWebsite', label: 'Svatební web' },
  { id: 'overallDesign', label: 'Celkový vzhled' }
]

export default function TestFeedbackManagement() {
  const [feedback, setFeedback] = useState<TestFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFeedback, setSelectedFeedback] = useState<TestFeedback | null>(null)
  const [showStatistics, setShowStatistics] = useState(false)

  useEffect(() => {
    fetchFeedback()
  }, [])

  const fetchFeedback = async () => {
    try {
      const response = await fetch('/api/test-feedback')
      const data = await response.json()
      
      if (data.success) {
        setFeedback(data.feedback)
      }
    } catch (error) {
      console.error('Error fetching feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAverageRating = (moduleId: string): number => {
    const ratings = feedback
      .map(f => f[moduleId as keyof TestFeedback] as ModuleRating)
      .filter(r => r?.rating > 0)
      .map(r => r.rating)
    
    if (ratings.length === 0) return 0
    return Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
  }

  const getOverallAverage = (): number => {
    const allRatings = modules.map(m => calculateAverageRating(m.id)).filter(r => r > 0)
    if (allRatings.length === 0) return 0
    return Math.round((allRatings.reduce((a, b) => a + b, 0) / allRatings.length) * 10) / 10
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return new Intl.DateTimeFormat('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getRatingColor = (rating: number): string => {
    if (rating >= 8) return 'text-green-600 bg-green-50'
    if (rating >= 6) return 'text-yellow-600 bg-yellow-50'
    if (rating >= 4) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Výsledky testování</h2>
            <p className="text-purple-100">
              Zpětná vazba od testerů aplikace
            </p>
          </div>
          <button
            onClick={() => setShowStatistics(!showStatistics)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            <TrendingUp className="w-5 h-5" />
            {showStatistics ? 'Skrýt statistiky' : 'Zobrazit statistiky'}
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      {showStatistics && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Průměrná hodnocení modulů</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {modules.map(module => {
              const avgRating = calculateAverageRating(module.id)
              return (
                <div key={module.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">{module.label}</span>
                    <span className={`px-3 py-1 rounded-full font-bold ${getRatingColor(avgRating)}`}>
                      {avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Celkový průměr</h4>
                <p className="text-gray-600">Průměr ze všech modulů a hodnocení</p>
              </div>
              <div className="text-4xl font-bold text-purple-600">
                {getOverallAverage().toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Celkem odpovědí</p>
              <p className="text-3xl font-bold text-gray-900">{feedback.length}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Celkový průměr</p>
              <p className="text-3xl font-bold text-purple-600">{getOverallAverage().toFixed(1)}/10</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <Star className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Testerů</p>
              <p className="text-3xl font-bold text-blue-600">{new Set(feedback.map(f => f.testerName)).size}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Všechny odpovědi</h3>
        </div>

        {feedback.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Zatím žádné odpovědi</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {feedback.map((item) => (
              <div
                key={item.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedFeedback(selectedFeedback?.id === item.id ? null : item)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.testerName}</h4>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedFeedback?.id === item.id && (
                  <div className="mt-6 space-y-4 bg-gray-50 rounded-lg p-6">
                    <h5 className="font-bold text-gray-900 text-lg mb-4">Hodnocení modulů</h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {modules.map(module => {
                        const rating = item[module.id as keyof TestFeedback] as ModuleRating
                        if (!rating) return null
                        
                        return (
                          <div key={module.id} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-700">{module.label}</span>
                              <span className={`px-3 py-1 rounded-full font-bold ${getRatingColor(rating.rating)}`}>
                                {rating.rating}/10
                              </span>
                            </div>
                            {rating.comment && (
                              <p className="text-sm text-gray-600 mt-2 italic">
                                "{rating.comment}"
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {item.generalComment && (
                      <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                        <h6 className="font-semibold text-gray-900 mb-2">Celkový komentář</h6>
                        <p className="text-gray-700">{item.generalComment}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
