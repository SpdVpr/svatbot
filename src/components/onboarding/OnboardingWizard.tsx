'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useOnboarding } from '@/hooks/useOnboarding'
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useViewTransition, getViewTransitionName } from '@/hooks/useViewTransition'

interface OnboardingWizardProps {
  onClose?: () => void
  autoShow?: boolean
}

export default function OnboardingWizard({ onClose, autoShow = true }: OnboardingWizardProps) {
  const router = useRouter()
  const { startTransition } = useViewTransition()
  const {
    onboardingState,
    steps,
    loading,
    completeStep,
    completeOnboarding,
    dismissWelcome,
    getNextStep,
    getProgress
  } = useOnboarding()

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Check if component is mounted (for portal)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-show for new users
  useEffect(() => {
    if (!loading && autoShow && onboardingState.showWelcome && onboardingState.isNewUser) {
      setIsOpen(true)
    }
  }, [loading, autoShow, onboardingState.showWelcome, onboardingState.isNewUser])

  // Manual open (when autoShow is false, open immediately)
  useEffect(() => {
    if (!autoShow) {
      setIsOpen(true)
    }
  }, [autoShow])

  const currentStep = steps[currentStepIndex]
  const progress = getProgress()
  const isLastStep = currentStepIndex === steps.length - 1

  const handleClose = () => {
    setIsOpen(false)
    dismissWelcome()
    if (onClose) onClose()
  }

  const handleNext = () => {
    if (currentStep && !currentStep.completed) {
      completeStep(currentStep.id)
    }

    if (isLastStep) {
      completeOnboarding()
      handleClose()
    } else {
      startTransition(() => {
        setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1))
      })
    }
  }

  const handlePrevious = () => {
    startTransition(() => {
      setCurrentStepIndex(prev => Math.max(prev - 1, 0))
    })
  }

  const handleSkip = () => {
    completeOnboarding()
    handleClose()
  }

  const handleAction = () => {
    if (currentStep?.actionUrl) {
      completeStep(currentStep.id)
      router.push(currentStep.actionUrl)
      handleClose()
    }
  }

  if (loading || !isOpen || !currentStep || !mounted) return null

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden my-8"
        style={getViewTransitionName('onboarding-wizard')}
      >
        {/* Header */}
        <div className="p-6 text-white relative" style={{ background: `linear-gradient(to right, var(--color-primary-600), var(--color-primary-700))` }}>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-4xl">{currentStep.icon}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium opacity-90">
                  Krok {currentStepIndex + 1} z {steps.length}
                </span>
              </div>
              <h2 className="text-2xl font-bold">{currentStep.title}</h2>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <p className="text-lg text-gray-700 mb-6">
            {currentStep.description}
          </p>

          {/* Tips */}
          {currentStep.tips && currentStep.tips.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Tipy od Svatbota:</h3>
              </div>
              <ul className="space-y-2">
                {currentStep.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Completed indicator */}
          {currentStep.completed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-green-800">
                <Check className="w-5 h-5 text-green-600" />
                <span className="font-medium">Tento krok jste již dokončili! 🎉</span>
              </div>
            </div>
          )}

          {/* Step navigation dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStepIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStepIndex
                    ? 'w-8 bg-primary-500'
                    : step.completed
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
                title={step.title}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Zpět
                </button>
              )}
              
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                Přeskočit průvodce
              </button>
            </div>

            <div className="flex items-center gap-3">
              {currentStep.actionUrl && (
                <button
                  onClick={handleAction}
                  className="px-6 py-2 bg-white border-2 border-primary-500 text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors flex items-center gap-2"
                >
                  {currentStep.actionLabel || 'Přejít'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-6 py-2 bg-gradient-to-r from-primary-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
              >
                {isLastStep ? 'Dokončit' : 'Další'}
                {!isLastStep && <ChevronRight className="w-4 h-4" />}
                {isLastStep && <Check className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Render modal in portal (outside of normal DOM hierarchy)
  return createPortal(modalContent, document.body)
}
