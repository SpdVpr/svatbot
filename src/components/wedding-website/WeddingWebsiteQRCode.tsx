'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Download } from 'lucide-react'

interface WeddingWebsiteQRCodeProps {
  url: string
  size?: number
  showDownload?: boolean
  className?: string
}

/**
 * QR Code component for wedding website
 * Generates a QR code that links to the wedding website
 */
export default function WeddingWebsiteQRCode({ 
  url, 
  size = 200, 
  showDownload = true,
  className = ''
}: WeddingWebsiteQRCodeProps) {
  
  const handleDownload = () => {
    // Get the SVG element
    const svg = document.getElementById('wedding-qr-code')
    if (!svg) return

    // Create a canvas to convert SVG to PNG
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = size
    canvas.height = size

    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)

    // Create an image and draw it on canvas
    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, size, size)
      ctx.drawImage(img, 0, 0, size, size)
      
      // Convert canvas to PNG and download
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'svatebni-web-qr-kod.png'
        link.click()
        URL.revokeObjectURL(url)
      })
      
      URL.revokeObjectURL(svgUrl)
    }
    img.src = svgUrl
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <QRCodeSVG
          id="wedding-qr-code"
          value={url}
          size={size}
          level="H"
          includeMargin={true}
          imageSettings={{
            src: '/logo.png',
            height: size * 0.15,
            width: size * 0.15,
            excavate: true,
          }}
        />
      </div>
      
      {showDownload && (
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Stáhnout QR kód</span>
        </button>
      )}
    </div>
  )
}

