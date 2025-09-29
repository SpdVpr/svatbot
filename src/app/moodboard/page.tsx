'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Upload, Heart, Download, Trash2, Plus } from 'lucide-react'
import Link from 'next/link'
import { useMoodboard } from '@/hooks/useMoodboard'
import MoodboardGrid from '@/components/moodboard/MoodboardGrid'
import ImageUpload from '@/components/moodboard/ImageUpload'

export default function MoodboardPage() {
  const { images, isLoading, addImage, removeImage, toggleFavorite, updateImagePosition, updateImageCategory } = useMoodboard()
  const [activeTab, setActiveTab] = useState<'grid' | 'upload'>('grid')
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Handle initial load state
  useEffect(() => {
    if (!isLoading) {
      setIsInitialLoad(false)
    }
  }, [isLoading])

  const favoriteImages = images.filter(img => img.isFavorite)
  const uploadedImages = images.filter(img => img.source === 'upload')

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
                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
                  </div>

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
        </div>
      </div>
    </div>
  )
}
