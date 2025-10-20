import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

let adminApp: App

// Initialize Firebase Admin SDK
if (!getApps().length) {
  // For production, use environment variables
  if (process.env.FIREBASE_ADMIN_PROJECT_ID) {
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    })
  } else {
    // For development/Vercel, use default credentials
    adminApp = initializeApp({
      projectId: 'svatbot-app'
    })
  }
} else {
  adminApp = getApps()[0]
}

export const adminDb = getFirestore(adminApp)
export default adminApp

