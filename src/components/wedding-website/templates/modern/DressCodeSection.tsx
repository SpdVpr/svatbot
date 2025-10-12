'use client'

import { Shirt, Palette } from 'lucide-react'
import type { DressCodeContent } from '@/types/wedding-website'
import Image from 'next/image'

interface DressCodeSectionProps {
  content: DressCodeContent
}

export default function ModernDressCodeSection({ content }: DressCodeSectionProps) {
  const { dressCode, dressCodeDetails, colorPalette, images } = content

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Dress Code Card */}
          {dressCode && (
            <div className="bg-gray-50 rounded-lg p-8 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gray-900 rounded-full flex-shrink-0">
                  <Shirt className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Dress Code</h3>
                  <p className="text-gray-700 text-lg">
                    {getDressCodeText(dressCode)}
                  </p>
                  {dressCodeDetails && dressCode !== 'custom' && (
                    <p className="text-gray-600 mt-2 italic">{dressCodeDetails}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Color Palette Card */}
          {colorPalette && colorPalette.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-8 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gray-900 rounded-full flex-shrink-0">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Barevná paleta</h3>
                  <div className="flex flex-wrap gap-3">
                    {colorPalette.map((color, index) => (
                      <div key={index} className="flex flex-col items-center gap-2">
                        <div
                          className="w-14 h-14 rounded-lg shadow-md"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                        <span className="text-xs text-gray-600 font-mono">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Inspiration Gallery */}
        {images && images.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Inspirace
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
                >
                  <Image
                    src={image}
                    alt={`Dress code inspirace ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

