'use client'

import { useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/config/firebase'
import { useAuthStore } from '@/stores/authStore'
import { User } from '@/types'

export interface AuthError {
  code: string
  message: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  gender: 'male' | 'female' | 'other'
}

export interface LoginData {
  email: string
  password: string
}

// Cache for user data to prevent repeated Firestore fetches
const userDataCache = new Map<string, { user: User; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useAuth() {
  const { user, setUser, setLoading, isLoading } = useAuthStore()
  const [error, setError] = useState<AuthError | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [hasSetInitialized, setHasSetInitialized] = useState(false)

  // Convert Firebase User to our User type
  const convertFirebaseUser = async (firebaseUser: FirebaseUser, forceRefresh = false): Promise<User> => {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = userDataCache.get(firebaseUser.uid)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('✅ Using cached user data for:', firebaseUser.uid)
        return cached.user
      }
    }

    let userData = null

    // Always try to get user data from Firestore (not just for verified emails)
    try {
      // Try to get additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (userDoc.exists()) {
        userData = userDoc.data()
        console.log('📥 Loaded user data from Firestore:', { gender: userData?.gender })
      } else {
        console.log('⚠️ No Firestore document found for user:', firebaseUser.uid)
      }
    } catch (error) {
      console.warn('Firestore not available for user data, using Firebase Auth data only:', error)
    }

    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || userData?.displayName || '',
      photoURL: firebaseUser.photoURL || userData?.photoURL,
      gender: userData?.gender,
      createdAt: userData?.createdAt?.toDate() || new Date(),
      updatedAt: new Date()
    }

    // Cache the user data
    userDataCache.set(firebaseUser.uid, { user, timestamp: Date.now() })

    return user
  }

  // Save user data to Firestore
  const saveUserToFirestore = async (firebaseUser: FirebaseUser, additionalData?: any) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        const userData = {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...additionalData
        }

        await setDoc(userRef, userData)
      }
    } catch (error) {
      console.warn('Firestore not available, skipping user data save:', error)
      // Continue without Firestore - user is still authenticated
    }
  }

  // Register with email and password
  const register = async (data: RegisterData): Promise<void> => {
    try {
      setError(null)
      setLoading(true)



      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      )

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: `${data.firstName} ${data.lastName}`
      })

      // Save to Firestore
      await saveUserToFirestore(firebaseUser, {
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: `${data.firstName} ${data.lastName}`,
        gender: data.gender
      })

      // Convert and set user
      const user = await convertFirebaseUser(firebaseUser)
      setUser(user)

      // Track affiliate registration
      try {
        const { trackAffiliateRegistration } = await import('@/lib/affiliateTracking')
        await trackAffiliateRegistration(firebaseUser.uid, firebaseUser.email || '')
      } catch (affiliateError) {
        console.error('Error tracking affiliate registration:', affiliateError)
        // Don't throw - registration succeeded
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      setError({
        code: error.code,
        message: getErrorMessage(error.code)
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Login with email and password
  const login = async (data: LoginData): Promise<void> => {
    try {
      setError(null)
      setLoading(true)

      // Login with Firebase Authentication (including demo account)
      const { user: firebaseUser } = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      )

      // Convert and set user
      const user = await convertFirebaseUser(firebaseUser)
      setUser(user)
    } catch (error: any) {
      console.error('Login error:', error)
      setError({
        code: error.code,
        message: getErrorMessage(error.code)
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Login with Google
  const loginWithGoogle = async (): Promise<void> => {
    try {
      setError(null)
      setLoading(true)

      const provider = new GoogleAuthProvider()
      const { user: firebaseUser } = await signInWithPopup(auth, provider)

      // Save to Firestore if new user
      await saveUserToFirestore(firebaseUser)

      // Convert and set user
      const user = await convertFirebaseUser(firebaseUser)
      setUser(user)
    } catch (error: any) {
      console.error('Google login error:', error)
      setError({
        code: error.code,
        message: getErrorMessage(error.code)
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = async (): Promise<void> => {
    try {
      // Clear user data cache
      if (user?.id) {
        userDataCache.delete(user.id)
      }

      await signOut(auth)
      setUser(null)
    } catch (error: any) {
      console.error('Logout error:', error)
      setError({
        code: error.code,
        message: 'Chyba při odhlašování'
      })
    }
  }

  // Listen to auth state changes
  useEffect(() => {
    let previousUserId: string | null = null
    let isMounted = true
    let authStateTimeout: NodeJS.Timeout | null = null
    let lastAuthStateChange = 0

    // Get previously stored user ID
    if (typeof window !== 'undefined') {
      const storedAuth = localStorage.getItem('svatbot-auth')
      if (storedAuth) {
        try {
          const parsed = JSON.parse(storedAuth)
          previousUserId = parsed.state?.user?.id || null
        } catch (error) {
          console.warn('Error parsing stored auth:', error)
        }
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const now = Date.now()

      // Debounce rapid auth state changes (within 500ms)
      if (now - lastAuthStateChange < 500) {
        console.log('🔄 Debouncing rapid auth state change')
        if (authStateTimeout) {
          clearTimeout(authStateTimeout)
        }
      }

      lastAuthStateChange = now

      // Clear any pending timeout
      if (authStateTimeout) {
        clearTimeout(authStateTimeout)
      }

      // Debounce auth state changes to prevent flickering
      authStateTimeout = setTimeout(async () => {
        if (!isMounted) return

        try {
          if (firebaseUser) {
            const newUserId = firebaseUser.uid

            // If switching to a different user, clear previous user's data
            if (previousUserId && previousUserId !== newUserId) {
              console.log('🔄 Switching users, clearing data for:', previousUserId, '→', newUserId)
              clearUserData()
            }

            // Only fetch user data if we don't have it or user changed
            if (!previousUserId || previousUserId !== newUserId) {
              const user = await convertFirebaseUser(firebaseUser)
              if (isMounted) {
                setUser(user)
                previousUserId = newUserId
              }
            } else {
              console.log('✅ User already loaded, skipping Firestore fetch')
            }
          } else {
            if (isMounted) {
              setUser(null)
              previousUserId = null
            }
          }
        } catch (error) {
          console.error('Auth state change error:', error)

          // Don't log out demo users even on error
          const currentUser = JSON.parse(localStorage.getItem('auth_user') || 'null')
          if (currentUser?.id === 'demo-user-id' || currentUser?.email === 'demo@svatbot.cz') {
            console.log('🎭 Preserving demo user session despite auth error')
            return
          }

          if (isMounted) {
            setUser(null)
            previousUserId = null
          }
        } finally {
          if (isMounted) {
            setLoading(false)
            if (!hasSetInitialized) {
              setIsInitialized(true)
              setHasSetInitialized(true)
            }
          }
        }
      }, 100) // Reduced to 100ms for faster response
    })

    return () => {
      isMounted = false
      if (authStateTimeout) {
        clearTimeout(authStateTimeout)
      }
      unsubscribe()
    }
  }, [setUser, setLoading, hasSetInitialized])

  // Clear all user data when switching users
  const clearUserData = () => {
    if (typeof window === 'undefined') return

    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (
        key.startsWith('svatbot-wedding') ||
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

  // Clear error
  const clearError = () => setError(null)

  // Refresh user data from Firestore (useful after profile updates)
  const refreshUser = async () => {
    const currentUser = auth.currentUser
    if (!currentUser) return

    console.log('🔄 Refreshing user data from Firestore...')

    // Clear cache for this user
    userDataCache.delete(currentUser.uid)

    // Force refresh from Firestore
    const updatedUser = await convertFirebaseUser(currentUser, true)
    setUser(updatedUser)

    console.log('✅ User data refreshed:', { gender: updatedUser.gender })
  }

  return {
    user: isInitialized ? user : undefined,
    isLoading,
    isInitialized,
    error,
    register,
    login,
    loginWithGoogle,
    logout,
    clearError,
    refreshUser
  }
}

// Helper function to get user-friendly error messages
function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Uživatel s tímto emailem neexistuje'
    case 'auth/wrong-password':
      return 'Nesprávné heslo'
    case 'auth/email-already-in-use':
      return 'Email je již používán jiným účtem'
    case 'auth/weak-password':
      return 'Heslo musí mít alespoň 6 znaků'
    case 'auth/invalid-email':
      return 'Neplatný formát emailu'
    case 'auth/too-many-requests':
      return 'Příliš mnoho pokusů. Zkuste to za chvíli'
    case 'auth/network-request-failed':
      return 'Chyba připojení. Zkontrolujte internet'
    case 'auth/popup-closed-by-user':
      return 'Přihlášení bylo zrušeno'
    case 'auth/operation-not-allowed':
      return 'Tato metoda přihlášení není povolena'
    case 'auth/user-disabled':
      return 'Tento účet byl deaktivován'
    case 'auth/invalid-credential':
      return 'Neplatné přihlašovací údaje'
    case 'auth/account-exists-with-different-credential':
      return 'Účet s tímto emailem již existuje s jinou metodou přihlášení'
    case 'auth/requires-recent-login':
      return 'Pro tuto akci se musíte znovu přihlásit'
    default:
      return 'Došlo k neočekávané chybě. Zkuste to prosím znovu.'
  }
}
