import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp()
}

/**
 * Cloud Function to set admin role for a user
 * 
 * This is a one-time setup function. After setting up your first admin,
 * you can delete this function or restrict it to super_admin only.
 * 
 * Usage:
 * 1. Deploy this function: firebase deploy --only functions:setAdminRole
 * 2. Call it from Firebase Console → Functions → setAdminRole → Test
 * 3. Pass data: { "userId": "USER_UID", "role": "super_admin" }
 * 4. After setup, you can delete this function
 */
export const setAdminRole = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    try {
      const { userId, role, secretKey } = data

      // Security: Require a secret key for first-time setup
      // After first admin is created, this function should check for super_admin role
      const SETUP_SECRET = 'svatbot-admin-setup-2025' // Change this!

      // Check if caller is already a super admin
      const isExistingAdmin = context.auth?.token?.role === 'super_admin'

      // For first-time setup, require secret key
      if (!isExistingAdmin && secretKey !== SETUP_SECRET) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'Invalid secret key or insufficient permissions'
        )
      }

      // Validate inputs
      if (!userId || !role) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'userId and role are required'
        )
      }

      if (!['super_admin', 'admin', 'moderator'].includes(role)) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Invalid role. Must be: super_admin, admin, or moderator'
        )
      }

      // Get user
      const user = await admin.auth().getUser(userId)

      // Set custom claims
      await admin.auth().setCustomUserClaims(userId, { role })

      // Create admin user document in Firestore
      await admin.firestore().collection('adminUsers').doc(userId).set({
        email: user.email,
        name: user.displayName || 'Admin',
        role: role,
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        permissions: {
          vendors: ['read', 'write', 'delete'],
          users: ['read', 'write'],
          marketplace: ['read', 'write', 'delete'],
          analytics: ['read'],
          messages: ['read', 'write'],
          feedback: ['read', 'write'],
          finance: ['read'],
          affiliate: ['read']
        }
      }, { merge: true })

      // Update user profile
      await admin.firestore().collection('users').doc(userId).set({
        role: role,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true })

      return {
        success: true,
        message: `Role ${role} set for user ${user.email}`,
        userId: userId
      }
    } catch (error: any) {
      console.error('Error setting admin role:', error)
      throw new functions.https.HttpsError(
        'internal',
        error.message || 'Failed to set admin role'
      )
    }
  })

