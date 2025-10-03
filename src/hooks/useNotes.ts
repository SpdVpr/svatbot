'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from './useAuth'
import { useWedding } from './useWedding'
import { Note, NoteFormData } from '@/types/notes'

export function useNotes() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Real-time listener for notes
  useEffect(() => {
    if (!user || !wedding?.id) {
      setNotes([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const notesRef = collection(db, 'notes')
    // Simplified query - only order by updatedAt to avoid composite index requirement
    const q = query(
      notesRef,
      where('weddingId', '==', wedding.id),
      where('userId', '==', user.id),
      orderBy('updatedAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notesData = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          }
        }) as Note[]

        // Sort by pinned status in memory (pinned first)
        notesData.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1
          if (!a.isPinned && b.isPinned) return 1
          return 0
        })

        setNotes(notesData)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching notes:', err)
        setError('Chyba při načítání poznámek')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, wedding?.id])

  // Create note
  const createNote = useCallback(async (noteData: NoteFormData): Promise<Note> => {
    if (!user || !wedding?.id) {
      throw new Error('User or wedding not found')
    }

    try {
      const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const newNote: Note = {
        id: noteId,
        ...noteData,
        weddingId: wedding.id,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: noteData.tags || [],
        color: noteData.color || 'yellow',
        isPinned: noteData.isPinned || false
      }

      // Update local state immediately
      setNotes(prev => [newNote, ...prev])

      // Save to Firebase in background (don't block UI)
      import('@/config/firebase').then(({ db }) => {
        import('firebase/firestore').then(({ collection, addDoc, Timestamp }) => {
          const notesRef = collection(db, 'notes')
          const firestoreNote = {
            ...noteData,
            weddingId: wedding.id,
            userId: user.id,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            tags: noteData.tags || [],
            color: noteData.color || 'yellow',
            isPinned: noteData.isPinned || false
          }

          addDoc(notesRef, firestoreNote).then((docRef) => {
            // Update local state with real Firebase ID
            setNotes(prev => prev.map(note =>
              note.id === noteId ? { ...note, id: docRef.id } : note
            ))
          }).catch((error) => {
            console.error('Firestore sync failed for note:', error)
            setError('Poznámka byla uložena lokálně, ale nepodařilo se synchronizovat s cloudem')
          })
        })
      }).catch((error) => {
        console.error('Failed to load Firestore modules:', error)
        setError('Poznámka byla uložena lokálně')
      })

      return newNote
    } catch (err: any) {
      console.error('Error creating note:', err)
      setError('Chyba při vytváření poznámky')
      throw err
    }
  }, [user, wedding?.id])

  // Update note
  const updateNote = useCallback(async (noteId: string, updates: Partial<NoteFormData>): Promise<void> => {
    if (!user || !wedding?.id) {
      throw new Error('User or wedding not found')
    }

    try {
      // Update local state immediately for better UX
      setNotes(prev => prev.map(note =>
        note.id === noteId
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      ))

      // Then update Firestore
      const noteRef = doc(db, 'notes', noteId)
      await updateDoc(noteRef, {
        ...updates,
        updatedAt: Timestamp.now()
      })

      console.log('✅ Note updated successfully:', noteId)
    } catch (err: any) {
      console.error('Error updating note:', err)
      setError('Chyba při aktualizaci poznámky')
      throw err
    }
  }, [user, wedding?.id])

  // Delete note
  const deleteNote = useCallback(async (noteId: string): Promise<void> => {
    if (!user || !wedding?.id) {
      throw new Error('User or wedding not found')
    }

    try {
      const noteRef = doc(db, 'notes', noteId)
      await deleteDoc(noteRef)
    } catch (err: any) {
      console.error('Error deleting note:', err)
      setError('Chyba při mazání poznámky')
      throw err
    }
  }, [user, wedding?.id])

  // Toggle pin status
  const togglePin = useCallback(async (noteId: string): Promise<void> => {
    const note = notes.find(n => n.id === noteId)
    if (!note) return

    await updateNote(noteId, { isPinned: !note.isPinned })
  }, [notes, updateNote])

  // Get notes by tag
  const getNotesByTag = useCallback((tag: string): Note[] => {
    return notes.filter(note => note.tags?.includes(tag))
  }, [notes])

  // Get all unique tags
  const getAllTags = useCallback((): string[] => {
    const allTags = notes.flatMap(note => note.tags || [])
    return Array.from(new Set(allTags)).sort()
  }, [notes])

  // Statistics
  const stats = {
    total: notes.length,
    pinned: notes.filter(n => n.isPinned).length,
    byColor: notes.reduce((acc, note) => {
      const color = note.color || 'yellow'
      acc[color] = (acc[color] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    totalTags: getAllTags().length
  }

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    getNotesByTag,
    getAllTags,
    stats
  }
}
