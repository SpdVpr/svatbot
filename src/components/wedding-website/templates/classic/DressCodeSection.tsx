'use client'

import { Shirt, Palette } from 'lucide-react'
import type { DressCodeContent } from '@/types/wedding-website'
import Image from 'next/image'

interface DressCodeSectionProps {
  content: DressCodeContent
}

export default function DressCodeSection({ content }: DressCodeSectionProps) {
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Dress Code Card */}
          {dressCode && (
            <div className="bg-white rounded-2xl p-10 shadow-xl border border-purple-100">
              <div className="flex items-start space-x-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex-shrink-0">
                  <Shirt className="w-8 h-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 font-serif">Dress Code</h3>
                  <p className="text-gray-600 text-lg">
                    {getDressCodeText(dressCode)}
                  </p>
                  {dressCodeDetails && dressCode !== 'custom' && (
                    <p className="text-gray-500 mt-3 italic leading-relaxed">{dressCodeDetails}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Color Palette Card */}
          {colorPalette && colorPalette.length > 0 && (
            <div className="bg-white rounded-2xl p-10 shadow-xl border border-pink-100">
              <div className="flex items-start space-x-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex-shrink-0">
                  <Palette className="w-8 h-8 text-pink-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">Barevná paleta</h3>
                  <div className="flex flex-wrap gap-3">
                    {colorPalette.map((color, index) => (
                      <div key={index} className="flex flex-col items-center gap-2">
                        <div
                          className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                        <span className="text-xs text-gray-500 font-mono">{color}</span>
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
          <div className="mt-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center font-serif">
              Inspirace
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow group"
                >
                  <Image
                    src={image}
                    alt={`Dress code inspirace ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
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

