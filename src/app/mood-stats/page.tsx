'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAICoach, MoodEntry } from '@/hooks/useAICoach'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import ModuleHeader from '@/components/common/ModuleHeader'
import {
  Heart,
  TrendingUp,
  Calendar,
  AlertCircle,
  BarChart3
} from 'lucide-react'

export default function MoodStatsPage() {
  const { user } = useAuth()
  const { emotionalInsight, loading, getRecentMoods } = useAICoach()
  const [allMoods, setAllMoods] = useState<MoodEntry[]>([])
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30)
  const [loadingMoods, setLoadingMoods] = useState(true)

  const loadMoods = useCallback(async () => {
    if (!user) return

    try {
      setLoadingMoods(true)
      const moods = await getRecentMoods(timeRange)
      setAllMoods(moods)
    } catch (error) {
      console.error('Error loading moods:', error)
    } finally {
      setLoadingMoods(false)
    }
  }, [user, timeRange, getRecentMoods])

  useEffect(() => {
    loadMoods()
  }, [loadMoods])

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'great': return '😄'
      case 'good': return '😊'
      case 'okay': return '😐'
      case 'stressed': return '😟'
      case 'overwhelmed': return '😰'
      default: return '😐'
    }
  }

  const getMoodLabel = (mood: string) => {
    switch (mood) {
      case 'great': return 'Skvělá'
      case 'good': return 'Dobrá'
      case 'okay': return 'Ujde to'
      case 'stressed': return 'Stres'
      case 'overwhelmed': return 'Přetížení'
      default: return mood
    }
  }

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'great': return 'bg-green-500'
      case 'good': return 'bg-blue-500'
      case 'okay': return 'bg-yellow-500'
      case 'stressed': return 'bg-orange-500'
      case 'overwhelmed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  // Calculate statistics
  const stats = {
    totalEntries: allMoods.length,
    moodDistribution: {
      great: allMoods.filter(m => m.mood === 'great').length,
      good: allMoods.filter(m => m.mood === 'good').length,
      okay: allMoods.filter(m => m.mood === 'okay').length,
      stressed: allMoods.filter(m => m.mood === 'stressed').length,
      overwhelmed: allMoods.filter(m => m.mood === 'overwhelmed').length,
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Přihlášení vyžadováno</h2>
          <p className="text-gray-600 mb-4">Pro zobrazení statistik nálad se musíš přihlásit.</p>
          <Link href="/" className="btn-primary inline-block">
            Přejít na hlavní stránku
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <ModuleHeader
        icon={Heart}
        title="Statistiky nálad"
        subtitle={`${stats.totalEntries} záznamů za posledních ${timeRange} dní`}
        iconGradient="from-pink-500 to-rose-500"
      />

      {/* Main Content */}
      <main className="container-desktop py-8">
        <div className="space-y-6">
          {/* Time Range Selector */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Časové období</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeRange(7)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === 7
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  7 dní
                </button>
                <button
                  onClick={() => setTimeRange(30)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === 30
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  30 dní
                </button>
                <button
                  onClick={() => setTimeRange(90)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === 90
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  90 dní
                </button>
              </div>
            </div>
          </div>

          {loadingMoods ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Celkem záznamů</span>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalEntries}</div>
                <p className="text-xs text-gray-500 mt-1">Za posledních {timeRange} dní</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Celková nálada</span>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {emotionalInsight?.overallMood === 'positive' ? '😊 Pozitivní' :
                   emotionalInsight?.overallMood === 'neutral' ? '😐 Neutrální' :
                   '😰 Stres'}
                </div>
              </div>
            </div>

            {/* Mood Distribution Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary-500" />
                Rozložení nálad
              </h2>
              <div className="space-y-4">
                {Object.entries(stats.moodDistribution).map(([mood, count]) => {
                  const percentage = stats.totalEntries > 0 ? (count / stats.totalEntries) * 100 : 0
                  return (
                    <div key={mood}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getMoodEmoji(mood)}</span>
                          <span className="font-medium text-gray-900">{getMoodLabel(mood)}</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {count} ({Math.round(percentage)}%)
                        </span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all ${getMoodColor(mood)}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent Moods History */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-500" />
                Historie nálad
              </h2>
              
              {allMoods.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Datum</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nálada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allMoods.map((mood, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {mood.createdAt?.toDate?.()?.toLocaleString('cs-CZ', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) || 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-2">
                              <span className="text-2xl">{getMoodEmoji(mood.mood)}</span>
                              <span className="text-base font-medium">{getMoodLabel(mood.mood)}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Zatím žádné záznamy nálady</p>
                  <p className="text-sm text-gray-500 mb-4">Začni sledovat svou náladu na dashboardu</p>
                  <Link href="/" className="btn-primary inline-block">
                    Přejít na dashboard
                  </Link>
                </div>
              )}
            </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

