'use client'

import { DressCodeContent } from '@/types/wedding-website'
import SectionTitle from './SectionTitle'

interface DressCodeSectionProps {
  content: DressCodeContent
}

export default function DressCodeSection({ content }: DressCodeSectionProps) {
  if (!content.enabled) return null

  return (
    <section id="dressCode" className="py-20 relative" style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #fdfcf9 50%, #faf8f3 100%)' }}>
      {/* Decorative Elements */}
      <div
        className="absolute left-0 top-1/3 w-28 h-28 opacity-15 hidden lg:block"
        style={{
          backgroundImage: 'url(/templates/pretty/images/rsvp-left-flower.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <SectionTitle title="Dress Code" />

        <div className="max-w-6xl mx-auto">
          {/* Dress Code Text */}
          {content.dressCode && (
            <div className="bg-white p-8 rounded-lg shadow-lg mb-8 text-center">
              <h3
                className="text-3xl mb-4"
                style={{ fontFamily: 'Great Vibes, cursive', color: '#b19a56' }}
              >
                Dress Code
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg mb-4">
                {content.dressCode}
              </p>
              {content.dressCodeDetails && (
                <p className="text-gray-500 leading-relaxed">
                  {content.dressCodeDetails}
                </p>
              )}
            </div>
          )}

          {/* Color Palette */}
          {((content.colors && content.colors.length > 0) || (content.colorPalette && content.colorPalette.length > 0)) && (
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3
                className="text-3xl mb-6 text-center"
                style={{ fontFamily: 'Great Vibes, cursive', color: '#b19a56' }}
              >
                Barevná paleta
              </h3>
              <div className="flex flex-wrap justify-center gap-6">
                {content.colors && content.colors.length > 0 ? (
                  content.colors.map((colorObj, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div
                        className="w-20 h-20 rounded-full shadow-lg border-4 border-white"
                        style={{ backgroundColor: colorObj.color }}
                      />
                      <span className="text-sm text-gray-600 font-semibold">
                        {colorObj.name || colorObj.color}
                      </span>
                    </div>
                  ))
                ) : (
                  content.colorPalette?.map((color, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div
                        className="w-20 h-20 rounded-full shadow-lg border-4 border-white"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm text-gray-600 uppercase">
                        {color}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Dress Code Images - New structure with colors */}
          {content.colors && content.colors.length > 0 && content.colors.some(c => c.images && c.images.length > 0) && (
            <div className="bg-white p-8 rounded-lg shadow-lg mt-8">
              <h3
                className="text-3xl mb-6 text-center"
                style={{ fontFamily: 'Great Vibes, cursive', color: '#b19a56' }}
              >
                Inspirace
              </h3>
              <div className="space-y-8">
                {content.colors.map((colorItem, colorIndex) => (
                  colorItem.images && colorItem.images.length > 0 && (
                    <div key={colorIndex}>
                      {colorItem.name && (
                        <h4 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                          {colorItem.name}
                        </h4>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {colorItem.images.map((image, imageIndex) => (
                          <div key={imageIndex} className="aspect-square overflow-hidden rounded-lg shadow-md">
                            <img
                              src={image}
                              alt={`${colorItem.name || 'Dress code'} inspiration ${imageIndex + 1}`}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Legacy Dress Code Images - fallback for old structure */}
          {(!content.colors || content.colors.length === 0 || !content.colors.some(c => c.images && c.images.length > 0)) &&
           content.images && content.images.length > 0 && content.images.filter(img => img && img.trim() !== '').length > 0 && (
            <div className="bg-white p-8 rounded-lg shadow-lg mt-8">
              <h3
                className="text-3xl mb-6 text-center"
                style={{ fontFamily: 'Great Vibes, cursive', color: '#b19a56' }}
              >
                Inspirace
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {content.images.filter(img => img && img.trim() !== '').map((image, index) => (
                  <div key={index} className="aspect-square overflow-hidden rounded-lg shadow-md">
                    <img
                      src={image}
                      alt={`Dress code inspiration ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

