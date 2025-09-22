#!/usr/bin/env node

/**
 * Script to create demo account in Firebase
 * Usage: node scripts/create-demo-account.js
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

async function createDemoAccount() {
  try {
    console.log('🎭 Creating demo account...');

    const demoEmail = 'demo@svatbot.cz';
    const demoPassword = 'demo123';

    // Check if demo user already exists
    let demoUser;
    try {
      demoUser = await auth.getUserByEmail(demoEmail);
      console.log('✅ Demo user already exists:', demoUser.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create demo user
        demoUser = await auth.createUser({
          email: demoEmail,
          password: demoPassword,
          displayName: 'Demo Uživatel',
          emailVerified: true
        });
        console.log('✅ Demo user created:', demoUser.uid);
      } else {
        throw error;
      }
    }

    // Create demo wedding data
    const demoWeddingData = {
      userId: demoUser.uid,
      brideName: 'Jana',
      groomName: 'Petr',
      weddingDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save wedding to Firestore
    const weddingRef = await db.collection('weddings').add(demoWeddingData);
    console.log('✅ Demo wedding created:', weddingRef.id);

    // Create demo user profile
    const demoUserData = {
      email: demoEmail,
      displayName: 'Demo Uživatel',
      firstName: 'Demo',
      lastName: 'Uživatel',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(demoUser.uid).set(demoUserData);
    console.log('✅ Demo user profile created');

    // Create some demo tasks
    const demoTasks = [
      {
        id: 'demo-task-1',
        weddingId: weddingRef.id,
        title: 'Rezervovat místo konání',
        description: 'Najít a rezervovat místo pro svatební obřad a hostinu',
        category: 'venue',
        priority: 'high',
        status: 'completed',
        dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        completedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'demo-task-2',
        weddingId: weddingRef.id,
        title: 'Objednat svatební fotografa',
        description: 'Najít a objednat profesionálního svatebního fotografa',
        category: 'photography',
        priority: 'high',
        status: 'in_progress',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'demo-task-3',
        weddingId: weddingRef.id,
        title: 'Vybrat svatební šaty',
        description: 'Najít a objednat svatební šaty včetně úprav',
        category: 'design',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    // Save demo tasks
    const batch = db.batch();
    demoTasks.forEach(task => {
      const taskRef = db.collection('tasks').doc();
      batch.set(taskRef, task);
    });
    await batch.commit();
    console.log('✅ Demo tasks created');

    console.log('\n🎉 Demo account setup complete!');
    console.log('📧 Email: demo@svatbot.cz');
    console.log('🔑 Password: demo123');
    console.log('👤 User ID:', demoUser.uid);
    console.log('💒 Wedding ID:', weddingRef.id);

  } catch (error) {
    console.error('❌ Error creating demo account:', error);
    process.exit(1);
  }
}

// Run the script
createDemoAccount()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
