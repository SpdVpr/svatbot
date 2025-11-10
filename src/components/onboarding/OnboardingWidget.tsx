'use client'

import { useState } from 'react'
import { useOnboarding } from '@/hooks/useOnboarding'
import { 
  ChevronRight, 
  Check,
  Sparkles,
  X,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'
import OnboardingWizard from './OnboardingWizard'

export default function OnboardingWidget() {
  const { 
    onboardingState, 
    steps, 
    loading,
    getNextStep,
    getProgress,
    dismissWelcome
  } = useOnboarding()

  const [showWizard, setShowWizard] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const nextStep = getNextStep()
  const progress = getProgress()
  const completedCount = onboardingState.completedSteps.length
  const totalSteps = steps.length

  // Don't show if completed or dismissed
  if (loading || onboardingState.hasCompletedOnboarding || isDismissed) {
    return null
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    dismissWelcome()
  }

  return (
    <>
      <div className="wedding-card border-2 border-primary-200 bg-primary-50">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-500" />
                Průvodce nastavením
              </h3>
              <p className="text-sm text-gray-600">
                {completedCount} z {totalSteps} kroků dokončeno
              </p>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Zavřít"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary-500 to-pink-500 h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${progress}%` }}
            >
              {progress > 15 && (
                <span className="text-xs font-bold text-white">
                  {progress}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Next step */}
        {nextStep ? (
          <div className="bg-white rounded-lg p-4 mb-4 border border-primary-200">
            <div className="flex items-start gap-3">
              <span className="text-3xl flex-shrink-0">{nextStep.icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 mb-1">
                  Další krok: {nextStep.title.replace(/^[^\s]+\s/, '')}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {nextStep.description}
                </p>
                
                {nextStep.actionUrl && (
                  <Link
                    href={nextStep.actionUrl}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    {nextStep.actionLabel || 'Začít'}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-green-800">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-medium">Skvělá práce! Dokončili jste všechny kroky! 🎉</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWizard(true)}
            className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <BookOpen className="w-4 h-4" />
            <span>Otevřít průvodce</span>
          </button>
          
          {progress === 100 && (
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Zavřít
            </button>
          )}
        </div>

        {/* Completed steps preview */}
        {completedCount > 0 && (
          <div className="mt-4 pt-4 border-t border-primary-200">
            <p className="text-xs text-gray-600 mb-2">Dokončené kroky:</p>
            <div className="flex flex-wrap gap-2">
              {steps.filter(s => s.completed).slice(0, 5).map(step => (
                <div
                  key={step.id}
                  className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs"
                >
                  <Check className="w-3 h-3" />
                  <span>{step.icon}</span>
                </div>
              ))}
              {completedCount > 5 && (
                <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  +{completedCount - 5} dalších
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Wizard Modal */}
      {showWizard && (
        <OnboardingWizard 
          onClose={() => setShowWizard(false)}
          autoShow={false}
        />
      )}
    </>
  )
}

