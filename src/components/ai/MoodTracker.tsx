'use client'

import { useState } from 'react'
import { useAICoach, MoodEntry } from '@/hooks/useAICoach'
import { TrendingUp, Heart, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const moodOptions: Array<{
  value: MoodEntry['mood']
  label: string
  emoji: string
  color: string
  bgColor: string
}> = [
  { value: 'great', label: 'Skvělá', emoji: '😄', color: 'text-white', bgColor: 'bg-primary-400 hover:bg-primary-300' },
  { value: 'good', label: 'Dobrá', emoji: '😊', color: 'text-white', bgColor: 'bg-primary-500 hover:bg-primary-400' },
  { value: 'okay', label: 'Ujde to', emoji: '😐', color: 'text-white', bgColor: 'bg-primary-600 hover:bg-primary-500' },
  { value: 'stressed', label: 'Stres', emoji: '😟', color: 'text-white', bgColor: 'bg-primary-800 hover:bg-primary-700' },
  { value: 'overwhelmed', label: 'Přetížení', emoji: '😰', color: 'text-white', bgColor: 'bg-primary-900 hover:bg-primary-800' }
]

interface MoodTrackerProps {
  compact?: boolean
  onMoodSaved?: () => void
}

export default function MoodTracker({ compact = false, onMoodSaved }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<MoodEntry['mood'] | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [currentMoodLabel, setCurrentMoodLabel] = useState<string | null>(null)

  const { saveMoodEntry, emotionalInsight, refreshEmotionalInsight } = useAICoach()

  const handleMoodSelect = async (mood: MoodEntry['mood']) => {
    setSelectedMood(mood)
    setSaved(false)
    setSaving(true)

    // Auto-set stress level based on mood
    const stressDefaults = {
      great: 2,
      good: 3,
      okay: 5,
      stressed: 7,
      overwhelmed: 9
    }
    const autoStressLevel = stressDefaults[mood]
    const autoEnergyLevel = mood === 'great' ? 8 : mood === 'good' ? 7 : mood === 'okay' ? 5 : mood === 'stressed' ? 4 : 3

    // Update current mood label immediately
    const moodLabels = {
      great: '😊 Skvělá',
      good: '😊 Dobrá',
      okay: '😐 Ujde to',
      stressed: '😟 Stres',
      overwhelmed: '😰 Přetížení'
    }
    setCurrentMoodLabel(moodLabels[mood])

    try {
      await saveMoodEntry(mood, autoStressLevel, autoEnergyLevel, '')

      // Refresh emotional insight immediately after saving
      await refreshEmotionalInsight()

      // Show success state
      setSaved(true)

      // Reset form after delay
      setTimeout(() => {
        setSelectedMood(null)
        setSaved(false)
      }, 1500)

      onMoodSaved?.()
    } catch (error) {
      console.error('Error saving mood:', error)
    } finally {
      setSaving(false)
    }
  }



  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <Link href="/mood-stats" className="block">
          <div className="flex items-center justify-between mb-3 group cursor-pointer">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary-500 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                Jak se dnes cítíš?
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {currentMoodLabel && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  currentMoodLabel.includes('Skvělá') || currentMoodLabel.includes('Dobrá') ? 'bg-green-100 text-green-700' :
                  currentMoodLabel.includes('Ujde') ? 'bg-blue-100 text-blue-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {currentMoodLabel}
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </Link>

        <div className="grid grid-cols-5 gap-2">
          {moodOptions.map((option) => {
            return (
              <button
                key={option.value}
                onClick={() => handleMoodSelect(option.value)}
                disabled={saving}
                className={`${option.bgColor} ${option.color} p-3 rounded-lg transition-all hover:scale-105 flex items-center justify-center text-2xl disabled:opacity-50 ${
                  selectedMood === option.value && saved ? 'ring-2 ring-green-500' : ''
                }`}
                title={option.label}
              >
                {option.emoji}
              </button>
            )
          })}
        </div>

        {/* Success message */}
        {saved && (
          <div className="mt-3 text-center">
            <p className="text-sm text-green-600 font-medium">
              ✓ Nálada uložena!
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
      <div>
        <p className="text-sm text-gray-600 mb-4">Jak se dnes cítíš?</p>
        <div className="grid grid-cols-5 gap-3">
          {moodOptions.map((option) => {
            return (
              <button
                key={option.value}
                onClick={() => handleMoodSelect(option.value)}
                disabled={saving}
                className={`${option.bgColor} ${option.color} p-4 rounded-xl transition-all hover:scale-105 hover:shadow-md flex flex-col items-center gap-2 disabled:opacity-50 ${
                  selectedMood === option.value && saved ? 'ring-2 ring-green-500' : ''
                }`}
              >
                <span className="text-3xl">{option.emoji}</span>
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            )
          })}
        </div>

        {/* Success message */}
        {saved && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-sm text-green-700 font-medium">
              ✓ Nálada úspěšně uložena! Svatbot ti přizpůsobí podporu.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

