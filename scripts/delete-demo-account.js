#!/usr/bin/env node

/**
 * Script to delete demo account and all its data from Firebase
 * Usage: node scripts/delete-demo-account.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://svatbot-app-default-rtdb.europe-west1.firebasedatabase.app'
  });
} catch (error) {
  console.log('⚠️  Service account not found, using default credentials');
  admin.initializeApp();
}

const auth = admin.auth();
const db = admin.firestore();

async function deleteDemoAccount() {
  try {
    console.log('🗑️  Deleting demo account...');

    const demoEmail = 'demo@svatbot.cz';

    // Get demo user
    let demoUser;
    try {
      demoUser = await auth.getUserByEmail(demoEmail);
      console.log('✅ Found demo user:', demoUser.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('ℹ️  Demo user not found, nothing to delete');
        return;
      }
      throw error;
    }

    // Find demo wedding
    const weddingsSnapshot = await db.collection('weddings')
      .where('userId', '==', demoUser.uid)
      .get();

    if (weddingsSnapshot.empty) {
      console.log('ℹ️  No wedding found for demo user');
    } else {
      const weddingId = weddingsSnapshot.docs[0].id;
      console.log('✅ Found demo wedding:', weddingId);

      // Delete all related data
      const collections = [
        'tasks',
        'guests',
        'budgetItems',
        'accommodations',
        'rooms',
        'moodboards',
        'menuItems',
        'drinkItems',
        'vendors',
        'notes',
        'milestones',
        'aiTimelineItems'
      ];

      for (const collectionName of collections) {
        const snapshot = await db.collection(collectionName)
          .where('weddingId', '==', weddingId)
          .get();

        if (!snapshot.empty) {
          console.log(`🗑️  Deleting ${snapshot.size} documents from ${collectionName}...`);
          const batch = db.batch();
          snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          await batch.commit();
          console.log(`✅ Deleted ${collectionName}`);
        }
      }

      // Delete music data (stored by weddingId as document ID)
      try {
        await db.collection('music').doc(weddingId).delete();
        console.log('✅ Deleted music data');
      } catch (error) {
        // Music document might not exist
      }

      // Delete wedding
      await db.collection('weddings').doc(weddingId).delete();
      console.log('✅ Deleted wedding');
    }

    // Delete user profile
    try {
      await db.collection('users').doc(demoUser.uid).delete();
      console.log('✅ Deleted user profile');
    } catch (error) {
      // User profile might not exist
    }

    // Delete user from Authentication
    await auth.deleteUser(demoUser.uid);
    console.log('✅ Deleted user from Authentication');

    console.log('\n🎉 Demo account deleted successfully!');

  } catch (error) {
    console.error('❌ Error deleting demo account:', error);
    process.exit(1);
  }
}

// Run the script
deleteDemoAccount()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

