'use client'

import { useState } from 'react'
import { Check, Lock, Crown } from 'lucide-react'
import type { TemplateType, TemplateConfig } from '@/types/wedding-website'
import { useSubscription } from '@/hooks/useSubscription'
import { useIsDemoUser } from '@/hooks/useDemoSettings'
import { useAuthStore } from '@/stores/authStore'
import Link from 'next/link'

interface TemplateSelectorProps {
  selectedTemplate: TemplateType | null
  onSelect: (template: TemplateType) => void
  disabled?: boolean
}

// Konfigurace šablon
const TEMPLATES: TemplateConfig[] = [
  {
    id: 'winter-elegance',
    name: 'Winter Elegance',
    description: 'Elegantní zimní design s jemnými detaily a kamennou paletou',
    thumbnail: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
    category: 'Elegantní',
    colors: {
      primary: '#78716c',
      secondary: '#f5f5f4',
      accent: '#57534e',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
    features: [
      'Serif fonty',
      'Kamenná paleta',
      'Elegantní design',
      'Jemné animace',
    ],
    suitableFor: [
      'Zimní svatby',
      'Elegantní události',
      'Formální svatby',
    ],
  },
  {
    id: 'twain-love',
    name: 'Twain Love',
    description: 'Romantická šablona s animovaným hero sliderem a elegantním designem',
    thumbnail: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',
    category: 'Romantický',
    colors: {
      primary: '#85aaba',
      secondary: '#b2c9d3',
      accent: '#6a8a98',
    },
    fonts: {
      heading: 'Futura',
      body: 'Inter',
    },
    features: [
      'Animovaný hero slider',
      'Countdown odpočítávání',
      'Zigzag story layout',
      'Lightbox galerie',
    ],
    suitableFor: [
      'Romantické svatby',
      'Elegantní události',
      'Moderní svatby',
    ],
  },
  {
    id: 'pretty',
    name: 'Pretty',
    description: 'Krásná šablona s květinovými dekoracemi a elegantním designem',
    thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    category: 'Romantický',
    colors: {
      primary: '#b19a56',
      secondary: '#faf8f3',
      accent: '#e1d9bf',
    },
    fonts: {
      heading: 'Great Vibes',
      body: 'Muli',
    },
    features: [
      'Květinové dekorace',
      'Countdown odpočítávání',
      'Lightbox galerie',
      'Interaktivní RSVP formulář',
    ],
    suitableFor: [
      'Romantické svatby',
      'Jarní svatby',
      'Elegantní události',
    ],
  },
]

export default function TemplateSelector({ selectedTemplate, onSelect, disabled = false }: TemplateSelectorProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<TemplateType | null>(null)
  const { subscription, hasPremiumAccess } = useSubscription()
  const { user } = useAuthStore()
  const { isDemoUser } = useIsDemoUser(user?.id)

  // Get subscription plan details
  const plan = subscription?.plan || 'free_trial'
  const canAccessAllTemplates = hasPremiumAccess || isDemoUser // Demo user má přístup ke všem šablonám

  // First template is free (winter-elegance)
  const FREE_TEMPLATES = ['winter-elegance']

  const isTemplateLocked = (templateId: string) => {
    if (disabled) return true // Lock all templates if disabled
    if (canAccessAllTemplates) return false // Premium nebo demo user má přístup ke všem
    return !FREE_TEMPLATES.includes(templateId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Vyberte šablonu
        </h2>
        <p className="text-gray-600">
          Vyberte si design, který nejlépe odpovídá stylu vaší svatby
        </p>
      </div>

      {/* Premium Info Banner */}
      {!canAccessAllTemplates && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900">
                  Máte přístup k 1 základní šabloně
                </p>
                <p className="text-xs text-amber-700">
                  Upgrade na Premium pro přístup ke všem designům
                </p>
              </div>
            </div>
            <Link
              href="/account?tab=subscription"
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
            >
              Upgrade
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATES.map((template) => {
          const isSelected = selectedTemplate === template.id
          const isHovered = hoveredTemplate === template.id
          const isLocked = isTemplateLocked(template.id)

          return (
            <div
              key={template.id}
              className={`relative bg-white rounded-lg border-2 transition-all ${
                isLocked ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
              } ${
                isSelected
                  ? 'border-primary-500 shadow-lg'
                  : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
              }`}
              onClick={() => !isLocked && onSelect(template.id)}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              {/* Locked overlay */}
              {isLocked && (
                <div className="absolute inset-0 bg-gray-900/50 rounded-lg z-20 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Lock className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-semibold">Premium šablona</p>
                    <Link
                      href="/account?tab=subscription"
                      className="inline-flex items-center space-x-1 mt-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm transition-colors"
                    >
                      <Crown className="w-4 h-4" />
                      <span>Odemknout</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Selected badge */}
              {isSelected && !isLocked && (
                <div className="absolute top-4 right-4 z-10 bg-primary-500 text-white rounded-full p-2">
                  <Check className="w-5 h-5" />
                </div>
              )}

              {/* Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
                {/* Placeholder - později nahradíme skutečným obrázkem */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">
                      💍
                    </div>
                    <div className="text-sm text-gray-500">
                      Náhled šablony
                    </div>
                  </div>
                </div>

                {/* Color palette */}
                <div className="absolute bottom-0 left-0 right-0 flex">
                  <div
                    className="flex-1 h-2"
                    style={{ backgroundColor: template.colors.primary }}
                  />
                  <div
                    className="flex-1 h-2"
                    style={{ backgroundColor: template.colors.secondary }}
                  />
                  <div
                    className="flex-1 h-2"
                    style={{ backgroundColor: template.colors.accent }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {template.name}
                    </h3>
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {template.category}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {template.description}
                </p>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Vlastnosti:
                  </h4>
                  <ul className="space-y-1">
                    {template.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1 h-1 bg-primary-500 rounded-full"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suitable for */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Vhodné pro:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {template.suitableFor.map((item, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-50 text-primary-600 text-xs rounded"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Fonts preview */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-2">Fonty:</div>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-xs text-gray-400">Nadpisy</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {template.fonts.heading}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Text</div>
                      <div className="text-sm text-gray-900">
                        {template.fonts.body}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover overlay */}
              {isHovered && !isSelected && (
                <div className="absolute inset-0 bg-primary-500 bg-opacity-5 rounded-lg pointer-events-none" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

