'use client'

import { Shirt, Palette } from 'lucide-react'
import type { DressCodeContent } from '@/types/wedding-website'
import { useColorTheme } from '../ColorThemeContext'

interface DressCodeSectionProps {
  content: DressCodeContent
}

export default function DressCodeSection({ content }: DressCodeSectionProps) {
  const { theme } = useColorTheme()
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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4 font-serif">
            Dress Code & Barevná paleta
          </h2>
          <div className="w-24 h-1 mx-auto mb-6" style={{ backgroundColor: theme.primary }}></div>
          <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
            {dressCodeDetails || 'Pomozte nám vytvořit harmonický vzhled naší svatby'}
          </p>
        </div>

        {/* Color Palette with Inspiration Images */}
        {colorItems.length > 0 && (
          <div className="space-y-12">
            {colorItems.map((colorItem, colorIndex) => (
              <div key={colorIndex} className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                {/* Color Name - Centered */}
                {colorItem.name && (
                  <div className="text-center mb-8">
                    <h4 className="text-2xl font-bold text-gray-900 font-serif">{colorItem.name}</h4>
                  </div>
                )}

                {/* Color Images - Max 3 per row with portrait aspect ratio and colored border */}
                {colorItem.images && colorItem.images.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {colorItem.images.map((image, imageIndex) => (
                      <div
                        key={imageIndex}
                        className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
                      >
                        <div className="relative w-full" style={{ paddingBottom: '140%' }}>
                          <img
                            src={image}
                            alt={`${colorItem.name || 'Color'} inspirace ${imageIndex + 1}`}
                            className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                          />
                          {/* Colored inset border overlay */}
                          <div
                            className="absolute inset-0 pointer-events-none rounded-xl"
                            style={{
                              boxShadow: `inset 0 0 0 15px ${colorItem.color}`
                            }}
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

