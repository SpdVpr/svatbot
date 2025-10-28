/**
 * Script to fix userAnalytics collection
 * - Updates missing email and displayName from users collection
 * - Ensures all records have proper data
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function fixUserAnalytics() {
  console.log('🔧 Starting userAnalytics fix...')

  try {
    // Get all userAnalytics documents
    const analyticsSnapshot = await getDocs(collection(db, 'userAnalytics'))
    console.log(`📊 Found ${analyticsSnapshot.docs.length} analytics documents`)

    let fixed = 0
    let skipped = 0
    let errors = 0

    for (const analyticsDoc of analyticsSnapshot.docs) {
      const data = analyticsDoc.data()
      const userId = analyticsDoc.id

      // Check if email or displayName is missing
      if (!data.email || !data.displayName || data.displayName === 'Unknown') {
        console.log(`\n🔍 Fixing user ${userId}...`)
        console.log(`   Current: email="${data.email}", displayName="${data.displayName}"`)

        try {
          // Try to get data from users collection
          const userDoc = await getDoc(doc(db, 'users', userId))
          
          if (userDoc.exists()) {
            const userData = userDoc.data()
            const updates: any = {}

            if (!data.email && userData.email) {
              updates.email = userData.email
              console.log(`   ✅ Adding email: ${userData.email}`)
            }

            if ((!data.displayName || data.displayName === 'Unknown') && userData.displayName) {
              updates.displayName = userData.displayName
              console.log(`   ✅ Adding displayName: ${userData.displayName}`)
            } else if ((!data.displayName || data.displayName === 'Unknown') && userData.email) {
              updates.displayName = userData.email.split('@')[0]
              console.log(`   ✅ Adding displayName from email: ${updates.displayName}`)
            }

            if (Object.keys(updates).length > 0) {
              await updateDoc(doc(db, 'userAnalytics', userId), updates)
              fixed++
              console.log(`   ✅ Fixed!`)
            } else {
              skipped++
              console.log(`   ⏭️ No updates needed`)
            }
          } else {
            console.log(`   ⚠️ User document not found in users collection`)
            skipped++
          }
        } catch (error) {
          console.error(`   ❌ Error fixing user ${userId}:`, error)
          errors++
        }
      } else {
        skipped++
      }
    }

    console.log('\n📊 Summary:')
    console.log(`   ✅ Fixed: ${fixed}`)
    console.log(`   ⏭️ Skipped: ${skipped}`)
    console.log(`   ❌ Errors: ${errors}`)
    console.log('\n✅ Done!')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }

  process.exit(0)
}

fixUserAnalytics()

