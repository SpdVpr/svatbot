import * as admin from 'firebase-admin'

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp()
}

// Export Firebase services
export const auth = admin.auth()
export const firestore = admin.firestore()
export const storage = admin.storage()
export const messaging = admin.messaging()

// Firestore settings
firestore.settings({
  timestampsInSnapshots: true
})

// Collections references
export const collections = {
  users: firestore.collection('users'),
  vendors: firestore.collection('vendors'),
  services: firestore.collection('services'),
  reviews: firestore.collection('reviews'),
  inquiries: firestore.collection('inquiries'),
  favorites: firestore.collection('favorites'),
  analytics: firestore.collection('analytics'),
  notifications: firestore.collection('notifications'),
  adminLogs: firestore.collection('adminLogs')
}

// Storage bucket
export const bucket = storage.bucket()

// Helper functions
export const FieldValue = admin.firestore.FieldValue
export const Timestamp = admin.firestore.Timestamp

// Batch operations helper
export const createBatch = () => firestore.batch()

// Transaction helper
export const runTransaction = (updateFunction: (transaction: admin.firestore.Transaction) => Promise<any>) => {
  return firestore.runTransaction(updateFunction)
}

// Server timestamp
export const serverTimestamp = () => FieldValue.serverTimestamp()

// Array operations
export const arrayUnion = (...elements: any[]) => FieldValue.arrayUnion(...elements)
export const arrayRemove = (...elements: any[]) => FieldValue.arrayRemove(...elements)

// Increment
export const increment = (n: number) => FieldValue.increment(n)

// Delete field
export const deleteField = () => FieldValue.delete()

// Firestore converters for type safety
export const createConverter = <T>() => ({
  toFirestore: (data: T): admin.firestore.DocumentData => {
    return data as admin.firestore.DocumentData
  },
  fromFirestore: (
    snapshot: admin.firestore.QueryDocumentSnapshot,
    options: admin.firestore.SnapshotOptions
  ): T => {
    const data = snapshot.data(options)
    return {
      id: snapshot.id,
      ...data
    } as T
  }
})

// Error handling
export class FirebaseError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'FirebaseError'
  }
}

// Common error codes
export const ErrorCodes = {
  UNAUTHORIZED: 'auth/unauthorized',
  FORBIDDEN: 'auth/forbidden',
  NOT_FOUND: 'firestore/not-found',
  ALREADY_EXISTS: 'firestore/already-exists',
  INVALID_ARGUMENT: 'functions/invalid-argument',
  PERMISSION_DENIED: 'firestore/permission-denied',
  UNAUTHENTICATED: 'functions/unauthenticated'
}

// Validation helpers
export const validateAuth = (context: any) => {
  if (!context.auth) {
    throw new FirebaseError(
      ErrorCodes.UNAUTHENTICATED,
      'Authentication required',
      401
    )
  }
  return context.auth
}

export const validateAdmin = (context: any) => {
  const auth = validateAuth(context)
  if (!auth.token.admin && !auth.token.superAdmin) {
    throw new FirebaseError(
      ErrorCodes.FORBIDDEN,
      'Admin privileges required',
      403
    )
  }
  return auth
}

export const validateVendor = (context: any) => {
  const auth = validateAuth(context)
  if (!auth.token.vendor && !auth.token.admin && !auth.token.superAdmin) {
    throw new FirebaseError(
      ErrorCodes.FORBIDDEN,
      'Vendor privileges required',
      403
    )
  }
  return auth
}

// Logging helper
export const logActivity = async (
  userId: string,
  action: string,
  details: any = {},
  collection: string = 'activityLogs'
) => {
  try {
    await firestore.collection(collection).add({
      userId,
      action,
      details,
      timestamp: serverTimestamp(),
      ip: details.ip || null,
      userAgent: details.userAgent || null
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}

// Pagination helper
export const paginate = async <T>(
  query: admin.firestore.Query<T>,
  limit: number = 20,
  startAfter?: admin.firestore.DocumentSnapshot
) => {
  let paginatedQuery = query.limit(limit)
  
  if (startAfter) {
    paginatedQuery = paginatedQuery.startAfter(startAfter)
  }
  
  const snapshot = await paginatedQuery.get()
  const docs = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  
  return {
    docs,
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
    hasMore: snapshot.docs.length === limit
  }
}

// Search helper
export const searchDocuments = async (
  collectionName: string,
  searchFields: string[],
  searchTerm: string,
  limit: number = 20
) => {
  const searchTermLower = searchTerm.toLowerCase()
  const promises = searchFields.map(field => {
    return firestore
      .collection(collectionName)
      .where(field, '>=', searchTermLower)
      .where(field, '<=', searchTermLower + '\uf8ff')
      .limit(limit)
      .get()
  })
  
  const snapshots = await Promise.all(promises)
  const allDocs = new Map()
  
  snapshots.forEach(snapshot => {
    snapshot.docs.forEach(doc => {
      if (!allDocs.has(doc.id)) {
        allDocs.set(doc.id, {
          id: doc.id,
          ...doc.data()
        })
      }
    })
  })
  
  return Array.from(allDocs.values()).slice(0, limit)
}
