'use client'

import { useState, useMemo } from 'react'
import { X, Sparkles, Loader2, Check, Image as ImageIcon, Filter } from 'lucide-react'
import { MoodboardImage, WEDDING_CATEGORIES, WeddingCategory } from '@/hooks/useMoodboard'

interface AIMoodboardGeneratorProps {
  images: MoodboardImage[]
  onGenerate: (selectedImageIds: string[], options?: any) => Promise<any>
  onClose: () => void
  isLoading?: boolean
}

type GenerationStep = 'select' | 'generating' | 'result'
type GenerationPhase = 'analyzing' | 'generating' | 'describing' | 'saving' | 'complete'

export default function AIMoodboardGenerator({
  images,
  onGenerate,
  onClose,
  isLoading: externalLoading
}: AIMoodboardGeneratorProps) {
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([])
  const [step, setStep] = useState<GenerationStep>('select')
  const [currentPhase, setCurrentPhase] = useState<GenerationPhase>('analyzing')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<WeddingCategory | 'all'>('all')

  // Filter only uploaded images (not AI generated)
  const uploadedImages = useMemo(() =>
    images.filter(img => img.source === 'upload'),
    [images]
  )

  // Filter by category
  const filteredImages = useMemo(() => {
    if (selectedCategory === 'all') {
      return uploadedImages
    }
    return uploadedImages.filter(img => img.category === selectedCategory)
  }, [uploadedImages, selectedCategory])

  // Group images by category for display
  const imagesByCategory = useMemo(() => {
    const grouped: Record<string, MoodboardImage[]> = {}
    uploadedImages.forEach(img => {
      const cat = img.category || 'other'
      if (!grouped[cat]) {
        grouped[cat] = []
      }
      grouped[cat].push(img)
    })
    return grouped
  }, [uploadedImages])

  const toggleImageSelection = (imageId: string) => {
    setSelectedImageIds(prev => {
      if (prev.includes(imageId)) {
        return prev.filter(id => id !== imageId)
      } else {
        if (prev.length >= 10) {
          setError('Můžete vybrat maximálně 10 obrázků')
          setTimeout(() => setError(null), 3000)
          return prev // Max 10 images
        }
        return [...prev, imageId]
      }
    })
  }

  const selectAllFromCategory = (category: WeddingCategory) => {
    const categoryImages = uploadedImages.filter(img => img.category === category)
    const categoryImageIds = categoryImages.map(img => img.id)

    // Add up to 10 total images
    const availableSlots = 10 - selectedImageIds.length
    const idsToAdd = categoryImageIds.filter(id => !selectedImageIds.includes(id)).slice(0, availableSlots)

    if (idsToAdd.length > 0) {
      setSelectedImageIds(prev => [...prev, ...idsToAdd])
    }
  }

  const handleGenerate = async () => {
    if (selectedImageIds.length < 2) {
      setError('Vyberte alespoň 2 obrázky')
      return
    }

    setStep('generating')
    setError(null)
    setCurrentPhase('analyzing')

    try {
      // Simulate phase progression
      const phaseTimers: NodeJS.Timeout[] = []
      
      phaseTimers.push(setTimeout(() => setCurrentPhase('generating'), 8000))
      phaseTimers.push(setTimeout(() => setCurrentPhase('describing'), 35000))
      phaseTimers.push(setTimeout(() => setCurrentPhase('saving'), 45000))

      const generatedResult = await onGenerate(selectedImageIds)

      // Clear timers
      phaseTimers.forEach(timer => clearTimeout(timer))

      setCurrentPhase('complete')
      setResult(generatedResult)
      setStep('result')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se vygenerovat moodboard')
      setStep('select')
    }
  }

  const phases = [
    { id: 'analyzing', label: 'Analyzuji fotky', icon: '🔍', duration: '~10s' },
    { id: 'generating', label: 'Vytvářím koláž', icon: '🎨', duration: '~30s' },
    { id: 'describing', label: 'Generuji popis', icon: '✍️', duration: '~10s' },
    { id: 'saving', label: 'Ukládám', icon: '💾', duration: '~5s' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Moodboard Generator</h2>
              <p className="text-sm text-gray-600">Vytvořte vizuální koláž z vašich fotek</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={step === 'generating'}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'select' && (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200">
                <h3 className="font-semibold text-gray-900 mb-2">Jak to funguje?</h3>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Vyberte 2-10 inspiračních fotek z vašeho moodboardu</li>
                  <li>AI analyzuje styl, barvy a atmosféru</li>
                  <li>Vygeneruje profesionální vizuální koláž</li>
                  <li>Dostanete popis stylu a doporučení</li>
                </ol>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Selection counter and category filter */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="font-semibold text-gray-900">
                  Vyberte fotky ({selectedImageIds.length}/10)
                </h3>
                <div className="flex items-center gap-2">
                  {selectedImageIds.length > 0 && (
                    <button
                      onClick={() => setSelectedImageIds([])}
                      className="text-sm text-pink-600 hover:text-pink-700"
                    >
                      Zrušit výběr
                    </button>
                  )}
                </div>
              </div>

              {/* Category filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Vše ({uploadedImages.length})
                </button>
                {Object.entries(imagesByCategory).map(([category, categoryImages]) => {
                  const categoryInfo = WEDDING_CATEGORIES[category as WeddingCategory]
                  if (!categoryInfo) return null

                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category as WeddingCategory)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === category
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {categoryInfo.icon} {categoryInfo.label} ({categoryImages.length})
                    </button>
                  )
                })}
              </div>

              {/* Loading state */}
              {externalLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-pink-500 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">Načítám fotky z Firebase...</p>
                </div>
              ) : uploadedImages.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Nejdřív nahrajte nějaké fotky do moodboardu</p>
                  <p className="text-sm text-gray-500">Přejděte na záložku "Nahrát fotky"</p>
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">V této kategorii nejsou žádné fotky</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Quick select by category */}
                  {selectedCategory === 'all' && Object.keys(imagesByCategory).length > 1 && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 mb-2">Rychlý výběr podle kategorie:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(imagesByCategory).map(([category, categoryImages]) => {
                          const categoryInfo = WEDDING_CATEGORIES[category as WeddingCategory]
                          if (!categoryInfo) return null

                          return (
                            <button
                              key={category}
                              onClick={() => selectAllFromCategory(category as WeddingCategory)}
                              className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-md hover:border-pink-300 hover:bg-pink-50 transition-colors"
                            >
                              {categoryInfo.icon} Vybrat {categoryInfo.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Image grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {filteredImages.map((image) => {
                      const isSelected = selectedImageIds.includes(image.id)
                      const categoryInfo = WEDDING_CATEGORIES[image.category || 'other']

                      return (
                        <button
                          key={image.id}
                          onClick={() => toggleImageSelection(image.id)}
                          className={`relative w-full rounded-lg overflow-hidden border-2 transition-all ${
                            isSelected
                              ? 'border-pink-500 ring-2 ring-pink-200 scale-95'
                              : 'border-gray-200 hover:border-pink-300'
                          }`}
                          style={{ aspectRatio: '1 / 1' }}
                        >
                          <div className="relative w-full h-full">
                            <img
                              src={image.thumbnailUrl || image.url}
                              alt={image.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Category badge */}
                          {categoryInfo && (
                            <div className="absolute top-1 left-1 z-10">
                              <span className="text-xs bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded">
                                {categoryInfo.icon}
                              </span>
                            </div>
                          )}

                          {/* Selection indicator */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center z-10">
                              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Stats */}
                  <div className="text-center text-sm text-gray-600">
                    Zobrazeno {filteredImages.length} {filteredImages.length === 1 ? 'fotka' : filteredImages.length < 5 ? 'fotky' : 'fotek'}
                    {selectedCategory !== 'all' && ` v kategorii ${WEDDING_CATEGORIES[selectedCategory]?.label}`}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'generating' && (
            <div className="space-y-8 py-8">
              {/* Progress */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-4 animate-pulse">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Generuji váš moodboard...
                </h3>
                <p className="text-gray-600">Toto může trvat až minutu</p>
              </div>

              {/* Phase indicators */}
              <div className="space-y-3 max-w-md mx-auto">
                {phases.map((phase, index) => {
                  const phaseIndex = phases.findIndex(p => p.id === currentPhase)
                  const currentIndex = phases.findIndex(p => p.id === phase.id)
                  const isComplete = currentIndex < phaseIndex
                  const isCurrent = currentIndex === phaseIndex
                  const isPending = currentIndex > phaseIndex

                  return (
                    <div
                      key={phase.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                        isCurrent ? 'bg-pink-50 border border-pink-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className={`text-2xl ${isCurrent ? 'animate-bounce' : ''}`}>
                        {phase.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{phase.label}</div>
                        <div className="text-xs text-gray-500">{phase.duration}</div>
                      </div>
                      {isComplete && (
                        <Check className="w-5 h-5 text-green-500" />
                      )}
                      {isCurrent && (
                        <Loader2 className="w-5 h-5 text-pink-500 animate-spin" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {step === 'result' && result && (
            <div className="space-y-6">
              {/* Success message */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900">Moodboard vygenerován!</h3>
                  <p className="text-sm text-green-700">Váš AI moodboard byl úspěšně vytvořen a uložen.</p>
                </div>
              </div>

              {/* Generated image preview */}
              <div className="relative w-full rounded-xl overflow-hidden border border-gray-200" style={{ aspectRatio: '16 / 9' }}>
                <img
                  src={result.url}
                  alt={result.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Description */}
              {result.description && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Popis stylu</h3>
                    <p className="text-gray-700">{result.description.styleDescription}</p>
                  </div>

                  {result.description.recommendations && result.description.recommendations.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Doporučení</h3>
                      <ul className="space-y-2">
                        {result.description.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-pink-500 mt-1">•</span>
                            <span className="text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          {step === 'select' && (
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Zrušit
              </button>
              <button
                onClick={handleGenerate}
                disabled={selectedImageIds.length < 2}
                className="btn-primary inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                <span>Vygenerovat moodboard</span>
              </button>
            </div>
          )}

          {step === 'generating' && (
            <div className="text-center text-sm text-gray-600">
              Prosím počkejte, generování probíhá...
            </div>
          )}

          {step === 'result' && (
            <div className="flex items-center justify-end">
              <button
                onClick={onClose}
                className="btn-primary"
              >
                Hotovo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

