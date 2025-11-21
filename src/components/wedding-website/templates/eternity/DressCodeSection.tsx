'use client'

import { DressCodeContent } from '@/types/wedding-website'

interface DressCodeSectionProps {
  content: DressCodeContent
}

export default function DressCodeSection({ content }: DressCodeSectionProps) {
  if (!content.enabled) return null

  return (
    <section id="dressCode" className="py-24 bg-[#FCFBF9]">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <span className="text-[#5F6F52] uppercase tracking-[0.3em] text-xs mb-4 block">Informace pro hosty</span>
        <h2 className="font-serif text-5xl md:text-6xl text-[#2C362B] mb-12">Dress Code</h2>
        
        <div className="bg-white p-12 md:p-16 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-[#2C362B]/5">
          {content.dressCode && (
            <h3 className="text-[#C5A880] text-xl font-sans uppercase tracking-widest mb-6">
              {content.dressCode}
            </h3>
          )}
          {content.dressCodeDetails && (
            <p className="text-[#1A1C1A]/70 leading-relaxed mb-12 max-w-2xl mx-auto text-lg font-light">
              {content.dressCodeDetails}
            </p>
          )}

          {/* Color Palette */}
          {content.colors && content.colors.length > 0 && (
            <div className="flex flex-wrap justify-center gap-8">
              {content.colors.map((colorItem, index) => (
                <div key={index} className="flex flex-col gap-3 items-center">
                  <div 
                    className="w-20 h-24 rounded-t-full shadow-sm"
                    style={{ backgroundColor: colorItem.color }}
                  ></div>
                  {colorItem.name && (
                    <span className="text-xs uppercase tracking-wider text-gray-500">
                      {colorItem.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Legacy color palette support */}
          {!content.colors && content.colorPalette && content.colorPalette.length > 0 && (
            <div className="flex flex-wrap justify-center gap-8">
              {content.colorPalette.map((color, index) => (
                <div key={index} className="flex flex-col gap-3 items-center">
                  <div 
                    className="w-20 h-24 rounded-t-full shadow-sm"
                    style={{ backgroundColor: color }}
                  ></div>
                </div>
              ))}
            </div>
          )}

          {/* Color Inspiration Images */}
          {content.colors && content.colors.some(c => c.images && c.images.length > 0) && (
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              {content.colors.map((colorItem, colorIndex) => 
                colorItem.images?.map((image, imgIndex) => (
                  <div key={`${colorIndex}-${imgIndex}`} className="aspect-square overflow-hidden rounded-lg">
                    <img 
                      src={image} 
                      alt={`${colorItem.name || 'Color'} inspiration`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

