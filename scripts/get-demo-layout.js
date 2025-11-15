/**
 * Get Demo Dashboard Layout
 * 
 * This script retrieves the current dashboard layout from the demo account
 * to use as the default layout for all new users.
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '..', 'firebase-service-account.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://svatbot-app.firebaseio.com'
});

const db = admin.firestore();

async function getDemoLayout() {
  try {
    console.log('🔍 Getting demo account layout...\n');

    // Find demo user
    const demoEmail = 'demo@svatbot.cz';
    const usersSnapshot = await admin.auth().getUserByEmail(demoEmail);
    const demoUser = usersSnapshot;
    
    if (!demoUser) {
      console.error('❌ Demo user not found!');
      process.exit(1);
    }

    console.log('✅ Found demo user:', demoUser.uid);

    // Get demo wedding
    const weddingsSnapshot = await db.collection('weddings')
      .where('userId', '==', demoUser.uid)
      .limit(1)
      .get();

    if (weddingsSnapshot.empty) {
      console.error('❌ Demo wedding not found!');
      process.exit(1);
    }

    const weddingId = weddingsSnapshot.docs[0].id;
    console.log('✅ Found demo wedding:', weddingId);

    // Get dashboard layout
    const dashboardRef = db.collection('dashboards').doc(`${demoUser.uid}_${weddingId}`);
    const dashboardDoc = await dashboardRef.get();

    if (!dashboardDoc.exists) {
      console.error('❌ Demo dashboard not found!');
      process.exit(1);
    }

    const layout = dashboardDoc.data();
    console.log('\n📊 Demo Dashboard Layout:');
    console.log('========================\n');
    console.log('Layout Mode:', layout.layoutMode);
    console.log('Edit Mode:', layout.isEditMode);
    console.log('Locked:', layout.isLocked);
    console.log('Total Modules:', layout.modules.length);
    console.log('\n📍 Module Positions:\n');

    // Sort modules by order
    const sortedModules = layout.modules.sort((a, b) => a.order - b.order);

    sortedModules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.title} (${module.id})`);
      console.log(`   Type: ${module.type}`);
      console.log(`   Size: ${module.size}`);
      console.log(`   Position: x=${module.position?.x || 0}, y=${module.position?.y || 0}`);
      if (module.customSize) {
        console.log(`   Custom Size: ${module.customSize.width}x${module.customSize.height}`);
      }
      console.log(`   Visible: ${module.isVisible}`);
      console.log(`   Locked: ${module.isLocked}`);
      console.log(`   Order: ${module.order}`);
      console.log('');
    });

    // Output as TypeScript array for easy copy-paste
    console.log('\n📋 TypeScript Array (for DEFAULT_DASHBOARD_MODULES):\n');
    console.log('export const DEFAULT_DASHBOARD_MODULES: DashboardModule[] = [');
    sortedModules.forEach((module, index) => {
      const comma = index < sortedModules.length - 1 ? ',' : '';
      console.log('  {');
      console.log(`    id: '${module.id}',`);
      console.log(`    type: '${module.type}',`);
      console.log(`    title: '${module.title}',`);
      console.log(`    size: '${module.size}',`);
      console.log(`    position: { x: ${module.position?.x || 0}, y: ${module.position?.y || 0} },`);
      if (module.customSize) {
        console.log(`    customSize: { width: ${module.customSize.width}, height: ${module.customSize.height} },`);
      }
      if (module.gridPosition) {
        console.log(`    gridPosition: { row: ${module.gridPosition.row}, column: ${module.gridPosition.column} },`);
      }
      console.log(`    isVisible: ${module.isVisible},`);
      console.log(`    isLocked: ${module.isLocked},`);
      console.log(`    order: ${module.order}`);
      console.log(`  }${comma}`);
    });
    console.log(']');

    console.log('\n✅ Demo layout retrieved successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error getting demo layout:', error);
    process.exit(1);
  }
}

getDemoLayout();

