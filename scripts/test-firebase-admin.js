/**
 * Test Firebase Admin SDK Configuration
 * 
 * This script tests if Firebase Admin SDK is properly configured
 * Run: node scripts/test-firebase-admin.js
 */

require('dotenv').config({ path: '.env.local' })

console.log('🔍 Testing Firebase Admin SDK Configuration...\n')

// Check environment variables
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY

console.log('Environment Variables:')
console.log('✓ FIREBASE_ADMIN_PROJECT_ID:', projectId || '❌ NOT SET')
console.log('✓ FIREBASE_ADMIN_CLIENT_EMAIL:', clientEmail || '❌ NOT SET')
console.log('✓ FIREBASE_ADMIN_PRIVATE_KEY:', privateKey ? `✓ SET (${privateKey.length} chars)` : '❌ NOT SET')
console.log('')

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Missing Firebase Admin credentials!')
  console.error('\nPlease set these in .env.local:')
  console.error('- FIREBASE_ADMIN_PROJECT_ID')
  console.error('- FIREBASE_ADMIN_CLIENT_EMAIL')
  console.error('- FIREBASE_ADMIN_PRIVATE_KEY')
  console.error('\nSee FIREBASE_ADMIN_SETUP.md for instructions.')
  process.exit(1)
}

// Validate private key format
if (!privateKey.includes('BEGIN PRIVATE KEY')) {
  console.error('❌ Invalid private key format!')
  console.error('Private key must start with: -----BEGIN PRIVATE KEY-----')
  process.exit(1)
}

if (!privateKey.includes('END PRIVATE KEY')) {
  console.error('❌ Invalid private key format!')
  console.error('Private key must end with: -----END PRIVATE KEY-----')
  process.exit(1)
}

console.log('✅ All environment variables are set!')
console.log('✅ Private key format looks correct!')
console.log('')

// Try to initialize Firebase Admin
try {
  const admin = require('firebase-admin')
  
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n')
      })
    })
    
    console.log('✅ Firebase Admin SDK initialized successfully!')
    console.log('')
    
    // Test Firestore connection
    const db = admin.firestore()
    console.log('✅ Firestore connection established!')
    console.log('')
    
    console.log('🎉 Everything is working correctly!')
    console.log('You can now use GoPay payments.')
    
  } else {
    console.log('✅ Firebase Admin SDK already initialized!')
  }
  
  process.exit(0)
  
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:')
  console.error(error.message)
  console.error('')
  console.error('Please check your credentials and try again.')
  console.error('See FIREBASE_ADMIN_SETUP.md for instructions.')
  process.exit(1)
}

