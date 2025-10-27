#!/bin/bash

# Deploy Vendor Edit System
# This script deploys all necessary components for the vendor edit system

set -e  # Exit on error

echo "🚀 Deploying Vendor Edit System"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must be run from project root directory"
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI not installed"
    echo "Install with: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
echo "🔐 Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "❌ Error: Not logged in to Firebase"
    echo "Login with: firebase login"
    exit 1
fi

echo "✅ Firebase authentication OK"
echo ""

# Step 1: Deploy Firestore Rules
echo "📋 Step 1/3: Deploying Firestore Rules..."
echo "This allows vendors to edit their listings using editToken"
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Firestore rules deployed successfully"
else
    echo "❌ Failed to deploy Firestore rules"
    exit 1
fi
echo ""

# Step 2: Deploy Firestore Indexes
echo "📊 Step 2/3: Deploying Firestore Indexes..."
echo "This creates indexes for querying by editToken"
firebase deploy --only firestore:indexes

if [ $? -eq 0 ]; then
    echo "✅ Firestore indexes deployed successfully"
    echo "⏳ Note: Indexes may take a few minutes to build"
else
    echo "❌ Failed to deploy Firestore indexes"
    exit 1
fi
echo ""

# Step 3: Build and Deploy Firebase Functions
echo "⚙️  Step 3/3: Building and deploying Firebase Functions..."
echo "This deploys email notification triggers"

cd functions

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building functions..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Functions built successfully"
else
    echo "❌ Failed to build functions"
    cd ..
    exit 1
fi

cd ..

echo "🚀 Deploying functions..."
firebase deploy --only functions:onMarketplaceVendorCreate,functions:onMarketplaceVendorUpdate

if [ $? -eq 0 ]; then
    echo "✅ Functions deployed successfully"
else
    echo "❌ Failed to deploy functions"
    exit 1
fi

echo ""
echo "================================"
echo "✅ Deployment Complete!"
echo "================================"
echo ""
echo "📝 What was deployed:"
echo "  ✅ Firestore rules (vendor edit permissions)"
echo "  ✅ Firestore indexes (editToken queries)"
echo "  ✅ onMarketplaceVendorCreate (registration email)"
echo "  ✅ onMarketplaceVendorUpdate (approval email)"
echo ""
echo "🧪 Next steps:"
echo "  1. Test vendor registration at /marketplace/register"
echo "  2. Check that editToken is generated"
echo "  3. Test editing via /marketplace/edit/[token]"
echo "  4. Check email inbox for notifications"
echo ""
echo "📚 Documentation:"
echo "  - docs/VENDOR_EDIT_SYSTEM.md"
echo "  - docs/VENDOR_EDIT_TESTING.md"
echo ""

