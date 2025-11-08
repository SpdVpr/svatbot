#!/usr/bin/env node

/**
 * Script to export demo account dashboard layout positions
 * Usage: node scripts/export-demo-dashboard.js
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

async function exportDemoDashboard() {
  try {
    console.log('🎭 Exporting demo account dashboard layout...\n');

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

    // Get dashboard layout
    const dashboardRef = db.collection('dashboards').doc(`${demoUser.uid}_${weddingId}`);
    const dashboardDoc = await dashboardRef.get();

    if (!dashboardDoc.exists) {
      console.error('❌ Demo dashboard not found');
      process.exit(1);
    }

    const dashboardData = dashboardDoc.data();
    console.log('✅ Found demo dashboard layout\n');

    console.log('📊 Dashboard info:');
    console.log('   - Layout mode:', dashboardData.layoutMode);
    console.log('   - Modules count:', dashboardData.modules.length);
    console.log('   - Edit mode:', dashboardData.isEditMode);
    console.log('   - Locked:', dashboardData.isLocked);
    console.log('\n');

    // Sort modules by order
    const sortedModules = [...dashboardData.modules].sort((a, b) => a.order - b.order);

    console.log('📋 Modules (sorted by order):\n');
    console.log('export const DEFAULT_DASHBOARD_MODULES: DashboardModule[] = [');
    
    sortedModules.forEach((module, index) => {
      const isLast = index === sortedModules.length - 1;
      
      console.log('  {');
      console.log(`    id: '${module.id}',`);
      console.log(`    type: '${module.type}',`);
      console.log(`    title: '${module.title}',`);
      console.log(`    size: '${module.size}',`);
      
      if (module.position) {
        console.log(`    position: { x: ${module.position.x}, y: ${module.position.y} },`);
      }
      
      if (module.customSize) {
        console.log(`    customSize: { width: ${module.customSize.width}, height: ${module.customSize.height} },`);
      }
      
      if (module.gridPosition) {
        console.log(`    gridPosition: { row: ${module.gridPosition.row}, column: ${module.gridPosition.column} },`);
      }
      
      console.log(`    isVisible: ${module.isVisible},`);
      console.log(`    isLocked: ${module.isLocked},`);
      console.log(`    order: ${module.order}`);
      console.log(`  }${isLast ? '' : ','}`);
    });
    
    console.log('];\n');

    console.log('✅ Export complete!');
    console.log('\n💡 Copy the output above and replace DEFAULT_DASHBOARD_MODULES in src/types/dashboard.ts');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error exporting demo dashboard:', error);
    process.exit(1);
  }
}

exportDemoDashboard();

