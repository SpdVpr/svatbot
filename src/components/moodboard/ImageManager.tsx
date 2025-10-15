'use client'

import { useState } from 'react'
import { X, FolderOpen, Check } from 'lucide-react'
import { MoodboardImage, MoodboardFolder } from '@/hooks/useMoodboard'
import Image from 'next/image'

interface ImageManagerProps {
  images: MoodboardImage[]
  folders: MoodboardFolder[]
  onMoveToFolder: (imageId: string, folderId: string) => Promise<void>
  onClose: () => void
}

export default function ImageManager({ images, folders, onMoveToFolder, onClose }: ImageManagerProps) {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [isMoving, setIsMoving] = useState(false)

  // Filter images without folder or with empty folderId
  const unassignedImages = images.filter(img => !img.folderId || img.folderId === '')

  const toggleImageSelection = (imageId: string) => {
    const newSelection = new Set(selectedImages)
    if (newSelection.has(imageId)) {
      newSelection.delete(imageId)
    } else {
      newSelection.add(imageId)
    }
    setSelectedImages(newSelection)
  }

  const selectAll = () => {
    setSelectedImages(new Set(unassignedImages.map(img => img.id)))
  }

  const deselectAll = () => {
    setSelectedImages(new Set())
  }

  const handleMove = async () => {
    if (!selectedFolder || selectedImages.size === 0) return

    setIsMoving(true)
    try {
      for (const imageId of Array.from(selectedImages)) {
        await onMoveToFolder(imageId, selectedFolder)
      }
      setSelectedImages(new Set())
      setSelectedFolder('')
      alert(`✅ Přesunuto ${selectedImages.size} obrázků do složky`)
    } catch (error) {
      console.error('Error moving images:', error)
      alert('Nepodařilo se přesunout obrázky')
    } finally {
      setIsMoving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <FolderOpen className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Přesunout fotky do složek
              </h2>
              <p className="text-sm text-gray-600">
                {unassignedImages.length} nepřiřazených fotek
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {unassignedImages.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Všechny fotky jsou přiřazeny
              </h3>
              <p className="text-gray-600">
                Všechny vaše fotky už jsou ve složkách
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selection controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={selectAll}
                    className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                  >
                    Vybrat vše
                  </button>
                  <button
                    onClick={deselectAll}
                    className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                  >
                    Zrušit výběr
                  </button>
                  <span className="text-sm text-gray-600">
                    {selectedImages.size} vybráno
                  </span>
                </div>
              </div>

              {/* Images grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {unassignedImages.map((image) => (
                  <div
                    key={image.id}
                    onClick={() => toggleImageSelection(image.id)}
                    className={`relative w-full rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedImages.has(image.id)
                        ? 'border-pink-500 ring-2 ring-pink-200'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                    style={{ paddingBottom: '100%' }}
                  >
                    <div className="absolute inset-0">
                      <Image
                        src={image.thumbnailUrl || image.url}
                        alt={image.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 25vw, (max-width: 768px) 16vw, 12vw"
                      />
                    </div>
                    {selectedImages.has(image.id) && (
                      <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                        <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Folder selection */}
              {selectedImages.size > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Vyberte cílovou složku:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {folders.map((folder) => (
                      <button
                        key={folder.id}
                        onClick={() => setSelectedFolder(folder.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedFolder === folder.id
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-pink-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                            style={{ backgroundColor: `${folder.color || '#EC4899'}20` }}
                          >
                            {folder.icon || '📁'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate text-sm">
                              {folder.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {folder.imageCount} fotek
                            </p>
                          </div>
                          {selectedFolder === folder.id && (
                            <Check className="w-5 h-5 text-pink-600 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {unassignedImages.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {selectedImages.size > 0 && selectedFolder
                  ? `Přesunout ${selectedImages.size} ${selectedImages.size === 1 ? 'fotku' : selectedImages.size < 5 ? 'fotky' : 'fotek'} do složky`
                  : 'Vyberte fotky a složku'}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="btn-outline"
                >
                  Zrušit
                </button>
                <button
                  onClick={handleMove}
                  disabled={selectedImages.size === 0 || !selectedFolder || isMoving}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isMoving ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 loading-spinner" />
                      <span>Přesouvám...</span>
                    </div>
                  ) : (
                    `Přesunout (${selectedImages.size})`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

