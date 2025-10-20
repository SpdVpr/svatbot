/**
 * Local script to set admin custom claims
 * This script runs locally and is NOT deployed to Firebase
 * 
 * Usage: node setAdminClaims.js <UID> <role>
 * Example: node setAdminClaims.js 3oFVSatEuOeecsiHVEfEoaE1RWk1 super_admin
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://svatbot-app.firebaseio.com'
});

async function setAdminClaims(userId, role) {
  try {
    console.log(`Setting custom claims for user: ${userId}`);
    console.log(`Role: ${role}`);

    // Set custom claims
    await admin.auth().setCustomUserClaims(userId, {
      role: role,
      admin: true
    });

    console.log('✅ Custom claims set successfully!');
    
    // Verify the claims
    const user = await admin.auth().getUser(userId);
    console.log('\n📋 User custom claims:', user.customClaims);
    
    console.log('\n🎉 Done! User can now login as admin.');
    console.log('Note: User may need to logout and login again for claims to take effect.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting custom claims:', error);
    process.exit(1);
  }
}

// Get arguments from command line
const userId = process.argv[2];
const role = process.argv[3] || 'super_admin';

if (!userId) {
  console.error('❌ Error: User ID is required');
  console.log('\nUsage: node setAdminClaims.js <UID> <role>');
  console.log('Example: node setAdminClaims.js 3oFVSatEuOeecsiHVEfEoaE1RWk1 super_admin');
  process.exit(1);
}

// Run the function
setAdminClaims(userId, role);

