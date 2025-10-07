/**
 * Script to copy vendors from demo account to a specific user's wedding
 * Usage: node scripts/copy-vendors-to-user.js <targetWeddingId>
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://svatbot-app-default-rtdb.europe-west1.firebasedatabase.app"
  });
}

const db = admin.firestore();

async function copyVendorsToUser(targetWeddingId) {
  try {
    console.log('🔍 Fetching vendors from demo account...');
    
    // Demo wedding ID
    const demoWeddingId = 'lBYJUhY3EA3TIoc4cuOz';
    
    // Get all vendors from demo account
    const vendorsSnapshot = await db.collection('vendors')
      .where('weddingId', '==', demoWeddingId)
      .get();
    
    console.log(`📦 Found ${vendorsSnapshot.size} vendors in demo account`);
    
    if (vendorsSnapshot.empty) {
      console.log('❌ No vendors found in demo account');
      return;
    }
    
    // Check if target wedding exists
    const weddingDoc = await db.collection('weddings').doc(targetWeddingId).get();
    if (!weddingDoc.exists) {
      console.log('❌ Target wedding not found:', targetWeddingId);
      return;
    }
    
    const weddingData = weddingDoc.data();
    console.log('✅ Target wedding found:', weddingData.brideName, '&', weddingData.groomName);
    
    // Copy each vendor
    let copiedCount = 0;
    for (const vendorDoc of vendorsSnapshot.docs) {
      const vendorData = vendorDoc.data();
      
      // Create new vendor with updated weddingId and createdBy
      const newVendorData = {
        ...vendorData,
        weddingId: targetWeddingId,
        createdBy: weddingData.userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Add to Firestore
      await db.collection('vendors').add(newVendorData);
      console.log(`✅ Copied vendor: ${vendorData.name}`);
      copiedCount++;
    }
    
    console.log(`\n🎉 Successfully copied ${copiedCount} vendors to wedding ${targetWeddingId}`);
    
  } catch (error) {
    console.error('❌ Error copying vendors:', error);
    throw error;
  }
}

// Get target wedding ID from command line
const targetWeddingId = process.argv[2];

if (!targetWeddingId) {
  console.error('❌ Please provide target wedding ID');
  console.log('Usage: node scripts/copy-vendors-to-user.js <targetWeddingId>');
  process.exit(1);
}

// Run the script
copyVendorsToUser(targetWeddingId)
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

