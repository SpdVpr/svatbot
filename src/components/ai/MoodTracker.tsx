'use client'

import { useState } from 'react'
import { useAICoach, MoodEntry } from '@/hooks/useAICoach'
import { Smile, Meh, Frown, AlertTriangle, TrendingUp, Heart, Sparkles } from 'lucide-react'

const moodOptions: Array<{
  value: MoodEntry['mood']
  label: string
  icon: any
  color: string
  bgColor: string
}> = [
  { value: 'great', label: 'Skvělá', icon: Sparkles, color: 'text-green-600', bgColor: 'bg-green-100 hover:bg-green-200' },
  { value: 'good', label: 'Dobrá', icon: Smile, color: 'text-blue-600', bgColor: 'bg-blue-100 hover:bg-blue-200' },
  { value: 'okay', label: 'Ujde to', icon: Meh, color: 'text-yellow-600', bgColor: 'bg-yellow-100 hover:bg-yellow-200' },
  { value: 'stressed', label: 'Stres', icon: Frown, color: 'text-orange-600', bgColor: 'bg-orange-100 hover:bg-orange-200' },
  { value: 'overwhelmed', label: 'Přetížení', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-100 hover:bg-red-200' }
]

interface MoodTrackerProps {
  compact?: boolean
  onMoodSaved?: () => void
}

export default function MoodTracker({ compact = false, onMoodSaved }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<MoodEntry['mood'] | null>(null)
  const [stressLevel, setStressLevel] = useState(5)
  const [energyLevel, setEnergyLevel] = useState(5)
  const [note, setNote] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const { saveMoodEntry, emotionalInsight } = useAICoach()

  const handleMoodSelect = (mood: MoodEntry['mood']) => {
    setSelectedMood(mood)
    setShowForm(true)
    setSaved(false)

    // Auto-set stress level based on mood
    const stressDefaults = {
      great: 2,
      good: 3,
      okay: 5,
      stressed: 7,
      overwhelmed: 9
    }
    setStressLevel(stressDefaults[mood])
  }

  const handleSave = async () => {
    if (!selectedMood) return

    setSaving(true)
    try {
      await saveMoodEntry(selectedMood, stressLevel, energyLevel, note)

      // Show success state
      setSaved(true)

      // Reset form after delay
      setTimeout(() => {
        setSelectedMood(null)
        setStressLevel(5)
        setEnergyLevel(5)
        setNote('')
        setShowForm(false)
        setSaved(false)
      }, 1500)

      onMoodSaved?.()
    } catch (error) {
      console.error('Error saving mood:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setSelectedMood(null)
    setShowForm(false)
    setNote('')
  }

  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary-500" />
            <h3 className="font-semibold text-gray-900">Jak se dnes cítíte?</h3>
          </div>
          {emotionalInsight && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              emotionalInsight.overallMood === 'positive' ? 'bg-green-100 text-green-700' :
              emotionalInsight.overallMood === 'neutral' ? 'bg-blue-100 text-blue-700' :
              'bg-orange-100 text-orange-700'
            }`}>
              {emotionalInsight.overallMood === 'positive' ? '😊 Pozitivní' :
               emotionalInsight.overallMood === 'neutral' ? '😐 Neutrální' :
               '😰 Stres'}
            </span>
          )}
        </div>

        {!showForm ? (
          <div className="grid grid-cols-5 gap-2">
            {moodOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() => handleMoodSelect(option.value)}
                  className={`${option.bgColor} ${option.color} p-3 rounded-lg transition-all hover:scale-105 flex flex-col items-center gap-1`}
                  title={option.label}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{option.label}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              {moodOptions.find(o => o.value === selectedMood) && (
                <>
                  {(() => {
                    const Icon = moodOptions.find(o => o.value === selectedMood)!.icon
                    return <Icon className="w-4 h-4" />
                  })()}
                  <span className="font-medium">
                    {moodOptions.find(o => o.value === selectedMood)?.label}
                  </span>
                </>
              )}
            </div>

            {/* Stress Level */}
            <div>
              <label className="text-xs text-gray-600 mb-1 block">
                Úroveň stresu: {stressLevel}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={stressLevel}
                onChange={(e) => setStressLevel(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </div>

            {/* Energy Level */}
            <div>
              <label className="text-xs text-gray-600 mb-1 block">
                Úroveň energie: {energyLevel}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </div>

            {/* Optional Note */}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Poznámka (volitelné)..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={2}
            />

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className={`flex-1 px-4 py-2 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2 ${
                  saved
                    ? 'bg-green-500 text-white'
                    : 'bg-gradient-to-r from-primary-500 to-pink-500 text-white hover:from-primary-600 hover:to-pink-600 shadow-md hover:shadow-lg disabled:opacity-50'
                }`}
              >
                {saved ? (
                  <>
                    <span>✓</span>
                    <span>Odesláno!</span>
                  </>
                ) : saving ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Odesílám...</span>
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    <span>Odeslat</span>
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving || saved}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Zrušit
              </button>
            </div>

            {/* Info text */}
            <p className="text-xs text-gray-500 text-center">
              💡 Svatbot analyzuje tvou náladu a přizpůsobí ti podporu
            </p>
          </div>
        )}
      </div>
    )
  }

  // Full version with insights
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-pink-500 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Sledování nálady</h2>
            <p className="text-sm text-gray-600">Pomozte Svatbotovi vás lépe podporovat</p>
          </div>
        </div>
        {emotionalInsight && (
          <div className="text-right">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              emotionalInsight.overallMood === 'positive' ? 'bg-green-100 text-green-700' :
              emotionalInsight.overallMood === 'neutral' ? 'bg-blue-100 text-blue-700' :
              'bg-orange-100 text-orange-700'
            }`}>
              <TrendingUp className="w-4 h-4" />
              <span>
                {emotionalInsight.overallMood === 'positive' ? 'Pozitivní nálada' :
                 emotionalInsight.overallMood === 'neutral' ? 'Neutrální nálada' :
                 'Zvýšený stres'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Průměrný stres: {emotionalInsight.stressLevel}/10
            </p>
          </div>
        )}
      </div>

      {/* Emotional Insights */}
      {emotionalInsight && emotionalInsight.suggestions.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-pink-50 rounded-lg border border-primary-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-lg">🤖</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-2">Svatbot doporučuje:</p>
              <ul className="space-y-1">
                {emotionalInsight.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-primary-500 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Mood Selection */}
      {!showForm ? (
        <div>
          <p className="text-sm text-gray-600 mb-4">Jak se dnes cítíte?</p>
          <div className="grid grid-cols-5 gap-3">
            {moodOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() => handleMoodSelect(option.value)}
                  className={`${option.bgColor} ${option.color} p-4 rounded-xl transition-all hover:scale-105 hover:shadow-md flex flex-col items-center gap-2`}
                >
                  <Icon className="w-8 h-8" />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            {moodOptions.find(o => o.value === selectedMood) && (
              <>
                {(() => {
                  const Icon = moodOptions.find(o => o.value === selectedMood)!.icon
                  return <Icon className="w-6 h-6" />
                })()}
                <span className="font-semibold text-lg">
                  {moodOptions.find(o => o.value === selectedMood)?.label}
                </span>
              </>
            )}
          </div>

          {/* Stress Level */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Úroveň stresu: <span className="text-primary-600 font-bold">{stressLevel}/10</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={stressLevel}
              onChange={(e) => setStressLevel(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Žádný stres</span>
              <span>Extrémní stres</span>
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Úroveň energie: <span className="text-primary-600 font-bold">{energyLevel}/10</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Vyčerpaný</span>
              <span>Plný energie</span>
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Poznámka (volitelné)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Co vás dnes trápí nebo těší?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-primary-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-primary-600 hover:to-pink-600 transition-all disabled:opacity-50 font-medium shadow-md hover:shadow-lg"
            >
              {saving ? 'Ukládám...' : 'Uložit náladu'}
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Zrušit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

