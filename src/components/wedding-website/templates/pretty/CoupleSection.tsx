'use client'

import { StoryContent, HeroContent } from '@/types/wedding-website'

interface CoupleSectionProps {
  content: StoryContent
  heroContent: HeroContent
}

export default function CoupleSection({ content, heroContent }: CoupleSectionProps) {
  if (!content.enabled) return null

  return (
    <section id="couple" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12">
          {/* Bride Info */}
          <div className="flex-1 text-center lg:text-right">
            {/* Bride Photo */}
            {content.bride?.image && (
              <div className="mb-6 flex justify-center lg:justify-end">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 shadow-lg" style={{ borderColor: '#e1d9bf' }}>
                  <img
                    src={content.bride.image}
                    alt={content.bride.name || heroContent.bride}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            <h3
              className="text-4xl md:text-5xl mb-6"
              style={{ fontFamily: 'Great Vibes, cursive', color: '#b19a56' }}
            >
              {content.bride?.name || heroContent.bride}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6 max-w-md mx-auto lg:ml-auto">
              {content.bride?.description || `${heroContent.bride} je úžasná nevěsta, která přináší do našeho vztahu lásku, radost a nekonečnou podporu.`}
            </p>
            {/* Social Links */}
            <div className="flex justify-center lg:justify-end gap-3">
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                style={{
                  backgroundColor: '#f5f1e8',
                  color: '#b19a56'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b19a56'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f1e8'
                  e.currentTarget.style.color = '#b19a56'
                }}
              >
                <i className="ti-facebook"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                style={{
                  backgroundColor: '#f5f1e8',
                  color: '#b19a56'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b19a56'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f1e8'
                  e.currentTarget.style.color = '#b19a56'
                }}
              >
                <i className="ti-twitter-alt"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                style={{
                  backgroundColor: '#f5f1e8',
                  color: '#b19a56'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b19a56'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f1e8'
                  e.currentTarget.style.color = '#b19a56'
                }}
              >
                <i className="ti-instagram"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                style={{
                  backgroundColor: '#f5f1e8',
                  color: '#b19a56'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b19a56'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f1e8'
                  e.currentTarget.style.color = '#b19a56'
                }}
              >
                <i className="ti-pinterest"></i>
              </a>
            </div>
          </div>

          {/* Couple Image */}
          {(content.howWeMet?.image || content.proposal?.image) && (
            <div className="flex-shrink-0">
              <div className="relative w-64 h-80 md:w-80 md:h-96 rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={content.howWeMet?.image || content.proposal?.image || 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800'}
                  alt="Couple"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Groom Info */}
          <div className="flex-1 text-center lg:text-left">
            {/* Groom Photo */}
            {content.groom?.image && (
              <div className="mb-6 flex justify-center lg:justify-start">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 shadow-lg" style={{ borderColor: '#e1d9bf' }}>
                  <img
                    src={content.groom.image}
                    alt={content.groom.name || heroContent.groom}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            <h3
              className="text-4xl md:text-5xl mb-6"
              style={{ fontFamily: 'Great Vibes, cursive', color: '#b19a56' }}
            >
              {content.groom?.name || heroContent.groom}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6 max-w-md mx-auto lg:mr-auto">
              {content.groom?.description || `${heroContent.groom} je skvělý ženich, který přináší do našeho vztahu sílu, humor a nekonečnou lásku.`}
            </p>
            {/* Social Links */}
            <div className="flex justify-center lg:justify-start gap-3">
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                style={{
                  backgroundColor: '#f5f1e8',
                  color: '#b19a56'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b19a56'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f1e8'
                  e.currentTarget.style.color = '#b19a56'
                }}
              >
                <i className="ti-facebook"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                style={{
                  backgroundColor: '#f5f1e8',
                  color: '#b19a56'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b19a56'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f1e8'
                  e.currentTarget.style.color = '#b19a56'
                }}
              >
                <i className="ti-twitter-alt"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                style={{
                  backgroundColor: '#f5f1e8',
                  color: '#b19a56'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b19a56'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f1e8'
                  e.currentTarget.style.color = '#b19a56'
                }}
              >
                <i className="ti-instagram"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                style={{
                  backgroundColor: '#f5f1e8',
                  color: '#b19a56'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b19a56'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f1e8'
                  e.currentTarget.style.color = '#b19a56'
                }}
              >
                <i className="ti-pinterest"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

