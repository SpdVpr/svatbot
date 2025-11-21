'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Loader2, ExternalLink } from 'lucide-react'

interface VenueAddressAutocompleteProps {
  address: string
  onAddressChange: (address: string) => void
  mapUrl?: string
  onMapUrlChange?: (url: string) => void
  placeholder?: string
  label?: string
}

// Declare google namespace for TypeScript
declare global {
  interface Window {
    google: any
  }
}

export default function VenueAddressAutocomplete({
  address,
  onAddressChange,
  mapUrl,
  onMapUrlChange,
  placeholder = 'Zadejte adresu nebo název místa...',
  label = 'Adresa'
}: VenueAddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [inputValue, setInputValue] = useState(address)

  // Load Google Maps API
  useEffect(() => {
    // Check if already loaded
    if (typeof window !== 'undefined' && window.google?.maps?.places) {
      console.log('✅ Google Maps already loaded (VenueAddressAutocomplete)')
      setIsLoaded(true)
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error('❌ Google Maps API key not found')
      return
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      console.log('📜 Google Maps script exists, waiting for load... (VenueAddressAutocomplete)')
      // Poll for Google Maps to be ready
      const checkInterval = setInterval(() => {
        if (window.google?.maps?.places) {
          console.log('✅ Google Maps loaded (existing script - VenueAddressAutocomplete)')
          setIsLoaded(true)
          clearInterval(checkInterval)
        }
      }, 100)
      
      setTimeout(() => {
        clearInterval(checkInterval)
        if (!window.google?.maps?.places) {
          console.error('❌ Google Maps failed to load within timeout')
        }
      }, 10000)
      return
    }

    console.log('📥 Loading Google Maps API... (VenueAddressAutocomplete)')

    // Load without callback - simpler approach
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=cs&region=CZ`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      console.log('📜 Script loaded, waiting for Google Maps API... (VenueAddressAutocomplete)')
      const checkInterval = setInterval(() => {
        if (window.google?.maps?.places) {
          console.log('✅ Google Maps API ready (VenueAddressAutocomplete)')
          setIsLoaded(true)
          clearInterval(checkInterval)
        }
      }, 50)
      
      setTimeout(() => {
        clearInterval(checkInterval)
        if (!window.google?.maps?.places) {
          console.error('❌ Google Maps API not ready after script load')
        }
      }, 5000)
    }
    
    script.onerror = () => {
      console.error('❌ Failed to load Google Maps script')
    }
    
    document.head.appendChild(script)
  }, [])

  // Initialize autocomplete
  useEffect(() => {
    if (!isLoaded || !inputRef.current) {
      return
    }

    // Prevent re-initialization
    if (autocompleteRef.current) {
      return
    }

    try {
      const google = (window as any).google
      console.log('🔍 Initializing autocomplete... (VenueAddressAutocomplete)')

      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'cz' },
        fields: ['formatted_address', 'geometry', 'name', 'place_id', 'url']
      })
      console.log('✅ Autocomplete initialized (VenueAddressAutocomplete)')

      // Handle place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace()
        console.log('📍 Place selected:', place)
        
        if (place && place.geometry && place.geometry.location) {
          const newAddress = place.formatted_address || place.name || ''
          console.log('✅ Valid place selected:', newAddress)

          // Update address
          setInputValue(newAddress)
          onAddressChange(newAddress)

          // Generate Google Maps URL
          if (onMapUrlChange && place.place_id) {
            const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
            onMapUrlChange(mapsUrl)
            console.log('✅ Generated Maps URL:', mapsUrl)
          }
        }
      })
    } catch (error) {
      console.error('❌ Error initializing autocomplete:', error)
    }

    return () => {
      if (autocompleteRef.current && typeof (window as any).google !== 'undefined') {
        (window as any).google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [isLoaded, onAddressChange, onMapUrlChange])

  // Update input value when address prop changes
  useEffect(() => {
    if (address !== inputValue) {
      setInputValue(address)
    }
  }, [address])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    onAddressChange(value)
  }

  if (!isLoaded) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          {label}
        </label>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          <span className="text-sm text-gray-500">Načítání...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <MapPin className="w-4 h-4 inline mr-1" />
        {label}
      </label>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
      />
      <p className="mt-1 text-xs text-gray-500">
        Začněte psát a vyberte místo z našeptávače. Google Maps odkaz se vygeneruje automaticky.
      </p>
      {mapUrl && (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-pink-600 hover:text-pink-700"
        >
          <ExternalLink className="w-3 h-3" />
          Zobrazit na Google Maps
        </a>
      )}
    </div>
  )
}

