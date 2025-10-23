'use client'

import { Shirt, Palette } from 'lucide-react'
import type { DressCodeContent } from '@/types/wedding-website'

interface DressCodeSectionProps {
  content: DressCodeContent
}

export default function ModernDressCodeSection({ content }: DressCodeSectionProps) {
  const { dressCode, dressCodeDetails, colors } = content

  // Legacy support - migrate old data structure
  const colorItems = colors || []

  const getDressCodeText = (code: string) => {
    switch (code) {
      case 'formal':
        return 'Formální (oblek/večerní šaty)'
      case 'semi-formal':
        return 'Poloformální (košile/koktejlové šaty)'
      case 'casual':
        return 'Neformální'
      case 'cocktail':
        return 'Koktejlové oblečení'
      case 'black-tie':
        return 'Black tie'
      case 'custom':
        return dressCodeDetails || 'Vlastní požadavky'
      default:
        return code
    }
  }

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Dress Code & Barevná paleta
          </h2>
          <div className="w-20 h-1 bg-gray-900 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {dressCodeDetails || 'Pomozte nám vytvořit harmonický vzhled naší svatby'}
          </p>
        </div>

        {/* Color Palette with Inspiration Images */}
        {colorItems.length > 0 && (
          <div className="space-y-10">

            {colorItems.map((colorItem, colorIndex) => (
              <div key={colorIndex} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                {/* Color Header - Centered */}
                <div className="flex flex-col items-center gap-3 mb-8">
                  <div
                    className="w-14 h-14 rounded-lg shadow-md"
                    style={{ backgroundColor: colorItem.color }}
                  />
                  {colorItem.name && (
                    <h4 className="text-xl font-bold text-gray-900 text-center">{colorItem.name}</h4>
                  )}
                </div>

                {/* Color Images - Max 3 per row with rectangular aspect ratio */}
                {colorItem.images && colorItem.images.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {colorItem.images.map((image, imageIndex) => (
                      <div
                        key={imageIndex}
                        className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
                      >
                        <div className="relative w-full" style={{ paddingBottom: '75%' }}>
                          <img
                            src={image}
                            alt={`${colorItem.name || 'Color'} inspirace ${imageIndex + 1}`}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

