'use client'

import { DressCodeContent } from '@/types/wedding-website'
import Image from 'next/image'
import SectionTitle from './SectionTitle'

interface DressCodeSectionProps {
  content: DressCodeContent
}

export default function DressCodeSection({ content }: DressCodeSectionProps) {
  if (!content.enabled) {
    return null
  }

  const hasColors = content.colors && content.colors.length > 0

  return (
    <div id="dresscode" className="py-20 bg-white">
      <SectionTitle title="Dress Code & Barevná paleta" />

      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Dress Code */}
          {content.dressCode && (
            <div className="text-center mb-12">
              <h3 className="text-3xl mb-4 text-gray-800" style={{ fontFamily: 'Great Vibes, cursive' }}>
                {content.dressCode}
              </h3>
              {content.dressCodeDetails && (
                <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Muli, sans-serif' }}>
                  {content.dressCodeDetails}
                </p>
              )}
            </div>
          )}

          {/* Color Palette */}
          {hasColors && (
            <div className="mt-12">
              <h3 className="text-2xl text-center mb-8 text-gray-800" style={{ fontFamily: 'Great Vibes, cursive' }}>
                {content.dressCode || 'Inspirace pro oblečení'}
              </h3>

              {/* Each color in its own column with images below */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {content.colors?.map((colorItem, index) => (
                  <div key={index}>
                    {/* Color circle at top of column */}
                    <div className="text-center mb-6">
                      <div
                        className="w-32 h-32 rounded-full mx-auto mb-4 shadow-lg border-4 border-white"
                        style={{ backgroundColor: colorItem.color }}
                      />
                      {colorItem.name && (
                        <p className="text-gray-700 font-medium" style={{ fontFamily: 'Muli, sans-serif' }}>
                          {colorItem.name}
                        </p>
                      )}
                    </div>

                    {/* Images for this color stacked vertically */}
                    {colorItem.images && colorItem.images.length > 0 && (
                      <div className="space-y-4">
                        {colorItem.images.map((img, imgIndex) => (
                          <div key={imgIndex} className="relative w-full h-[450px] rounded overflow-hidden shadow-md">
                            <Image
                              src={img}
                              alt={`${colorItem.name || 'Color'} inspiration ${imgIndex + 1}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

