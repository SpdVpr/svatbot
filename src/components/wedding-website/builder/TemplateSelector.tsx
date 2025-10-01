'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import type { TemplateType, TemplateConfig } from '@/types/wedding-website'

interface TemplateSelectorProps {
  selectedTemplate: TemplateType | null
  onSelect: (template: TemplateType) => void
}

// Konfigurace šablon
const TEMPLATES: TemplateConfig[] = [
  {
    id: 'classic-elegance',
    name: 'Classic Elegance',
    description: 'Elegantní a časeless design s jemnými detaily',
    thumbnail: '/templates/classic-elegance.jpg',
    category: 'Elegantní',
    colors: {
      primary: '#D4AF37',
      secondary: '#F7E7CE',
      accent: '#8B7355',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Cormorant',
    },
    features: [
      'Serif fonty',
      'Zlaté akcenty',
      'Ornamentální prvky',
      'Jemné animace',
    ],
    suitableFor: [
      'Tradiční svatby',
      'Zámecké svatby',
      'Formální události',
    ],
  },
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    description: 'Čistý a minimalistický design s moderním vzhledem',
    thumbnail: '/templates/modern-minimalist.jpg',
    category: 'Moderní',
    colors: {
      primary: '#1A1A1A',
      secondary: '#F5F5F5',
      accent: '#FF6B6B',
    },
    fonts: {
      heading: 'Montserrat',
      body: 'Inter',
    },
    features: [
      'Sans-serif fonty',
      'Geometrické tvary',
      'Plochý design',
      'Minimální animace',
    ],
    suitableFor: [
      'Moderní svatby',
      'Městské svatby',
      'Neformální události',
    ],
  },
]

export default function TemplateSelector({ selectedTemplate, onSelect }: TemplateSelectorProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<TemplateType | null>(null)

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TEMPLATES.map((template) => {
          const isSelected = selectedTemplate === template.id
          const isHovered = hoveredTemplate === template.id

          return (
            <div
              key={template.id}
              className={`relative bg-white rounded-lg border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-pink-500 shadow-lg'
                  : 'border-gray-200 hover:border-pink-300 hover:shadow-md'
              }`}
              onClick={() => onSelect(template.id)}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              {/* Selected badge */}
              {isSelected && (
                <div className="absolute top-4 right-4 z-10 bg-pink-500 text-white rounded-full p-2">
                  <Check className="w-5 h-5" />
                </div>
              )}

              {/* Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
                {/* Placeholder - později nahradíme skutečným obrázkem */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">
                      {template.id === 'classic-elegance' ? '💍' : '⚪'}
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
                        <span className="w-1 h-1 bg-pink-500 rounded-full"></span>
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
                        className="px-2 py-1 bg-pink-50 text-pink-600 text-xs rounded"
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
                <div className="absolute inset-0 bg-pink-500 bg-opacity-5 rounded-lg pointer-events-none" />
              )}
            </div>
          )
        })}
      </div>

      {/* Coming soon templates */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">
          🚧 Připravujeme další šablony
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Rustic Romance', icon: '🌾' },
            { name: 'Bohemian Dream', icon: '🌸' },
            { name: 'Garden Party', icon: '🌿' },
            { name: 'Beach Vibes', icon: '🌊' },
          ].map((template, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 text-center border border-gray-200 opacity-50"
            >
              <div className="text-3xl mb-2">{template.icon}</div>
              <div className="text-sm font-medium text-gray-600">
                {template.name}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Již brzy
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

