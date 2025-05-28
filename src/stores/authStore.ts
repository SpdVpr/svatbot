'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  User as FirebaseUser
} from 'firebase/auth'
import { auth } from '@/config/firebase'
import { User } from '@/types'

// Convert Firebase User to our User type
const convertFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  id: firebaseUser.uid,
  email: firebaseUser.email || '',
  displayName: firebaseUser.displayName || '',
  photoURL: firebaseUser.photoURL || '',
  createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
  updatedAt: new Date()
})

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isInitialized: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName?: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithFacebook: () => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  initialize: () => void
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isInitialized: false,
      error: null,

      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        isLoading: false
      }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: async () => {
        // Clear all user-specific data from localStorage (only on client)
        if (typeof window !== 'undefined') {
          const keysToRemove = []
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && (
              key.startsWith('svatbot-') ||
              key.startsWith('tasks_') ||
              key.startsWith('budgetItems_') ||
              key.startsWith('vendors_') ||
              key.startsWith('milestones_') ||
              key.startsWith('guests_') ||
              key === 'marketplace_vendors'
            )) {
              keysToRemove.push(key)
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key))
        }

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        })
      },

      // Add missing functions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const result = await signInWithEmailAndPassword(auth, email, password)
          const user = convertFirebaseUser(result.user)
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error: any) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      register: async (email: string, password: string, displayName?: string) => {
        set({ isLoading: true, error: null })
        try {
          const result = await createUserWithEmailAndPassword(auth, email, password)
          if (displayName) {
            await updateProfile(result.user, { displayName })
          }
          const user = convertFirebaseUser(result.user)
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error: any) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null })
        try {
          const provider = new GoogleAuthProvider()
          const result = await signInWithPopup(auth, provider)
          const user = convertFirebaseUser(result.user)
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error: any) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      loginWithFacebook: async () => {
        set({ isLoading: true, error: null })
        try {
          const provider = new FacebookAuthProvider()
          const result = await signInWithPopup(auth, provider)
          const user = convertFirebaseUser(result.user)
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error: any) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      clearError: () => set({ error: null }),

      initialize: () => {
        set({ isInitialized: true })
        onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            const user = convertFirebaseUser(firebaseUser)
            set({ user, isAuthenticated: true, isLoading: false })
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false })
          }
        })
      },
    }),
    {
      name: 'svatbot-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
)
