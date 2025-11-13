'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Copy, Check, QrCode as QrCodeIcon, Printer } from 'lucide-react'

interface AdminQRCodeProps {
  url: string
  size?: number
  className?: string
}

/**
 * Admin QR Code component with tracking URL
 * Generates QR code for svatbot.cz with UTM parameters for tracking
 */
export default function AdminQRCode({ 
  url, 
  size = 300, 
  className = ''
}: AdminQRCodeProps) {
  const [copied, setCopied] = useState(false)

  // Add UTM parameters for tracking
  const trackingUrl = `${url}?utm_source=qr_code&utm_medium=offline&utm_campaign=print_materials`

  const handleDownloadPNG = () => {
    const svg = document.getElementById('admin-qr-code')
    if (!svg) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // High resolution for print
    const printSize = size * 4
    canvas.width = printSize
    canvas.height = printSize

    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, printSize, printSize)
      ctx.drawImage(img, 0, 0, printSize, printSize)
      
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'svatbot-qr-kod-high-res.png'
        link.click()
        URL.revokeObjectURL(url)
      })
      
      URL.revokeObjectURL(svgUrl)
    }
    img.src = svgUrl
  }

  const handleDownloadSVG = () => {
    const svg = document.getElementById('admin-qr-code')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'svatbot-qr-kod.svg'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const svg = document.getElementById('admin-qr-code')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SvatBot.cz QR Kód</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 40px;
              font-family: Arial, sans-serif;
            }
            .qr-container {
              text-align: center;
              page-break-inside: avoid;
            }
            h1 {
              font-size: 32px;
              margin-bottom: 20px;
              color: #1f2937;
            }
            .qr-code {
              margin: 30px 0;
            }
            .url {
              font-size: 18px;
              color: #6b7280;
              margin-top: 20px;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>SvatBot.cz</h1>
            <div class="qr-code">${svgData}</div>
            <p class="url">${url}</p>
          </div>
        </body>
      </html>
    `)
    
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      {/* QR Code Display */}
      <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-200">
        <QRCodeSVG
          id="admin-qr-code"
          value={trackingUrl}
          size={size}
          level="H"
          includeMargin={true}
        />
      </div>

      {/* URL Display */}
      <div className="w-full max-w-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tracking URL
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={trackingUrl}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
          />
          <button
            onClick={handleCopyUrl}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Kopírovat URL"
          >
            {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={handleDownloadPNG}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Stáhnout PNG (tisk)</span>
        </button>
        
        <button
          onClick={handleDownloadSVG}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Stáhnout SVG</span>
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Vytisknout</span>
        </button>
      </div>

      {/* Info */}
      <div className="text-center text-sm text-gray-600 max-w-md">
        <p>
          QR kód obsahuje tracking parametry pro sledování návštěvnosti z offline materiálů.
          Stáhněte PNG verzi pro tisk nebo SVG pro další úpravy.
        </p>
      </div>
    </div>
  )
}

