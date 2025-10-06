#!/usr/bin/env node

/**
 * Script to create demo account in Firebase
 * Usage: node scripts/create-demo-account.js
 */

const admin = require('firebase-admin');
const path = require('path');
const { createDemoGuests } = require('./guests-data');
const { createDemoTasks, createDemoBudget } = require('./tasks-budget-data');

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

async function cleanupOldDemoData(userId) {
  console.log('🧹 Cleaning up old demo data...');

  // Delete all collections for this user
  const collections = [
    'weddings',
    'guests',
    'tasks',
    'budgetItems',
    'timelineEvents',
    'milestones',
    'menuItems',
    'drinkItems',
    'accommodations',
    'rooms',
    'moodboards',
    'vendors',
    'music',
    'notes',
    'weddingDayTimeline',
    'userProfiles'
  ];

  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName)
      .where('userId', '==', userId)
      .get();

    if (!snapshot.empty) {
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`  ✅ Deleted ${snapshot.size} documents from ${collectionName}`);
    }
  }

  // Also delete by weddingId (need to find all weddings first)
  const weddingsSnapshot = await db.collection('weddings')
    .where('userId', '==', userId)
    .get();

  const weddingIds = weddingsSnapshot.docs.map(doc => doc.id);

  if (weddingIds.length > 0) {
    const weddingCollections = [
      'guests',
      'tasks',
      'budgetItems',
      'timelineEvents',
      'milestones',
      'menuItems',
      'drinkItems',
      'accommodations',
      'rooms',
      'moodboards',
      'vendors',
      'music',
      'notes'
    ];

    for (const collectionName of weddingCollections) {
      for (const weddingId of weddingIds) {
        const snapshot = await db.collection(collectionName)
          .where('weddingId', '==', weddingId)
          .get();

        if (!snapshot.empty) {
          const batch = db.batch();
          snapshot.docs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
          console.log(`  ✅ Deleted ${snapshot.size} documents from ${collectionName} for wedding ${weddingId}`);
        }
      }
    }
  }

  console.log('✅ Cleanup complete');
}

async function createDemoAccount() {
  try {
    console.log('🎭 Creating fresh demo account...');

    const demoEmail = 'demo@svatbot.cz';
    const demoPassword = 'demo123';

    // Check if demo user already exists
    let demoUser;
    try {
      demoUser = await auth.getUserByEmail(demoEmail);
      console.log('✅ Demo user already exists:', demoUser.uid);

      // Clean up old data
      await cleanupOldDemoData(demoUser.uid);
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

    // Create demo tasks - realistic wedding planning tasks
    console.log('📋 Creating demo tasks...');
    const demoTasks = createDemoTasks(weddingRef.id);

    // Save demo tasks
    const taskBatch = db.batch();
    demoTasks.forEach(task => {
      const taskRef = db.collection('tasks').doc();
      taskBatch.set(taskRef, task);
    });
    await taskBatch.commit();
    console.log(`✅ Demo tasks created (${demoTasks.length} tasks)`);

    // Create demo guests - 40 guests for a small wedding
    console.log('👥 Creating demo guests...');
    const demoGuests = createDemoGuests(weddingRef.id, demoUser.uid);

    const guestBatch = db.batch();
    demoGuests.forEach(guest => {
      const guestRef = db.collection('guests').doc();
      guestBatch.set(guestRef, guest);
    });
    await guestBatch.commit();
    console.log('✅ Demo guests created');

    // Create demo accommodations
    console.log('🏨 Creating demo accommodations...');
    const demoAccommodations = [
      {
        weddingId: weddingRef.id,
        name: 'Hotel Château Mcely',
        description: 'Luxusní boutique hotel v krásném prostředí s wellness a golfovým hřištěm',
        address: {
          street: 'Mcely 61',
          city: 'Mcely',
          postalCode: '289 36',
          country: 'Česká republika'
        },
        contactInfo: {
          email: 'info@chateaumcely.cz',
          phone: '+420 325 600 000',
          website: 'https://www.chateaumcely.cz'
        },
        website: 'https://www.chateaumcely.cz',
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
          'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'
        ],
        amenities: ['WiFi', 'Parkování', 'Snídaně', 'Wellness', 'Restaurant', 'Bar', 'Golf'],
        rooms: [],
        policies: {
          checkIn: '15:00',
          checkOut: '11:00',
          cancellationPolicy: 'Zrušení zdarma do 7 dní před příjezdem',
          petPolicy: 'Domácí mazlíčci povoleni za příplatek',
          smokingPolicy: 'Nekuřácký hotel',
          childrenPolicy: 'Děti vítány',
          additionalFees: ['Parkování: 200 Kč/den', 'Domácí mazlíček: 500 Kč/noc']
        },
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        weddingId: weddingRef.id,
        name: 'Penzion U Lípy',
        description: 'Rodinný penzion s útulnými pokoji a domácí atmosférou',
        address: {
          street: 'Hlavní 123',
          city: 'Mcely',
          postalCode: '289 36',
          country: 'Česká republika'
        },
        contactInfo: {
          email: 'info@penzionulipy.cz',
          phone: '+420 325 123 456',
          website: 'https://www.penzionulipy.cz'
        },
        website: 'https://www.penzionulipy.cz',
        images: [
          'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'
        ],
        amenities: ['WiFi', 'Parkování', 'Snídaně', 'Zahrada', 'Gril'],
        rooms: [],
        policies: {
          checkIn: '14:00',
          checkOut: '10:00',
          cancellationPolicy: 'Zrušení zdarma do 3 dní před příjezdem',
          petPolicy: 'Domácí mazlíčci povoleni',
          smokingPolicy: 'Kouření pouze venku',
          childrenPolicy: 'Děti vítány',
          additionalFees: []
        },
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const accommodation of demoAccommodations) {
      const accommodationRef = await db.collection('accommodations').add(accommodation);
      console.log(`✅ Created accommodation: ${accommodation.name}`);

      // Add rooms to first accommodation
      if (accommodation.name === 'Hotel Château Mcely') {
        const rooms = [
          // Standard pokoje (3 pokoje)
          {
            accommodationId: accommodationRef.id,
            weddingId: weddingRef.id,
            name: 'Standard pokoj 101',
            description: 'Útulný pokoj s manželskou postelí',
            type: 'double',
            capacity: 2,
            maxOccupancy: 2,
            bedConfiguration: [{ type: 'queen', count: 1 }],
            pricePerNight: 2800,
            totalPrice: 5600,
            amenities: ['WiFi', 'TV', 'Koupelna', 'Klimatizace'],
            images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
            isAvailable: true,
            reservations: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          {
            accommodationId: accommodationRef.id,
            weddingId: weddingRef.id,
            name: 'Standard pokoj 102',
            description: 'Útulný pokoj s manželskou postelí',
            type: 'double',
            capacity: 2,
            maxOccupancy: 2,
            bedConfiguration: [{ type: 'queen', count: 1 }],
            pricePerNight: 2800,
            totalPrice: 5600,
            amenities: ['WiFi', 'TV', 'Koupelna', 'Klimatizace'],
            images: ['https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800'],
            isAvailable: true,
            reservations: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          {
            accommodationId: accommodationRef.id,
            weddingId: weddingRef.id,
            name: 'Standard pokoj 103',
            description: 'Útulný pokoj s manželskou postelí',
            type: 'double',
            capacity: 2,
            maxOccupancy: 2,
            bedConfiguration: [{ type: 'queen', count: 1 }],
            pricePerNight: 2800,
            totalPrice: 5600,
            amenities: ['WiFi', 'TV', 'Koupelna', 'Klimatizace'],
            images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'],
            isAvailable: true,
            reservations: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          // Deluxe pokoje (4 pokoje)
          {
            accommodationId: accommodationRef.id,
            weddingId: weddingRef.id,
            name: 'Deluxe pokoj 201',
            description: 'Prostorný pokoj s king size postelí a výhledem do zahrady',
            type: 'double',
            capacity: 2,
            maxOccupancy: 2,
            bedConfiguration: [{ type: 'king', count: 1 }],
            pricePerNight: 3500,
            totalPrice: 7000,
            amenities: ['WiFi', 'TV', 'Minibar', 'Klimatizace', 'Koupelna', 'Výhled do zahrady'],
            images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
            isAvailable: true,
            reservations: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          {
            accommodationId: accommodationRef.id,
            weddingId: weddingRef.id,
            name: 'Deluxe pokoj 202',
            description: 'Prostorný pokoj s king size postelí a výhledem do zahrady',
            type: 'double',
            capacity: 2,
            maxOccupancy: 2,
            bedConfiguration: [{ type: 'king', count: 1 }],
            pricePerNight: 3500,
            totalPrice: 7000,
            amenities: ['WiFi', 'TV', 'Minibar', 'Klimatizace', 'Koupelna', 'Výhled do zahrady'],
            images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800'],
            isAvailable: true,
            reservations: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          {
            accommodationId: accommodationRef.id,
            weddingId: weddingRef.id,
            name: 'Deluxe pokoj 203',
            description: 'Prostorný pokoj s king size postelí a balkonem',
            type: 'double',
            capacity: 2,
            maxOccupancy: 3,
            bedConfiguration: [{ type: 'king', count: 1 }],
            pricePerNight: 3800,
            totalPrice: 7600,
            amenities: ['WiFi', 'TV', 'Minibar', 'Klimatizace', 'Koupelna', 'Balkon'],
            images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
            isAvailable: true,
            reservations: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          {
            accommodationId: accommodationRef.id,
            weddingId: weddingRef.id,
            name: 'Deluxe pokoj 204',
            description: 'Prostorný pokoj s king size postelí a balkonem',
            type: 'double',
            capacity: 2,
            maxOccupancy: 3,
            bedConfiguration: [{ type: 'king', count: 1 }],
            pricePerNight: 3800,
            totalPrice: 7600,
            amenities: ['WiFi', 'TV', 'Minibar', 'Klimatizace', 'Koupelna', 'Balkon'],
            images: ['https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800'],
            isAvailable: true,
            reservations: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          // Rodinné pokoje (2 pokoje)
          {
            accommodationId: accommodationRef.id,
            weddingId: weddingRef.id,
            name: 'Rodinný apartmán 301',
            description: 'Prostorný apartmán pro rodiny s dětmi',
            type: 'family',
            capacity: 4,
            maxOccupancy: 4,
            bedConfiguration: [
              { type: 'queen', count: 1 },
              { type: 'single', count: 2 }
            ],
            pricePerNight: 5000,
            totalPrice: 10000,
            amenities: ['WiFi', 'TV', 'Kuchyňka', 'Klimatizace', 'Koupelna', 'Balkon'],
            images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'],
            isAvailable: true,
            reservations: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          {
            accommodationId: accommodationRef.id,
            weddingId: weddingRef.id,
            name: 'Rodinný apartmán 302',
            description: 'Prostorný apartmán pro rodiny s dětmi',
            type: 'family',
            capacity: 4,
            maxOccupancy: 5,
            bedConfiguration: [
              { type: 'queen', count: 1 },
              { type: 'single', count: 2 },
              { type: 'sofa-bed', count: 1 }
            ],
            pricePerNight: 5500,
            totalPrice: 11000,
            amenities: ['WiFi', 'TV', 'Kuchyňka', 'Klimatizace', 'Koupelna', 'Balkon', 'Dětská postýlka'],
            images: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800'],
            isAvailable: true,
            reservations: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          // Apartmá (1 pokoj)
          {
            accommodationId: accommodationRef.id,
            weddingId: weddingRef.id,
            name: 'Prezidentské apartmá',
            description: 'Nejluxusnější apartmá s vlastním wellness a terasou',
            type: 'suite',
            capacity: 2,
            maxOccupancy: 4,
            bedConfiguration: [
              { type: 'king', count: 1 },
              { type: 'sofa-bed', count: 1 }
            ],
            pricePerNight: 8000,
            totalPrice: 16000,
            amenities: ['WiFi', 'TV', 'Minibar', 'Klimatizace', 'Koupelna', 'Terasa', 'Vířivka', 'Sauna', 'Výhled na golf'],
            images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'],
            isAvailable: true,
            reservations: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }
        ];

        // Update accommodation document with rooms array
        const now = new Date();
        await accommodationRef.update({
          rooms: rooms.map((room, index) => ({
            id: `room_${accommodationRef.id}_${index + 1}`,
            ...room,
            accommodationId: accommodationRef.id,
            weddingId: weddingRef.id,
            createdAt: now,
            updatedAt: now
          }))
        });
        console.log(`✅ Added ${rooms.length} rooms to ${accommodation.name}`);
      }

      // Add rooms to second accommodation
      if (accommodation.name === 'Penzion U Lípy') {
        const rooms = [
          // Jednolůžkové pokoje (2 pokoje)
          {
            accommodationId: accommodationRef.id,
            weddingId: weddingRef.id,
            name: 'Jednolůžkový pokoj 1',
            description: 'Útulný pokoj pro jednu osobu',
            type: 'single',
            capacity: 1,
            maxOccupancy: 1,
            bedConfiguration: [{ type: 'single', count: 1 }],
            pricePerNight: 1200,
            totalPrice: 2400,
            amenities: ['WiFi', 'TV', 'Koupelna'],
            images: ['https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800'],
            isAvailable: true,
            reservations: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          {
            accommodationId: accommodationRef.id,
            weddingId: weddingRef.id,
            name: 'Jednolůžkový pokoj 2',
            description: 'Útulný pokoj pro jednu osobu',
            type: 'single',
            capacity: 1,
            maxOccupancy: 1,
            bedConfiguration: [{ type: 'single', count: 1 }],
            pricePerNight: 1200,
            totalPrice: 2400,
            amenities: ['WiFi', 'TV', 'Koupelna'],
            images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800'],
            isAvailable: true,
            reservations: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          // Dvoulůžkové pokoje (4 pokoje)
          {
            accommodationId: accommodationRef.id,
            weddingId: weddingRef.id,
            name: 'Dvoulůžkový pokoj 3',
            description: 'Útulný pokoj s manželskou postelí',
            type: 'double',
            capacity: 2,
            maxOccupancy: 2,
            bedConfiguration: [{ type: 'queen', count: 1 }],
            pricePerNight: 1800,
            totalPrice: 3600,
            amenities: ['WiFi', 'TV', 'Koupelna'],
            images: ['https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800'],
            isAvailable: true,
            reservations: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          {
            accommodationId: accommodationRef.id,
            weddingId: weddingRef.id,
            name: 'Dvoulůžkový pokoj 4',
            description: 'Útulný pokoj s manželskou postelí',
            type: 'double',
            capacity: 2,
            maxOccupancy: 2,
            bedConfiguration: [{ type: 'queen', count: 1 }],
            pricePerNight: 1800,
            totalPrice: 3600,
            amenities: ['WiFi', 'TV', 'Koupelna'],
            images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'],
            isAvailable: true,
            reservations: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          {
            accommodationId: accommodationRef.id,
            weddingId: weddingRef.id,
            name: 'Dvoulůžkový pokoj 5',
            description: 'Pokoj s manželskou postelí a balkonem',
            type: 'double',
            capacity: 2,
            maxOccupancy: 2,
            bedConfiguration: [{ type: 'queen', count: 1 }],
            pricePerNight: 2000,
            totalPrice: 4000,
            amenities: ['WiFi', 'TV', 'Koupelna', 'Balkon'],
            images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
            isAvailable: true,
            reservations: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          {
            accommodationId: accommodationRef.id,
            weddingId: weddingRef.id,
            name: 'Dvoulůžkový pokoj 6',
            description: 'Pokoj s manželskou postelí a balkonem',
            type: 'double',
            capacity: 2,
            maxOccupancy: 2,
            bedConfiguration: [{ type: 'queen', count: 1 }],
            pricePerNight: 2000,
            totalPrice: 4000,
            amenities: ['WiFi', 'TV', 'Koupelna', 'Balkon'],
            images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800'],
            isAvailable: true,
            reservations: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          // Třílůžkové pokoje (2 pokoje)
          {
            accommodationId: accommodationRef.id,
            weddingId: weddingRef.id,
            name: 'Třílůžkový pokoj 7',
            description: 'Pokoj pro tři osoby',
            type: 'twin',
            capacity: 3,
            maxOccupancy: 3,
            bedConfiguration: [
              { type: 'double', count: 1 },
              { type: 'single', count: 1 }
            ],
            pricePerNight: 2400,
            totalPrice: 4800,
            amenities: ['WiFi', 'TV', 'Koupelna'],
            images: ['https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800'],
            isAvailable: true,
            reservations: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          {
            accommodationId: accommodationRef.id,
            weddingId: weddingRef.id,
            name: 'Třílůžkový pokoj 8',
            description: 'Pokoj pro tři osoby s balkonem',
            type: 'twin',
            capacity: 3,
            maxOccupancy: 3,
            bedConfiguration: [
              { type: 'double', count: 1 },
              { type: 'single', count: 1 }
            ],
            pricePerNight: 2600,
            totalPrice: 5200,
            amenities: ['WiFi', 'TV', 'Koupelna', 'Balkon'],
            images: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800'],
            isAvailable: true,
            reservations: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          // Rodinné pokoje (2 pokoje)
          {
            accommodationId: accommodationRef.id,
            weddingId: weddingRef.id,
            name: 'Rodinný pokoj 9',
            description: 'Prostorný pokoj pro rodinu',
            type: 'family',
            capacity: 4,
            maxOccupancy: 4,
            bedConfiguration: [
              { type: 'queen', count: 1 },
              { type: 'single', count: 2 }
            ],
            pricePerNight: 3000,
            totalPrice: 6000,
            amenities: ['WiFi', 'TV', 'Koupelna', 'Balkon'],
            images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
            isAvailable: true,
            reservations: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          {
            accommodationId: accommodationRef.id,
            weddingId: weddingRef.id,
            name: 'Rodinný pokoj 10',
            description: 'Velký rodinný pokoj s kuchyňkou',
            type: 'family',
            capacity: 5,
            maxOccupancy: 5,
            bedConfiguration: [
              { type: 'queen', count: 1 },
              { type: 'single', count: 2 },
              { type: 'sofa-bed', count: 1 }
            ],
            pricePerNight: 3500,
            totalPrice: 7000,
            amenities: ['WiFi', 'TV', 'Koupelna', 'Balkon', 'Kuchyňka'],
            images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'],
            isAvailable: true,
            reservations: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }
        ];

        // Update accommodation document with rooms array
        const now = new Date();
        await accommodationRef.update({
          rooms: rooms.map((room, index) => ({
            id: `room_${accommodationRef.id}_${index + 1}`,
            ...room,
            accommodationId: accommodationRef.id,
            weddingId: weddingRef.id,
            createdAt: now,
            updatedAt: now
          }))
        });
        console.log(`✅ Added ${rooms.length} rooms to ${accommodation.name}`);
      }
    }

    // Create demo moodboard images
    console.log('🎨 Creating demo moodboard images...');
    const demoMoodboardImages = [
      {
        weddingId: weddingRef.id,
        userId: demoUser.uid,
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
        title: 'Svatební místo - zámek',
        description: 'Inspirace pro místo konání - romantický zámek',
        source: 'upload',
        sourceUrl: '',
        isFavorite: true,
        tags: ['místo', 'zámek', 'elegance'],
        category: 'venue',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        weddingId: weddingRef.id,
        userId: demoUser.uid,
        url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400',
        title: 'Květinová výzdoba',
        description: 'Bílé růže a eukalyptus',
        source: 'upload',
        sourceUrl: '',
        isFavorite: true,
        tags: ['květiny', 'růže', 'bílá'],
        category: 'flowers',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        weddingId: weddingRef.id,
        userId: demoUser.uid,
        url: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400',
        title: 'Svatební šaty',
        description: 'Elegantní krajkové šaty',
        source: 'upload',
        sourceUrl: '',
        isFavorite: false,
        tags: ['šaty', 'krajka', 'elegance'],
        category: 'dress',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        weddingId: weddingRef.id,
        userId: demoUser.uid,
        url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400',
        title: 'Svatební dort',
        description: 'Třípatrový dort s květinovou výzdobou',
        source: 'upload',
        sourceUrl: '',
        isFavorite: true,
        tags: ['dort', 'květiny', 'elegance'],
        category: 'cake',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        weddingId: weddingRef.id,
        userId: demoUser.uid,
        url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400',
        title: 'Stolní dekorace',
        description: 'Rustikální stolní výzdoba se svíčkami',
        source: 'upload',
        sourceUrl: '',
        isFavorite: false,
        tags: ['dekorace', 'stůl', 'svíčky'],
        category: 'decoration',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        weddingId: weddingRef.id,
        userId: demoUser.uid,
        url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400',
        title: 'Svatební prsteny',
        description: 'Zlaté snubní prsteny',
        source: 'upload',
        sourceUrl: '',
        isFavorite: true,
        tags: ['prsteny', 'zlato'],
        category: 'rings',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    const moodboardBatch = db.batch();
    demoMoodboardImages.forEach(image => {
      const imageRef = db.collection('moodboards').doc();
      moodboardBatch.set(imageRef, image);
    });
    await moodboardBatch.commit();
    console.log('✅ Demo moodboard images created');

    // Create demo menu items
    console.log('🍽️ Creating demo menu items...');
    const demoMenuItems = [
      // Předkrmy
      {
        weddingId: weddingRef.id,
        name: 'Carpaccio z hovězího',
        description: 'Tenké plátky hovězího masa s rukolou, parmazánem a balsamikem',
        category: 'appetizer',
        estimatedQuantity: 80,
        actualQuantity: null,
        pricePerServing: 150,
        totalCost: 12000,
        currency: 'CZK',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: true,
        allergens: ['dairy'],
        status: 'confirmed',
        vendorName: 'Catering Elegance',
        notes: 'Lehký předkrm',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        name: 'Grilovaná zelenina s kozím sýrem',
        description: 'Baklažán, cuketa, paprika s kozím sýrem a bylinkami',
        category: 'appetizer',
        estimatedQuantity: 40,
        actualQuantity: null,
        pricePerServing: 120,
        totalCost: 4800,
        currency: 'CZK',
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: true,
        allergens: ['dairy'],
        status: 'confirmed',
        vendorName: 'Catering Elegance',
        notes: 'Vegetariánská varianta',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      // Polévky
      {
        weddingId: weddingRef.id,
        name: 'Hovězí vývar s nudlemi',
        description: 'Tradiční český vývar s domácími nudlemi',
        category: 'soup',
        estimatedQuantity: 80,
        actualQuantity: null,
        pricePerServing: 80,
        totalCost: 6400,
        currency: 'CZK',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        allergens: ['gluten', 'eggs'],
        status: 'confirmed',
        vendorName: 'Catering Elegance',
        notes: 'Klasika',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        name: 'Krémová dýňová polévka',
        description: 'Sametová polévka z pečené dýně s zázvorem',
        category: 'soup',
        estimatedQuantity: 40,
        actualQuantity: null,
        pricePerServing: 90,
        totalCost: 3600,
        currency: 'CZK',
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        allergens: [],
        status: 'confirmed',
        vendorName: 'Catering Elegance',
        notes: 'Veganská varianta',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      // Hlavní jídla
      {
        weddingId: weddingRef.id,
        name: 'Hovězí svíčková',
        description: 'Hovězí svíčková na smetaně s karlovarským knedlíkem',
        category: 'main-course',
        estimatedQuantity: 50,
        actualQuantity: null,
        pricePerServing: 280,
        totalCost: 14000,
        currency: 'CZK',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        allergens: ['gluten', 'dairy'],
        status: 'confirmed',
        vendorName: 'Catering Elegance',
        notes: 'Tradiční česká klasika',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        name: 'Grilovaný losos',
        description: 'Grilovaný losos s bylinkovým máslem a grilovanou zeleninou',
        category: 'main-course',
        estimatedQuantity: 35,
        actualQuantity: null,
        pricePerServing: 320,
        totalCost: 11200,
        currency: 'CZK',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: true,
        allergens: ['fish'],
        status: 'confirmed',
        vendorName: 'Catering Elegance',
        notes: 'Pro milovníky ryb',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        name: 'Kuřecí supreme',
        description: 'Kuřecí prsa plněná špenátem a sýrem feta',
        category: 'main-course',
        estimatedQuantity: 45,
        actualQuantity: null,
        pricePerServing: 250,
        totalCost: 11250,
        currency: 'CZK',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: true,
        allergens: ['dairy'],
        status: 'confirmed',
        vendorName: 'Catering Elegance',
        notes: 'Lehčí varianta',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      // Přílohy
      {
        weddingId: weddingRef.id,
        name: 'Opékané brambory',
        description: 'Křupavé opékané brambory s rozmarýnem',
        category: 'side-dish',
        estimatedQuantity: 80,
        actualQuantity: null,
        pricePerServing: 60,
        totalCost: 4800,
        currency: 'CZK',
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        allergens: [],
        status: 'confirmed',
        vendorName: 'Catering Elegance',
        notes: 'Univerzální příloha',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        name: 'Rýže jasmínová',
        description: 'Voňavá jasmínová rýže',
        category: 'side-dish',
        estimatedQuantity: 60,
        actualQuantity: null,
        pricePerServing: 40,
        totalCost: 2400,
        currency: 'CZK',
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        allergens: [],
        status: 'confirmed',
        vendorName: 'Catering Elegance',
        notes: 'K rybám',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        name: 'Zeleninový mix',
        description: 'Grilovaná zelenina - cuketa, paprika, lilek',
        category: 'side-dish',
        estimatedQuantity: 70,
        actualQuantity: null,
        pricePerServing: 70,
        totalCost: 4900,
        currency: 'CZK',
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        allergens: [],
        status: 'confirmed',
        vendorName: 'Catering Elegance',
        notes: 'Zdravá příloha',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      // Dezerty
      {
        weddingId: weddingRef.id,
        name: 'Svatební dort',
        description: 'Třípatrový dort s vanilkovým krémem a čerstvým ovocem',
        category: 'dessert',
        estimatedQuantity: 100,
        actualQuantity: null,
        pricePerServing: 120,
        totalCost: 12000,
        currency: 'CZK',
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: false,
        allergens: ['gluten', 'dairy', 'eggs'],
        status: 'confirmed',
        vendorName: 'Cukrárna U Anděla',
        notes: 'Hlavní dort',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        name: 'Tiramisu',
        description: 'Italský dezert s mascarpone a kávou',
        category: 'dessert',
        estimatedQuantity: 50,
        actualQuantity: null,
        pricePerServing: 90,
        totalCost: 4500,
        currency: 'CZK',
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: false,
        allergens: ['gluten', 'dairy', 'eggs'],
        status: 'confirmed',
        vendorName: 'Catering Elegance',
        notes: 'Alternativa k dortu',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        name: 'Ovocný salát',
        description: 'Čerstvé sezónní ovoce',
        category: 'dessert',
        estimatedQuantity: 40,
        actualQuantity: null,
        pricePerServing: 70,
        totalCost: 2800,
        currency: 'CZK',
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        allergens: [],
        status: 'confirmed',
        vendorName: 'Catering Elegance',
        notes: 'Lehká varianta',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      }
    ];

    const menuBatch = db.batch();
    demoMenuItems.forEach(item => {
      const itemRef = db.collection('menuItems').doc();
      menuBatch.set(itemRef, item);
    });
    await menuBatch.commit();
    console.log('✅ Demo menu items created');

    // Create demo drink items
    console.log('🍷 Creating demo drink items...');
    const demoDrinkItems = [
      {
        weddingId: weddingRef.id,
        name: 'Prosecco',
        description: 'Italské šumivé víno na přivítanou',
        category: 'sparkling',
        estimatedQuantity: 100,
        actualQuantity: null,
        pricePerUnit: 150,
        totalCost: 15000,
        currency: 'CZK',
        unit: 'sklenice',
        isAlcoholic: true,
        status: 'confirmed',
        vendorName: 'Vinotéka U Hroznů',
        notes: 'Podávat při příchodu hostů',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        name: 'Domácí limonáda',
        description: 'Osvěžující citronová limonáda',
        category: 'soft-drinks',
        estimatedQuantity: 150,
        actualQuantity: null,
        pricePerUnit: 40,
        totalCost: 6000,
        currency: 'CZK',
        unit: 'sklenice',
        isAlcoholic: false,
        status: 'confirmed',
        vendorName: 'Catering Elegance',
        notes: 'Pro děti a řidiče',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        name: 'Bílé víno - Ryzlink rýnský',
        description: 'Suché bílé víno z Moravy',
        category: 'wine',
        estimatedQuantity: 80,
        actualQuantity: null,
        pricePerUnit: 120,
        totalCost: 9600,
        currency: 'CZK',
        unit: 'sklenice',
        isAlcoholic: true,
        status: 'confirmed',
        vendorName: 'Vinotéka U Hroznů',
        notes: 'K rybám',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        name: 'Červené víno - Frankovka',
        description: 'Polosuché červené víno',
        category: 'wine',
        estimatedQuantity: 70,
        actualQuantity: null,
        pricePerUnit: 130,
        totalCost: 9100,
        currency: 'CZK',
        unit: 'sklenice',
        isAlcoholic: true,
        status: 'confirmed',
        vendorName: 'Vinotéka U Hroznů',
        notes: 'K masu',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        name: 'Pivo Pilsner Urquell',
        description: 'Ležák 12°',
        category: 'beer',
        estimatedQuantity: 120,
        actualQuantity: null,
        pricePerUnit: 50,
        totalCost: 6000,
        currency: 'CZK',
        unit: 'půllitr',
        isAlcoholic: true,
        status: 'confirmed',
        vendorName: 'Nápojový servis',
        notes: 'Čepované',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        name: 'Minerální voda',
        description: 'Perlivá i neperlivá',
        category: 'soft-drinks',
        estimatedQuantity: 200,
        actualQuantity: null,
        pricePerUnit: 25,
        totalCost: 5000,
        currency: 'CZK',
        unit: 'láhev',
        isAlcoholic: false,
        status: 'confirmed',
        vendorName: 'Nápojový servis',
        notes: 'Na stoly',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        name: 'Džus pomerančový',
        description: '100% pomerančový džus',
        category: 'soft-drinks',
        estimatedQuantity: 80,
        actualQuantity: null,
        pricePerUnit: 35,
        totalCost: 2800,
        currency: 'CZK',
        unit: 'sklenice',
        isAlcoholic: false,
        status: 'confirmed',
        vendorName: 'Catering Elegance',
        notes: 'Pro děti',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      }
    ];

    const drinkBatch = db.batch();
    demoDrinkItems.forEach(item => {
      const itemRef = db.collection('drinkItems').doc();
      drinkBatch.set(itemRef, item);
    });
    await drinkBatch.commit();
    console.log('✅ Demo drink items created');

    // Create demo budget items - realistic wedding budget
    console.log('💰 Creating demo budget items...');
    const demoBudgetItems = createDemoBudget(weddingRef.id, demoUser.uid);

    const budgetBatch = db.batch();
    demoBudgetItems.forEach((item) => {
      const budgetRef = db.collection('budgetItems').doc();
      budgetBatch.set(budgetRef, item);
    });
    await budgetBatch.commit();
    console.log(`✅ Demo budget items created (${demoBudgetItems.length} items)`);

    // Create demo vendors
    console.log('👔 Creating demo vendors...');
    const demoVendors = [
      {
        weddingId: weddingRef.id,
        name: 'Photo Nejedlí',
        category: 'photographer',
        description: 'Profesionální svatební fotografie s důrazem na přirozené okamžiky',
        website: 'https://photonejedli.cz',
        contacts: [
          {
            name: 'Jan Nejedlý',
            role: 'Hlavní fotograf',
            email: 'jan@photonejedli.cz',
            phone: '+420 777 123 456',
            isPrimary: true
          }
        ],
        address: {
          street: 'Václavské náměstí 1',
          city: 'Praha',
          postalCode: '110 00',
          country: 'Česká republika'
        },
        businessName: 'Photo Nejedlí s.r.o.',
        businessId: '12345678',
        services: [
          {
            id: 'service_photo_1',
            name: 'Reportážní fotografie',
            description: 'Celý den svatby',
            price: 35000,
            priceType: 'fixed',
            included: ['Digitální galerie', 'Retušování'],
            duration: '10 hodin'
          }
        ],
        priceRange: {
          min: 15000,
          max: 50000,
          currency: 'CZK'
        },
        status: 'contracted',
        priority: 'high',
        rating: {
          overall: 5,
          communication: 5,
          quality: 5,
          value: 5,
          professionalism: 5
        },
        lastContactDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        notes: 'Skvělé reference, profesionální přístup. Smlouva podepsána.',
        tags: ['fotografie', 'reportáž', 'profesionál'],
        portfolio: [
          'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800',
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800'
        ],
        testimonials: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        name: 'Catering Elegance',
        category: 'catering',
        description: 'Prémiový svatební catering s důrazem na kvalitu a prezentaci',
        website: 'https://cateringelegance.cz',
        contacts: [
          {
            name: 'Marie Svobodová',
            role: 'Vedoucí cateringu',
            email: 'marie@cateringelegance.cz',
            phone: '+420 777 234 567',
            isPrimary: true
          }
        ],
        address: {
          street: 'Nádražní 45',
          city: 'Praha',
          postalCode: '150 00',
          country: 'Česká republika'
        },
        businessName: 'Catering Elegance s.r.o.',
        businessId: '87654321',
        services: [
          {
            id: 'service_catering_1',
            name: 'Svatební menu',
            description: 'Kompletní menu pro 85 hostů',
            price: 127500,
            priceType: 'per-person',
            included: ['Předkrm', 'Hlavní chod', 'Dezert', 'Nápoje'],
            duration: null
          }
        ],
        priceRange: {
          min: 800,
          max: 2000,
          currency: 'CZK'
        },
        status: 'contracted',
        priority: 'critical',
        rating: {
          overall: 5,
          communication: 5,
          quality: 5,
          value: 4,
          professionalism: 5
        },
        lastContactDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        notes: 'Potvrzeno menu, záloha zaplacena. Finální počty 2 týdny před svatbou.',
        tags: ['catering', 'jídlo', 'profesionál'],
        portfolio: [
          'https://images.unsplash.com/photo-1555244162-803834f70033?w=800',
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'
        ],
        testimonials: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        name: 'Château Mcely',
        category: 'venue',
        description: 'Luxusní hotel a místo konání svateb v krásném prostředí',
        website: 'https://chateaumcely.cz',
        contacts: [
          {
            name: 'Petra Dvořáková',
            role: 'Event Manager',
            email: 'petra@chateaumcely.cz',
            phone: '+420 325 600 000',
            isPrimary: true
          }
        ],
        address: {
          street: 'Mcely 61',
          city: 'Mcely',
          postalCode: '289 36',
          country: 'Česká republika'
        },
        businessName: 'Château Mcely s.r.o.',
        businessId: '23456789',
        services: [
          {
            id: 'service_venue_1',
            name: 'Pronájem prostor',
            description: 'Obřad + hostina + ubytování',
            price: 120000,
            priceType: 'fixed',
            included: ['Obřadní síň', 'Hostinský sál', 'Zahrada', 'Parkování'],
            duration: '2 dny'
          }
        ],
        priceRange: {
          min: 80000,
          max: 150000,
          currency: 'CZK'
        },
        status: 'contracted',
        priority: 'critical',
        rating: {
          overall: 5,
          communication: 5,
          quality: 5,
          value: 4,
          professionalism: 5
        },
        lastContactDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        notes: 'Rezervace potvrzena, záloha 50% zaplacena',
        tags: ['místo', 'hotel', 'luxus'],
        portfolio: [
          'https://images.unsplash.com/photo-1519167758481-83f29da8c2b0?w=800',
          'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800'
        ],
        testimonials: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        name: 'DJ Martin Beats',
        category: 'music',
        description: 'Profesionální DJ s vlastním ozvučením a osvětlením',
        website: 'https://djmartinbeats.cz',
        contacts: [
          {
            name: 'Martin Novotný',
            role: 'DJ',
            email: 'martin@djmartinbeats.cz',
            phone: '+420 777 345 678',
            isPrimary: true
          }
        ],
        address: {
          street: 'Hlavní 123',
          city: 'Praha',
          postalCode: '120 00',
          country: 'Česká republika'
        },
        businessName: 'Martin Novotný - DJ',
        businessId: '34567890',
        services: [
          {
            id: 'service_dj_1',
            name: 'DJ na svatbu',
            description: 'Hudba + ozvučení + osvětlení',
            price: 18000,
            priceType: 'fixed',
            included: ['Ozvučení', 'Osvětlení', 'Hudba dle přání'],
            duration: '6 hodin'
          }
        ],
        priceRange: {
          min: 15000,
          max: 25000,
          currency: 'CZK'
        },
        status: 'booked',
        priority: 'high',
        rating: {
          overall: 5,
          communication: 5,
          quality: 5,
          value: 5,
          professionalism: 5
        },
        lastContactDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        notes: 'Rezervace potvrzena, playlist připravujeme',
        tags: ['hudba', 'dj', 'zábava'],
        portfolio: [],
        testimonials: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        name: 'Květiny Růže',
        category: 'florist',
        description: 'Svatební květinová výzdoba a kytice',
        website: 'https://kvetinyruze.cz',
        contacts: [
          {
            name: 'Eva Květová',
            role: 'Floristka',
            email: 'eva@kvetinyruze.cz',
            phone: '+420 777 456 789',
            isPrimary: true
          }
        ],
        address: {
          street: 'Zahradní 45',
          city: 'Praha',
          postalCode: '130 00',
          country: 'Česká republika'
        },
        businessName: 'Květiny Růže s.r.o.',
        businessId: '45678901',
        services: [
          {
            id: 'service_florist_1',
            name: 'Svatební květiny',
            description: 'Kytice + výzdoba + stolní aranžmá',
            price: 25000,
            priceType: 'fixed',
            included: ['Svatební kytice', 'Korsáže', 'Stolní výzdoba', 'Obřadní výzdoba'],
            duration: null
          }
        ],
        priceRange: {
          min: 15000,
          max: 40000,
          currency: 'CZK'
        },
        status: 'contacted',
        priority: 'medium',
        rating: null,
        lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        nextFollowUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        notes: 'Čeká se na cenovou nabídku',
        tags: ['květiny', 'výzdoba'],
        portfolio: [
          'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
          'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800'
        ],
        testimonials: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        name: 'Video Memories',
        category: 'videographer',
        description: 'Profesionální svatební video s drony',
        website: 'https://videomemories.cz',
        contacts: [
          {
            name: 'Tomáš Kamera',
            role: 'Kameraman',
            email: 'tomas@videomemories.cz',
            phone: '+420 777 567 890',
            isPrimary: true
          }
        ],
        address: {
          street: 'Filmová 78',
          city: 'Praha',
          postalCode: '140 00',
          country: 'Česká republika'
        },
        businessName: 'Video Memories s.r.o.',
        businessId: '56789012',
        services: [
          {
            id: 'service_video_1',
            name: 'Svatební video',
            description: 'Celý den + dron + sestřih',
            price: 28000,
            priceType: 'fixed',
            included: ['Celý den natáčení', 'Dronové záběry', 'Profesionální sestřih', 'Hudba'],
            duration: '10 hodin'
          }
        ],
        priceRange: {
          min: 20000,
          max: 45000,
          currency: 'CZK'
        },
        status: 'potential',
        priority: 'medium',
        rating: null,
        lastContactDate: null,
        nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        notes: 'Doporučení od fotografa, zatím nekontaktováno',
        tags: ['video', 'dron'],
        portfolio: [],
        testimonials: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        name: 'Salon Krása',
        category: 'beauty',
        description: 'Svatební líčení a účesy',
        website: 'https://salonkrasa.cz',
        contacts: [
          {
            name: 'Lucie Krásná',
            role: 'Vizážistka',
            email: 'lucie@salonkrasa.cz',
            phone: '+420 777 678 901',
            isPrimary: true
          }
        ],
        address: {
          street: 'Kosmetická 12',
          city: 'Praha',
          postalCode: '150 00',
          country: 'Česká republika'
        },
        businessName: 'Salon Krása s.r.o.',
        businessId: '67890123',
        services: [
          {
            id: 'service_beauty_1',
            name: 'Svatební líčení a účes',
            description: 'Nevěsta + 2 družičky',
            price: 8500,
            priceType: 'fixed',
            included: ['Zkušební líčení', 'Svatební líčení', 'Svatební účes'],
            duration: '4 hodiny'
          }
        ],
        priceRange: {
          min: 5000,
          max: 15000,
          currency: 'CZK'
        },
        status: 'booked',
        priority: 'high',
        rating: {
          overall: 5,
          communication: 5,
          quality: 5,
          value: 5,
          professionalism: 5
        },
        lastContactDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        notes: 'Zkušební líčení proběhlo, vše OK',
        tags: ['líčení', 'účes', 'krása'],
        portfolio: [],
        testimonials: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      }
    ];

    const vendorBatch = db.batch();
    demoVendors.forEach(vendor => {
      const vendorRef = db.collection('vendors').doc();
      vendorBatch.set(vendorRef, vendor);
    });
    await vendorBatch.commit();
    console.log(`✅ Demo vendors created (${demoVendors.length} vendors)`);

    // Create demo music data
    console.log('🎵 Creating demo music data...');
    const demoMusicData = {
      weddingId: weddingRef.id,
      userId: demoUser.uid,
      vendor: {
        name: 'DJ Martin',
        contact: '+420 777 345 678',
        email: 'martin@djmartin.cz'
      },
      categories: [
        {
          id: 'groom-entrance',
          name: 'Nástup ženicha',
          description: 'Hudba při příchodu ženicha k oltáři',
          icon: '🤵',
          required: true,
          songs: [
            {
              id: 'song-groom-1',
              title: 'Canon in D',
              artist: 'Johann Pachelbel',
              notes: 'Klasická volba'
            }
          ]
        },
        {
          id: 'bride-entrance',
          name: 'Nástup nevěsty',
          description: 'Nejdůležitější okamžik - příchod nevěsty',
          icon: '💍',
          required: true,
          songs: [
            {
              id: 'song-1',
              title: 'A Thousand Years',
              artist: 'Christina Perri',
              notes: 'Romantická klasika'
            }
          ]
        },
        {
          id: 'first-dance',
          name: 'První tanec',
          description: 'Váš první tanec jako manželé',
          icon: '💃',
          required: true,
          songs: [
            {
              id: 'song-2',
              title: 'Perfect',
              artist: 'Ed Sheeran',
              notes: 'Naše oblíbená píseň'
            }
          ]
        },
        {
          id: 'party-songs',
          name: 'Párty písně',
          description: 'Písně na rozjetí večírku',
          icon: '🎵',
          required: true,
          songs: [
            {
              id: 'song-party-1',
              title: 'Uptown Funk',
              artist: 'Mark Ronson ft. Bruno Mars',
              notes: 'Rozjede to!'
            },
            {
              id: 'song-party-2',
              title: 'I Gotta Feeling',
              artist: 'Black Eyed Peas',
              notes: 'Klasika'
            },
            {
              id: 'song-party-3',
              title: 'Happy',
              artist: 'Pharrell Williams',
              notes: 'Pozitivní nálada'
            }
          ]
        },
        {
          id: 'slow-songs',
          name: 'Pomalé písně',
          description: 'Romantické písně pro pomalé tance',
          icon: '💕',
          required: false,
          songs: [
            {
              id: 'song-slow-1',
              title: 'Thinking Out Loud',
              artist: 'Ed Sheeran',
              notes: 'Romantická'
            },
            {
              id: 'song-slow-2',
              title: 'All of Me',
              artist: 'John Legend',
              notes: 'Krásný text'
            }
          ]
        }
      ],
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('music').add(demoMusicData);
    console.log('✅ Demo music data created');

    // Create demo notes
    console.log('📝 Creating demo notes...');
    const demoNotes = [
      {
        weddingId: weddingRef.id,
        title: 'Důležité kontakty',
        content: 'Fotograf: Jan Nejedlý (+420 777 123 456)\nCatering: Marie Svobodová (+420 777 234 567)\nMísto konání: Château Mcely (+420 325 600 000)',
        category: 'contacts',
        isPinned: true,
        tags: ['kontakty', 'důležité'],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        title: 'Nápady na dekorace',
        content: 'Bílé růže s eukalyptem\nSvíčky na stolech\nRustikální dřevěné prvky\nZlatá barva jako akcent',
        category: 'ideas',
        isPinned: false,
        tags: ['dekorace', 'nápady'],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      }
    ];

    const notesBatch = db.batch();
    demoNotes.forEach(note => {
      const noteRef = db.collection('notes').doc();
      notesBatch.set(noteRef, note);
    });
    await notesBatch.commit();
    console.log('✅ Demo notes created');

    // Create demo timeline milestones
    console.log('📅 Creating demo timeline milestones...');
    const demoMilestones = [
      {
        weddingId: weddingRef.id,
        title: 'Rezervace místa konání',
        description: 'Rezervovat a potvrdit místo konání svatby',
        type: 'venue-booking',
        targetDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
        period: '6-months',
        status: 'completed',
        progress: 100,
        dependsOn: [],
        blockedBy: [],
        taskIds: [],
        budgetItemIds: [],
        guestIds: [],
        vendorIds: [],
        priority: 'critical',
        isRequired: true,
        reminderDays: [30, 14, 7],
        notificationsSent: [],
        notes: 'Château Mcely rezervováno a potvrzeno',
        attachments: [],
        tags: ['místo', 'rezervace'],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        title: 'Výběr svatebních šatů',
        description: 'Najít a objednat svatební šaty včetně úprav',
        type: 'attire',
        targetDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
        period: '6-months',
        status: 'completed',
        progress: 100,
        dependsOn: [],
        blockedBy: [],
        taskIds: [],
        budgetItemIds: [],
        guestIds: [],
        vendorIds: [],
        priority: 'high',
        isRequired: true,
        reminderDays: [14, 7, 3],
        notificationsSent: [],
        notes: 'Šaty objednány a upraveny, vše připraveno',
        attachments: [],
        tags: ['šaty', 'oblečení'],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        title: 'Výběr fotografa',
        description: 'Najít a rezervovat svatebního fotografa',
        type: 'vendor-booking',
        targetDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
        period: '6-months',
        status: 'completed',
        progress: 100,
        dependsOn: [],
        blockedBy: [],
        taskIds: [],
        budgetItemIds: [],
        guestIds: [],
        vendorIds: [],
        priority: 'critical',
        isRequired: true,
        reminderDays: [30, 14, 7],
        notificationsSent: [],
        notes: 'Photo Nejedlí rezervován, smlouva podepsána',
        attachments: [],
        tags: ['fotograf', 'dodavatel'],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        title: 'Výběr cateringu',
        description: 'Najít a rezervovat catering pro svatbu',
        type: 'vendor-booking',
        targetDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000),
        period: '6-months',
        status: 'completed',
        progress: 100,
        dependsOn: [],
        blockedBy: [],
        taskIds: [],
        budgetItemIds: [],
        guestIds: [],
        vendorIds: [],
        priority: 'critical',
        isRequired: true,
        reminderDays: [30, 14, 7],
        notificationsSent: [],
        notes: 'Catering Elegance rezervován, menu potvrzeno',
        attachments: [],
        tags: ['catering', 'dodavatel'],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        title: 'Rozeslání pozvánek',
        description: 'Vytisknout a rozeslat svatební pozvánky',
        type: 'invitations',
        targetDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000),
        period: '3-months',
        status: 'completed',
        progress: 100,
        dependsOn: [],
        blockedBy: [],
        taskIds: [],
        budgetItemIds: [],
        guestIds: [],
        vendorIds: [],
        priority: 'high',
        isRequired: true,
        reminderDays: [14, 7, 3],
        notificationsSent: [],
        notes: 'Pozvánky rozeslány všem hostům',
        attachments: [],
        tags: ['pozvánky', 'hosté'],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        title: 'Výběr hudby a DJ',
        description: 'Najít a rezervovat DJ nebo živou hudbu',
        type: 'vendor-booking',
        targetDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
        period: '3-months',
        status: 'completed',
        progress: 100,
        dependsOn: [],
        blockedBy: [],
        taskIds: [],
        budgetItemIds: [],
        guestIds: [],
        vendorIds: [],
        priority: 'high',
        isRequired: true,
        reminderDays: [14, 7, 3],
        notificationsSent: [],
        notes: 'DJ Martin Beats rezervován',
        attachments: [],
        tags: ['hudba', 'dj', 'dodavatel'],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        title: 'Finalizace seznamu hostů',
        description: 'Potvrdit finální počet hostů a dietní požadavky',
        type: 'guest-list',
        targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        period: '1-month',
        status: 'in-progress',
        progress: 80,
        dependsOn: [],
        blockedBy: [],
        taskIds: [],
        budgetItemIds: [],
        guestIds: [],
        vendorIds: [],
        priority: 'critical',
        isRequired: true,
        reminderDays: [7, 3, 1],
        notificationsSent: [],
        notes: 'Čeká se na potvrzení od několika hostů',
        attachments: [],
        tags: ['hosté', 'rsvp'],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        title: 'Výběr květinové výzdoby',
        description: 'Vybrat a objednat květiny a výzdobu',
        type: 'vendor-booking',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        period: '1-month',
        status: 'in-progress',
        progress: 40,
        dependsOn: [],
        blockedBy: [],
        taskIds: [],
        budgetItemIds: [],
        guestIds: [],
        vendorIds: [],
        priority: 'medium',
        isRequired: true,
        reminderDays: [14, 7, 3],
        notificationsSent: [],
        notes: 'Jednání s Květiny Růže, čeká se na nabídku',
        attachments: [],
        tags: ['květiny', 'výzdoba', 'dodavatel'],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        title: 'Příprava svatebního dne',
        description: 'Finální přípravy a koordinace svatebního dne',
        type: 'final-preparations',
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        period: '1-week',
        status: 'pending',
        progress: 0,
        dependsOn: [],
        blockedBy: [],
        taskIds: [],
        budgetItemIds: [],
        guestIds: [],
        vendorIds: [],
        priority: 'critical',
        isRequired: true,
        reminderDays: [3, 1],
        notificationsSent: [],
        notes: 'Finální kontrola všech detailů',
        attachments: [],
        tags: ['příprava', 'finalizace'],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      }
    ];

    const milestoneBatch = db.batch();
    demoMilestones.forEach(milestone => {
      const milestoneRef = db.collection('milestones').doc();
      milestoneBatch.set(milestoneRef, milestone);
    });
    await milestoneBatch.commit();
    console.log('✅ Demo timeline milestones created');

    // Create wedding day timeline items
    console.log('\n📅 Creating wedding day timeline items...');
    const weddingDayTimelineItems = [
      {
        weddingId: weddingRef.id,
        time: '08:00',
        activity: 'Příjezd vizážistky a kadeřnice',
        duration: '30 min',
        category: 'preparation',
        location: 'Hotel Château Mcely - pokoj nevěsty',
        participants: ['Vizážistka', 'Kadeřnice'],
        notes: 'Příprava vybavení a materiálů. Salon Krása.',
        order: 0,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        time: '08:30',
        activity: 'Příprava nevěsty - líčení a účes',
        duration: '3 hod',
        category: 'preparation',
        location: 'Hotel Château Mcely - pokoj nevěsty',
        participants: ['Nevěsta', 'Kadeřnice', 'Vizážistka', 'Družičky'],
        notes: 'Začít včas, rezervovat dostatek času. Salon Krása.',
        order: 1,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        time: '10:00',
        activity: 'Příprava ženicha',
        duration: '1 hod',
        category: 'preparation',
        location: 'Hotel Château Mcely - pokoj ženicha',
        participants: ['Ženich', 'Svědek'],
        notes: 'Oblékání a příprava',
        order: 2,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        time: '11:30',
        activity: 'Fotografie příprav',
        duration: '1 hod',
        category: 'photography',
        location: 'Hotel Château Mcely',
        participants: ['Nevěsta', 'Ženich', 'Fotograf'],
        notes: 'Fotky příprav, detaily, šperky. Photo Nejedlí.',
        order: 3,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        time: '12:30',
        activity: 'První setkání (First Look)',
        duration: '30 min',
        category: 'photography',
        location: 'Château Mcely - zahrada',
        participants: ['Nevěsta', 'Ženich', 'Fotograf'],
        notes: 'First look - intimní moment před obřadem. Photo Nejedlí.',
        order: 4,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        time: '13:00',
        activity: 'Příjezd hostů',
        duration: '45 min',
        category: 'ceremony',
        location: 'Château Mcely - parkoviště',
        participants: ['Hosté'],
        notes: 'Uvítání hostů, welcome drink. Catering Elegance.',
        order: 5,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        time: '14:00',
        activity: 'Svatební obřad',
        duration: '45 min',
        category: 'ceremony',
        location: 'Château Mcely - zahrada',
        participants: ['Nevěsta', 'Ženich', 'Oddávající', 'Hosté'],
        notes: 'Hlavní část svatby - venkovní obřad',
        order: 6,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        time: '14:45',
        activity: 'Gratulace a házení kytice',
        duration: '30 min',
        category: 'ceremony',
        location: 'Château Mcely - zahrada',
        participants: ['Nevěsta', 'Ženich', 'Hosté'],
        notes: 'Gratulace od hostů, házení kytice',
        order: 7,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        time: '15:15',
        activity: 'Skupinové fotografie',
        duration: '45 min',
        category: 'photography',
        location: 'Château Mcely - zahrada',
        participants: ['Nevěsta', 'Ženich', 'Fotograf', 'Hosté'],
        notes: 'Skupinové fotky s hosty, rodinou. Photo Nejedlí.',
        order: 8,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        time: '16:00',
        activity: 'Kreativní focení novomanželů',
        duration: '1 hod',
        category: 'photography',
        location: 'Château Mcely - park',
        participants: ['Nevěsta', 'Ženich', 'Fotograf'],
        notes: 'Kreativní portréty v parku. Photo Nejedlí.',
        order: 9,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        time: '17:00',
        activity: 'Aperitiv a občerstvení',
        duration: '1 hod',
        category: 'reception',
        location: 'Château Mcely - terasa',
        participants: ['Všichni hosté'],
        notes: 'Aperitiv, canapés, volná zábava. Catering Elegance.',
        order: 10,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        time: '18:00',
        activity: 'Příchod do svatebního sálu',
        duration: '15 min',
        category: 'reception',
        location: 'Château Mcely - sál',
        participants: ['Všichni hosté'],
        notes: 'Usazení hostů, představení programu',
        order: 11,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        time: '18:15',
        activity: 'Slavnostní přípitek',
        duration: '15 min',
        category: 'reception',
        location: 'Château Mcely - sál',
        participants: ['Všichni hosté', 'Svědek'],
        notes: 'Přípitek od svědka',
        order: 12,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        time: '18:30',
        activity: 'Svatební hostina - předkrm',
        duration: '30 min',
        category: 'reception',
        location: 'Château Mcely - sál',
        participants: ['Všichni hosté'],
        notes: 'Carpaccio z hovězího. Catering Elegance.',
        order: 13,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        time: '19:00',
        activity: 'Svatební hostina - polévka',
        duration: '20 min',
        category: 'reception',
        location: 'Château Mcely - sál',
        participants: ['Všichni hosté'],
        notes: 'Hovězí vývar s nudlemi. Catering Elegance.',
        order: 14,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        time: '19:20',
        activity: 'Svatební hostina - hlavní chod',
        duration: '40 min',
        category: 'reception',
        location: 'Château Mcely - sál',
        participants: ['Všichni hosté'],
        notes: 'Hovězí svíčková nebo losos. Catering Elegance.',
        order: 15,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        time: '20:00',
        activity: 'Krájení svatebního dortu',
        duration: '15 min',
        category: 'reception',
        location: 'Château Mcely - sál',
        participants: ['Nevěsta', 'Ženich', 'Hosté'],
        notes: 'Slavnostní krájení dortu. Catering Elegance.',
        order: 16,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        time: '20:15',
        activity: 'Svatební hostina - dezert',
        duration: '30 min',
        category: 'reception',
        location: 'Château Mcely - sál',
        participants: ['Všichni hosté'],
        notes: 'Svatební dort a dezerty. Catering Elegance.',
        order: 17,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        time: '20:45',
        activity: 'Příprava tanečního parketu',
        duration: '15 min',
        category: 'party',
        location: 'Château Mcely - taneční parket',
        participants: ['DJ', 'Personál'],
        notes: 'Příprava hudby a osvětlení. DJ Martin Beats.',
        order: 18,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        time: '21:00',
        activity: 'První tanec novomanželů',
        duration: '5 min',
        category: 'party',
        location: 'Château Mcely - taneční parket',
        participants: ['Nevěsta', 'Ženich', 'Hosté'],
        notes: 'První tanec - Ed Sheeran - Perfect. DJ Martin Beats.',
        order: 19,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        time: '21:05',
        activity: 'Tanec s rodiči',
        duration: '10 min',
        category: 'party',
        location: 'Château Mcely - taneční parket',
        participants: ['Nevěsta', 'Ženich', 'Rodiče'],
        notes: 'Tanec nevěsty s otcem, ženicha s matkou. DJ Martin Beats.',
        order: 20,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        time: '21:15',
        activity: 'Volná zábava a tanec',
        duration: '3h 45min',
        category: 'party',
        location: 'Château Mcely - taneční parket',
        participants: ['Všichni hosté', 'DJ'],
        notes: 'Tanec a oslava. DJ Martin Beats.',
        order: 21,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        time: '22:00',
        activity: 'Půlnoční překvapení',
        duration: '30 min',
        category: 'party',
        location: 'Château Mcely - zahrada',
        participants: ['Všichni hosté'],
        notes: 'Ohňostroj nebo lampiony',
        order: 22,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      },
      {
        weddingId: weddingRef.id,
        time: '01:00',
        activity: 'Závěr svatby',
        duration: '30 min',
        category: 'party',
        location: 'Château Mcely',
        participants: ['Všichni hosté'],
        notes: 'Rozloučení s hosty',
        order: 23,
        isCompleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: demoUser.uid
      }
    ];

    const timelineBatch = db.batch();
    weddingDayTimelineItems.forEach(item => {
      const itemRef = db.collection('weddingDayTimeline').doc();
      timelineBatch.set(itemRef, item);
    });
    await timelineBatch.commit();
    console.log('✅ Wedding day timeline items created');

    console.log('\n🎉 Demo account setup complete!');
    console.log('📧 Email: demo@svatbot.cz');
    console.log('🔑 Password: demo123');
    console.log('👤 User ID:', demoUser.uid);
    console.log('💒 Wedding ID:', weddingRef.id);

  } catch (error) {
    console.error('❌ Error creating demo account:', error);
    throw error;
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