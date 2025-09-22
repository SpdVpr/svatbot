#!/usr/bin/env node

/**
 * 🔥 Firebase Firestore Indexes Creator
 * 
 * Tento skript automaticky vytvoří všechny potřebné indexy pro SvatBot aplikaci.
 * 
 * Použití:
 * node scripts/create-firestore-indexes.js
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Inicializace Firebase Admin
const app = initializeApp({
  projectId: 'svatbot-app'
});

const db = getFirestore(app);

// Definice všech potřebných indexů
const indexes = [
  // Weddings
  {
    collection: 'weddings',
    fields: [
      { field: 'userId', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ]
  },
  
  // Tasks
  {
    collection: 'tasks',
    fields: [
      { field: 'weddingId', order: 'ASCENDING' },
      { field: 'phase', order: 'ASCENDING' },
      { field: 'priority', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'tasks',
    fields: [
      { field: 'weddingId', order: 'ASCENDING' },
      { field: 'status', order: 'ASCENDING' },
      { field: 'dueDate', order: 'ASCENDING' }
    ]
  },
  
  // Guests
  {
    collection: 'guests',
    fields: [
      { field: 'weddingId', order: 'ASCENDING' },
      { field: 'category', order: 'ASCENDING' }
    ]
  },
  {
    collection: 'guests',
    fields: [
      { field: 'weddingId', order: 'ASCENDING' },
      { field: 'rsvpStatus', order: 'ASCENDING' }
    ]
  },
  
  // Budget Items
  {
    collection: 'budgetItems',
    fields: [
      { field: 'weddingId', order: 'ASCENDING' },
      { field: 'category', order: 'ASCENDING' }
    ]
  },
  
  // Timeline Events
  {
    collection: 'timelineEvents',
    fields: [
      { field: 'weddingId', order: 'ASCENDING' },
      { field: 'startTime', order: 'ASCENDING' }
    ]
  },
  
  // Vendors (Marketplace)
  {
    collection: 'vendors',
    fields: [
      { field: 'active', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'vendors',
    fields: [
      { field: 'active', order: 'ASCENDING' },
      { field: 'category', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'vendors',
    fields: [
      { field: 'active', order: 'ASCENDING' },
      { field: 'verified', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'vendors',
    fields: [
      { field: 'active', order: 'ASCENDING' },
      { field: 'featured', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'vendors',
    fields: [
      { field: 'category', order: 'ASCENDING' },
      { field: 'location', order: 'ASCENDING' },
      { field: 'rating', order: 'DESCENDING' }
    ]
  },
  
  // RSVP
  {
    collection: 'rsvpInvitations',
    fields: [
      { field: 'weddingId', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'rsvpResponses',
    fields: [
      { field: 'respondedAt', order: 'DESCENDING' }
    ]
  },
  
  // Venues
  {
    collection: 'venues',
    fields: [
      { field: 'region', order: 'ASCENDING' },
      { field: 'rating', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'venues',
    fields: [
      { field: 'venueType', order: 'ASCENDING' },
      { field: 'featured', order: 'DESCENDING' }
    ]
  }
];

/**
 * Vytvoří URL pro manuální vytvoření indexu v Firebase Console
 */
function createIndexUrl(index) {
  const baseUrl = 'https://console.firebase.google.com/v1/r/project/svatbot-app/firestore/indexes';
  
  const fieldsParam = index.fields.map(f => 
    `${f.field}:${f.order.toLowerCase()}`
  ).join(',');
  
  return `${baseUrl}?create_composite=${index.collection}:${fieldsParam}`;
}

/**
 * Hlavní funkce
 */
async function createIndexes() {
  console.log('🔥 Firebase Firestore Indexes Creator');
  console.log('=====================================\n');
  
  console.log('⚠️  POZNÁMKA: Firebase Admin SDK nemůže vytvářet indexy programaticky.');
  console.log('   Indexy musíte vytvořit manuálně pomocí Firebase CLI nebo Console.\n');
  
  console.log('🚀 NEJRYCHLEJŠÍ ZPŮSOB - Firebase CLI:');
  console.log('   firebase deploy --only firestore:indexes\n');
  
  console.log('🔗 ALTERNATIVA - Přímé odkazy na vytvoření indexů:');
  console.log('   Klikněte na každý odkaz níže pro vytvoření indexu:\n');
  
  indexes.forEach((index, i) => {
    const fields = index.fields.map(f => `${f.field} (${f.order})`).join(', ');
    console.log(`${i + 1}. ${index.collection}: ${fields}`);
    console.log(`   ${createIndexUrl(index)}\n`);
  });
  
  console.log('✅ Po vytvoření všech indexů bude aplikace plně funkční!');
  console.log('📊 Sledujte progress v Firebase Console > Firestore > Indexes');
}

// Spuštění
createIndexes().catch(console.error);
