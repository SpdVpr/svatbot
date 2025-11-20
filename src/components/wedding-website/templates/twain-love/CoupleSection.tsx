'use client'

import { StoryContent, HeroContent } from '@/types/wedding-website'
import Image from 'next/image'

interface CoupleSectionProps {
  content: StoryContent
  heroContent: HeroContent
}

export default function CoupleSection({
  content,
  heroContent
}: CoupleSectionProps) {
  return (
    <div id="couple" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto relative">
          {/* Bride */}
          {content.bride && (
            <div className="text-center relative couple-wrap-2">
              <div className="mb-6">
                {content.bride.image ? (
                  <Image
                    src={content.bride.image}
                    alt={content.bride.name || heroContent.bride}
                    width={340}
                    height={340}
                    className="rounded-full mx-auto object-cover border-[10px] border-[#b2c9d3] hover:grayscale-[50%] transition-all duration-500"
                    style={{ width: '340px', height: '340px' }}
                  />
                ) : (
                  <div className="w-[340px] h-[340px] rounded-full mx-auto bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center border-[10px] border-[#b2c9d3]">
                    <span className="text-6xl text-pink-300">👰</span>
                  </div>
                )}
              </div>
              <h3 className="text-3xl text-gray-800 mb-4" style={{ fontFamily: 'Great Vibes, cursive' }}>
                {content.bride.name || heroContent.bride}
              </h3>
              {content.bride.description && (
                <p className="text-gray-600 leading-relaxed max-w-md mx-auto" style={{ fontFamily: 'Muli, sans-serif' }}>
                  {content.bride.description}
                </p>
              )}
            </div>
          )}

          {/* Groom */}
          {content.groom && (
            <div className="text-center relative couple-wrap-3">
              <div className="mb-6">
                {content.groom.image ? (
                  <Image
                    src={content.groom.image}
                    alt={content.groom.name || heroContent.groom}
                    width={340}
                    height={340}
                    className="rounded-full mx-auto object-cover border-[10px] border-[#b2c9d3] hover:grayscale-[50%] transition-all duration-500"
                    style={{ width: '340px', height: '340px' }}
                  />
                ) : (
                  <div className="w-[340px] h-[340px] rounded-full mx-auto bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-[10px] border-[#b2c9d3]">
                    <span className="text-6xl text-blue-300">🤵</span>
                  </div>
                )}
              </div>
              <h3 className="text-3xl text-gray-800 mb-4" style={{ fontFamily: 'Great Vibes, cursive' }}>
                {content.groom.name || heroContent.groom}
              </h3>
              {content.groom.description && (
                <p className="text-gray-600 leading-relaxed max-w-md mx-auto" style={{ fontFamily: 'Muli, sans-serif' }}>
                  {content.groom.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CSS for decorative elements */}
      <style jsx>{`
        @media (min-width: 768px) {
          .couple-wrap-2::before {
            position: absolute;
            right: -20px;
            top: 30px;
            width: 1px;
            height: 95%;
            background: rgba(178, 201, 211, 0.5);
            content: '';
          }
          .couple-wrap-2::after {
            position: absolute;
            right: -39px;
            bottom: -33px;
            background: url(/templates/twain-love/couple-icon.png);
            content: '';
            width: 39px;
            height: 34px;
          }
          .couple-wrap-3::after {
            position: absolute;
            left: -48px;
            top: 0px;
            background: url(/templates/twain-love/couple-icon2.png);
            content: '';
            width: 39px;
            height: 34px;
          }
        }
      `}</style>
    </div>
  )
}

