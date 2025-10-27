# Deploy Vendor Edit System
# This script deploys all necessary components for the vendor edit system

$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying Vendor Edit System" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Must be run from project root directory" -ForegroundColor Red
    exit 1
}

# Check if Firebase CLI is installed
try {
    $null = firebase --version
} catch {
    Write-Host "❌ Error: Firebase CLI not installed" -ForegroundColor Red
    Write-Host "Install with: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Check if logged in to Firebase
Write-Host "🔐 Checking Firebase authentication..." -ForegroundColor Cyan
try {
    $null = firebase projects:list 2>&1
    Write-Host "✅ Firebase authentication OK" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Not logged in to Firebase" -ForegroundColor Red
    Write-Host "Login with: firebase login" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 1: Deploy Firestore Rules
Write-Host "📋 Step 1/3: Deploying Firestore Rules..." -ForegroundColor Cyan
Write-Host "This allows vendors to edit their listings using editToken" -ForegroundColor Gray

try {
    firebase deploy --only firestore:rules
    Write-Host "✅ Firestore rules deployed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to deploy Firestore rules" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Deploy Firestore Indexes
Write-Host "📊 Step 2/3: Deploying Firestore Indexes..." -ForegroundColor Cyan
Write-Host "This creates indexes for querying by editToken" -ForegroundColor Gray

try {
    firebase deploy --only firestore:indexes
    Write-Host "✅ Firestore indexes deployed successfully" -ForegroundColor Green
    Write-Host "⏳ Note: Indexes may take a few minutes to build" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Failed to deploy Firestore indexes" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Build and Deploy Firebase Functions
Write-Host "⚙️  Step 3/3: Building and deploying Firebase Functions..." -ForegroundColor Cyan
Write-Host "This deploys email notification triggers" -ForegroundColor Gray

Push-Location functions

Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
try {
    npm install
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host "🔨 Building functions..." -ForegroundColor Cyan
try {
    npm run build
    Write-Host "✅ Functions built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to build functions" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location

Write-Host "🚀 Deploying functions..." -ForegroundColor Cyan
try {
    firebase deploy --only functions:onMarketplaceVendorCreate,functions:onMarketplaceVendorUpdate
    Write-Host "✅ Functions deployed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to deploy functions" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 What was deployed:" -ForegroundColor Cyan
Write-Host "  ✅ Firestore rules (vendor edit permissions)" -ForegroundColor Green
Write-Host "  ✅ Firestore indexes (editToken queries)" -ForegroundColor Green
Write-Host "  ✅ onMarketplaceVendorCreate (registration email)" -ForegroundColor Green
Write-Host "  ✅ onMarketplaceVendorUpdate (approval email)" -ForegroundColor Green
Write-Host ""
Write-Host "🧪 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Test vendor registration at /marketplace/register" -ForegroundColor White
Write-Host "  2. Check that editToken is generated" -ForegroundColor White
Write-Host "  3. Test editing via /marketplace/edit/TOKEN" -ForegroundColor White
Write-Host "  4. Check email inbox for notifications" -ForegroundColor White
Write-Host ""

