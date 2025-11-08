#!/usr/bin/env node

/**
 * Script to reset demo account dashboard layout to default positions
 * Usage: node scripts/reset-demo-dashboard.js
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

// Default dashboard modules with correct positions (from src/types/dashboard.ts)
const DEFAULT_DASHBOARD_MODULES = [
  // Row 0 - 1 large (2 modules wide) + 1 medium
  {
    id: 'wedding-countdown',
    type: 'wedding-countdown',
    title: 'Odpočet do svatby',
    size: 'large',
    position: { x: 40, y: 40 },
    gridPosition: { row: 0, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 0
  },
  {
    id: 'svatbot-coach',
    type: 'svatbot-coach',
    title: 'Svatbot - Váš AI Kouč',
    size: 'medium',
    position: { x: 840, y: 40 },
    customSize: { width: 360, height: 940 }, // 2 modules tall (450 + 40 + 450)
    gridPosition: { row: 0, column: 2 },
    isVisible: true,
    isLocked: false,
    order: 1
  },
  // Row 1 - 2 modules (under wedding-countdown) + 1 module continues from row 0 (svatbot-coach)
  {
    id: 'quick-actions',
    type: 'quick-actions',
    title: 'Rychlé akce',
    size: 'medium',
    position: { x: 40, y: 530 },
    gridPosition: { row: 1, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 2
  },
  {
    id: 'task-management',
    type: 'task-management',
    title: 'Správa úkolů',
    size: 'medium',
    position: { x: 440, y: 530 },
    customSize: { width: 360, height: 450 }, // 1 module tall - same as quick-actions and guest-management
    gridPosition: { row: 1, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 3
  },
  // Row 2 - 3 modules (svatbot-coach ends here)
  {
    id: 'guest-management',
    type: 'guest-management',
    title: 'Správa hostů',
    size: 'medium',
    position: { x: 40, y: 1020 },
    gridPosition: { row: 2, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 4
  },
  {
    id: 'seating-plan',
    type: 'seating-plan',
    title: 'Rozmístění hostů',
    size: 'medium',
    position: { x: 440, y: 1020 },
    gridPosition: { row: 2, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 5
  },
  {
    id: 'vendor-management',
    type: 'vendor-management',
    title: 'Dodavatelé',
    size: 'medium',
    position: { x: 840, y: 1020 },
    gridPosition: { row: 2, column: 2 },
    isVisible: true,
    isLocked: false,
    order: 6
  },
  // Row 3 - Svatební checklist pod "Správa hostů" + 2 další moduly
  {
    id: 'wedding-checklist',
    type: 'wedding-checklist',
    title: 'Svatební checklist',
    size: 'medium',
    position: { x: 40, y: 1510 },
    customSize: { width: 360, height: 940 }, // Zvětšeno na výšku pro zobrazení celého obsahu (2 moduly vysoké)
    gridPosition: { row: 3, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 7
  },
  {
    id: 'budget-tracking',
    type: 'budget-tracking',
    title: 'Rozpočet',
    size: 'medium',
    position: { x: 440, y: 1510 },
    gridPosition: { row: 3, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 8
  },
  {
    id: 'timeline-planning',
    type: 'timeline-planning',
    title: 'Časová osa',
    size: 'medium',
    position: { x: 840, y: 1510 },
    gridPosition: { row: 3, column: 2 },
    isVisible: true,
    isLocked: false,
    order: 9
  },
  // Row 4 - 2 moduly (marketplace a moodboard)
  {
    id: 'marketplace',
    type: 'marketplace',
    title: 'Najít dodavatele',
    size: 'medium',
    position: { x: 440, y: 2000 },
    gridPosition: { row: 4, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 10
  },
  {
    id: 'moodboard',
    type: 'moodboard',
    title: 'Moodboard',
    size: 'medium',
    position: { x: 840, y: 2000 },
    gridPosition: { row: 4, column: 2 },
    isVisible: true,
    isLocked: false,
    order: 11
  },
  // Row 5 - Harmonogram dne + 2 další moduly
  {
    id: 'wedding-day-timeline',
    type: 'wedding-day-timeline',
    title: 'Harmonogram dne',
    size: 'small',
    position: { x: 40, y: 2490 },
    customSize: { width: 360, height: 353 }, // Stejná velikost jako ostatní malé moduly
    gridPosition: { row: 5, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 12
  },
  {
    id: 'food-drinks',
    type: 'food-drinks',
    title: 'Jídlo a Pití',
    size: 'medium',
    position: { x: 440, y: 2490 },
    customSize: { width: 360, height: 353 },
    gridPosition: { row: 5, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 13
  },
  // Row 6 - 3 modules
  {
    id: 'music-playlist',
    type: 'music-playlist',
    title: 'Svatební hudba',
    size: 'medium',
    position: { x: 40, y: 2980 },
    gridPosition: { row: 6, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 14
  },
  {
    id: 'shopping-list',
    type: 'shopping-list',
    title: 'Nákupní seznam',
    size: 'medium',
    position: { x: 440, y: 2980 },
    gridPosition: { row: 6, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 15
  },
  {
    id: 'accommodation-management',
    type: 'accommodation-management',
    title: 'Ubytování',
    size: 'medium',
    position: { x: 840, y: 2980 },
    gridPosition: { row: 6, column: 2 },
    isVisible: true,
    isLocked: false,
    order: 16
  },
  // Row 7 - 1 module
  {
    id: 'wedding-website',
    type: 'wedding-website',
    title: 'Svatební web',
    size: 'medium',
    position: { x: 40, y: 3470 },
    gridPosition: { row: 7, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 17
  }
];

async function resetDemoDashboard() {
  try {
    console.log('🎭 Resetting demo account dashboard layout...');

    const demoEmail = 'demo@svatbot.cz';

    // Get demo user
    let demoUser;
    try {
      demoUser = await auth.getUserByEmail(demoEmail);
      console.log('✅ Found demo user:', demoUser.uid);
    } catch (error) {
      console.error('❌ Demo user not found');
      process.exit(1);
    }

    // Get demo wedding
    const weddingsSnapshot = await db.collection('weddings')
      .where('userId', '==', demoUser.uid)
      .limit(1)
      .get();

    if (weddingsSnapshot.empty) {
      console.error('❌ Demo wedding not found');
      process.exit(1);
    }

    const weddingId = weddingsSnapshot.docs[0].id;
    console.log('✅ Found demo wedding:', weddingId);

    // Create default dashboard layout
    const defaultLayout = {
      modules: DEFAULT_DASHBOARD_MODULES,
      isEditMode: false,
      isLocked: false,
      layoutMode: 'grid'
    };

    // Update dashboard in Firebase
    const dashboardRef = db.collection('dashboards').doc(`${demoUser.uid}_${weddingId}`);
    await dashboardRef.set(defaultLayout);

    console.log('✅ Dashboard layout reset successfully!');
    console.log('📊 Layout details:');
    console.log('   - Modules:', DEFAULT_DASHBOARD_MODULES.length);
    console.log('   - Layout mode: grid');
    console.log('   - All modules visible: true');
    console.log('\n🎉 Demo dashboard is now using default positions!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting demo dashboard:', error);
    process.exit(1);
  }
}

resetDemoDashboard();

