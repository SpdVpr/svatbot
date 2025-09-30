'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Trash2, ExternalLink, Music, GripVertical } from 'lucide-react'
import { spotifyClient } from '@/lib/spotify'
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

interface SongCardProps {
  song: Song
  onRemove: () => void
  isPlaying?: boolean
  onPlayToggle?: () => void
}

export default function SongCard({ song, onRemove, isPlaying, onPlayToggle }: SongCardProps) {
  const [showNotes, setShowNotes] = useState(false)

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group">
      <div className="flex items-center space-x-3 p-3">
        {/* Drag Handle */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>

        {/* Album Cover */}
        <div className="relative w-14 h-14 flex-shrink-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden">
          {song.albumCover ? (
            <Image
              src={song.albumCover}
              alt={song.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-6 h-6 text-purple-400" />
            </div>
          )}
        </div>

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {song.title}
          </p>
          <p className="text-sm text-gray-600 truncate">
            {song.artist}
          </p>
          {song.duration && (
            <p className="text-xs text-gray-500">
              {spotifyClient.formatDuration(song.duration)}
            </p>
          )}
          {song.notes && (
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="text-xs text-purple-600 hover:text-purple-700 mt-1"
            >
              {showNotes ? 'Skrýt poznámku' : 'Zobrazit poznámku'}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          {/* Play/Pause Button */}
          {song.previewUrl && onPlayToggle && (
            <button
              onClick={onPlayToggle}
              className={`p-2 rounded-lg transition-all ${
                isPlaying
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'text-green-600 hover:bg-green-50'
              }`}
              title={isPlaying ? "Zastavit" : "Přehrát ukázku"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Spotify Link */}
          {song.spotifyUrl && (
            <a
              href={song.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Otevřít ve Spotify"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}

          {/* Remove Button */}
          <button
            onClick={onRemove}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Odstranit"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Notes */}
      {showNotes && song.notes && (
        <div className="px-3 pb-3">
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <p className="text-sm text-gray-700">{song.notes}</p>
          </div>
        </div>
      )}
    </div>
  )
}

