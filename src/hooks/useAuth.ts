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
}

export interface LoginData {
  email: string
  password: string
}

export function useAuth() {
  const { user, setUser, setLoading, isLoading } = useAuthStore()
  const [error, setError] = useState<AuthError | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Convert Firebase User to our User type
  const convertFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
    let userData = null

    try {
      // Try to get additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      userData = userDoc.data()
    } catch (error) {
      console.warn('Firestore not available, using Firebase Auth data only:', error)
    }

    return {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || userData?.displayName || '',
      photoURL: firebaseUser.photoURL || userData?.photoURL,
      createdAt: userData?.createdAt?.toDate() || new Date(),
      updatedAt: new Date()
    }
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
        displayName: `${data.firstName} ${data.lastName}`
      })

      // Convert and set user
      const user = await convertFirebaseUser(firebaseUser)
      setUser(user)
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

      // Special handling for demo account
      if (data.email === 'demo@svatbot.cz' && data.password === 'demo123') {
        // Create mock demo user
        const demoUser: User = {
          id: 'demo-user-id',
          email: 'demo@svatbot.cz',
          displayName: 'Demo Uživatel',
          firstName: 'Demo',
          lastName: 'Uživatel',
          photoURL: '',
          createdAt: new Date(),
          updatedAt: new Date()
        }

        setUser(demoUser)
        // Save demo user to localStorage so it persists
        localStorage.setItem('auth_user', JSON.stringify(demoUser))
        console.log('🎭 Demo user logged in successfully')
        return
      }

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
    setLoading(true)
    let previousUserId: string | null = null

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

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const newUserId = firebaseUser.uid

          // If switching to a different user, clear previous user's data
          if (previousUserId && previousUserId !== newUserId) {
            console.log('🔄 Switching users, clearing data for:', previousUserId, '→', newUserId)
            clearUserData()
          }

          const user = await convertFirebaseUser(firebaseUser)
          setUser(user)
          previousUserId = newUserId
        } else {
          // Don't log out demo users when Firebase auth state changes
          const currentUser = JSON.parse(localStorage.getItem('auth_user') || 'null')
          if (currentUser?.id === 'demo-user-id' || currentUser?.email === 'demo@svatbot.cz') {
            console.log('🎭 Preserving demo user session despite Firebase auth change')
            // Keep demo user logged in
            return
          }

          setUser(null)
          previousUserId = null
        }
      } catch (error) {
        console.error('Auth state change error:', error)

        // Don't log out demo users even on error
        const currentUser = JSON.parse(localStorage.getItem('auth_user') || 'null')
        if (currentUser?.id === 'demo-user-id' || currentUser?.email === 'demo@svatbot.cz') {
          console.log('🎭 Preserving demo user session despite auth error')
          return
        }

        setUser(null)
        previousUserId = null
      } finally {
        setLoading(false)
        setIsInitialized(true)
      }
    })

    return () => unsubscribe()
  }, [setUser, setLoading])

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

  return {
    user: isInitialized ? user : undefined,
    isLoading,
    isInitialized,
    error,
    register,
    login,
    loginWithGoogle,
    logout,
    clearError
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
