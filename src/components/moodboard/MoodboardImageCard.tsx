'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Heart, Trash2, Move } from 'lucide-react'
import { MoodboardImage, WEDDING_CATEGORIES } from '@/hooks/useMoodboard'
import Image from 'next/image'

interface MoodboardImageCardProps {
  image: MoodboardImage
  onToggleFavorite: (id: string) => void
  onRemove: (id: string) => void
  onImageClick: (image: MoodboardImage) => void
  onPositionChange?: (imageId: string, position: { x: number; y: number }, size?: { width: number; height: number }) => void
}

export default function MoodboardImageCard({
  image,
  onToggleFavorite,
  onRemove,
  onImageClick,
  onPositionChange
}: MoodboardImageCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  // Calculate initial position using useMemo for stability - only depend on image.id
  const initialPosition = useMemo(() => {
    if (image.position) {
      return image.position
    } else {
      // Generate random position for new images
      const hash = image.id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
      }, 0)

      const containerWidth = 1400 // Approximate container width
      const containerHeight = 1200 // Approximate container height

      const randomX = Math.abs(hash % (containerWidth - 250))
      const randomY = Math.abs((hash >> 8) % (containerHeight - 200))

      return { x: randomX, y: randomY }
    }
  }, [image.id]) // Remove image.position from dependencies!

  const [position, setPosition] = useState(initialPosition)
  const [isHovered, setIsHovered] = useState(false)
  const [imageSize, setImageSize] = useState({ width: 200, height: 200 })

  // Initialize size from saved data
  useEffect(() => {
    if (image.size) {
      setImageSize(image.size)
    }
  }, [image.size])
  const dragRef = useRef<HTMLDivElement>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hasDragged, setHasDragged] = useState(false)
  const [dragStartTime, setDragStartTime] = useState(0)
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 })
  const [lastDragEndTime, setLastDragEndTime] = useState(0)
  const [justMoved, setJustMoved] = useState(false)
  const lastMoveTime = useRef(0)

  const hasBeenDragged = useRef(false)
  const isInitialized = useRef(false)
  const componentMountTime = useRef(Date.now())

  // Initialize position from Firebase only once
  useEffect(() => {
    if (!isInitialized.current && image.position) {
      console.log('🔄 Initializing position from Firebase:', image.title, image.position)
      setPosition(image.position)
      isInitialized.current = true
    } else if (!isInitialized.current) {
      console.log('🎲 Using generated position for:', image.title, initialPosition)
      isInitialized.current = true
    }
  }, [image.position, image.title, initialPosition])





  // Handle image load to get natural dimensions
  const handleImageLoad = (e: any) => {
    const img = e.target
    const aspectRatio = img.naturalWidth / img.naturalHeight
    
    // Calculate size with max constraints
    let width = Math.min(img.naturalWidth, 300)
    let height = width / aspectRatio
    
    if (height > 400) {
      height = 400
      width = height * aspectRatio
    }
    
    // Minimum size constraints
    if (width < 150) {
      width = 150
      height = width / aspectRatio
    }
    
    setImageSize({ width, height })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // Check if this is a real user interaction
    if (!e.isTrusted) {
      console.log('⚠️ Ignoring untrusted mouse event for:', image.title)
      return
    }

    // Ignore events that happen too soon after component mount (likely automatic)
    const timeSinceMount = Date.now() - componentMountTime.current
    if (timeSinceMount < 1000) { // 1 second grace period
      console.log('⏰ Ignoring mouse event too soon after mount:', timeSinceMount, 'ms for:', image.title)
      return
    }

    // Only allow dragging from the drag handle or the image itself
    const target = e.target as HTMLElement
    const isDragHandle = target.closest('.drag-handle')
    const isImage = target.tagName === 'IMG' || target.closest('.image-container')
    const isButton = target.closest('button')

    // Don't start drag if clicking on buttons
    if (isButton && !isDragHandle) {
      return
    }

    if (!isDragHandle && !isImage) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    console.log('🖱️ Mouse down on:', image.title, 'isTrusted:', e.isTrusted)
    setHasDragged(false)
    setDragStartTime(Date.now())
    setDragStartPosition({ x: position.x, y: position.y })
    setIsDragging(true)

    const rect = dragRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    // Throttle mouse move events for better performance
    const now = Date.now()
    if (now - lastMoveTime.current < 16) return // ~60fps
    lastMoveTime.current = now

    // Mark as dragged if moved more than 10px or after 150ms
    const timeDiff = now - dragStartTime
    if (!hasDragged) {
      const container = dragRef.current?.parentElement?.getBoundingClientRect()
      if (container) {
        const currentX = e.clientX - container.left - dragOffset.x
        const currentY = e.clientY - container.top - dragOffset.y
        const distance = Math.sqrt(
          Math.pow(currentX - position.x, 2) +
          Math.pow(currentY - position.y, 2)
        )
        if (distance > 10 || timeDiff > 150) {
          setHasDragged(true)
        }
      }
    }

    const container = dragRef.current?.parentElement?.getBoundingClientRect()
    if (container) {
      const newX = Math.max(0, Math.min(
        container.width - imageSize.width - 16, // Account for padding
        e.clientX - container.left - dragOffset.x
      ))
      const newY = Math.max(0, Math.min(
        container.height - imageSize.height - 16, // Account for padding
        e.clientY - container.top - dragOffset.y
      ))

      setPosition({ x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    console.log('🖱️ Mouse up - isDragging:', isDragging, 'hasDragged:', hasDragged, 'dragStartTime:', dragStartTime)

    // Only process if we actually started dragging with a valid timestamp
    if (isDragging && dragStartTime > 0) {
      // Calculate total distance moved from start position
      const totalDistance = Math.sqrt(
        Math.pow(position.x - dragStartPosition.x, 2) +
        Math.pow(position.y - dragStartPosition.y, 2)
      )

      const timeDiff = Date.now() - dragStartTime
      // Only consider it a drag if mouse actually moved OR user explicitly dragged
      const wasActualDrag = (totalDistance > 15 && hasDragged) || (timeDiff > 200 && hasDragged)

      console.log('📏 Drag analysis:', { totalDistance, timeDiff, wasActualDrag, hasDragged })

      if (wasActualDrag && onPositionChange) {
        // Save position to Firebase only if actually dragged
        console.log('🚀 Saving position:', image.title, position)
        hasBeenDragged.current = true
        onPositionChange(image.id, position, imageSize)
        setLastDragEndTime(Date.now())
        setJustMoved(true)
        // Remove the "just moved" indicator after a short time
        setTimeout(() => setJustMoved(false), 1000)
      } else if (!wasActualDrag) {
        // Only allow click if enough time passed since last drag AND it was a quick click
        const timeSinceLastDrag = Date.now() - lastDragEndTime
        const wasQuickClick = timeDiff < 500 // Less than 500ms = quick click

        if (timeSinceLastDrag > 300 && wasQuickClick) {
          console.log('👆 Treating as quick click')
          onImageClick(image)
        } else {
          console.log('🚫 Ignoring slow click/hold:', { timeDiff, timeSinceLastDrag })
        }
      }
    }
    setIsDragging(false)
    setHasDragged(false)
  }

  useEffect(() => {
    if (isDragging) {
      console.log('📎 Adding mouse event listeners for:', image.title)
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        console.log('🗑️ Removing mouse event listeners for:', image.title)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset, imageSize])

  return (
    <div
      ref={dragRef}
      className={`absolute group select-none ${
        isDragging
          ? 'z-50 scale-105 shadow-2xl cursor-grabbing'
          : 'z-10 hover:z-20 cursor-grab hover:shadow-lg transition-shadow duration-200'
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: imageSize.width,
        height: imageSize.height,
        willChange: isDragging ? 'transform' : 'auto',
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => !isDragging && setIsHovered(true)}
      onMouseLeave={() => !isDragging && setIsHovered(false)}
    >
      {/* Main Image */}
      <div className={`image-container relative w-full h-full rounded-lg overflow-hidden shadow-lg bg-white border-2 transition-all ${
        isDragging
          ? 'border-pink-300'
          : justMoved
          ? 'border-green-300 shadow-green-200'
          : 'border-transparent hover:border-pink-200'
      }`}
      style={{
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)', // Force hardware acceleration
      }}>
        <Image
          src={image.url}
          alt={image.title || 'Moodboard image'}
          fill
          className="object-cover"
          onLoad={handleImageLoad}
          sizes="400px"
          quality={95}
        />
        
        {/* Drag handle */}
        <div className={`drag-handle absolute top-2 left-2 p-1 rounded-full bg-white/80 backdrop-blur-sm transition-opacity ${
          isHovered && !isDragging ? 'opacity-100' : 'opacity-0'
        }`}>
          <Move className="w-3 h-3 text-gray-600" />
        </div>

        {/* Favorite indicator */}
        {image.isFavorite && (
          <div className="absolute top-2 right-2 bg-pink-500 text-white p-1 rounded-full shadow-lg">
            <Heart className="w-3 h-3 fill-current" />
          </div>
        )}

        {/* Actions - only on hover and not dragging */}
        <div className={`absolute top-2 right-2 flex space-x-1 transition-opacity ${
          isHovered && !isDragging ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(image.id)
            }}
            className={`p-1.5 rounded-full backdrop-blur-sm shadow-lg transition-colors ${
              image.isFavorite
                ? 'bg-pink-500 text-white'
                : 'bg-white/90 text-gray-600 hover:bg-white'
            }`}
          >
            <Heart className={`w-3 h-3 ${image.isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove(image.id)
            }}
            className="p-1.5 rounded-full bg-white/90 text-gray-600 hover:bg-white hover:text-red-600 backdrop-blur-sm shadow-lg transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {/* Tags - only visible on hover and not dragging */}
        {(image.tags.length > 0 || image.category !== 'other') && (
          <div className={`absolute bottom-2 left-2 right-2 transition-opacity ${
            isHovered && !isDragging ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="flex flex-wrap gap-1">
              {/* Category tag */}
              <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${WEDDING_CATEGORIES[image.category].color} backdrop-blur-sm`}>
                <span className="mr-1">{WEDDING_CATEGORIES[image.category].icon}</span>
                {WEDDING_CATEGORIES[image.category].label}
              </span>

              {/* Regular tags */}
              {image.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="text-xs bg-white/90 text-gray-700 px-2 py-1 rounded-full backdrop-blur-sm">
                  #{tag}
                </span>
              ))}
              {image.tags.length > 2 && (
                <span className="text-xs bg-white/90 text-gray-700 px-2 py-1 rounded-full backdrop-blur-sm">
                  +{image.tags.length - 2}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
