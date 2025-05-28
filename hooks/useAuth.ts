import { useState, useEffect } from 'react'
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth'
import { auth } from '../lib/firebase'

// Simple hook for marketplace auth
export function useMarketplaceAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        // Get user role from custom claims
        const tokenResult = await user.getIdTokenResult()
        setUserRole((tokenResult.claims.role as string) || 'user')
      } else {
        setUserRole(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)

      // Call backend login endpoint for additional logic
      const token = await auth.currentUser?.getIdToken()
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)

      // Call backend register endpoint
      const token = await user.getIdToken()
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone
        })
      })

      if (!response.ok) {
        throw new Error('Registration failed')
      }

      // Send verification email
      await sendEmailVerification(user)
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      provider.addScope('email')
      provider.addScope('profile')

      const result = await signInWithPopup(auth, provider)

      // Call backend login endpoint for additional logic
      const token = await result.user.getIdToken()
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: result.user.email,
          provider: 'google'
        })
      })
    } catch (error) {
      console.error('Google sign in error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      // Call backend logout endpoint
      const token = await auth.currentUser?.getIdToken()
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const sendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser)
    }
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  const isAdmin = userRole === 'admin' || userRole === 'super_admin'
  const isVendor = userRole === 'vendor' || isAdmin

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    sendVerification,
    resetPassword,
    userRole,
    isAdmin,
    isVendor
  }
}
