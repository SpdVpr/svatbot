'use client'

import { useState } from 'react'
import { Plus, Folder, Image as ImageIcon, Edit, Trash2, MoreVertical, Sparkles } from 'lucide-react'
import { MoodboardFolder } from '@/hooks/useMoodboard'
import Image from 'next/image'

interface FolderGridProps {
  folders: MoodboardFolder[]
  allImages?: any[]
  onFolderClick: (folder: MoodboardFolder) => void
  onCreateFolder: () => void
  onEditFolder: (folder: MoodboardFolder) => void
  onDeleteFolder: (folderId: string) => void
  onImageClick?: (image: any) => void
  onAIGeneratorClick?: () => void
  uploadedImagesCount?: number
}

export default function FolderGrid({
  folders,
  allImages = [],
  onFolderClick,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onImageClick,
  onAIGeneratorClick,
  uploadedImagesCount = 0
}: FolderGridProps) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const handleMenuToggle = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(menuOpen === folderId ? null : folderId)
  }

  const handleEdit = (folder: MoodboardFolder, e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(null)
    onEditFolder(folder)
  }

  const handleDelete = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(null)
    if (confirm('Opravdu chcete smazat tuto složku? Všechny obrázky v ní budou také smazány.')) {
      onDeleteFolder(folderId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header - Responsive layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Moje složky</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Organizujte své svatební inspirace do složek
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* AI Moodboard Generator Button */}
          {uploadedImagesCount >= 2 && onAIGeneratorClick && (
            <button
              onClick={onAIGeneratorClick}
              className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-sm hover:shadow-md flex-1 sm:flex-initial justify-center"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
              <span className="whitespace-nowrap">AI Moodboard</span>
            </button>
          )}

          {/* New Folder Button */}
          <button
            onClick={onCreateFolder}
            className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2.5 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-all shadow-sm hover:shadow-md flex-1 sm:flex-initial justify-center"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            <span className="whitespace-nowrap">Nová složka</span>
          </button>
        </div>
      </div>

      {/* Folder Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {folders.map((folder) => (
          <div
            key={folder.id}
            onClick={() => onFolderClick(folder)}
            className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden border border-gray-200 hover:border-pink-300 flex flex-col"
          >
            {/* Cover Image or Placeholder */}
            <div
              className="relative w-full"
              style={{
                minHeight: '200px',
                height: '200px',
                backgroundColor: folder.color ? `${folder.color}15` : '#FDF2F8',
                backgroundImage: folder.coverImageUrl ? 'none' : `linear-gradient(135deg, ${folder.color || '#EC4899'}15 0%, ${folder.color || '#EC4899'}30 100%)`
              }}
            >
              {folder.coverImageUrl ? (
                <Image
                  src={folder.coverImageUrl}
                  alt={folder.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  quality={95}
                  priority={false}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {folder.icon ? (
                    <div className="text-6xl">{folder.icon}</div>
                  ) : (
                    <Folder className="w-16 h-16" style={{ color: folder.color || '#EC4899' }} />
                  )}
                </div>
              )}

              {/* Overlay with image count */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-2 left-2 flex items-center space-x-1 text-white text-sm font-medium">
                  <ImageIcon className="w-4 h-4" />
                  <span>{folder.imageCount}</span>
                </div>
              </div>

              {/* Menu button */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleMenuToggle(folder.id, e)}
                  className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-sm"
                >
                  <MoreVertical className="w-4 h-4 text-gray-700" />
                </button>

                {/* Dropdown menu */}
                {menuOpen === folder.id && (
                  <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      onClick={(e) => handleEdit(folder, e)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Upravit</span>
                    </button>
                    <button
                      onClick={(e) => handleDelete(folder.id, e)}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Smazat</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Folder Info */}
            <div className="p-3">
              <h3 className="font-semibold text-gray-900 truncate">
                {folder.name}
              </h3>
              {folder.description && (
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {folder.description}
                </p>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">
                  {folder.imageCount} {folder.imageCount === 1 ? 'obrázek' : folder.imageCount < 5 ? 'obrázky' : 'obrázků'}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {folders.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <Folder className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Zatím nemáte žádné složky
            </h3>
            <p className="text-sm text-gray-600 mb-4 max-w-md">
              Vytvořte si první složku a začněte organizovat své svatební inspirace jako na Pinterestu
            </p>
            <button
              onClick={onCreateFolder}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Vytvořit první složku</span>
            </button>
          </div>
        )}
      </div>

      {/* All Images Preview Section */}
      {allImages.length > 0 && (
        <div className="mt-12 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Všechny fotky</h2>
              <p className="text-sm text-gray-600 mt-1">
                {allImages.length} {allImages.length === 1 ? 'obrázek' : allImages.length < 5 ? 'obrázky' : 'obrázků'} celkem
              </p>
            </div>
          </div>

          {/* Images Masonry Grid */}
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">
            {allImages.map((image) => (
              <div
                key={image.id}
                className="group relative break-inside-avoid mb-4"
                onClick={() => onImageClick && onImageClick(image)}
              >
                <div className="wedding-card relative overflow-hidden bg-gray-100 !p-0">
                  <Image
                    src={image.url}
                    alt={image.title || 'Moodboard image'}
                    width={400}
                    height={600}
                    className="w-full object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    quality={95}
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
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
        </div>
      )}
    </div>
  )
}

