'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useWeddingStore } from '@/stores/weddingStore'
import { useWeddingWebsite } from '@/hooks/useWeddingWebsite'
import { ArrowLeft, ArrowRight, Save, Eye, Rocket } from 'lucide-react'
import TemplateSelector from '@/components/wedding-website/builder/TemplateSelector'
import UrlConfigurator from '@/components/wedding-website/builder/UrlConfigurator'
import type { TemplateType } from '@/types/wedding-website'

type Step = 'template' | 'url' | 'content' | 'preview'

export default function WeddingWebsiteBuilderPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { currentWedding: wedding } = useWeddingStore()
  const { website, createWebsite, updateWebsite, publishWebsite, loading } = useWeddingWebsite()

  const [currentStep, setCurrentStep] = useState<Step>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(
    website?.template || null
  )
  const [customUrl, setCustomUrl] = useState(website?.customUrl || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  useEffect(() => {
    if (website) {
      setSelectedTemplate(website.template)
      setCustomUrl(website.customUrl)
      // Pokud už web existuje, přejdi na content step
      setCurrentStep('content')
    }
  }, [website])

  const steps: { id: Step; label: string; description: string }[] = [
    { id: 'template', label: 'Šablona', description: 'Vyberte design' },
    { id: 'url', label: 'URL adresa', description: 'Nastavte URL' },
    { id: 'content', label: 'Obsah', description: 'Vyplňte informace' },
    { id: 'preview', label: 'Náhled', description: 'Zkontrolujte a publikujte' },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)
  const canGoNext = () => {
    if (currentStep === 'template') return selectedTemplate !== null
    if (currentStep === 'url') return customUrl.length >= 3
    return true
  }

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id)
    }
  }

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id)
    }
  }

  const handleSave = async () => {
    if (!selectedTemplate || !customUrl || !wedding) return

    setIsSaving(true)
    try {
      if (!website) {
        // Vytvoření nového webu
        await createWebsite({
          customUrl,
          template: selectedTemplate,
          content: {
            hero: {
              bride: wedding.brideName || '',
              groom: wedding.groomName || '',
              weddingDate: wedding.date || new Date(),
            },
            story: { enabled: false },
            info: { enabled: true },
            schedule: { enabled: false, items: [] },
            rsvp: { enabled: true, mealSelection: false, plusOneAllowed: true, songRequests: false },
            accommodation: { enabled: false },
            gift: { enabled: false },
            gallery: { enabled: false, images: [], allowGuestUploads: false },
            contact: { enabled: true },
            faq: { enabled: false, items: [] },
          },
        })
      } else {
        // Aktualizace existujícího webu
        await updateWebsite({
          template: selectedTemplate,
          customUrl,
        })
      }

      alert('Web byl úspěšně uložen!')
    } catch (error) {
      console.error('Error saving website:', error)
      alert('Chyba při ukládání webu')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!website) {
      alert('Nejdříve uložte web')
      return
    }

    setIsPublishing(true)
    try {
      await publishWebsite()
      alert('Web byl úspěšně publikován!')
      router.push('/admin/wedding-website')
    } catch (error) {
      console.error('Error publishing website:', error)
      alert('Chyba při publikování webu')
    } finally {
      setIsPublishing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
          <p className="text-gray-600">Načítání...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/wedding-website')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {website ? 'Upravit svatební web' : 'Vytvořit svatební web'}
                </h1>
                <p className="text-sm text-gray-600">
                  {steps[currentStepIndex].description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving || !selectedTemplate || !customUrl}
                className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Ukládání...' : 'Uložit'}
              </button>

              {website && !website.isPublished && (
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="inline-flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Rocket className="w-4 h-4" />
                  {isPublishing ? 'Publikování...' : 'Publikovat'}
                </button>
              )}
            </div>
          </div>

          {/* Progress steps */}
          <div className="mt-6 flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentStep === step.id
                      ? 'bg-pink-100 text-pink-700'
                      : index < currentStepIndex
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      currentStep === step.id
                        ? 'bg-pink-500 text-white'
                        : index < currentStepIndex
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="font-medium">{step.label}</span>
                </button>

                {index < steps.length - 1 && (
                  <div className="w-12 h-0.5 bg-gray-200 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {currentStep === 'template' && (
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            onSelect={setSelectedTemplate}
          />
        )}

        {currentStep === 'url' && (
          <UrlConfigurator
            customUrl={customUrl}
            onUrlChange={setCustomUrl}
          />
        )}

        {currentStep === 'content' && (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Content Editor
            </h2>
            <p className="text-gray-600 mb-6">
              Tato sekce je ve vývoji. Zde budete moci upravit obsah jednotlivých sekcí webu.
            </p>
          </div>
        )}

        {currentStep === 'preview' && (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">👀</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Náhled webu
            </h2>
            <p className="text-gray-600 mb-6">
              Tato sekce je ve vývoji. Zde uvidíte náhled vašeho svatebního webu.
            </p>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            Zpět
          </button>

          <button
            onClick={handleNext}
            disabled={!canGoNext() || currentStepIndex === steps.length - 1}
            className="inline-flex items-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Další
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

