'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { Music, Heart, Loader2, ExternalLink, Download } from 'lucide-react'
import Image from 'next/image'

interface Song {
  id: string
  title: string
  artist: string
  spotifyUrl?: string
  spotifyTrackId?: string
  albumCover?: string
  previewUrl?: string
  duration?: number
  notes?: string
}

interface MusicCategory {
  id: string
  name: string
  description: string
  icon: string
  songs: Song[]
}

interface SharedPlaylist {
  id: string
  weddingId: string
  brideName?: string
  groomName?: string
  weddingDate?: Date
  categories: MusicCategory[]
  vendors?: Array<{
    name: string
    contact?: string
    email?: string
    type?: string
  }>
  createdAt: Date
  expiresAt?: Date
}

export default function SharedPlaylistPage() {
  const params = useParams()
  const shareId = params.shareId as string
  
  const [playlist, setPlaylist] = useState<SharedPlaylist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSharedPlaylist()
  }, [shareId])

  const loadSharedPlaylist = async () => {
    try {
      setLoading(true)
      setError(null)

      const docRef = doc(db, 'sharedPlaylists', shareId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        setError('Playlist nebyl nalezen nebo vypršela jeho platnost')
        return
      }

      const data = docSnap.data()
      
      // Check if expired
      if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
        setError('Platnost tohoto odkazu vypršela')
        return
      }

      setPlaylist({
        id: docSnap.id,
        ...data,
        weddingDate: data.weddingDate?.toDate(),
        createdAt: data.createdAt?.toDate(),
        expiresAt: data.expiresAt?.toDate()
      } as SharedPlaylist)
    } catch (err) {
      console.error('Error loading shared playlist:', err)
      setError('Chyba při načítání playlistu')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return ''
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getTotalSongs = () => {
    if (!playlist) return 0
    return playlist.categories.reduce((total, cat) => total + cat.songs.length, 0)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Načítání playlistu...</p>
        </div>
      </div>
    )
  }

  if (error || !playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Playlist nenalezen</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  const categoriesWithSongs = playlist.categories.filter(cat => cat.songs.length > 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 print:border-0">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <Music className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Svatební Playlist
                </h1>
                {playlist.brideName && playlist.groomName && (
                  <p className="text-lg text-gray-600 flex items-center space-x-2">
                    <span>{playlist.brideName}</span>
                    <Heart className="w-4 h-4 text-pink-500" />
                    <span>{playlist.groomName}</span>
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={handlePrint}
              className="print:hidden btn-outline flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Stáhnout PDF</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-600">{getTotalSongs()}</div>
              <div className="text-sm text-gray-600">Celkem písní</div>
            </div>
            <div className="bg-pink-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-pink-600">{categoriesWithSongs.length}</div>
              <div className="text-sm text-gray-600">Kategorií</div>
            </div>
            {playlist.weddingDate && (
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {new Date(playlist.weddingDate).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })}
                </div>
                <div className="text-sm text-gray-600">Datum svatby</div>
              </div>
            )}
            {playlist.vendors && playlist.vendors.length > 0 && (
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600">{playlist.vendors.length}</div>
                <div className="text-sm text-gray-600">DJ/Hudebníci</div>
              </div>
            )}
          </div>

          {/* Vendors */}
          {playlist.vendors && playlist.vendors.length > 0 && (
            <div className="mt-6 bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Kontakt na DJ/Hudebníky:</h3>
              <div className="space-y-2">
                {playlist.vendors.map((vendor, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{vendor.name}</p>
                      {vendor.type && <p className="text-sm text-gray-600">{vendor.type}</p>}
                    </div>
                    <div className="text-right text-sm">
                      {vendor.email && <p className="text-gray-600">{vendor.email}</p>}
                      {vendor.contact && <p className="text-gray-600">{vendor.contact}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {categoriesWithSongs.map((category) => (
            <div key={category.id} className="bg-white rounded-2xl shadow-lg overflow-hidden print:break-inside-avoid">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{category.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-white">{category.name}</h2>
                    <p className="text-purple-100 text-sm">{category.description}</p>
                  </div>
                  <div className="ml-auto bg-white/20 px-3 py-1 rounded-full">
                    <span className="text-white font-semibold">{category.songs.length} písní</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  {category.songs.map((song, index) => (
                    <div
                      key={song.id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors print:break-inside-avoid"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-purple-600">{index + 1}</span>
                      </div>
                      
                      {song.albumCover && (
                        <div className="flex-shrink-0 print:hidden">
                          <Image
                            src={song.albumCover}
                            alt={song.title}
                            width={48}
                            height={48}
                            className="rounded-lg"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{song.title}</h3>
                        <p className="text-sm text-gray-600 truncate">{song.artist}</p>
                        {song.notes && (
                          <p className="text-xs text-gray-500 mt-1 italic">{song.notes}</p>
                        )}
                      </div>

                      {song.duration && (
                        <div className="text-sm text-gray-500">
                          {formatDuration(song.duration)}
                        </div>
                      )}

                      {song.spotifyUrl && (
                        <a
                          href={song.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="print:hidden flex-shrink-0 p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                          title="Otevřít ve Spotify"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12 print:mt-8">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-gray-600">
          <p className="text-sm">
            Vytvořeno pomocí <span className="font-semibold text-purple-600">SvatBot.cz</span>
          </p>
          <p className="text-xs mt-1 text-gray-500">
            Váš chytrý svatební plánovač
          </p>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
          .print\\:border-0 {
            border: 0 !important;
          }
          .print\\:mt-8 {
            margin-top: 2rem !important;
          }
        }
      `}</style>
    </div>
  )
}

