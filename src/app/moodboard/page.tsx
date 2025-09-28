'use client'

import { useState } from 'react'
import { ArrowLeft, Upload, Search, Heart, Download, Trash2, Plus } from 'lucide-react'
import Link from 'next/link'
import { useMoodboard } from '@/hooks/useMoodboard'
import MoodboardGrid from '@/components/moodboard/MoodboardGrid'
import PinterestImport from '@/components/moodboard/PinterestImport'
import ImageUpload from '@/components/moodboard/ImageUpload'

export default function MoodboardPage() {
  const { images, isLoading, addImage, removeImage, toggleFavorite } = useMoodboard()
  const [activeTab, setActiveTab] = useState<'grid' | 'pinterest' | 'upload'>('grid')

  const tabs = [
    {
      id: 'grid' as const,
      label: 'Můj Moodboard',
      icon: Heart,
      count: images.length
    },
    {
      id: 'pinterest' as const,
      label: 'Pinterest Import',
      icon: Search,
      count: 0
    },
    {
      id: 'upload' as const,
      label: 'Nahrát fotky',
      icon: Upload,
      count: 0
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
              {images.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Váš moodboard je prázdný
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Začněte přidáváním fotek z Pinterestu nebo nahrajte vlastní fotky
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setActiveTab('pinterest')}
                      className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Importovat z Pinterestu
                    </button>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Nahrát fotky
                    </button>
                  </div>
                </div>
              ) : (
                <MoodboardGrid
                  images={images}
                  onRemove={removeImage}
                  onToggleFavorite={toggleFavorite}
                  isLoading={isLoading}
                />
              )}
            </div>
          )}

          {activeTab === 'pinterest' && (
            <PinterestImport
              onImport={addImage}
              isLoading={isLoading}
            />
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
