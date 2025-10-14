'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Upload, Heart, Download, Trash2, Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useMoodboard } from '@/hooks/useMoodboard'
import MoodboardGrid from '@/components/moodboard/MoodboardGrid'
import ImageUpload from '@/components/moodboard/ImageUpload'
import AIMoodboardGenerator from '@/components/moodboard/AIMoodboardGenerator'

export default function MoodboardPage() {
  const { images, isLoading, addImage, removeImage, toggleFavorite, updateImagePosition, updateImageCategory, generateAIMoodboard } = useMoodboard()
  const [activeTab, setActiveTab] = useState<'grid' | 'upload' | 'ai'>('grid')
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showAIGenerator, setShowAIGenerator] = useState(false)

  // Handle initial load state
  useEffect(() => {
    if (!isLoading) {
      setIsInitialLoad(false)
    }
  }, [isLoading])

  const favoriteImages = images.filter(img => img.isFavorite)
  const uploadedImages = images.filter(img => img.source === 'upload')
  const aiGeneratedImages = images.filter(img => img.source === 'ai-generated')

  const tabs = [
    {
      id: 'grid' as const,
      label: 'Moodboard',
      icon: Heart,
      count: images.length,
      description: 'Vaše svatební inspirace'
    },
    {
      id: 'upload' as const,
      label: 'Nahrát fotky',
      icon: Upload,
      count: uploadedImages.length,
      description: 'Vlastní obrázky'
    },
    {
      id: 'ai' as const,
      label: 'AI Moodboardy',
      icon: Sparkles,
      count: aiGeneratedImages.length,
      description: 'Vygenerované koláže'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zpět na dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900">Moodboard</h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {images.length} {images.length === 1 ? 'fotka' : images.length < 5 ? 'fotky' : 'fotek'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-pink-500 text-pink-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                        activeTab === tab.id
                          ? 'bg-pink-100 text-pink-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'grid' && (
            <div>
              {isInitialLoad && isLoading ? (
                // Loading state - only show on initial load
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Načítám moodboard...</p>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <Heart className="w-20 h-20 text-pink-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Vytvořte svůj svatební moodboard
                    </h3>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                      Moodboard vám pomůže vizualizovat styl a náladu vaší svatby.
                      Sbírejte inspirace, barvy a nápady na jednom místě.
                    </p>
                    <div className="flex justify-center mb-8">
                      <button
                        onClick={() => setActiveTab('upload')}
                        className="flex flex-col items-center p-8 bg-pink-50 border border-pink-200 rounded-xl hover:bg-pink-100 transition-colors"
                      >
                        <Upload className="w-12 h-12 text-pink-600 mb-4" />
                        <h4 className="font-semibold text-pink-900 mb-2 text-lg">Nahrát fotky</h4>
                        <p className="text-sm text-pink-700 text-center">Přidejte vlastní svatební inspirace</p>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Stats & AI Button */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{images.length}</div>
                      <div className="text-sm text-gray-600">Celkem obrázků</div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                      <div className="text-2xl font-bold text-pink-600">{favoriteImages.length}</div>
                      <div className="text-sm text-gray-600">Oblíbené</div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{uploadedImages.length}</div>
                      <div className="text-sm text-gray-600">Nahrané</div>
                    </div>
                    <button
                      onClick={() => setShowAIGenerator(true)}
                      disabled={uploadedImages.length < 2}
                      className="bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg p-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center space-y-2 shadow-lg hover:shadow-xl"
                    >
                      <Sparkles className="w-6 h-6" />
                      <div className="text-sm font-semibold">AI Moodboard</div>
                    </button>
                  </div>

                  {/* AI Info Banner */}
                  {uploadedImages.length >= 2 && (
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-4 mb-6">
                      <div className="flex items-start space-x-3">
                        <Sparkles className="w-5 h-5 text-pink-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Vyzkoušejte AI Moodboard Generator
                          </h4>
                          <p className="text-sm text-gray-700">
                            Máte {uploadedImages.length} {uploadedImages.length === 1 ? 'fotku' : uploadedImages.length < 5 ? 'fotky' : 'fotek'}.
                            AI může vytvořit profesionální vizuální koláž z vašich inspirací!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <MoodboardGrid
                    images={images}
                    onRemove={removeImage}
                    onToggleFavorite={toggleFavorite}
                    onPositionChange={updateImagePosition}
                    onUpdateCategory={updateImageCategory}
                    isLoading={false}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <ImageUpload
              onUpload={addImage}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      AI Vygenerované Moodboardy
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Profesionální vizuální koláže vytvořené umělou inteligencí z vašich svatebních inspirací.
                      Každý moodboard obsahuje analýzu stylu, barevnou paletu a personalizovaná doporučení.
                    </p>
                    {aiGeneratedImages.length === 0 && (
                      <button
                        onClick={() => setShowAIGenerator(true)}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Vytvořit první AI Moodboard
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Generated Images Grid */}
              {aiGeneratedImages.length > 0 ? (
                <MoodboardGrid
                  images={aiGeneratedImages}
                  onRemove={removeImage}
                  onToggleFavorite={toggleFavorite}
                  onPositionChange={updateImagePosition}
                  onUpdateCategory={updateImageCategory}
                  isLoading={false}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Zatím žádné AI moodboardy
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Nahrajte alespoň 2 fotky a vygenerujte svůj první AI moodboard
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Moodboard Generator Modal */}
      {showAIGenerator && (
        <AIMoodboardGenerator
          images={images}
          onGenerate={generateAIMoodboard}
          onClose={() => setShowAIGenerator(false)}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
