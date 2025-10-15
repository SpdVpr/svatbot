'use client'

import { useState, useRef } from 'react'
import { ArrowLeft, Upload, Plus, Grid3x3, LayoutGrid, Heart, Trash2, Image as ImageIcon, X, FileText, Move } from 'lucide-react'
import { MoodboardFolder, MoodboardImage } from '@/hooks/useMoodboard'
import Image from 'next/image'
import SimpleMoodboardCard from './SimpleMoodboardCard'

interface FolderViewProps {
  folder: MoodboardFolder
  images: MoodboardImage[]
  onBack: () => void
  onUploadImage: (file: File, metadata?: any) => Promise<any>
  onRemoveImage: (imageId: string) => void
  onToggleFavorite: (imageId: string) => void
  onImageClick: (image: MoodboardImage) => void
  onPositionChange?: (imageId: string, position: { x: number; y: number }, size?: { width: number; height: number }) => void
  isLoading: boolean
}

export default function FolderView({
  folder,
  images,
  onBack,
  onUploadImage,
  onRemoveImage,
  onToggleFavorite,
  onImageClick,
  onPositionChange,
  isLoading
}: FolderViewProps) {
  const [showDetailedUpload, setShowDetailedUpload] = useState(false)
  const [viewMode, setViewMode] = useState<'masonry' | 'grid' | 'free'>('masonry')
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Detailed upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string>('')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')

  const handleQuickUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      try {
        setUploadingFiles(prev => [...prev, file.name])
        await onUploadImage(file, {
          folderId: folder.id,
          title: file.name.replace(/\.[^/.]+$/, ''),
          category: 'other'
        })
        setUploadingFiles(prev => prev.filter(f => f !== file.name))
      } catch (error) {
        console.error('Error uploading file:', error)
        setUploadingFiles(prev => prev.filter(f => f !== file.name))
        alert(`Nepodařilo se nahrát ${file.name}`)
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDetailedUploadClick = () => {
    setShowDetailedUpload(true)
  }

  const handleDetailedFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadFile(file)
    setUploadPreview(URL.createObjectURL(file))
    setUploadTitle(file.name.replace(/\.[^/.]+$/, ''))
  }

  const handleDetailedUploadSubmit = async () => {
    if (!uploadFile) return

    try {
      await onUploadImage(uploadFile, {
        folderId: folder.id,
        title: uploadTitle || uploadFile.name,
        description: uploadDescription,
        category: 'other'
      })

      // Reset form
      setShowDetailedUpload(false)
      setUploadFile(null)
      setUploadPreview('')
      setUploadTitle('')
      setUploadDescription('')
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Nepodařilo se nahrát obrázek')
    }
  }

  const handleCancelDetailedUpload = () => {
    setShowDetailedUpload(false)
    setUploadFile(null)
    if (uploadPreview) {
      URL.revokeObjectURL(uploadPreview)
    }
    setUploadPreview('')
    setUploadTitle('')
    setUploadDescription('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-3">
            {folder.icon && (
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                style={{ backgroundColor: (folder.color || '#EC4899') + '20' }}
              >
                {folder.icon}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{folder.name}</h2>
              {folder.description && (
                <p className="text-sm text-gray-600">{folder.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {images.length} {images.length === 1 ? 'obrázek' : images.length < 5 ? 'obrázky' : 'obrázků'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('masonry')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'masonry'
                  ? 'bg-white shadow-sm text-pink-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Masonry zobrazení"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-pink-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Mřížka"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('free')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'free'
                  ? 'bg-white shadow-sm text-pink-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Volné přesouvání"
            >
              <Move className="w-4 h-4" />
            </button>
          </div>

          {/* Upload buttons */}
          <button
            onClick={handleQuickUpload}
            className="btn-outline flex items-center space-x-2"
            disabled={uploadingFiles.length > 0}
          >
            <Upload className="w-4 h-4" />
            <span>Rychlé nahrání</span>
            {uploadingFiles.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-pink-100 text-pink-600 text-xs rounded-full">
                {uploadingFiles.length}
              </span>
            )}
          </button>
          <button
            onClick={handleDetailedUploadClick}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Přidat s detaily</span>
          </button>
        </div>
      </div>

      {/* Hidden file input for quick upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Images Grid */}
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Zatím zde nejsou žádné obrázky
          </h3>
          <p className="text-sm text-gray-600 mb-4 max-w-md">
            Přidejte své první svatební inspirace do této složky
          </p>
          <button
            onClick={handleDetailedUploadClick}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Přidat první obrázek</span>
          </button>
        </div>
      ) : viewMode === 'free' ? (
        /* Free drag & drop canvas */
        <div className="relative w-full bg-gray-50 rounded-xl border-2 border-gray-200 overflow-auto" style={{ minHeight: '1200px', maxHeight: '1200px' }}>
          <div className="relative w-full" style={{ minHeight: '2400px' }}>
            {images.map((image) => (
              <SimpleMoodboardCard
                key={image.id}
                image={image}
                onImageClick={onImageClick}
                onPositionChange={onPositionChange || (() => {})}
                onToggleFavorite={onToggleFavorite}
                onRemove={onRemoveImage}
              />
            ))}

            {/* Instructions overlay */}
            {images.length > 0 && (
              <div className="sticky top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm inline-block z-50">
                <p className="text-sm text-gray-600">
                  💡 Přetáhněte obrázky pro změnu pozice, táhněte za roh pro změnu velikosti
                </p>
              </div>
            )}

            {/* Grid background for better positioning */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage: 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }}
            />
          </div>
        </div>
      ) : (
        <div
          className={
            viewMode === 'masonry'
              ? 'columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4'
              : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
          }
        >
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative break-inside-avoid mb-4 cursor-pointer"
              onClick={() => onImageClick(image)}
            >
              <div className="relative rounded-xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-all">
                <Image
                  src={image.thumbnailUrl || image.url}
                  alt={image.title}
                  width={400}
                  height={viewMode === 'grid' ? 400 : 600}
                  className={`w-full ${viewMode === 'grid' ? 'aspect-square' : ''} object-cover`}
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />

                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute top-2 right-2 flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleFavorite(image.id)
                      }}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          image.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'
                        }`}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Opravdu chcete smazat tento obrázek?')) {
                          onRemoveImage(image.id)
                        }
                      }}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>

                  {/* Title */}
                  {image.title && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-sm font-medium truncate">
                        {image.title}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Upload Modal */}
      {showDetailedUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Přidat obrázek do složky "{folder.name}"
              </h2>
              <button
                onClick={handleCancelDetailedUpload}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {!uploadFile ? (
                // File selection
                <div>
                  <label className="block">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-pink-400 hover:bg-pink-50 transition-colors cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Vyberte obrázek
                      </p>
                      <p className="text-sm text-gray-600">
                        Klikněte nebo přetáhněte soubor
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDetailedFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                // File details form
                <div className="space-y-4">
                  {/* Preview */}
                  <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={uploadPreview}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Název
                    </label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="Název obrázku..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Popis (volitelné)
                    </label>
                    <textarea
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      placeholder="Popis obrázku..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCancelDetailedUpload}
                      className="flex-1 btn-outline"
                    >
                      Zrušit
                    </button>
                    <button
                      type="button"
                      onClick={handleDetailedUploadSubmit}
                      className="flex-1 btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Nahrávám...' : 'Nahrát obrázek'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

