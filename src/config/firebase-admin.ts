import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

let adminApp: App | null = null
let adminDb: Firestore | null = null

// Initialize Firebase Admin SDK only at runtime (not during build)
function initializeAdminSDK() {
  if (adminApp) {
    return { adminApp, adminDb: adminDb! }
  }

  if (getApps().length > 0) {
    adminApp = getApps()[0]
    adminDb = getFirestore(adminApp)
    return { adminApp, adminDb }
  }

  // Check if all required environment variables are set
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin SDK credentials not configured. Please set:\n' +
      '- FIREBASE_ADMIN_PROJECT_ID\n' +
      '- FIREBASE_ADMIN_CLIENT_EMAIL\n' +
      '- FIREBASE_ADMIN_PRIVATE_KEY\n' +
      `Current status: projectId=${!!projectId}, clientEmail=${!!clientEmail}, privateKey=${!!privateKey}`
    )
  }

  console.log('🔥 Initializing Firebase Admin SDK with credentials...')
  console.log(`Project ID: ${projectId}`)
  console.log(`Client Email: ${clientEmail}`)
  console.log(`Private Key: ${privateKey ? 'SET (length: ' + privateKey.length + ')' : 'NOT SET'}`)

  adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n')
    })
  })

  adminDb = getFirestore(adminApp)

  console.log('✅ Firebase Admin SDK initialized successfully')

  return { adminApp, adminDb }
}

// Export a getter function instead of direct export
export function getAdminDb(): Firestore {
  const { adminDb } = initializeAdminSDK()
  return adminDb
}

export function getAdminApp(): App {
  const { adminApp } = initializeAdminSDK()
  return adminApp
}

// For backward compatibility, export adminDb but it will be initialized lazily
export { adminDb }

