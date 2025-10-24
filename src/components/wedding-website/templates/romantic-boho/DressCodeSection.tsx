'use client'

import { Shirt, Palette } from 'lucide-react'
import type { DressCodeContent } from '@/types/wedding-website'

interface DressCodeSectionProps {
  content: DressCodeContent
}

export default function DressCodeSection({ content }: DressCodeSectionProps) {
  if (!content.enabled) return null

  return (
    <section className="relative py-24 bg-gradient-to-br from-rose-50 via-amber-50 to-pink-50 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-rose-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-amber-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-300 rounded-full blur-xl opacity-50"></div>
              <div className="relative bg-gradient-to-br from-rose-100 to-pink-100 rounded-full p-5">
                <Shirt className="w-10 h-10 text-rose-600" />
              </div>
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Dress Code
          </h2>
          {content.dressCode && (
            <p className="text-2xl text-rose-600 font-semibold mb-2">{content.dressCode}</p>
          )}
          {content.dressCodeDetails && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{content.dressCodeDetails}</p>
          )}
        </div>

        {/* Color Palette */}
        {content.colors && content.colors.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Palette className="w-6 h-6 text-amber-600" />
              <h3 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                Barevná inspirace
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {content.colors.map((colorItem, index) => (
                <div key={index} className="group">
                  <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                    {/* Color swatch */}
                    <div
                      className="h-48 transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundColor: colorItem.color }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Color name */}
                    {colorItem.name && (
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg">
                          <p className="text-gray-800 font-bold text-center">{colorItem.name}</p>
                          <p className="text-gray-600 text-sm text-center">{colorItem.color}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Images for this color */}
                  {colorItem.images && colorItem.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {colorItem.images.slice(0, 4).map((image, imgIndex) => (
                        <div key={imgIndex} className="relative overflow-hidden rounded-xl aspect-square group/img">
                          <img
                            src={image}
                            alt={`${colorItem.name || 'Color'} inspiration ${imgIndex + 1}`}
                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover/img:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legacy images support */}
        {content.images && content.images.length > 0 && (!content.colors || content.colors.length === 0) && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {content.images.map((image, index) => (
              <div key={index} className="relative overflow-hidden rounded-2xl aspect-[3/4] group shadow-xl">
                <img
                  src={image}
                  alt={`Dress code inspiration ${index + 1}`}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Decorative corners */}
                <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom note */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-white rounded-3xl px-8 py-6 shadow-xl border-2 border-rose-100">
            <p className="text-gray-700 text-lg">
              <span className="font-bold text-rose-600">Tip:</span> Nebojte se být kreativní a vyjádřit svůj styl! 💃🕺
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

