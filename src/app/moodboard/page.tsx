'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Sparkles, FolderInput, X, Heart, Trash2, Calendar } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useMoodboard, MoodboardFolder, MoodboardImage } from '@/hooks/useMoodboard'
import FolderGrid from '@/components/moodboard/FolderGrid'
import FolderModal from '@/components/moodboard/FolderModal'
import FolderView from '@/components/moodboard/FolderView'
import AIMoodboardGenerator from '@/components/moodboard/AIMoodboardGenerator'
import ImageManager from '@/components/moodboard/ImageManager'

export default function MoodboardPage() {
  const {
    images,
    folders,
    isLoading,
    uploadImage,
    removeImage,
    toggleFavorite,
    updateImagePosition,
    generateAIMoodboard,
    createFolder,
    updateFolder,
    deleteFolder,
    moveImageToFolder
  } = useMoodboard()

  const [view, setView] = useState<'folders' | 'folder-detail'>('folders')
  const [selectedFolder, setSelectedFolder] = useState<MoodboardFolder | null>(null)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [editingFolder, setEditingFolder] = useState<MoodboardFolder | undefined>(undefined)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [showImageManager, setShowImageManager] = useState(false)
  const [selectedImage, setSelectedImage] = useState<MoodboardImage | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Handle initial load state
  useEffect(() => {
    if (!isLoading) {
      setIsInitialLoad(false)
    }
  }, [isLoading])

  // Handlers
  const handleFolderClick = (folder: MoodboardFolder) => {
    setSelectedFolder(folder)
    setView('folder-detail')
  }

  const handleBackToFolders = () => {
    setSelectedFolder(null)
    setView('folders')
  }

  const handleCreateFolder = () => {
    setEditingFolder(undefined)
    setShowFolderModal(true)
  }

  const handleEditFolder = (folder: MoodboardFolder) => {
    setEditingFolder(folder)
    setShowFolderModal(true)
  }

  const handleSaveFolder = async (data: { name: string; description?: string; color?: string; icon?: string }) => {
    if (editingFolder) {
      await updateFolder(editingFolder.id, data)
    } else {
      await createFolder(data)
    }
    setShowFolderModal(false)
    setEditingFolder(undefined)
  }

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await deleteFolder(folderId)
      if (selectedFolder?.id === folderId) {
        handleBackToFolders()
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
      alert(error instanceof Error ? error.message : 'Nepodařilo se smazat složku')
    }
  }

  const handleImageClick = (image: MoodboardImage) => {
    setImageLoading(true)
    setSelectedImage(image)
  }

  const handleToggleFavorite = async (imageId: string) => {
    await toggleFavorite(imageId)
    // Update selected image if it's the one being toggled
    if (selectedImage?.id === imageId) {
      const updatedImage = images.find(img => img.id === imageId)
      if (updatedImage) {
        setSelectedImage(updatedImage)
      }
    }
  }

  const handleRemoveImage = async (imageId: string) => {
    if (!confirm('Opravdu chcete smazat tento obrázek?')) {
      return
    }

    setIsDeleting(true)
    try {
      await removeImage(imageId)
      setSelectedImage(null)
    } catch (error) {
      console.error('Error removing image:', error)
      alert('Nepodařilo se smazat obrázek')
    } finally {
      setIsDeleting(false)
    }
  }

  // Get images for selected folder
  const folderImages = selectedFolder
    ? images.filter(img => img.folderId === selectedFolder.id)
    : []

  const uploadedImages = images.filter(img => img.source === 'upload')
  const unassignedImages = images.filter(img => !img.folderId || img.folderId === '')

  return (
    <div className="min-h-screen">
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
              {view === 'folders' && (
                <>
                  <span className="text-sm text-gray-600">
                    {folders.length} {folders.length === 1 ? 'složka' : folders.length < 5 ? 'složky' : 'složek'}
                  </span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-600">
                    {images.length} {images.length === 1 ? 'obrázek' : images.length < 5 ? 'obrázky' : 'obrázků'}
                  </span>
                  {unassignedImages.length > 0 && (
                    <>
                      <span className="text-sm text-gray-400">•</span>
                      <button
                        onClick={() => setShowImageManager(true)}
                        className="inline-flex items-center px-3 py-1.5 bg-amber-50 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-100 transition-colors border border-amber-200"
                      >
                        <FolderInput className="w-4 h-4 mr-2" />
                        {unassignedImages.length} nepřiřazených
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'folders' ? (
          // Folders view
          <FolderGrid
            folders={folders}
            allImages={images}
            onFolderClick={handleFolderClick}
            onCreateFolder={handleCreateFolder}
            onEditFolder={handleEditFolder}
            onDeleteFolder={handleDeleteFolder}
            onImageClick={handleImageClick}
            onAIGeneratorClick={() => setShowAIGenerator(true)}
            uploadedImagesCount={uploadedImages.length}
          />
        ) : view === 'folder-detail' && selectedFolder ? (
          // Folder detail view
          <FolderView
            folder={selectedFolder}
            images={folderImages}
            onBack={handleBackToFolders}
            onUploadImage={uploadImage}
            onRemoveImage={removeImage}
            onToggleFavorite={toggleFavorite}
            onImageClick={handleImageClick}
            onPositionChange={updateImagePosition}
            isLoading={isLoading}
          />
        ) : null}

      </div>

      {/* Folder Modal */}
      {showFolderModal && (
        <FolderModal
          folder={editingFolder}
          onSave={handleSaveFolder}
          onClose={() => {
            setShowFolderModal(false)
            setEditingFolder(undefined)
          }}
          loading={isLoading}
        />
      )}

      {/* AI Moodboard Generator Modal */}
      {showAIGenerator && (
        <AIMoodboardGenerator
          images={uploadedImages}
          folders={folders}
          onGenerate={generateAIMoodboard}
          onClose={() => setShowAIGenerator(false)}
          isLoading={isLoading}
        />
      )}

      {/* Image Manager Modal */}
      {showImageManager && (
        <ImageManager
          images={images}
          folders={folders}
          onMoveToFolder={moveImageToFolder}
          onClose={() => setShowImageManager(false)}
        />
      )}

      {/* Image Detail Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) {
              setSelectedImage(null)
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden relative mx-4">
            {/* Close button */}
            <button
              onClick={() => !isDeleting && setSelectedImage(null)}
              disabled={isDeleting}
              className="absolute top-2 right-2 md:top-4 md:right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="flex-1 relative bg-gray-100 flex items-center justify-center" style={{ minHeight: '400px', minWidth: '400px' }}>
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.title || 'Moodboard image'}
                  width={800}
                  height={600}
                  className={`object-contain max-h-[70vh] w-full transition-opacity duration-300 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  quality={95}
                  priority
                  onLoad={() => setImageLoading(false)}
                />
              </div>

              {/* Details */}
              <div className="w-full md:w-80 p-4 md:p-6 md:border-l border-t md:border-t-0 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedImage.title || 'Bez názvu'}
                  </h3>
                </div>

                {selectedImage.description && (
                  <p className="text-gray-600 mb-4">{selectedImage.description}</p>
                )}

                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedImage.createdAt.toLocaleDateString('cs-CZ')}</span>
                  </div>

                  {selectedImage.tags && selectedImage.tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Tagy:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedImage.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => handleToggleFavorite(selectedImage.id)}
                    className={`flex-1 px-4 py-3 sm:py-2 rounded-lg font-medium transition-colors ${
                      selectedImage.isFavorite
                        ? 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 inline mr-2 ${selectedImage.isFavorite ? 'fill-current' : ''}`} />
                    <span className="hidden sm:inline">{selectedImage.isFavorite ? 'Oblíbené' : 'Přidat k oblíbeným'}</span>
                    <span className="sm:hidden">{selectedImage.isFavorite ? '❤️' : '🤍'}</span>
                  </button>
                  <button
                    onClick={() => handleRemoveImage(selectedImage.id)}
                    disabled={isDeleting}
                    className={`px-4 py-3 sm:py-2 rounded-lg font-medium transition-colors ${
                      isDeleting
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    <Trash2 className="w-4 h-4 inline mr-2" />
                    {isDeleting ? 'Mazání...' : 'Smazat'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
