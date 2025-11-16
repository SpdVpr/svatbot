'use client'

import { useColorTheme } from '../ColorThemeContext'
import { DressCodeContent } from '@/types/wedding-website'
import Image from 'next/image'

interface DressCodeSectionProps {
  content: DressCodeContent
}

export default function DressCodeSection({ content }: DressCodeSectionProps) {
  const { theme } = useColorTheme()

  if (!content.enabled) return null

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-light text-stone-900 mb-6">
            Dress Code
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-stone-400 to-transparent mx-auto mb-8"></div>
          {content.dressCodeDetails && (
            <p className="text-lg italic text-stone-600 leading-relaxed max-w-2xl mx-auto font-serif">
              {content.dressCodeDetails}
            </p>
          )}
        </div>

        {/* Color Palette with Images */}
        {content.colors && content.colors.length > 0 && (
          <div className="space-y-16">
            {content.colors.map((colorItem, colorIndex) => (
              <div key={colorIndex}>
                {/* Color Header */}
                <div className="text-center mb-8">
                  <h4 className="text-lg font-light text-stone-900 mb-6">
                    {colorItem.name || 'Barva'}
                  </h4>
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-full shadow-lg"
                      style={{ backgroundColor: colorItem.color }}
                    ></div>
                  </div>
                </div>

                {/* Inspiration Images */}
                {colorItem.images && colorItem.images.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {colorItem.images.map((image, imageIndex) => (
                      <div
                        key={imageIndex}
                        className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="aspect-[3/4] relative">
                          <Image
                            src={image}
                            alt={`${colorItem.name} inspirace ${imageIndex + 1}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-white text-sm font-semibold">
                            {colorItem.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Legacy Color Palette (fallback) */}
        {(!content.colors || content.colors.length === 0) && content.colorPalette && content.colorPalette.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {content.colorPalette.map((color, index) => (
              <div key={index} className="text-center">
                <div className="flex flex-col items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-full shadow-lg"
                    style={{ backgroundColor: color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legacy Images (fallback) */}
        {(!content.colors || content.colors.length === 0) && content.images && content.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {content.images.map((image, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[3/4] relative">
                  <Image
                    src={image}
                    alt={`Dress code inspirace ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dress Code Text */}
        {content.dressCode && (
          <div className="text-center mt-12">
            <p className="text-stone-600 text-lg">
              {content.dressCode}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

