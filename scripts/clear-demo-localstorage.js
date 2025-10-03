/**
 * Clear Demo LocalStorage Script
 * 
 * This script generates JavaScript code to clear demo-related localStorage
 * Run this in browser console to clear all demo data from localStorage
 */

console.log(`
🧹 Clear Demo LocalStorage
===========================

Copy and paste this code into your browser console:

// Clear all demo-related localStorage
Object.keys(localStorage).forEach(key => {
  if (key.includes('demo') || key.includes('guests_') || key.includes('tasks_') || key.includes('budget_') || key.includes('milestones_') || key.includes('menu_') || key.includes('drink_')) {
    console.log('🗑️ Removing:', key);
    localStorage.removeItem(key);
  }
});

console.log('✅ Demo localStorage cleared!');
console.log('🔄 Refresh the page to load data from Firestore');

===========================

Or run this to clear ALL localStorage:

localStorage.clear();
console.log('✅ All localStorage cleared!');
console.log('🔄 Refresh the page');

===========================
`);

