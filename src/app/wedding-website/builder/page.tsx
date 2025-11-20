'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useWeddingStore } from '@/stores/weddingStore'
import { useWeddingWebsite } from '@/hooks/useWeddingWebsite'
import { useDemoLock } from '@/hooks/useDemoLock'
import { ArrowLeft, ArrowRight, Save, Eye, Rocket, Home, ExternalLink } from 'lucide-react'
import TemplateSelector from '@/components/wedding-website/builder/TemplateSelector'
import ColorThemeSelector from '@/components/wedding-website/builder/ColorThemeSelector'
import UrlConfigurator from '@/components/wedding-website/builder/UrlConfigurator'
import ContentEditor from '@/components/wedding-website/builder/ContentEditor'
import DomainStatus from '@/components/wedding-website/DomainStatus'
import ClassicEleganceTemplate from '@/components/wedding-website/templates/ClassicEleganceTemplate'
import ModernMinimalistTemplate from '@/components/wedding-website/templates/ModernMinimalistTemplate'
import RomanticBohoTemplate from '@/components/wedding-website/templates/RomanticBohoTemplate'
import WinterEleganceTemplate from '@/components/wedding-website/templates/WinterEleganceTemplate'
import TwainLoveTemplate from '@/components/wedding-website/templates/TwainLoveTemplate'
import type { TemplateType, WebsiteContent, WeddingWebsite } from '@/types/wedding-website'

type Step = 'url' | 'template' | 'content' | 'preview'

export default function WeddingWebsiteBuilderPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { currentWedding: wedding } = useWeddingStore()
  const { website, createWebsite, updateWebsite, publishWebsite, loading } = useWeddingWebsite()
  const { withDemoCheck, canMakeChanges, isLocked } = useDemoLock()

  const [currentStep, setCurrentStep] = useState<Step>('url')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(
    website?.template || null
  )
  const [colorTheme, setColorTheme] = useState<string>(website?.style?.colorTheme || 'default')
  const [customColors, setCustomColors] = useState(website?.style?.customColors || {
    name: 'Vlastní',
    primary: '#f59e0b',
    secondary: '#f43f5e',
    accent: '#fbbf24',
    bgGradientFrom: '#fef3c7',
    bgGradientTo: '#fecdd3',
  })
  const [customUrl, setCustomUrl] = useState(website?.customUrl || '')
  const [isUrlAvailable, setIsUrlAvailable] = useState(false)
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
      showDrinks: true,
      showSideDishes: true,
      showDesserts: true
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
      setColorTheme(website.style?.colorTheme || 'default')
      setCustomColors(website.style?.customColors || {
        name: 'Vlastní',
        primary: '#f59e0b',
        secondary: '#f43f5e',
        accent: '#fbbf24',
        bgGradientFrom: '#fef3c7',
        bgGradientTo: '#fecdd3',
      })
      setCustomUrl(website.customUrl)
      setIsUrlAvailable(true) // Pokud web existuje, URL je dostupná
      // Ensure dressCode exists in content (for backward compatibility)
      setContent({
        ...website.content,
        dressCode: website.content.dressCode || { enabled: false }
      })
      // Pokud už web existuje a jsme na url kroku, přejdi na template step
      if (currentStep === 'url' && website.customUrl) {
        setCurrentStep('template')
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' })
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
    if (currentStep === 'url') return customUrl.length >= 3 && isUrlAvailable
    if (currentStep === 'template') return selectedTemplate !== null
    return true
  }

  const handleNext = async () => {
    // Pokud jsme na URL kroku a URL je vyplněné, uložíme ho
    if (currentStep === 'url' && customUrl.length >= 3 && !website) {
      setIsSaving(true)
      try {
        // Vytvoříme základní web s URL a výchozí šablonou
        await withDemoCheck(async () => {
          await createWebsite({
            customUrl,
            template: 'twain-love', // Výchozí šablona
            content,
            style: {
              colorTheme,
              customColors: colorTheme === 'custom' ? customColors : undefined,
            },
          })
        })
        // Po vytvoření přejdeme na výběr šablony
        setCurrentStep('template')
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (error) {
        if (error instanceof Error && error.message === 'DEMO_LOCKED') {
          // Demo locked - don't show error
          return
        }
        console.error('Error creating website:', error)
      } finally {
        setIsSaving(false)
      }
      return
    }

    // Automaticky uložit před přechodem na další krok (pokud už web existuje)
    if (website && selectedTemplate && customUrl) {
      setIsSaving(true)
      try {
        await withDemoCheck(async () => {
          await updateWebsite({
            template: selectedTemplate,
            customUrl,
            content,
            style: {
              ...website?.style,
              colorTheme,
              customColors: colorTheme === 'custom' ? customColors : undefined,
            },
          })
        })
      } catch (error) {
        if (error instanceof Error && error.message === 'DEMO_LOCKED') {
          // Demo locked - don't show error
          return
        }
        console.error('Error saving before next step:', error)
      } finally {
        setIsSaving(false)
      }
    }

    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      const nextStep = steps[nextIndex].id
      setCurrentStep(nextStep)

      // Pokud přecházíme na preview krok, otevři web v novém okně
      if (nextStep === 'preview' && customUrl) {
        window.open(`https://${customUrl}.svatbot.cz`, '_blank')
      }

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id)
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Pokud jsme na prvním kroku, vrať se na /wedding-website
      router.push('/wedding-website')
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
      await withDemoCheck(async () => {
        if (!website) {
          // Vytvoření nového webu
          await createWebsite({
            customUrl,
            template: selectedTemplate,
            content,
            style: {
              colorTheme,
              customColors: colorTheme === 'custom' ? customColors : undefined,
            },
          })
        } else {
          // Aktualizace existujícího webu
          await updateWebsite({
            template: selectedTemplate,
            customUrl,
            content,
            style: {
              ...website?.style,
              colorTheme,
              customColors: colorTheme === 'custom' ? customColors : undefined,
            },
          })
        }
      })
    } catch (error) {
      if (error instanceof Error && error.message === 'DEMO_LOCKED') {
        // Demo locked - alert already shown
        return
      }
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
        console.log('💾 Saving template change:', template)
        await withDemoCheck(async () => {
          await updateWebsite({
            template,
            customUrl,
            content,
            style: {
              ...website?.style,
              colorTheme,
              customColors: colorTheme === 'custom' ? customColors : undefined,
            },
          })
        })
        console.log('✅ Template saved successfully')
      } catch (error) {
        if (error instanceof Error && error.message === 'DEMO_LOCKED') {
          // Demo locked - alert already shown, revert template selection
          setSelectedTemplate(website.template)
          return
        }
        console.error('❌ Error updating template:', error)
        alert('Chyba při ukládání šablony. Zkuste to prosím znovu.')
      } finally {
        setIsSaving(false)
      }
    }
  }

  // Handler pro změnu barevné palety
  const handleColorThemeChange = async (theme: string) => {
    setColorTheme(theme)

    // Pokud už web existuje, automaticky uložíme změnu barevné palety
    if (website) {
      setIsSaving(true)
      try {
        console.log('💾 Saving color theme change:', theme)
        await withDemoCheck(async () => {
          await updateWebsite({
            style: {
              ...website?.style,
              colorTheme: theme,
              customColors: theme === 'custom' ? customColors : undefined,
            },
          })
        })
        console.log('✅ Color theme saved successfully')
      } catch (error) {
        if (error instanceof Error && error.message === 'DEMO_LOCKED') {
          // Demo locked - alert already shown, revert color theme selection
          setColorTheme(website.style?.colorTheme || 'default')
          return
        }
        console.error('❌ Error updating color theme:', error)
        alert('Chyba při ukládání barevné palety. Zkuste to prosím znovu.')
      } finally {
        setIsSaving(false)
      }
    }
  }

  // Handler pro změnu vlastních barev
  const handleCustomColorsChange = async (colors: any) => {
    setCustomColors(colors)

    // Pokud už web existuje a máme vybranou custom paletu, automaticky uložíme změnu
    if (website && colorTheme === 'custom') {
      setIsSaving(true)
      try {
        console.log('💾 Saving custom colors change:', colors)
        await withDemoCheck(async () => {
          await updateWebsite({
            style: {
              ...website?.style,
              colorTheme: 'custom',
              customColors: colors,
            },
          })
        })
        console.log('✅ Custom colors saved successfully')
      } catch (error) {
        if (error instanceof Error && error.message === 'DEMO_LOCKED') {
          // Demo locked - alert already shown, revert custom colors
          setCustomColors(website.style?.customColors || customColors)
          return
        }
        console.error('❌ Error updating custom colors:', error)
        // Nebudeme zobrazovat alert při každé změně barvy, jen logujeme
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
      await withDemoCheck(async () => {
        await publishWebsite()
      })
      console.log('✅ Website published successfully!')

      // Otevři web v novém okně
      window.open(`https://${customUrl}.svatbot.cz`, '_blank')

      // Přejdi na preview krok po publikování
      setCurrentStep('preview')
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      if (error instanceof Error && error.message === 'DEMO_LOCKED') {
        // Demo locked - alert already shown
        return
      }
      console.error('❌ Error publishing website:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
          <p className="text-gray-600">Načítání...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="mx-auto px-4 py-4" style={{ maxWidth: '1240px' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/wedding-website')}
                className="inline-flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                title="Zpět na svatební web"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Zpět</span>
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
                disabled={Boolean(isSaving || !selectedTemplate || !customUrl.trim() || isLocked)}
                className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Ukládání...' : 'Uložit'}
              </button>

              {website && !website.isPublished && (
                <button
                  onClick={handlePublish}
                  disabled={Boolean(isPublishing || isLocked)}
                  className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              // Umožnit kliknutí na všechny kroky pokud už web existuje
              const isClickable = website || index === 0

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => {
                      if (!isClickable) return
                      // Pokud je to preview krok, otevři web v novém okně
                      if (step.id === 'preview' && customUrl) {
                        window.open(`https://${customUrl}.svatbot.cz`, '_blank')
                      } else {
                        setCurrentStep(step.id)
                        // Scroll to top
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }
                    }}
                    disabled={Boolean(!isClickable)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      currentStep === step.id
                        ? 'bg-primary-100 text-primary-700'
                        : isClickable
                        ? 'text-gray-700 hover:bg-gray-100 cursor-pointer'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                        currentStep === step.id
                          ? 'bg-primary-500 text-white'
                          : isClickable
                          ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
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
      <div className="mx-auto px-4 py-8" style={{ maxWidth: '1240px' }}>
        {currentStep === 'url' && (
          <UrlConfigurator
            customUrl={customUrl}
            onUrlChange={setCustomUrl}
            onAvailabilityChange={setIsUrlAvailable}
            disabled={Boolean(isLocked)}
          />
        )}

        {currentStep === 'template' && (
          <div className="space-y-8">
            {/* Status Messages */}
            {isSaving && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-yellow-600"></div>
                  <p className="text-sm text-yellow-800">
                    <strong>Ukládám změny...</strong>
                  </p>
                </div>
              </div>
            )}
            {website && !isSaving && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-sm text-primary-800">
                  <strong>Tip:</strong> Změna šablony nebo barevné palety zachová všechna vaše data a nastavení.
                  Změní se pouze design webu na adrese <strong>{customUrl}.svatbot.cz</strong>
                </p>
              </div>
            )}

            {/* Template Selection Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold">
                    1
                  </span>
                  Vyberte šablonu webu
                </h3>
                <p className="text-sm text-gray-600 mt-1 ml-10">
                  Zvolte design, který nejlépe odpovídá stylu vaší svatby
                </p>
              </div>
              <div className="p-6">
                <TemplateSelector
                  selectedTemplate={selectedTemplate}
                  onSelect={handleTemplateChange}
                  disabled={Boolean(isLocked)}
                />
              </div>
            </div>

            {/* Color Theme Selection Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold">
                    2
                  </span>
                  Nastavte barevnou paletu
                </h3>
                <p className="text-sm text-gray-600 mt-1 ml-10">
                  Vyberte předpřipravenou paletu nebo si vytvořte vlastní barvy
                </p>
              </div>
              <div className="p-6">
                <ColorThemeSelector
                  selectedTheme={colorTheme}
                  customColors={customColors}
                  onSelect={handleColorThemeChange}
                  onCustomColorsChange={handleCustomColorsChange}
                  disabled={Boolean(isLocked)}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 'content' && (
          <ContentEditor
            content={content}
            onContentChange={setContent}
            onSave={handleSave}
            onExpandedChange={setIsSectionExpanded}
            disabled={Boolean(isLocked)}
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
              <div className="flex items-center justify-between p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-primary-900 mb-1">
                    URL adresa vašeho webu:
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg text-primary-600">
                      https://{customUrl}.svatbot.cz
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
                  href={`https://${customUrl}.svatbot.cz`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
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

              <div className="max-h-screen overflow-y-auto relative">
                <style jsx global>{`
                  /* Fix navigation positioning in preview */
                  .wedding-preview-container nav {
                    position: absolute !important;
                  }
                `}</style>
                <div className="wedding-preview-container">
                  {selectedTemplate === 'classic-elegance' && (
                    <ClassicEleganceTemplate
                      website={{
                        id: 'preview',
                        weddingId: wedding?.id || 'preview',
                        customUrl,
                        template: selectedTemplate,
                        content,
                        style: {
                          ...website?.style,
                          colorTheme,
                          customColors: colorTheme === 'custom' ? customColors : undefined,
                        },
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
                        style: {
                          ...website?.style,
                          colorTheme,
                          customColors: colorTheme === 'custom' ? customColors : undefined,
                        },
                        isPublished: false,
                        createdAt: new Date(),
                        updatedAt: new Date()
                      } as WeddingWebsite}
                    />
                  )}

                  {selectedTemplate === 'romantic-boho' && (
                    <RomanticBohoTemplate
                      website={{
                        id: 'preview',
                        weddingId: wedding?.id || 'preview',
                        customUrl,
                        template: selectedTemplate,
                        content,
                        style: {
                          ...website?.style,
                          colorTheme,
                          customColors: colorTheme === 'custom' ? customColors : undefined,
                        },
                        isPublished: false,
                        createdAt: new Date(),
                        updatedAt: new Date()
                      } as WeddingWebsite}
                    />
                  )}

                  {selectedTemplate === 'winter-elegance' && (
                    <WinterEleganceTemplate
                      website={{
                        id: 'preview',
                        weddingId: wedding?.id || 'preview',
                        customUrl,
                        template: selectedTemplate,
                        content,
                        style: {
                          ...website?.style,
                          colorTheme,
                          customColors: colorTheme === 'custom' ? customColors : undefined,
                        },
                        isPublished: false,
                        createdAt: new Date(),
                        updatedAt: new Date()
                      } as WeddingWebsite}
                    />
                  )}

                  {selectedTemplate === 'twain-love' && (
                    <TwainLoveTemplate
                      website={{
                        id: 'preview',
                        weddingId: wedding?.id || 'preview',
                        customUrl,
                        template: selectedTemplate,
                        content,
                        style: {
                          ...website?.style,
                          colorTheme,
                          customColors: colorTheme === 'custom' ? customColors : undefined,
                        },
                        isPublished: false,
                        createdAt: new Date(),
                        updatedAt: new Date()
                      } as WeddingWebsite}
                    />
                  )}

                  {(selectedTemplate === 'luxury-gold' || selectedTemplate === 'garden-fresh') && (
                    <div className="flex items-center justify-center min-h-screen bg-gray-50">
                      <div className="text-center p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          Šablona se připravuje
                        </h3>
                        <p className="text-gray-600">
                          Tato šablona bude brzy k dispozici. Zatím můžete použít jinou šablonu.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
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
              className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300"
            >
              <ArrowLeft className="w-5 h-5" />
              {currentStepIndex === 0 ? 'Zpět na přehled' : 'Zpět'}
            </button>

            {currentStepIndex === steps.length - 1 ? (
              <div className="flex items-center gap-3">
                {!website?.isPublished && (
                  <button
                    onClick={handlePublish}
                    disabled={Boolean(isPublishing || !canGoNext() || isLocked)}
                    className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={Boolean(!canGoNext() || isSaving || isLocked)}
                className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

