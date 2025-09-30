'use client'

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'

interface Song {
  id: string
  title: string
  artist: string
  previewUrl?: string
  albumCover?: string
}

interface MusicPlayerContextType {
  currentSong: Song | null
  isPlaying: boolean
  play: (song: Song) => void
  pause: () => void
  toggle: (song: Song) => void
  stop: () => void
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined)

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const play = (song: Song) => {
    if (!song.previewUrl) return

    // If same song, just resume
    if (currentSong?.id === song.id && audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
      return
    }

    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause()
    }

    // Create new audio
    audioRef.current = new Audio(song.previewUrl)
    audioRef.current.volume = 0.5

    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false)
    })

    audioRef.current.play()
    setCurrentSong(song)
    setIsPlaying(true)
  }

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const toggle = (song: Song) => {
    if (currentSong?.id === song.id && isPlaying) {
      pause()
    } else {
      play(song)
    }
  }

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setCurrentSong(null)
    setIsPlaying(false)
  }

  return (
    <MusicPlayerContext.Provider value={{ currentSong, isPlaying, play, pause, toggle, stop }}>
      {children}
    </MusicPlayerContext.Provider>
  )
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext)
  if (!context) {
    throw new Error('useMusicPlayer must be used within MusicPlayerProvider')
  }
  return context
}

