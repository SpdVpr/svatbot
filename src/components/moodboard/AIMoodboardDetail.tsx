'use client'

import { useState } from 'react'
import { X, Sparkles, Palette, Lightbulb, Flower2, Download } from 'lucide-react'
import { MoodboardImage } from '@/hooks/useMoodboard'

interface AIMoodboardDetailProps {
  image: MoodboardImage
  onClose: () => void
}

export default function AIMoodboardDetail({ image, onClose }: AIMoodboardDetailProps) {
  const [imageLoading, setImageLoading] = useState(true)

  if (!image.aiMetadata) return null

  const { description, style, colors, mood } = image.aiMetadata

  const handleDownload = async () => {
    try {
      // Use proxy endpoint to bypass CORS
      const response = await fetch('/api/ai/moodboard/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: image.url })
      })

      if (!response.ok) {
        throw new Error('Failed to download image')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      // Determine file extension from URL or default to jpg
      const extension = image.url.includes('.png') ? 'png' : 'jpg'
      a.download = `${image.title || 'moodboard'}.${extension}`

      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading image:', error)
      alert('Nepodařilo se stáhnout obrázek')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{image.title}</h2>
                <p className="text-purple-100 text-sm">AI Vygenerovaný Moodboard</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image */}
            <div className="space-y-4">
              <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center" style={{ aspectRatio: '16 / 9', minHeight: '300px' }}>
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <img
                  src={image.url}
                  alt={image.title}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={() => setImageLoading(false)}
                />
              </div>

              {/* Style & Mood */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <h3 className="font-semibold text-purple-900">Styl</h3>
                  </div>
                  <p className="text-purple-700 capitalize">{style}</p>
                </div>

                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Palette className="w-4 h-4 text-pink-600" />
                    <h3 className="font-semibold text-pink-900">Nálada</h3>
                  </div>
                  <p className="text-pink-700 text-sm">{mood}</p>
                </div>
              </div>

              {/* Colors */}
              {colors && colors.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Palette className="w-4 h-4 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Barevná paleta</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700 capitalize"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description & Recommendations */}
            <div className="space-y-6">
              {/* Style Description */}
              {description?.styleDescription && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <span>Popis stylu</span>
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{description.styleDescription}</p>
                </div>
              )}

              {/* Color Palette Details */}
              {description?.colorPalette && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <Palette className="w-5 h-5 text-purple-600" />
                    <span>Barevná paleta</span>
                  </h3>
                  <p className="text-gray-700 mb-3">{description.colorPalette.description}</p>
                  
                  {description.colorPalette.primary && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-600 mb-1">Hlavní barvy:</p>
                      <div className="flex flex-wrap gap-2">
                        {description.colorPalette.primary.map((color: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-white rounded text-sm capitalize">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {description.colorPalette.accent && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-600 mb-1">Doplňkové barvy:</p>
                      <div className="flex flex-wrap gap-2">
                        {description.colorPalette.accent.map((color: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-white rounded text-sm capitalize">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {description.colorPalette.usage && (
                    <p className="text-sm text-gray-600 mt-2 italic">{description.colorPalette.usage}</p>
                  )}
                </div>
              )}

              {/* Recommendations */}
              {description?.recommendations && description.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    <span>Doporučení</span>
                  </h3>
                  <ul className="space-y-2">
                    {description.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start space-x-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <span className="text-yellow-600 font-bold mt-0.5">{index + 1}.</span>
                        <span className="text-gray-700 text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Decoration Ideas */}
              {description?.decorationIdeas && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <Flower2 className="w-5 h-5 text-green-600" />
                    <span>Nápady na dekorace</span>
                  </h3>
                  
                  {description.decorationIdeas.flowers && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-green-700 mb-1">🌸 Květiny:</p>
                      <p className="text-sm text-gray-700">{description.decorationIdeas.flowers}</p>
                    </div>
                  )}
                  
                  {description.decorationIdeas.decorations && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-green-700 mb-1">✨ Dekorace:</p>
                      <p className="text-sm text-gray-700">{description.decorationIdeas.decorations}</p>
                    </div>
                  )}
                  
                  {description.decorationIdeas.accessories && (
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-1">💎 Doplňky:</p>
                      <p className="text-sm text-gray-700">{description.decorationIdeas.accessories}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Summary */}
              {description?.summary && (
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-xl p-4">
                  <p className="text-gray-800 font-medium text-center italic">
                    "{description.summary}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Vygenerováno: {image.aiMetadata.generatedAt ? new Date(image.aiMetadata.generatedAt).toLocaleDateString('cs-CZ', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'N/A'}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Stáhnout
              </button>
              <button
                onClick={onClose}
                className="btn-primary"
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

