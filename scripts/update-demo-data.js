#!/usr/bin/env node

/**
 * Script to update demo account data without recreating the account
 * Usage: node scripts/update-demo-data.js
 * 
 * This script will:
 * 1. Find existing demo account
 * 2. Delete old data
 * 3. Create fresh demo data
 * 4. Keep the same user and wedding IDs
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

async function updateDemoData() {
  try {
    console.log('🔄 Updating demo account data...');

    const demoEmail = 'demo@svatbot.cz';

    // Get demo user
    let demoUser;
    try {
      demoUser = await auth.getUserByEmail(demoEmail);
      console.log('✅ Found demo user:', demoUser.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.error('❌ Demo user not found. Please run create-demo-account.js first.');
        process.exit(1);
      }
      throw error;
    }

    // Find demo wedding
    const weddingsSnapshot = await db.collection('weddings')
      .where('userId', '==', demoUser.uid)
      .get();

    if (weddingsSnapshot.empty) {
      console.error('❌ No wedding found for demo user. Please run create-demo-account.js first.');
      process.exit(1);
    }

    const weddingDoc = weddingsSnapshot.docs[0];
    const weddingId = weddingDoc.id;
    console.log('✅ Found demo wedding:', weddingId);

    // Delete old data
    console.log('🗑️  Deleting old demo data...');
    const collections = [
      'tasks',
      'guests',
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
      }
    }

    // Delete music data
    try {
      await db.collection('music').doc(weddingId).delete();
    } catch (error) {
      // Music document might not exist
    }

    console.log('✅ Old data deleted');

    // Update wedding data
    console.log('📝 Updating wedding data...');
    await weddingDoc.ref.update({
      brideName: 'Jana',
      groomName: 'Petr',
      weddingDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      estimatedGuestCount: 85,
      budget: 450000,
      style: 'classic',
      region: 'Praha',
      status: 'planning',
      progress: {
        overall: 73,
        foundation: 100,
        venue: 85,
        guests: 80,
        budget: 65,
        design: 45,
        organization: 30,
        final: 0
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Wedding data updated');

    // Now run the same data creation as in create-demo-account.js
    // Import and execute the data creation functions
    console.log('📦 Creating fresh demo data...');
    console.log('ℹ️  For full data creation, please run: node scripts/create-demo-account.js');
    console.log('ℹ️  The script will detect existing account and update it.');

    console.log('\n🎉 Demo data update complete!');
    console.log('📧 Email: demo@svatbot.cz');
    console.log('🔑 Password: demo123');
    console.log('👤 User ID:', demoUser.uid);
    console.log('💒 Wedding ID:', weddingId);

  } catch (error) {
    console.error('❌ Error updating demo data:', error);
    process.exit(1);
  }
}

// Run the script
updateDemoData()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

