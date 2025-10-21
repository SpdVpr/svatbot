const admin = require('firebase-admin');
const serviceAccount = require('../svatbot-app-firebase-adminsdk-rvqxe-e0e0e0e0e0.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkAffiliate() {
  try {
    const snapshot = await db.collection('affiliatePartners')
      .where('referralCode', '==', 'MIC150254')
      .get();

    if (snapshot.empty) {
      console.log('❌ Partner MIC150254 not found');
      return;
    }

    snapshot.forEach(doc => {
      console.log('✅ Partner found:');
      console.log('ID:', doc.id);
      console.log('Data:', JSON.stringify(doc.data(), null, 2));
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAffiliate();

