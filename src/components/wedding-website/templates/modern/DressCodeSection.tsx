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
            Pomozte nám vytvořit harmonický vzhled naší svatby
          </p>
        </div>

        {/* Dress Code Info */}
        {dressCode && (
          <div className="bg-gray-50 rounded-lg p-8 hover:shadow-md transition-shadow mb-12">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gray-900 rounded-full flex-shrink-0">
                <Shirt className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Dress Code</h3>
                <p className="text-gray-700 text-lg">
                  {getDressCodeText(dressCode)}
                </p>
                {dressCodeDetails && (
                  <p className="text-gray-600 mt-2 italic">{dressCodeDetails}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Color Palette with Inspiration Images */}
        {colorItems.length > 0 && (
          <div className="space-y-10">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Barevná paleta & Inspirace
            </h3>

            {colorItems.map((colorItem, colorIndex) => (
              <div key={colorIndex} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                {/* Color Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-16 h-16 rounded-lg shadow-md flex-shrink-0"
                    style={{ backgroundColor: colorItem.color }}
                  />
                  <div>
                    {colorItem.name && (
                      <h4 className="text-xl font-bold text-gray-900">{colorItem.name}</h4>
                    )}
                    <p className="text-gray-600 font-mono text-sm">{colorItem.color}</p>
                  </div>
                </div>

                {/* Color Images */}
                {colorItem.images && colorItem.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {colorItem.images.map((image, imageIndex) => (
                      <div
                        key={imageIndex}
                        className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
                      >
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={image}
                            alt={`${colorItem.name || 'Color'} inspirace ${imageIndex + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

