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
  console.error('❌ Error loading service account:', error.message);
  console.error('Make sure firebase-service-account.json exists in the project root');
  process.exit(1);
}

const db = admin.firestore();

async function deleteDemoTimeline() {
  try {
    console.log('🗑️ Deleting demo wedding day timeline items...');

    // Demo wedding ID (from your console logs)
    const demoWeddingId = 'SYYQ3hijKLHSxblxG1Mc';

    // Get all wedding day timeline items for demo wedding
    const timelineSnapshot = await db.collection('weddingDayTimeline')
      .where('weddingId', '==', demoWeddingId)
      .get();

    console.log(`📊 Found ${timelineSnapshot.size} timeline items to delete`);

    // Delete in batches
    const batchSize = 500;
    let batch = db.batch();
    let count = 0;

    for (const doc of timelineSnapshot.docs) {
      batch.delete(doc.ref);
      count++;

      if (count % batchSize === 0) {
        await batch.commit();
        batch = db.batch();
        console.log(`✅ Deleted ${count} items...`);
      }
    }

    // Commit remaining items
    if (count % batchSize !== 0) {
      await batch.commit();
    }

    console.log(`✅ Successfully deleted ${count} wedding day timeline items`);

  } catch (error) {
    console.error('❌ Error deleting demo timeline:', error);
    throw error;
  }
}

// Run the script
deleteDemoTimeline()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

