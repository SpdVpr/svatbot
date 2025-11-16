'use client'

import { useState } from 'react'
import { X, Sparkles, Check, Loader2 } from 'lucide-react'

interface Activity {
  name: string
  category: 'preparation' | 'ceremony' | 'photography' | 'reception' | 'party'
  duration: string
  icon: string
}

interface AITimelineDialogProps {
  isOpen: boolean
  onClose: () => void
  activities: Activity[]
  onGenerate: (selectedActivities: Activity[], generalNotes: string) => Promise<void>
}

export default function AITimelineDialog({
  isOpen,
  onClose,
  activities,
  onGenerate
}: AITimelineDialogProps) {
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set())
  const [generalNotes, setGeneralNotes] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  if (!isOpen) return null

  const toggleActivity = (activity: Activity) => {
    const newSelected = new Set(selectedActivities)
    if (newSelected.has(activity.name)) {
      newSelected.delete(activity.name)
    } else {
      newSelected.add(activity.name)
    }
    setSelectedActivities(newSelected)
  }

  const handleGenerate = async () => {
    if (selectedActivities.size === 0) {
      alert('Vyberte alespoň jednu aktivitu')
      return
    }

    setIsGenerating(true)
    try {
      const selectedActivityObjects = activities.filter(a => selectedActivities.has(a.name))
      await onGenerate(selectedActivityObjects, generalNotes)
      onClose()
      // Reset state
      setSelectedActivities(new Set())
      setGeneralNotes('')
    } catch (error) {
      console.error('Error generating timeline:', error)
      alert('Chyba při generování harmonogramu')
    } finally {
      setIsGenerating(false)
    }
  }

  const categoryLabels = {
    preparation: 'Příprava',
    ceremony: 'Obřad',
    photography: 'Fotografie',
    reception: 'Hostina',
    party: 'Zábava'
  }

  const groupedActivities = activities.reduce((acc, activity) => {
    if (!acc[activity.category]) {
      acc[activity.category] = []
    }
    acc[activity.category].push(activity)
    return acc
  }, {} as Record<string, Activity[]>)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-bold">Vytvořit harmonogram pomocí AI</h2>
              <p className="text-primary-100 text-sm mt-1">
                Vyberte aktivity a AI vytvoří kompletní časový plán
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            disabled={isGenerating}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <p className="text-text-muted mb-4">
              Vyberte aktivity, které chcete zahrnout do harmonogramu. AI automaticky doplní časy a další důležité detaily.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Vyberte hlavní aktivity a AI automaticky přidá logické přechody, přestávky a další důležité momenty.
              </p>
            </div>
          </div>

          {/* Activities by category */}
          <div className="space-y-6">
            {Object.entries(groupedActivities).map(([category, categoryActivities]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                  <span className="ml-2 text-sm text-text-muted font-normal">
                    ({categoryActivities.filter(a => selectedActivities.has(a.name)).length}/{categoryActivities.length})
                  </span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categoryActivities.map((activity) => {
                    const isSelected = selectedActivities.has(activity.name)

                    return (
                      <button
                        key={activity.name}
                        onClick={() => toggleActivity(activity)}
                        className={`p-4 text-left border-2 rounded-lg transition-all ${
                          isSelected
                            ? 'bg-primary-50 border-primary-400 shadow-sm'
                            : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{activity.icon}</span>
                            <div className="font-medium text-text-primary text-sm">
                              {activity.name}
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* General Notes Section */}
          {selectedActivities.size > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="block text-sm font-semibold text-text-primary mb-2">
                💭 Celkový komentář (volitelné)
              </label>
              <textarea
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Např. Chceme začít dříve, máme hodně hostů ze zahraničí, potřebujeme více času na focení..."
                className="input-field text-sm resize-none"
                rows={3}
              />
              <p className="text-xs text-text-muted mt-2">
                Zde můžete napsat jakékoliv speciální požadavky nebo poznámky, které by AI měla vzít v úvahu při plánování harmonogramu.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6 flex items-center justify-between">
          <div className="text-sm text-text-muted">
            Vybráno: <strong>{selectedActivities.size}</strong> {selectedActivities.size === 1 ? 'aktivita' : selectedActivities.size < 5 ? 'aktivity' : 'aktivit'}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="btn-outline"
              disabled={isGenerating}
            >
              Zrušit
            </button>
            <button
              onClick={handleGenerate}
              className="btn-primary flex items-center space-x-2"
              disabled={isGenerating || selectedActivities.size === 0}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generuji...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Vygenerovat harmonogram</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


