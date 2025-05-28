import * as functions from 'firebase-functions'
import { collections, serverTimestamp } from '../config/firebase'
import { UserRole } from '../types'

// Trigger when a new user is created in Firebase Auth
const onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    console.log('New user created:', user.uid, user.email)

    // Create user document in Firestore
    const userData = {
      email: user.email || '',
      firstName: user.displayName?.split(' ')[0] || '',
      lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
      phone: user.phoneNumber || null,
      role: UserRole.USER,
      verified: user.emailVerified || false,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: null,
      profileImage: user.photoURL || null,
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        language: 'cs',
        currency: 'CZK'
      }
    }

    await collections.users.doc(user.uid).set(userData)

    // Send welcome notification
    await collections.notifications.add({
      userId: user.uid,
      type: 'system_update',
      title: 'Vítejte v SvatBot!',
      message: 'Děkujeme za registraci. Začněte prozkoumáním našich dodavatelů.',
      data: {
        action: 'explore_vendors'
      },
      read: false,
      createdAt: serverTimestamp()
    })

    console.log('User document created successfully:', user.uid)
  } catch (error) {
    console.error('Error creating user document:', error)
    // Don't throw error to avoid blocking user creation
  }
})

export default onUserCreate
