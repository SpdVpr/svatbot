'use client'

import { Heart, Sparkles, Calendar } from 'lucide-react'
import type { StoryContent } from '@/types/wedding-website'

interface StorySectionProps {
  content: StoryContent
}

export default function StorySection({ content }: StorySectionProps) {
  if (!content.enabled) return null

  return (
    <section className="relative py-24 bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 overflow-hidden">
      {/* Decorative watercolor blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-block mb-4">
            <Heart className="w-12 h-12 text-rose-500 fill-rose-200 animate-pulse" />
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            {content.title || 'Náš příběh'}
          </h2>
          {content.subtitle && (
            <p className="text-xl text-rose-600 italic" style={{ fontFamily: 'Lora, serif' }}>
              {content.subtitle}
            </p>
          )}
        </div>

        {/* Bride & Groom Profiles */}
        {(content.bride || content.groom) && (
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            {/* Bride */}
            {content.bride && (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 to-pink-400 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-white rounded-3xl p-8 shadow-xl">
                  {content.bride.image && (
                    <div className="mb-6 relative">
                      <div className="absolute -top-4 -right-4 w-24 h-24 bg-rose-200 rounded-full opacity-50"></div>
                      <img
                        src={content.bride.image}
                        alt={content.bride.name}
                        className="relative w-48 h-48 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                      />
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-gray-800 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {content.bride.name}
                    </h3>
                    <div className="text-4xl mb-4">👰</div>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {content.bride.description}
                    </p>
                    {content.bride.hobbies && (
                      <div className="bg-rose-50 rounded-2xl p-4 mb-3">
                        <p className="text-sm text-rose-700">
                          <span className="font-semibold">Koníčky:</span> {content.bride.hobbies}
                        </p>
                      </div>
                    )}
                    {content.bride.favoriteThings && (
                      <div className="bg-pink-50 rounded-2xl p-4">
                        <p className="text-sm text-pink-700">
                          <span className="font-semibold">Oblíbené:</span> {content.bride.favoriteThings}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Groom */}
            {content.groom && (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-white rounded-3xl p-8 shadow-xl">
                  {content.groom.image && (
                    <div className="mb-6 relative">
                      <div className="absolute -top-4 -left-4 w-24 h-24 bg-amber-200 rounded-full opacity-50"></div>
                      <img
                        src={content.groom.image}
                        alt={content.groom.name}
                        className="relative w-48 h-48 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                      />
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-gray-800 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {content.groom.name}
                    </h3>
                    <div className="text-4xl mb-4">🤵</div>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {content.groom.description}
                    </p>
                    {content.groom.hobbies && (
                      <div className="bg-amber-50 rounded-2xl p-4 mb-3">
                        <p className="text-sm text-amber-700">
                          <span className="font-semibold">Koníčky:</span> {content.groom.hobbies}
                        </p>
                      </div>
                    )}
                    {content.groom.favoriteThings && (
                      <div className="bg-orange-50 rounded-2xl p-4">
                        <p className="text-sm text-orange-700">
                          <span className="font-semibold">Oblíbené:</span> {content.groom.favoriteThings}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* How We Met */}
        {content.howWeMet && (
          <div className="mb-16 relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-300 to-amber-300 transform -translate-x-1/2 hidden md:block"></div>

            <div className="relative bg-white rounded-3xl p-10 shadow-2xl max-w-3xl mx-auto border-4 border-rose-100">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-rose-500 rounded-full p-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>

              {content.howWeMet.image && (
                <img
                  src={content.howWeMet.image}
                  alt={content.howWeMet.title}
                  className="w-full h-64 object-cover rounded-2xl mb-6 shadow-lg"
                />
              )}

              <div className="text-center">
                <h3 className="text-3xl font-bold text-gray-800 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {content.howWeMet.title}
                </h3>
                {content.howWeMet.date && (
                  <div className="flex items-center justify-center gap-2 text-rose-600 mb-4">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {new Date(content.howWeMet.date).toLocaleDateString('cs-CZ', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                <p className="text-gray-700 text-lg leading-relaxed">
                  {content.howWeMet.text}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Proposal */}
        {content.proposal && (
          <div className="relative">
            <div className="relative bg-gradient-to-br from-amber-100 to-rose-100 rounded-3xl p-10 shadow-2xl max-w-3xl mx-auto border-4 border-amber-200">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-amber-500 rounded-full p-4 shadow-lg">
                <Heart className="w-8 h-8 text-white fill-white" />
              </div>

              {content.proposal.image && (
                <img
                  src={content.proposal.image}
                  alt={content.proposal.title}
                  className="w-full h-64 object-cover rounded-2xl mb-6 shadow-lg"
                />
              )}

              <div className="text-center">
                <h3 className="text-3xl font-bold text-gray-800 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {content.proposal.title}
                </h3>
                {content.proposal.date && (
                  <div className="flex items-center justify-center gap-2 text-amber-700 mb-4">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {new Date(content.proposal.date).toLocaleDateString('cs-CZ', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                <p className="text-gray-700 text-lg leading-relaxed">
                  {content.proposal.text}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  )
}
