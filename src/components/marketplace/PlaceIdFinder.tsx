'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface PlaceIdFinderProps {
  onPlaceSelected: (placeId: string, mapsUrl: string, placeName: string) => void
  initialValue?: string
}

export default function PlaceIdFinder({ onPlaceSelected, initialValue }: PlaceIdFinderProps) {
  const [searchQuery, setSearchQuery] = useState(initialValue || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<any>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load Google Maps API
    if (typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places&language=cs`
      script.async = true
      script.defer = true
      script.onload = initAutocomplete
      document.head.appendChild(script)
    } else if (window.google) {
      initAutocomplete()
    }
  }, [])

  const initAutocomplete = () => {
    if (!inputRef.current || !window.google) return

    // Initialize autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'cz' },
      fields: ['place_id', 'name', 'formatted_address', 'geometry', 'url', 'rating', 'user_ratings_total'],
      types: ['establishment']
    })

    // Listen for place selection
    autocompleteRef.current.addListener('place_changed', handlePlaceSelect)
  }

  const handlePlaceSelect = () => {
    if (!autocompleteRef.current) return

    const place = autocompleteRef.current.getPlace()

    if (!place.place_id) {
      setError('Místo nebylo nalezeno. Zkuste jiný název.')
      return
    }

    setError(null)
    setSelectedPlace(place)

    // Generate Google Maps URL
    const mapsUrl = place.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`

    // Call parent callback
    onPlaceSelected(place.place_id, mapsUrl, place.name || '')

    console.log('✅ Place selected:', {
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      reviewCount: place.user_ratings_total,
      mapsUrl
    })
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🔍 Vyhledat místo na Google Maps
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Začněte psát název vaší firmy..."
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          💡 Tip: Začněte psát název vaší firmy a vyberte ji ze seznamu návrhů
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Selected Place Info */}
      {selectedPlace && (
        <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-green-900 mb-1">
              ✅ Místo nalezeno!
            </h4>
            <p className="text-sm text-green-800 mb-2">
              <strong>{selectedPlace.name}</strong>
            </p>
            <p className="text-xs text-green-700 mb-2">
              {selectedPlace.formatted_address}
            </p>
            {selectedPlace.rating && (
              <p className="text-xs text-green-700">
                ⭐ {selectedPlace.rating} ({selectedPlace.user_ratings_total} recenzí)
              </p>
            )}
            <p className="text-xs text-green-600 mt-2 font-mono break-all">
              Place ID: {selectedPlace.place_id}
            </p>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          📖 Jak to funguje?
        </h4>
        <ol className="text-xs text-blue-800 space-y-1 ml-4 list-decimal">
          <li>Začněte psát název vaší firmy do vyhledávacího pole</li>
          <li>Vyberte správné místo ze seznamu návrhů</li>
          <li>Place ID a Google Maps URL se automaticky vyplní</li>
          <li>Hotovo! Vaše Google recenze se budou zobrazovat na marketplace</li>
        </ol>
      </div>
    </div>
  )
}

