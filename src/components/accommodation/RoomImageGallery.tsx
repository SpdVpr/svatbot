'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface RoomImageGalleryProps {
  images: string[]
  roomName: string
  isOpen: boolean
  onClose: () => void
  initialIndex?: number
}

export default function RoomImageGallery({
  images,
  roomName,
  isOpen,
  onClose,
  initialIndex = 0
}: RoomImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  if (!isOpen || images.length === 0) return null

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowLeft') {
      goToPrevious()
    } else if (e.key === 'ArrowRight') {
      goToNext()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
            className="absolute left-4 text-white hover:text-gray-300 z-10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            className="absolute right-4 text-white hover:text-gray-300 z-10"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Main Image */}
      <div
        className="relative max-w-4xl max-h-[80vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full max-w-4xl max-h-[80vh]">
          <Image
            src={images[currentIndex]}
            alt={`${roomName} - fotka ${currentIndex + 1}`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            priority
          />
        </div>
      </div>

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-md overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(index)
              }}
              className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 ${
                index === currentIndex ? 'ring-2 ring-white' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div className="relative w-full h-full">
                <Image
                  src={image}
                  alt={`${roomName} - náhled ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Hook for managing gallery state
export function useRoomImageGallery() {
  const [isOpen, setIsOpen] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [roomName, setRoomName] = useState('')
  const [initialIndex, setInitialIndex] = useState(0)

  const openGallery = (roomImages: string[], name: string, startIndex: number = 0) => {
    setImages(roomImages)
    setRoomName(name)
    setInitialIndex(startIndex)
    setIsOpen(true)
  }

  const closeGallery = () => {
    setIsOpen(false)
  }

  return {
    isOpen,
    images,
    roomName,
    initialIndex,
    openGallery,
    closeGallery
  }
}
