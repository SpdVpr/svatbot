#!/bin/bash

# 🔥 Firebase Deployment Script for SvatBot
# This script deploys the complete Firebase backend

set -e

echo "🔥 Starting Firebase deployment for SvatBot..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    print_error "You are not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    print_error "firebase.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Checking Firebase project..."
PROJECT_ID=$(firebase use --current 2>/dev/null | grep "Active project" | awk '{print $3}' || echo "")

if [ -z "$PROJECT_ID" ]; then
    print_error "No Firebase project selected. Please select a project:"
    echo "firebase use --add"
    exit 1
fi

print_success "Using Firebase project: $PROJECT_ID"

# Build Functions
print_status "Building Firebase Functions..."
cd functions

if [ ! -f "package.json" ]; then
    print_error "Functions package.json not found!"
    exit 1
fi

# Install dependencies
print_status "Installing Functions dependencies..."
npm install

# Build TypeScript
print_status "Building TypeScript..."
npm run build

cd ..

# Deploy based on argument
DEPLOY_TARGET=${1:-"all"}

case $DEPLOY_TARGET in
    "functions")
        print_status "Deploying only Functions..."
        firebase deploy --only functions
        ;;
    "firestore")
        print_status "Deploying only Firestore rules..."
        firebase deploy --only firestore:rules
        ;;
    "storage")
        print_status "Deploying only Storage rules..."
        firebase deploy --only storage
        ;;
    "hosting")
        print_status "Building Next.js app..."
        npm run build
        print_status "Deploying only Hosting..."
        firebase deploy --only hosting
        ;;
    "rules")
        print_status "Deploying only Security Rules..."
        firebase deploy --only firestore:rules,storage
        ;;
    "backend")
        print_status "Deploying Backend (Functions + Rules)..."
        firebase deploy --only functions,firestore:rules,storage
        ;;
    "all")
        print_status "Deploying everything..."
        
        # Build Next.js app for hosting
        print_status "Building Next.js app..."
        npm run build
        
        # Deploy all services
        firebase deploy
        ;;
    *)
        print_error "Unknown deployment target: $DEPLOY_TARGET"
        echo "Usage: $0 [functions|firestore|storage|hosting|rules|backend|all]"
        exit 1
        ;;
esac

print_success "🎉 Deployment completed successfully!"

# Show useful information
print_status "📊 Deployment Information:"
echo "Project ID: $PROJECT_ID"
echo "Functions URL: https://europe-west1-$PROJECT_ID.cloudfunctions.net"
echo "Hosting URL: https://$PROJECT_ID.web.app"
echo ""

print_status "🔧 Useful commands:"
echo "View logs: firebase functions:log"
echo "Open console: firebase open"
echo "View hosting: firebase hosting:channel:open"

print_warning "⚠️  Don't forget to:"
echo "1. Update environment variables if needed"
echo "2. Test the deployed functions"
echo "3. Verify security rules are working"
echo "4. Check Firebase console for any issues"
