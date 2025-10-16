'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Sparkles, FolderInput } from 'lucide-react'
import Link from 'next/link'
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
    setSelectedImage(image)
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
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
            />
            {selectedImage.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                <h3 className="text-white text-xl font-semibold mb-2">
                  {selectedImage.title}
                </h3>
                {selectedImage.description && (
                  <p className="text-gray-200 text-sm">
                    {selectedImage.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
