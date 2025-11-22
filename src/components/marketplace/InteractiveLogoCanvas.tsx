'use client'

import { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import { MarketplaceVendor } from '@/types/vendor'

interface InteractiveLogoCanvasProps {
  vendors: MarketplaceVendor[]
  maxLogos?: number
  height?: number
}

export default function InteractiveLogoCanvas({
  vendors,
  maxLogos = 50,
  height = 500
}: InteractiveLogoCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const renderRef = useRef<Matter.Render | null>(null)
  const runnerRef = useRef<Matter.Runner | null>(null)
  const mouseConstraintRef = useRef<Matter.MouseConstraint | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return

    const container = canvasRef.current
    const width = container.clientWidth
    const canvasHeight = height

    console.log('🎨 InteractiveLogoCanvas initializing:', { width, height: canvasHeight, vendorCount: vendors.length })

    // Create engine with very gentle gravity
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0.15 } // Very gentle gravity for floating effect
    })
    engineRef.current = engine

    // Create renderer
    const render = Matter.Render.create({
      element: container,
      engine: engine,
      options: {
        width,
        height: canvasHeight,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio || 1
      }
    })
    renderRef.current = render

    // Style the canvas
    if (render.canvas) {
      render.canvas.style.display = 'block'
      render.canvas.style.width = '100%'
      render.canvas.style.height = '100%'
    }

    // Create walls (invisible boundaries)
    const wallThickness = 50
    const walls = [
      // Bottom
      Matter.Bodies.rectangle(width / 2, canvasHeight + wallThickness / 2, width, wallThickness, {
        isStatic: true,
        render: { fillStyle: 'transparent' }
      }),
      // Left
      Matter.Bodies.rectangle(-wallThickness / 2, canvasHeight / 2, wallThickness, canvasHeight, {
        isStatic: true,
        render: { fillStyle: 'transparent' }
      }),
      // Right
      Matter.Bodies.rectangle(width + wallThickness / 2, canvasHeight / 2, wallThickness, canvasHeight, {
        isStatic: true,
        render: { fillStyle: 'transparent' }
      }),
      // Top
      Matter.Bodies.rectangle(width / 2, -wallThickness / 2, width, wallThickness, {
        isStatic: true,
        render: { fillStyle: 'transparent' }
      })
    ]

    Matter.Composite.add(engine.world, walls)

    // Get all vendors (limit to maxLogos)
    // We'll show logo if available, otherwise text with vendor name
    const selectedVendors = vendors.slice(0, maxLogos)

    // Calculate logo size based on count
    const vendorCount = selectedVendors.length
    const fillerCount = Math.max(30, 60 - vendorCount) // At least 30 filler balls for better visual
    const totalObjects = vendorCount + fillerCount

    // Dynamic sizing: more objects = smaller size
    const baseSize = totalObjects < 40 ? 60 : totalObjects < 80 ? 50 : 40
    const logoSize = baseSize * 1.3 // Logos slightly bigger
    const ballSize = baseSize // Balls same size as base

    // Preload logo images for custom rendering
    const logoImages = new Map<string, HTMLImageElement>()
    selectedVendors.forEach((vendor) => {
      if (vendor.logo) {
        const img = new Image()
        // Don't set crossOrigin for Firebase Storage URLs to avoid CORS issues
        // Firebase Storage already allows same-origin access
        img.src = vendor.logo
        logoImages.set(vendor.id, img)
      }
    })

    // Create vendor bodies - start them visible on canvas
    // All vendors will use custom rendering (either logo or text)
    const vendorBodies = selectedVendors.map((vendor, index) => {
      const x = Math.random() * (width - 100) + 50
      const y = Math.random() * (canvasHeight * 0.3) + 50 // Start in upper 30% of canvas
      const radius = logoSize / 2

      const body = Matter.Bodies.circle(x, y, radius, {
        restitution: 0.6,
        friction: 0.1,
        density: 0.002, // Slightly heavier than balls
        render: {
          // Completely invisible - we'll render custom in afterRender
          visible: false,
          fillStyle: 'transparent',
          strokeStyle: 'transparent',
          lineWidth: 0,
          opacity: 0
        },
        label: `vendor-${vendor.id}-${vendor.name}` // Include name in label for custom rendering
      })

      // Add initial velocity for movement
      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 2,
        y: Math.random() * 2
      })

      return body
    })

    // Create colorful filler balls
    const colors = [
      '#f43f5e', // rose-500
      '#ec4899', // pink-500
      '#a855f7', // purple-500
      '#8b5cf6', // violet-500
      '#6366f1', // indigo-500
      '#3b82f6', // blue-500
      '#06b6d4', // cyan-500
      '#10b981', // emerald-500
      '#f59e0b', // amber-500
      '#ef4444', // red-500
    ]

    const fillerBalls = Array.from({ length: fillerCount }, (_, index) => {
      const x = Math.random() * (width - 100) + 50
      const y = Math.random() * (canvasHeight * 0.6) + 50 // Start in upper 60% of canvas
      const radius = (ballSize / 2) + (Math.random() * 15 - 7.5) // More size variation
      const color = colors[Math.floor(Math.random() * colors.length)]

      const body = Matter.Bodies.circle(x, y, radius, {
        restitution: 0.7, // More bouncy
        friction: 0.05,
        density: 0.0008,
        render: {
          fillStyle: color,
          strokeStyle: 'rgba(255, 255, 255, 0.4)',
          lineWidth: 3
        },
        label: 'filler-ball'
      })

      // Add initial velocity for movement
      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 3,
        y: Math.random() * 3
      })

      return body
    })

    // Create invisible barrier at bottom center (where search bar is)
    // Search bar is max-w-3xl (768px) centered
    const searchBarWidth = Math.min(768, width * 0.8) // Max 768px or 80% of canvas width
    const searchBarHeight = 60 // Height of barrier

    const bottomBarrier = Matter.Bodies.rectangle(
      width / 2, // Centered horizontally
      canvasHeight - 10, // 10px from bottom edge
      searchBarWidth,
      searchBarHeight,
      {
        isStatic: true,
        render: {
          visible: false,
          fillStyle: 'transparent'
        },
        label: 'search-bar-barrier'
      }
    )

    // Add all bodies to world (including barrier)
    Matter.Composite.add(engine.world, [...vendorBodies, ...fillerBalls, bottomBarrier])

    // Add mouse control
    const mouse = Matter.Mouse.create(render.canvas)
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    })
    mouseConstraintRef.current = mouseConstraint

    Matter.Composite.add(engine.world, mouseConstraint)

    // Keep mouse in sync with rendering
    render.mouse = mouse

    // Mouse repulsion effect
    const repulsionRadius = 200 // Radius of repulsion effect (increased)
    const repulsionForce = 0.003 // Strength of repulsion (significantly increased)

    Matter.Events.on(engine, 'beforeUpdate', () => {
      if (!mouse.position.x || !mouse.position.y) return

      const allBodies = Matter.Composite.allBodies(engine.world)

      allBodies.forEach((body) => {
        // Skip static bodies (walls)
        if (body.isStatic) return

        // Calculate distance from mouse to body
        const dx = body.position.x - mouse.position.x
        const dy = body.position.y - mouse.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Apply repulsion force if within radius
        if (distance < repulsionRadius && distance > 0) {
          const forceMagnitude = repulsionForce * (1 - distance / repulsionRadius)
          const forceX = (dx / distance) * forceMagnitude * body.mass
          const forceY = (dy / distance) * forceMagnitude * body.mass

          Matter.Body.applyForce(body, body.position, {
            x: forceX,
            y: forceY
          })
        }
      })
    })

    // Custom rendering for logos and text
    Matter.Events.on(render, 'afterRender', () => {
      const context = render.context

      vendorBodies.forEach((body) => {
        const label = body.label
        // Extract vendor ID and name from label (format: "vendor-{id}-{name}")
        const parts = label.split('-')
        const vendorId = parts[1]
        const namePart = parts.slice(2).join('-')

        context.save()

        // Position at body center
        context.translate(body.position.x, body.position.y)
        context.rotate(body.angle)

        // Check if vendor has logo
        const logoImg = logoImages.get(vendorId)

        if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
          // Draw logo with transparency preserved and rounded corners
          const size = logoSize
          const radius = size * 0.15 // 15% radius for rounded corners

          // Ensure transparency is preserved
          context.globalCompositeOperation = 'source-over'

          // Create rounded rectangle clipping path
          context.save()
          context.beginPath()
          context.moveTo(-size / 2 + radius, -size / 2)
          context.lineTo(size / 2 - radius, -size / 2)
          context.quadraticCurveTo(size / 2, -size / 2, size / 2, -size / 2 + radius)
          context.lineTo(size / 2, size / 2 - radius)
          context.quadraticCurveTo(size / 2, size / 2, size / 2 - radius, size / 2)
          context.lineTo(-size / 2 + radius, size / 2)
          context.quadraticCurveTo(-size / 2, size / 2, -size / 2, size / 2 - radius)
          context.lineTo(-size / 2, -size / 2 + radius)
          context.quadraticCurveTo(-size / 2, -size / 2, -size / 2 + radius, -size / 2)
          context.closePath()
          context.clip()

          // Draw the image with rounded corners
          context.drawImage(logoImg, -size / 2, -size / 2, size, size)
          context.restore()
        } else if (namePart) {
          // Set font first to measure text
          const fontSize = logoSize * 0.25
          context.font = `bold ${fontSize}px Arial, sans-serif`

          // Measure text width
          const textMetrics = context.measureText(namePart)
          const textWidth = textMetrics.width

          // Calculate rectangle dimensions with padding
          const padding = fontSize * 0.8 // Padding around text
          const rectWidth = textWidth + padding * 2
          const rectHeight = fontSize * 2.5 // Height for single line text
          const radius = Math.min(rectWidth, rectHeight) * 0.15 // 15% radius for rounded corners

          // Draw white rounded rectangle background for text
          context.save()
          context.beginPath()
          context.moveTo(-rectWidth / 2 + radius, -rectHeight / 2)
          context.lineTo(rectWidth / 2 - radius, -rectHeight / 2)
          context.quadraticCurveTo(rectWidth / 2, -rectHeight / 2, rectWidth / 2, -rectHeight / 2 + radius)
          context.lineTo(rectWidth / 2, rectHeight / 2 - radius)
          context.quadraticCurveTo(rectWidth / 2, rectHeight / 2, rectWidth / 2 - radius, rectHeight / 2)
          context.lineTo(-rectWidth / 2 + radius, rectHeight / 2)
          context.quadraticCurveTo(-rectWidth / 2, rectHeight / 2, -rectWidth / 2, rectHeight / 2 - radius)
          context.lineTo(-rectWidth / 2, -rectHeight / 2 + radius)
          context.quadraticCurveTo(-rectWidth / 2, -rectHeight / 2, -rectWidth / 2 + radius, -rectHeight / 2)
          context.closePath()

          // Fill with white background
          context.fillStyle = '#ffffff'
          context.fill()

          // Add border
          context.strokeStyle = '#e5e7eb'
          context.lineWidth = 2
          context.stroke()
          context.restore()

          // Draw text (centered, single line)
          context.fillStyle = '#1f2937' // gray-800
          context.textAlign = 'center'
          context.textBaseline = 'middle'
          context.fillText(namePart, 0, 0)
        }

        context.restore()
      })
    })

    // Create and run runner
    const runner = Matter.Runner.create()
    runnerRef.current = runner
    Matter.Runner.run(runner, engine)
    Matter.Render.run(render)

    console.log('✅ Physics engine started, canvas:', render.canvas)
    console.log('✅ Runner created and started')
    setIsLoaded(true)

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up physics engine')
      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current)
      }
      Matter.Render.stop(render)
      Matter.Engine.clear(engine)
      if (render.canvas) {
        render.canvas.remove()
      }
      if (render.textures) {
        render.textures = {}
      }
    }
  }, [vendors, maxLogos, height])

  return (
    <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 50%, rgba(244, 63, 94, 0.2) 100%)'
        }}
      />

      {/* Canvas container */}
      <div
        ref={canvasRef}
        className="absolute inset-0"
      />

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-lg font-medium">Načítání fyziky...</div>
        </div>
      )}
    </div>
  )
}

