'use client'

import { useState, useEffect } from 'react'
import { useAICoach } from '@/hooks/useAICoach'
import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import MoodTracker from '@/components/ai/MoodTracker'
import { Heart, TrendingUp, Calendar, AlertCircle } from 'lucide-react'

export default function TestMoodPage() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const { emotionalInsight, loading } = useAICoach()
  const [recentMoods, setRecentMoods] = useState<any[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch recent moods from Firebase
  useEffect(() => {
    if (emotionalInsight?.recentMoods) {
      setRecentMoods(emotionalInsight.recentMoods)
    }
  }, [emotionalInsight, refreshKey])

  const handleMoodSaved = () => {
    // Refresh data after saving
    setTimeout(() => {
      setRefreshKey(prev => prev + 1)
      window.location.reload() // Force reload to see new data
    }, 2000)
  }

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'great': return '😄'
      case 'good': return '😊'
      case 'okay': return '😐'
      case 'stressed': return '😰'
      case 'overwhelmed': return '😫'
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Přihlášení vyžadováno</h2>
          <p className="text-gray-600">Pro testování mood trackeru se musíš přihlásit.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-pink-500 rounded-xl p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">🧪 Test Mood Tracker & AI Kouč</h1>
          <p className="text-white/90">Testovací stránka pro ověření funkčnosti mood trackingu a analýzy</p>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Informace o účtu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">User ID:</p>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">{user.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email:</p>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">{user.email}</p>
            </div>
            {wedding && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Wedding ID:</p>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{wedding.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Svatba:</p>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                    {wedding.brideName} & {wedding.groomName}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mood Tracker */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-500" />
              Mood Tracker
            </h2>
            <MoodTracker onMoodSaved={handleMoodSaved} />
          </div>

          {/* Emotional Insight */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              Analýza nálady (posledních 7 dní)
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : emotionalInsight ? (
              <div className="space-y-4">
                {/* Overall Mood */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Celková nálada:</p>
                  <p className="text-2xl font-bold">
                    {emotionalInsight.overallMood === 'positive' ? '😊 Pozitivní' :
                     emotionalInsight.overallMood === 'neutral' ? '😐 Neutrální' :
                     '😰 Stresovaná'}
                  </p>
                </div>

                {/* Stress Level */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Průměrná úroveň stresu:</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all ${
                          emotionalInsight.stressLevel >= 7 ? 'bg-red-500' :
                          emotionalInsight.stressLevel >= 5 ? 'bg-orange-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${emotionalInsight.stressLevel * 10}%` }}
                      />
                    </div>
                    <span className="text-xl font-bold">{emotionalInsight.stressLevel}/10</span>
                  </div>
                </div>

                {/* Needs Support */}
                {emotionalInsight.needsSupport && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-orange-900 mb-2">⚠️ Potřebuješ podporu!</p>
                    <p className="text-sm text-orange-700">
                      Svatbot detekoval zvýšenou úroveň stresu a nabídne ti podporu.
                    </p>
                  </div>
                )}

                {/* Suggestions */}
                {emotionalInsight.suggestions.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2">💡 Doporučení:</p>
                    <ul className="space-y-1">
                      {emotionalInsight.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-blue-700">• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">Zatím žádná data k analýze</p>
            )}
          </div>
        </div>

        {/* Recent Moods History */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-500" />
            Historie nálad (uloženo v Firebase)
          </h2>
          
          {recentMoods.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Datum</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nálada</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Stres</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Energie</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Poznámka</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMoods.map((mood, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {mood.createdAt?.toDate?.()?.toLocaleString('cs-CZ') || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-2">
                          <span className="text-xl">{getMoodEmoji(mood.mood)}</span>
                          <span className="text-sm font-medium">{getMoodLabel(mood.mood)}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                          mood.stressLevel >= 7 ? 'bg-red-100 text-red-700' :
                          mood.stressLevel >= 5 ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {mood.stressLevel}/10
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-1 rounded text-sm font-medium bg-blue-100 text-blue-700">
                          {mood.energyLevel}/10
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {mood.note || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-2">Zatím žádné záznamy nálady</p>
              <p className="text-sm text-gray-500">Zkus přidat svou první náladu výše! 👆</p>
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">🔍 Jak to funguje?</h2>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex gap-3">
              <span className="font-bold">1.</span>
              <p><strong>Uložení do Firebase:</strong> Když klikneš na "Odeslat", data se uloží do Firebase kolekce <code className="bg-blue-100 px-1 rounded">moodEntries</code></p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold">2.</span>
              <p><strong>Analýza:</strong> Svatbot načte posledních 7 dní nálad a vypočítá průměrný stres a celkovou náladu</p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold">3.</span>
              <p><strong>Doporučení:</strong> Pokud je stres ≥ 6, Svatbot nabídne podporu a tipy na relaxaci</p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold">4.</span>
              <p><strong>Notifikace:</strong> Při stresu ≥ 7 se vytvoří notifikace s povzbuzující zprávou</p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold">5.</span>
              <p><strong>Personalizace:</strong> Zprávy od Svatbota se přizpůsobují podle tvého pohlaví a aktuální nálady</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

