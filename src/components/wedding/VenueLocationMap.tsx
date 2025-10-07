'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

interface VenueLocationMapProps {
  address: string
  onAddressChange?: (address: string) => void
  className?: string
}

// Declare google namespace for TypeScript
declare global {
  interface Window {
    google: any
    initMap?: () => void
  }
}

export default function VenueLocationMap({ address, onAddressChange, className = '' }: VenueLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [inputValue, setInputValue] = useState(address)

  // Load Google Maps API
  useEffect(() => {
    // Check if already loaded
    if (typeof window !== 'undefined' && typeof (window as any).google !== 'undefined' && (window as any).google.maps) {
      setIsLoaded(true)
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error('Google Maps API key not found')
      return
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      const checkLoaded = setInterval(() => {
        if (typeof (window as any).google !== 'undefined' && (window as any).google.maps) {
          setIsLoaded(true)
          clearInterval(checkLoaded)
        }
      }, 100)
      setTimeout(() => clearInterval(checkLoaded), 10000)
      return
    }

    // Load the script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=cs&region=CZ`
    script.async = true
    script.defer = true
    script.onload = () => setIsLoaded(true)
    script.onerror = () => console.error('Failed to load Google Maps API')
    document.head.appendChild(script)
  }, [])

  // Initialize map and autocomplete
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !inputRef.current) return

    try {
      const google = (window as any).google

      // Initialize map centered on Czech Republic
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: { lat: 49.8175, lng: 15.4730 }, // Center of Czech Republic
        zoom: 7,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      })

      // Initialize autocomplete
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'cz' },
        fields: ['formatted_address', 'geometry', 'name']
      })

      // Handle place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace()
        if (place && place.geometry && place.geometry.location) {
          const location = place.geometry.location
          const newAddress = place.formatted_address || place.name || ''
          
          // Update input
          setInputValue(newAddress)
          if (onAddressChange) {
            onAddressChange(newAddress)
          }

          // Update map
          mapInstanceRef.current.setCenter(location)
          mapInstanceRef.current.setZoom(15)

          // Update or create marker
          if (markerRef.current) {
            markerRef.current.setPosition(location)
          } else {
            markerRef.current = new google.maps.Marker({
              position: location,
              map: mapInstanceRef.current,
              title: newAddress
            })
          }
        }
      })

      // If we have an initial address, geocode it
      if (address && address.trim()) {
        geocodeAddress(address)
      }
    } catch (error) {
      console.error('Error initializing map:', error)
    }

    return () => {
      if (autocompleteRef.current && typeof (window as any).google !== 'undefined') {
        (window as any).google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [isLoaded])

  // Geocode address and show on map
  const geocodeAddress = async (addr: string) => {
    if (!addr || !isLoaded || !mapInstanceRef.current) return

    setIsLoadingLocation(true)
    try {
      const google = (window as any).google
      const geocoder = new google.maps.Geocoder()

      geocoder.geocode(
        { address: addr, region: 'CZ' },
        (results: any[], status: string) => {
          setIsLoadingLocation(false)
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location

            // Update map
            mapInstanceRef.current.setCenter(location)
            mapInstanceRef.current.setZoom(15)

            // Update or create marker
            if (markerRef.current) {
              markerRef.current.setPosition(location)
            } else {
              markerRef.current = new google.maps.Marker({
                position: location,
                map: mapInstanceRef.current,
                title: addr
              })
            }
          }
        }
      )
    } catch (error) {
      console.error('Error geocoding address:', error)
      setIsLoadingLocation(false)
    }
  }

  // Update map when address prop changes
  useEffect(() => {
    if (address !== inputValue) {
      setInputValue(address)
      if (address && address.trim()) {
        geocodeAddress(address)
      }
    }
  }, [address])

  if (!isLoaded) {
    return (
      <div className={`bg-gray-50 rounded-lg p-8 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Načítání mapy...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Address Input with Autocomplete */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          Místo konání
        </label>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Zadejte adresu nebo název místa..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">
          Začněte psát a vyberte místo z našeptávače
        </p>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-96 rounded-lg border border-gray-300"
        />
        {isLoadingLocation && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <Loader2 className="w-6 h-6 text-primary-600 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">Hledání místa...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

