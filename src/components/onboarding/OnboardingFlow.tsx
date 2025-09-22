'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Heart } from 'lucide-react'
import { cn } from '@/utils'
import { OnboardingData, WeddingStyle } from '@/types'
import { useWedding } from '@/hooks/useWedding'
import { useAuthStore } from '@/stores/authStore'

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void
  onSkip: () => void
}

const STEPS = [
  { id: 'names', title: 'Jména snoubenců', description: 'Začněme od základů' },
  { id: 'date', title: 'Datum svatby', description: 'Kdy se chcete vzít?' },
  { id: 'guests', title: 'Počet hostů', description: 'Kolik pozvaných hostů?' },
  { id: 'budget', title: 'Rozpočet', description: 'Jaký je váš rozpočet?' },
  { id: 'style', title: 'Styl svatby', description: 'Jaký styl preferujete?' },
  { id: 'region', title: 'Region', description: 'Kde se chcete vzít?' },
]

export default function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const { createWedding, error } = useWedding()
  const { user } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<OnboardingData>({
    brideName: '',
    groomName: '',
    email: user?.email || '',
    weddingDate: undefined,
    estimatedGuestCount: 75,
    budget: 450000,
    style: 'classic',
    region: 'Praha'
  })

  const currentStepData = STEPS[currentStep]
  const isLastStep = currentStep === STEPS.length - 1
  const canProceed = validateCurrentStep()

  function validateCurrentStep(): boolean {
    switch (currentStepData.id) {
      case 'names':
        return formData.brideName.trim() !== '' && formData.groomName.trim() !== ''
      case 'date':
        return true // Date is optional
      case 'guests':
        return formData.estimatedGuestCount > 0
      case 'budget':
        return formData.budget > 0
      case 'style':
        return formData.style !== null && formData.style !== undefined
      case 'region':
        return formData.region !== ''
      default:
        return true
    }
  }

  const handleNext = async () => {
    if (isLastStep) {
      try {
        setIsCreating(true)

        // Create wedding in Firebase
        await createWedding(formData)

        // Call completion callback
        onComplete(formData)
      } catch (error) {
        console.error('Error creating wedding:', error)
        // Error is handled by useWedding hook
      } finally {
        setIsCreating(false)
      }
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = async () => {
    try {
      setIsCreating(true)

      // Create minimal wedding data for skipped onboarding
      const minimalWeddingData = {
        brideName: '',
        groomName: '',
        email: user?.email || '',
        weddingDate: undefined,
        estimatedGuestCount: 50,
        budget: 300000,
        style: 'classic' as const,
        region: 'Praha'
      }

      // Create wedding in Firebase
      await createWedding(minimalWeddingData)

      // Call completion callback (this will trigger redirect to dashboard)
      onComplete(minimalWeddingData)

      console.log('Minimal wedding created for skipped onboarding')
    } catch (error) {
      console.error('Error creating minimal wedding:', error)
      // Even if there's an error, call onSkip to let parent handle it
      onSkip()
    } finally {
      setIsCreating(false)
    }
  }

  const updateFormData = (updates: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'names':
        return (
          <div className="space-y-6">
            <div>
              <label className="block body-small font-medium text-text-primary mb-2">
                Jméno nevěsty
              </label>
              <input
                type="text"
                value={formData.brideName}
                onChange={(e) => updateFormData({ brideName: e.target.value })}
                className="input-field"
                placeholder="Jana"
                autoFocus
              />
            </div>
            <div>
              <label className="block body-small font-medium text-text-primary mb-2">
                Jméno ženicha
              </label>
              <input
                type="text"
                value={formData.groomName}
                onChange={(e) => updateFormData({ groomName: e.target.value })}
                className="input-field"
                placeholder="Petr"
              />
            </div>
          </div>
        )

      case 'date':
        return (
          <div className="space-y-6">
            <div>
              <label className="block body-small font-medium text-text-primary mb-2">
                Datum svatby (volitelné)
              </label>
              <input
                type="date"
                value={formData.weddingDate ? formData.weddingDate.toISOString().split('T')[0] : ''}
                onChange={(e) => updateFormData({
                  weddingDate: e.target.value ? new Date(e.target.value) : undefined
                })}
                className="input-field"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="bg-primary-50 p-4 rounded-xl">
              <p className="body-small text-primary-700">
                💡 <strong>Tip:</strong> Nejoblíbenější měsíce jsou červen, září a květen.
                Levnější možnosti nabízí březen a listopad.
              </p>
            </div>
          </div>
        )

      case 'guests':
        return (
          <div className="space-y-6">
            <div>
              <label className="block body-small font-medium text-text-primary mb-4">
                Přibližný počet hostů: <strong>{formData.estimatedGuestCount}</strong>
              </label>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={formData.estimatedGuestCount}
                onChange={(e) => updateFormData({ estimatedGuestCount: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-text-muted mt-2">
                <span>10</span>
                <span>200</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { range: '30-50', label: 'Intimní' },
                { range: '50-80', label: 'Střední' },
                { range: '80-120', label: 'Velká' },
                { range: '120+', label: 'Extra velká' }
              ].map((option) => (
                <button
                  key={option.range}
                  onClick={() => {
                    const avg = option.range === '120+' ? 150 :
                               option.range === '80-120' ? 100 :
                               option.range === '50-80' ? 65 : 40
                    updateFormData({ estimatedGuestCount: avg })
                  }}
                  className="btn-outline text-sm py-2"
                >
                  {option.range}
                  <br />
                  <span className="text-xs text-text-muted">{option.label}</span>
                </button>
              ))}
            </div>

            <div className="bg-secondary-50 p-4 rounded-xl">
              <p className="body-small text-secondary-700">
                📊 Průměr v ČR: <strong>75 hostů</strong>
              </p>
            </div>
          </div>
        )

      case 'budget':
        return (
          <div className="space-y-6">
            <div>
              <label className="block body-small font-medium text-text-primary mb-4">
                Orientační rozpočet: <strong>{formData.budget.toLocaleString('cs-CZ')} Kč</strong>
              </label>
              <input
                type="range"
                min="100000"
                max="1000000"
                step="50000"
                value={formData.budget}
                onChange={(e) => updateFormData({ budget: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-text-muted mt-2">
                <span>100k</span>
                <span>1M+</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { amount: 250000, label: '100-300k' },
                { amount: 400000, label: '300-500k' },
                { amount: 650000, label: '500-800k' },
                { amount: 900000, label: '800k+' }
              ].map((option) => (
                <button
                  key={option.amount}
                  onClick={() => updateFormData({ budget: option.amount })}
                  className="btn-outline text-sm py-2"
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="bg-accent-50 p-4 rounded-xl">
              <p className="body-small text-accent-700">
                💰 Průměr: <strong>420.000 Kč</strong> •
                Rozpočet na hlavu: <strong>~{Math.round(formData.budget / formData.estimatedGuestCount).toLocaleString('cs-CZ')} Kč</strong>
              </p>
            </div>
          </div>
        )

      case 'style':
        const styles: { value: WeddingStyle; label: string; emoji: string }[] = [
          { value: 'classic', label: 'Klasicky elegantní', emoji: '🏰' },
          { value: 'rustic', label: 'Rustic/venkovský', emoji: '🌿' },
          { value: 'modern', label: 'Moderní minimální', emoji: '✨' },
          { value: 'vintage', label: 'Romanticky vintage', emoji: '🌸' },
          { value: 'bohemian', label: 'Bohémská', emoji: '🦋' },
          { value: 'garden', label: 'Zahradní', emoji: '🌺' }
        ]

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {styles.map((style) => (
                <button
                  key={style.value}
                  onClick={() => updateFormData({ style: style.value })}
                  className={cn(
                    'p-4 border-2 rounded-xl text-left transition-all duration-200',
                    formData.style === style.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-primary-25'
                  )}
                >
                  <div className="text-2xl mb-2">{style.emoji}</div>
                  <div className="font-medium text-text-primary">{style.label}</div>
                </button>
              ))}
            </div>

            <div className="bg-primary-50 p-4 rounded-xl">
              <p className="body-small text-primary-700">
                💡 Můžete změnit později podle vybraného místa konání
              </p>
            </div>
          </div>
        )

      case 'region':
        const regions = [
          'Praha', 'Brno', 'Ostrava', 'Plzeň', 'Liberec',
          'Olomouc', 'České Budějovice', 'Hradec Králové', 'Pardubice', 'Jiné'
        ]

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => updateFormData({ region })}
                  className={cn(
                    'p-3 border-2 rounded-xl text-center transition-all duration-200',
                    formData.region === region
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-primary-25'
                  )}
                >
                  {region}
                </button>
              ))}
            </div>

            {formData.region === 'Jiné' && (
              <div>
                <label className="block body-small font-medium text-text-primary mb-2">
                  Zadejte region
                </label>
                <input
                  type="text"
                  onChange={(e) => updateFormData({ region: e.target.value })}
                  className="input-field"
                  placeholder="Zadejte váš region"
                />
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen wedding-gradient">
      {/* Header */}
      <header className="container-desktop py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-8 h-8 text-primary-500" fill="currentColor" />
            <span className="font-display text-2xl font-bold text-text-primary">
              SvatBot.cz
            </span>
          </div>

          <button
            onClick={handleSkip}
            className="body-small text-text-muted hover:text-text-secondary"
          >
            Přeskočit zatím
          </button>
        </div>
      </header>

      {/* Progress */}
      <div className="container-desktop mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="body-small text-text-muted">
              Krok {currentStep + 1} z {STEPS.length}
            </span>
            <span className="body-small text-text-muted">
              {Math.round(((currentStep + 1) / STEPS.length) * 100)}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container-desktop pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="wedding-card">
            {/* Step Header */}
            <div className="text-center mb-8">
              <h1 className="heading-3 mb-2">
                {currentStepData.title}
              </h1>
              <p className="body-normal text-text-secondary">
                {currentStepData.description}
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="body-small text-red-600">{error}</p>
              </div>
            )}

            {/* Step Content */}
            <div className="mb-8">
              {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={cn(
                  'btn-secondary flex items-center space-x-2',
                  currentStep === 0 && 'opacity-50 cursor-not-allowed'
                )}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Zpět</span>
              </button>

              <button
                onClick={handleNext}
                disabled={!canProceed || isCreating}
                className={cn(
                  'btn-primary flex items-center space-x-2',
                  (!canProceed || isCreating) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 loading-spinner" />
                    <span>Vytváříme svatbu...</span>
                  </>
                ) : (
                  <>
                    <span>{isLastStep ? 'Dokončit' : 'Pokračovat'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
