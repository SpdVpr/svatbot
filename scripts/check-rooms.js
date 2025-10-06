const admin = require('firebase-admin');
const path = require('path');
const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkRooms() {
  try {
    // Get demo wedding ID
    const weddingId = '0yAG31uMahHKyyB2AZar';
    
    console.log('🔍 Checking rooms for wedding:', weddingId);
    
    // Get all rooms for this wedding
    const roomsSnapshot = await db.collection('rooms')
      .where('weddingId', '==', weddingId)
      .get();
    
    console.log('📊 Total rooms found:', roomsSnapshot.size);
    
    if (roomsSnapshot.empty) {
      console.log('❌ No rooms found!');
    } else {
      roomsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`✅ ${data.name} - ${data.type} - ${data.pricePerNight} Kč/noc`);
      });
    }
    
    // Get accommodations
    const accommodationsSnapshot = await db.collection('accommodations')
      .where('weddingId', '==', weddingId)
      .get();
    
    console.log('\n🏨 Accommodations found:', accommodationsSnapshot.size);
    
    accommodationsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`✅ ${data.name} (ID: ${doc.id})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkRooms();

