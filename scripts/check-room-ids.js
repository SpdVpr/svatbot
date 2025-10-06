const admin = require('firebase-admin');
const path = require('path');
const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkRoomIds() {
  try {
    // Get demo wedding ID
    const weddingId = 'z3ke76MoOjVZAyxZRses';
    
    console.log('🔍 Checking room IDs for wedding:', weddingId);
    
    // Get all accommodations for this wedding
    const accommodationsSnapshot = await db.collection('accommodations')
      .where('weddingId', '==', weddingId)
      .get();
    
    console.log('🏨 Accommodations found:', accommodationsSnapshot.size);
    
    accommodationsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\n✅ ${data.name} (ID: ${doc.id})`);
      console.log(`   Rooms count: ${data.rooms?.length || 0}`);
      
      if (data.rooms && data.rooms.length > 0) {
        data.rooms.forEach((room, index) => {
          console.log(`   ${index + 1}. ${room.name}`);
          console.log(`      ID: ${room.id || 'NO ID!'}`);
          console.log(`      Type: ${room.type}`);
          console.log(`      Price: ${room.pricePerNight} Kč/noc`);
        });
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkRoomIds();

