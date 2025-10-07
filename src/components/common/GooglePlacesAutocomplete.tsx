'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

interface GooglePlacesAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  error?: boolean
}

export default function GooglePlacesAutocomplete({
  value,
  onChange,
  placeholder = 'Zadejte adresu...',
  className = '',
  disabled = false,
  error = false
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Check if Google Maps API is already loaded
    if (typeof window !== 'undefined' && typeof google !== 'undefined' && google.maps && google.maps.places) {
      console.log('✅ Google Maps API already loaded')
      setIsLoaded(true)
      return
    }

    // Load Google Maps API
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error('❌ Google Maps API key not found')
      return
    }

    console.log('🔄 Loading Google Maps API...')

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      console.log('⏳ Google Maps script already exists, waiting for load...')
      // Wait for it to load
      const checkLoaded = setInterval(() => {
        if (typeof google !== 'undefined' && google.maps && google.maps.places) {
          console.log('✅ Google Maps API loaded (from existing script)')
          setIsLoaded(true)
          clearInterval(checkLoaded)
        }
      }, 100)

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkLoaded)
        if (!isLoaded) {
          console.error('❌ Timeout waiting for Google Maps API')
        }
      }, 10000)
      return
    }

    // Load the script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=cs&region=CZ`
    script.async = true
    script.defer = true
    script.onload = () => {
      console.log('✅ Google Maps API loaded successfully')
      setIsLoaded(true)
    }
    script.onerror = (error) => {
      console.error('❌ Failed to load Google Maps API:', error)
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup if needed
    }
  }, [])

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) {
      return
    }

    try {
      console.log('🔧 Initializing Google Places Autocomplete...')

      // Initialize autocomplete
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'cz' },
        fields: ['formatted_address', 'name', 'address_components']
      })

      console.log('✅ Google Places Autocomplete initialized')

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace()
        console.log('📍 Place selected:', place)

        if (place && place.formatted_address) {
          console.log('✅ Using formatted_address:', place.formatted_address)
          onChange(place.formatted_address)
        } else if (place && place.name) {
          console.log('✅ Using name:', place.name)
          onChange(place.name)
        } else {
          console.warn('⚠️ No address or name found in place')
        }
      })
    } catch (error) {
      console.error('❌ Error initializing Google Places Autocomplete:', error)
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [isLoaded, onChange])

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <MapPin className="w-4 h-4 text-gray-400" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${className}`}
        disabled={disabled}
      />
    </div>
  )
}

