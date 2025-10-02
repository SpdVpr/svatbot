'use client'

interface GoogleMapsEmbedProps {
  address: string
  className?: string
  height?: string
}

export default function GoogleMapsEmbed({ 
  address, 
  className = "w-full rounded-lg border border-gray-200",
  height = "300px"
}: GoogleMapsEmbedProps) {
  // Encode the address for the Google Maps embed URL
  const encodedAddress = encodeURIComponent(address)
  
  // Google Maps Embed API URL
  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodedAddress}&zoom=15`
  
  // Fallback to Google Maps search URL if API key is not available
  const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`

  // If no API key is available, show a link instead
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`} style={{ height }}>
        <div className="text-center p-4">
          <p className="text-gray-600 mb-2">Zobrazit na mapě:</p>
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Otevřít v Google Maps
          </a>
        </div>
      </div>
    )
  }

  return (
    <iframe
      src={embedUrl}
      className={className}
      style={{ height }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title={`Mapa pro ${address}`}
    />
  )
}
