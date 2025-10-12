'use client'

import { Shirt, Palette } from 'lucide-react'
import type { DressCodeContent } from '@/types/wedding-website'

interface DressCodeSectionProps {
  content: DressCodeContent
}

export default function DressCodeSection({ content }: DressCodeSectionProps) {
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
    <section className="py-20 bg-gradient-to-b from-amber-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4 font-serif">
            Dress Code & Barevná paleta
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
            Pomozte nám vytvořit harmonický vzhled naší svatby
          </p>
        </div>

        {/* Dress Code Info */}
        {dressCode && (
          <div className="bg-white rounded-2xl p-10 shadow-xl border border-purple-100 mb-12">
            <div className="flex items-start space-x-4">
              <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex-shrink-0">
                <Shirt className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 font-serif">Dress Code</h3>
                <p className="text-gray-600 text-lg">
                  {getDressCodeText(dressCode)}
                </p>
                {dressCodeDetails && (
                  <p className="text-gray-500 mt-3 italic leading-relaxed">{dressCodeDetails}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Color Palette with Inspiration Images */}
        {colorItems.length > 0 && (
          <div className="space-y-12">
            <h3 className="text-3xl font-bold text-gray-900 text-center font-serif mb-8">
              Barevná paleta & Inspirace
            </h3>

            {colorItems.map((colorItem, colorIndex) => (
              <div key={colorIndex} className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                {/* Color Header - Centered */}
                <div className="flex flex-col items-center gap-3 mb-8">
                  <div
                    className="w-16 h-16 rounded-2xl border-4 border-white shadow-lg"
                    style={{ backgroundColor: colorItem.color }}
                  />
                  {colorItem.name && (
                    <h4 className="text-2xl font-bold text-gray-900 font-serif text-center">{colorItem.name}</h4>
                  )}
                </div>

                {/* Color Images - Max 3 per row */}
                {colorItem.images && colorItem.images.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {colorItem.images.map((image, imageIndex) => (
                      <div
                        key={imageIndex}
                        className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
                      >
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={image}
                            alt={`${colorItem.name || 'Color'} inspirace ${imageIndex + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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

