import { initializeApp, getApps } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "svatbot-demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "svatbot-demo",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "svatbot-demo.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ABCDEF1234",
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Connect to emulators in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true'

  if (useEmulators) {
    try {
      // Connect to Firebase emulators
      connectAuthEmulator(auth, 'http://localhost:9099')
      connectFirestoreEmulator(db, 'localhost', 8080)
      connectStorageEmulator(storage, 'localhost', 9199)
      console.log('🔥 Connected to Firebase emulators')
    } catch (error) {
      console.log('Firebase emulators not available, using production config')
    }
  }
}

// Initialize Analytics (only in browser and production)
export const analytics = typeof window !== 'undefined' && process.env.NODE_ENV === 'production'
  ? getAnalytics(app)
  : null

export default app
