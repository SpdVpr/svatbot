'use client'

import { useState, useRef, useEffect, memo } from 'react'
import { Heart, Trash2, Move, Sparkles } from 'lucide-react'
import { MoodboardImage, WEDDING_CATEGORIES } from '@/hooks/useMoodboard'

interface SimpleMoodboardCardProps {
  image: MoodboardImage
  onImageClick: (image: MoodboardImage) => void
  onPositionChange: (imageId: string, position: { x: number; y: number }, size?: { width: number; height: number }) => void
  onToggleFavorite: (imageId: string) => void
  onRemove: (imageId: string) => void
}

function SimpleMoodboardCard({
  image,
  onImageClick,
  onPositionChange,
  onToggleFavorite,
  onRemove
}: SimpleMoodboardCardProps) {
  // Simple state management
  const [position, setPosition] = useState(image.position || { x: 0, y: 0 })

  // AI generated images should be larger by default
  // If image has saved size but it's too small for AI image, upgrade it
  const getInitialSize = () => {
    if (image.size) {
      // If it's an AI image and saved size is small, upgrade to larger size
      if (image.source === 'ai-generated') {
        const maxDimension = Math.max(image.size.width, image.size.height)
        if (maxDimension < 400) {
          // Upgrade small AI images to larger size
          return { width: 500, height: 500 }
        }
      }
      return image.size
    }
    // Default sizes for new images
    return image.source === 'ai-generated' ? { width: 500, height: 500 } : { width: 200, height: 200 }
  }

  const [imageSize, setImageSize] = useState(getInitialSize())
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 })
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  // Always use full quality like in dashboard
  const [showFullQuality] = useState(true)
  const [hasBeenResized, setHasBeenResized] = useState(false)

  const dragRef = useRef<HTMLDivElement>(null)
  const startPos = useRef({ x: 0, y: 0 })
  const hasMoved = useRef(false)
  const aspectRatio = useRef(1)

  // Update position when it changes in Firebase (but not during drag)
  useEffect(() => {
    if (image.position && !isDragging) {
      setPosition(image.position)
    } else if (!image.position) {
      // Generate initial position for new images
      const hash = image.id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
      }, 0)

      const randomX = Math.abs(hash % 1000)
      const randomY = Math.abs((hash >> 8) % 800)

      setPosition({ x: randomX, y: randomY })
    }
  }, [image.position, isDragging])

  // Check if image was loaded from Firebase with large size (user previously resized it)
  useEffect(() => {
    if (image.size) {
      const maxDimension = Math.max(image.size.width, image.size.height)
      if (maxDimension > 350) {
        setHasBeenResized(true)
      }
    }
  }, [image.size])

  // Check and upgrade AI image size when image loads or changes
  useEffect(() => {
    console.log('🔍 Checking image size:', {
      id: image.id,
      source: image.source,
      currentSize: imageSize,
      savedSize: image.size
    })

    if (image.source === 'ai-generated') {
      const currentMax = Math.max(imageSize.width, imageSize.height)
      console.log('🤖 AI image detected, current max dimension:', currentMax)

      // If current size is too small, upgrade it
      if (currentMax < 400) {
        console.log('📐 Upgrading AI image from', imageSize, 'to 500x500')
        const newSize = { width: 500, height: 500 }
        setImageSize(newSize)

        // Save to database immediately
        setTimeout(() => {
          console.log('💾 Saving upgraded size to database')
          onPositionChange(image.id, position, newSize)
        }, 100)
      } else {
        console.log('✅ AI image size is already good:', currentMax)
      }
    }
  }, [image.id, image.source])

  // Handle image load for sizing
  const handleImageLoad = (e: any) => {
    const img = e.target
    aspectRatio.current = img.naturalWidth / img.naturalHeight
    setImageLoaded(true)

    // Only set initial size if not already set from Firebase
    if (!image.size) {
      // AI generated images should be larger
      const maxWidth = image.source === 'ai-generated' ? 500 : 300
      let width = Math.min(img.naturalWidth, maxWidth)
      let height = width / aspectRatio.current

      const maxHeight = image.source === 'ai-generated' ? 600 : 400
      if (height > maxHeight) {
        height = maxHeight
        width = height * aspectRatio.current
      }

      if (width < 150) {
        width = 150
        height = width / aspectRatio.current
      }

      setImageSize({ width, height })
    }
  }

  // Always use full quality - removed quality switching logic for better UX

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsResizing(true)
    setResizeStartSize(imageSize)

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    setResizeStartPos({ x: clientX, y: clientY })
  }

  const handleResize = (e: MouseEvent | TouchEvent) => {
    if (!isResizing) return

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    const deltaX = clientX - resizeStartPos.x
    const deltaY = clientY - resizeStartPos.y

    // Use the larger delta to maintain aspect ratio
    const delta = Math.max(deltaX, deltaY)

    let newWidth = Math.max(100, resizeStartSize.width + delta)
    let newHeight = newWidth / aspectRatio.current

    // Limit maximum size
    const maxSize = 600
    if (newWidth > maxSize) {
      newWidth = maxSize
      newHeight = newWidth / aspectRatio.current
    }

    setImageSize({ width: newWidth, height: newHeight })
  }

  const handleResizeEnd = () => {
    if (isResizing) {
      setIsResizing(false)
      setHasBeenResized(true) // Mark that user has manually resized this image
      onPositionChange(image.id, position, imageSize)
    }
  }

  // Simple drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()

    setIsDragging(true)
    hasMoved.current = false
    startPos.current = { x: e.clientX, y: e.clientY }

    const rect = dragRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      handleResize(e)
      return
    }

    if (!isDragging) return

    // Check if mouse actually moved
    const moved = Math.abs(e.clientX - startPos.current.x) > 5 ||
                  Math.abs(e.clientY - startPos.current.y) > 5

    if (moved) {
      hasMoved.current = true
    }

    const container = dragRef.current?.parentElement?.getBoundingClientRect()
    if (container) {
      const newX = Math.max(0, Math.min(
        container.width - imageSize.width - 16,
        e.clientX - container.left - dragOffset.x
      ))
      const newY = Math.max(0, Math.min(
        container.height - imageSize.height - 16,
        e.clientY - container.top - dragOffset.y
      ))

      setPosition({ x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    if (isResizing) {
      handleResizeEnd()
      return
    }

    if (isDragging) {
      if (hasMoved.current) {
        // Save position if actually moved
        onPositionChange(image.id, position, imageSize)
      } else {
        // Treat as click if not moved
        onImageClick(image)
      }
    }

    setIsDragging(false)
    hasMoved.current = false
  }

  // Touch handlers for mobile
  const handleTouchMove = (e: TouchEvent) => {
    if (isResizing) {
      handleResize(e)
      return
    }

    if (!isDragging) return

    const touch = e.touches[0]
    const moved = Math.abs(touch.clientX - startPos.current.x) > 5 ||
                  Math.abs(touch.clientY - startPos.current.y) > 5

    if (moved) {
      hasMoved.current = true
    }

    const container = dragRef.current?.parentElement?.getBoundingClientRect()
    if (container) {
      const newX = Math.max(0, Math.min(
        container.width - imageSize.width - 16,
        touch.clientX - container.left - dragOffset.x
      ))
      const newY = Math.max(0, Math.min(
        container.height - imageSize.height - 16,
        touch.clientY - container.top - dragOffset.y
      ))

      setPosition({ x: newX, y: newY })
    }
  }

  const handleTouchEnd = () => {
    if (isResizing) {
      handleResizeEnd()
      return
    }

    if (isDragging) {
      if (hasMoved.current) {
        onPositionChange(image.id, position, imageSize)
      } else {
        onImageClick(image)
      }
    }

    setIsDragging(false)
    hasMoved.current = false
  }

  // Add/remove global events
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp])

  const category = WEDDING_CATEGORIES[image.category as keyof typeof WEDDING_CATEGORIES]

  return (
    <div
      ref={dragRef}
      className={`absolute select-none ${
        isDragging ? 'cursor-grabbing z-50' :
        isResizing ? 'cursor-nw-resize z-50' :
        'cursor-grab z-10'
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: imageSize.width,
        height: imageSize.height,
        transform: (isDragging || isResizing) ? 'scale(1.05)' : 'scale(1)',
        transition: (isDragging || isResizing) ? 'none' : 'transform 0.2s ease'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={(e) => {
        const touch = e.touches[0]
        setIsDragging(true)
        hasMoved.current = false
        startPos.current = { x: touch.clientX, y: touch.clientY }

        const rect = dragRef.current?.getBoundingClientRect()
        if (rect) {
          setDragOffset({
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
          })
        }
      }}
      onMouseEnter={() => !(isDragging || isResizing) && setIsHovered(true)}
      onMouseLeave={() => !(isDragging || isResizing) && setIsHovered(false)}
    >
      <div className={`relative w-full h-full rounded-lg overflow-hidden shadow-lg bg-white border-2 ${
        isDragging ? 'border-pink-300' : 'border-transparent hover:border-pink-200'
      } transition-all`}>
        
        {/* Image - always full quality like dashboard */}
        <div className="relative w-full h-full">
          {/* Main image - always use full quality */}
          <img
            src={image.url}
            alt={image.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            draggable={false}
          />

          {/* Loading indicator */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Hover overlay */}
        {isHovered && !isDragging && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite(image.id)
                }}
                className={`p-2 rounded-full ${image.isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700'} hover:scale-110 transition-transform`}
              >
                <Heart size={16} fill={image.isFavorite ? 'currentColor' : 'none'} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(image.id)
                }}
                className="p-2 rounded-full bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )}

        {/* AI Generated badge */}
        {image.source === 'ai-generated' && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg">
              <Sparkles size={12} />
              AI Generated
            </span>
          </div>
        )}

        {/* Category badge */}
        {category && image.source !== 'ai-generated' && (
          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
              <span>{category.icon}</span>
              {category.label}
            </span>
          </div>
        )}

        {/* Drag handle */}
        <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
          <div className="p-1 rounded bg-white/90 text-gray-700">
            <Move size={14} />
          </div>
        </div>

        {/* Resize handle */}
        <div
          className={`absolute bottom-0 right-0 w-6 h-6 cursor-nw-resize ${
            isHovered || isResizing ? 'opacity-100' : 'opacity-0'
          } transition-opacity`}
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
        >
          <div className="absolute bottom-1 right-1 w-0 h-0 border-l-[12px] border-l-transparent border-b-[12px] border-b-white/90">
            <div className="absolute -bottom-2 -right-2 w-0 h-0 border-l-[8px] border-l-transparent border-b-[8px] border-b-gray-600"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders
export default memo(SimpleMoodboardCard, (prevProps, nextProps) => {
  // Only re-render if image data actually changed significantly
  const prevPos = prevProps.image.position
  const nextPos = nextProps.image.position
  const prevSize = prevProps.image.size
  const nextSize = nextProps.image.size

  // Check if position changed by more than 1px (to avoid micro-updates)
  const positionChanged = !prevPos || !nextPos ||
    Math.abs(prevPos.x - nextPos.x) > 1 ||
    Math.abs(prevPos.y - nextPos.y) > 1

  // Check if size changed significantly
  const sizeChanged = !prevSize || !nextSize ||
    Math.abs(prevSize.width - nextSize.width) > 1 ||
    Math.abs(prevSize.height - nextSize.height) > 1

  // Only re-render if there are significant changes
  return (
    prevProps.image.id === nextProps.image.id &&
    !positionChanged &&
    !sizeChanged &&
    prevProps.image.isFavorite === nextProps.image.isFavorite &&
    prevProps.image.url === nextProps.image.url
  )
})
