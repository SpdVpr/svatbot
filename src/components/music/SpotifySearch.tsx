'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Play, Pause, Plus, ExternalLink, Loader2, Music } from 'lucide-react'
import { spotifyClient, SpotifyTrack } from '@/lib/spotify'
import Image from 'next/image'

interface SpotifySearchProps {
  onSelectTrack: (track: SpotifyTrack) => void
  placeholder?: string
}

export default function SpotifySearch({ onSelectTrack, placeholder }: SpotifySearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SpotifyTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [playingTrack, setPlayingTrack] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setShowResults(false)
      return
    }

    setLoading(true)
    setShowResults(true)

    try {
      const tracks = await spotifyClient.search(searchQuery, 8)
      setResults(tracks)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (value: string) => {
    setQuery(value)

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value)
    }, 500)
  }

  const handlePlayPreview = (track: SpotifyTrack) => {
    if (!track.preview_url) return

    // If already playing this track, pause it
    if (playingTrack === track.id) {
      audioRef.current?.pause()
      setPlayingTrack(null)
      return
    }

    // Stop current audio if any
    if (audioRef.current) {
      audioRef.current.pause()
    }

    // Create new audio element
    audioRef.current = new Audio(track.preview_url)
    audioRef.current.volume = 0.5

    audioRef.current.addEventListener('ended', () => {
      setPlayingTrack(null)
    })

    audioRef.current.play()
    setPlayingTrack(track.id)
  }

  const handleSelectTrack = (track: SpotifyTrack) => {
    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause()
      setPlayingTrack(null)
    }

    onSelectTrack(track)
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query && setShowResults(true)}
          placeholder={placeholder || "Vyhledat píseň na Spotify..."}
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500 animate-spin" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowResults(false)}
          />

          {/* Results */}
          <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 z-20 max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Vyhledávání na Spotify...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="p-2">
                {results.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    {/* Album Cover */}
                    <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                      {track.album.images[0] ? (
                        <Image
                          src={track.album.images[0].url}
                          alt={track.album.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {track.name}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {track.artists.map(a => a.name).join(', ')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {spotifyClient.formatDuration(track.duration_ms)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Preview Button */}
                      {track.preview_url && (
                        <button
                          onClick={() => handlePlayPreview(track)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title={playingTrack === track.id ? "Zastavit ukázku" : "Přehrát ukázku"}
                        >
                          {playingTrack === track.id ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                        </button>
                      )}

                      {/* Spotify Link */}
                      <a
                        href={track.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Otevřít ve Spotify"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>

                      {/* Add Button */}
                      <button
                        onClick={() => handleSelectTrack(track)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Přidat do playlistu"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : query ? (
              <div className="p-8 text-center">
                <Music className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Žádné výsledky pro "{query}"</p>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}

