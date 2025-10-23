'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useWeddingStore } from '@/stores/weddingStore'
import { useWeddingWebsite } from '@/hooks/useWeddingWebsite'
import { ArrowLeft, ArrowRight, Save, Eye, Rocket, Home, ExternalLink } from 'lucide-react'
import TemplateSelector from '@/components/wedding-website/builder/TemplateSelector'
import UrlConfigurator from '@/components/wedding-website/builder/UrlConfigurator'
import ContentEditor from '@/components/wedding-website/builder/ContentEditor'
import DomainStatus from '@/components/wedding-website/DomainStatus'
import ClassicEleganceTemplate from '@/components/wedding-website/templates/ClassicEleganceTemplate'
import ModernMinimalistTemplate from '@/components/wedding-website/templates/ModernMinimalistTemplate'
import type { TemplateType, WebsiteContent, WeddingWebsite } from '@/types/wedding-website'

type Step = 'url' | 'template' | 'content' | 'preview'

export default function WeddingWebsiteBuilderPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { currentWedding: wedding } = useWeddingStore()
  const { website, createWebsite, updateWebsite, publishWebsite, loading } = useWeddingWebsite()

  const [currentStep, setCurrentStep] = useState<Step>('url')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(
    website?.template || null
  )
  const [customUrl, setCustomUrl] = useState(website?.customUrl || '')
  const [content, setContent] = useState<WebsiteContent>(website?.content || {
    hero: {
      bride: wedding?.brideName || '',
      groom: wedding?.groomName || '',
      weddingDate: wedding?.weddingDate || new Date(),
      tagline: '',
      mainImage: undefined
    },
    story: { enabled: false },
    info: { enabled: true },
    dressCode: { enabled: false },
    schedule: { enabled: false, items: [] },
    rsvp: { enabled: true, mealSelection: false, plusOneAllowed: true, songRequests: false },
    accommodation: {
      enabled: false,
      showPrices: true,
      showAvailability: true
    },
    gift: { enabled: false },
    gallery: { enabled: false, images: [], allowGuestUploads: false },
    contact: { enabled: true },
    faq: { enabled: false, items: [] },
    menu: {
      enabled: false,
      title: 'Svatební menu',
      description: 'Připravili jsme pro vás výběr chutných jídel a nápojů.',
      showCategories: true,
      showDietaryInfo: true,
      showDrinks: true
    },
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isSectionExpanded, setIsSectionExpanded] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  useEffect(() => {
    if (website) {
      setSelectedTemplate(website.template)
      setCustomUrl(website.customUrl)
      // Ensure dressCode exists in content (for backward compatibility)
      setContent({
        ...website.content,
        dressCode: website.content.dressCode || { enabled: false }
      })
      // Pokud už web existuje a jsme na url kroku, přejdi na template step
      if (currentStep === 'url' && website.customUrl) {
        setCurrentStep('template')
      }
    }
  }, [website])

  const steps: { id: Step; label: string; description: string }[] = [
    { id: 'url', label: 'URL adresa', description: 'Nastavte URL' },
    { id: 'template', label: 'Šablona', description: 'Vyberte design' },
    { id: 'content', label: 'Obsah', description: 'Vyplňte informace' },
    { id: 'preview', label: 'Náhled', description: 'Zkontrolujte a publikujte' },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)
  const canGoNext = () => {
    if (currentStep === 'url') return customUrl.length >= 3
    if (currentStep === 'template') return selectedTemplate !== null
    return true
  }

  const handleNext = async () => {
    // Pokud jsme na URL kroku a URL je vyplněné, uložíme ho
    if (currentStep === 'url' && customUrl.length >= 3 && !website) {
      setIsSaving(true)
      try {
        // Vytvoříme základní web s URL a výchozí šablonou
        await createWebsite({
          customUrl,
          template: 'classic-elegance', // Výchozí šablona
          content,
        })
        // Po vytvoření přejdeme na výběr šablony
        setCurrentStep('template')
      } catch (error) {
        console.error('Error creating website:', error)
      } finally {
        setIsSaving(false)
      }
      return
    }

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

    console.log('💾 Saving website...', {
      dressCodeEnabled: content.dressCode?.enabled,
      dressCodeImagesCount: content.dressCode?.images?.length || 0,
      dressCodeImages: content.dressCode?.images
    })

    setIsSaving(true)
    try {
      if (!website) {
        // Vytvoření nového webu
        await createWebsite({
          customUrl,
          template: selectedTemplate,
          content,
        })
      } else {
        // Aktualizace existujícího webu
        await updateWebsite({
          template: selectedTemplate,
          customUrl,
          content,
        })
      }
    } catch (error) {
      console.error('Error saving website:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Nová funkce pro změnu šablony
  const handleTemplateChange = async (template: TemplateType) => {
    setSelectedTemplate(template)

    // Pokud už web existuje, automaticky uložíme změnu šablony
    if (website) {
      setIsSaving(true)
      try {
        await updateWebsite({
          template,
          customUrl,
          content,
        })
      } catch (error) {
        console.error('Error updating template:', error)
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handlePublish = async () => {
    if (!website) {
      return
    }

    console.log('🚀 Starting website publication process...')
    console.log('📄 Website data:', website)
    console.log('🔗 Custom URL:', customUrl)

    setIsPublishing(true)
    try {
      console.log('📞 Calling publishWebsite hook...')
      await publishWebsite()
      console.log('✅ Website published successfully!')
      // Přejdi na preview krok po publikování
      setCurrentStep('preview')
    } catch (error) {
      console.error('❌ Error publishing website:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
          <p className="text-gray-600">Načítání...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                title="Zpět na dashboard"
              >
                <Home className="w-5 h-5" />
                <span className="text-sm font-medium">Dashboard</span>
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
            {steps.map((step, index) => {
              // Umožnit kliknutí na kroky, které už byly dokončeny, nebo na template krok pokud už web existuje
              const isClickable = index <= currentStepIndex || (step.id === 'template' && website)

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => isClickable && setCurrentStep(step.id)}
                    disabled={!isClickable}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      currentStep === step.id
                        ? 'bg-pink-100 text-pink-700'
                        : index < currentStepIndex || (step.id === 'template' && website)
                        ? 'text-green-600 hover:bg-green-50 cursor-pointer'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                        currentStep === step.id
                          ? 'bg-pink-500 text-white'
                          : index < currentStepIndex || (step.id === 'template' && website)
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
              )
            })}
          </div>

        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {currentStep === 'url' && (
          <UrlConfigurator
            customUrl={customUrl}
            onUrlChange={setCustomUrl}
          />
        )}

        {currentStep === 'template' && (
          <div className="space-y-6">
            {website && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Změna šablony zachová všechna vaše data a nastavení.
                  Změní se pouze design webu na adrese <strong>{customUrl}.svatbot.cz</strong>
                </p>
              </div>
            )}
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onSelect={handleTemplateChange}
            />
          </div>
        )}

        {currentStep === 'content' && (
          <ContentEditor
            content={content}
            onContentChange={setContent}
            onSave={handleSave}
            onExpandedChange={setIsSectionExpanded}
          />
        )}

        {currentStep === 'preview' && (
          <div className="space-y-6">
            {/* Preview Header */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Náhled webu
                  </h2>
                  <p className="text-gray-600">
                    Takto bude váš svatební web vypadat pro hosty
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500">
                    Šablona: <span className="font-medium">{selectedTemplate}</span>
                  </div>
                </div>
              </div>

              {/* URL and Open Button */}
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-blue-900 mb-1">
                    URL adresa vašeho webu:
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg text-blue-600">
                      https://svatbot.cz/wedding/{customUrl}
                    </span>
                    {website?.isPublished && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Publikováno
                      </span>
                    )}
                  </div>
                </div>
                <a
                  href={`/wedding/${customUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Otevřít web
                </a>
              </div>
            </div>

            {/* Preview Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-600 font-mono">
                    {customUrl}.svatbot.cz
                  </div>
                </div>
              </div>

              <div className="max-h-screen overflow-y-auto">
                {selectedTemplate === 'classic-elegance' && (
                  <ClassicEleganceTemplate
                    website={{
                      id: 'preview',
                      weddingId: wedding?.id || 'preview',
                      customUrl,
                      template: selectedTemplate,
                      content,
                      isPublished: false,
                      createdAt: new Date(),
                      updatedAt: new Date()
                    } as WeddingWebsite}
                  />
                )}

                {selectedTemplate === 'modern-minimalist' && (
                  <ModernMinimalistTemplate
                    website={{
                      id: 'preview',
                      weddingId: wedding?.id || 'preview',
                      customUrl,
                      template: selectedTemplate,
                      content,
                      isPublished: false,
                      createdAt: new Date(),
                      updatedAt: new Date()
                    } as WeddingWebsite}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        {/* Hide navigation buttons when a section is expanded in content editor */}
        {!isSectionExpanded && (
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-5 h-5" />
              Zpět
            </button>

            {currentStepIndex === steps.length - 1 ? (
              <div className="flex items-center gap-3">
                {!website?.isPublished && (
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing || !canGoNext()}
                    className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Rocket className="w-5 h-5" />
                    {isPublishing ? 'Publikování...' : 'Publikovat web'}
                  </button>
                )}

                {website?.isPublished && (
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Web je publikován</span>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canGoNext() || isSaving}
                className="inline-flex items-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStep === 'url' && !website ? (
                  isSaving ? 'Ukládání...' : 'Pokračovat'
                ) : (
                  'Další'
                )}
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

