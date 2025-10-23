#!/bin/bash

# SvatBot Email System Setup Script
# This script helps you configure the email system for Firebase Functions

echo "🚀 SvatBot Email System Setup"
echo "================================"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed"
    echo "Please install it with: npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI found"
echo ""

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase"
    echo "Please login with: firebase login"
    exit 1
fi

echo "✅ Logged in to Firebase"
echo ""

# Prompt for email credentials
echo "📧 Email Configuration (vedos.cz SMTP)"
echo "--------------------------------------"
echo ""

read -p "Email address (default: info@svatbot.cz): " EMAIL_USER
EMAIL_USER=${EMAIL_USER:-info@svatbot.cz}

read -sp "Email password: " EMAIL_PASSWORD
echo ""
echo ""

if [ -z "$EMAIL_PASSWORD" ]; then
    echo "❌ Email password is required"
    exit 1
fi

# Set Firebase Functions config
echo "⚙️  Setting Firebase Functions configuration..."
echo ""

firebase functions:config:set \
    email.user="$EMAIL_USER" \
    email.password="$EMAIL_PASSWORD" \
    email.from="SvatBot.cz <$EMAIL_USER>"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Configuration set successfully"
else
    echo ""
    echo "❌ Failed to set configuration"
    exit 1
fi

echo ""
echo "📦 Building Functions..."
cd functions
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
read -p "🚀 Deploy email functions now? (y/n): " DEPLOY
echo ""

if [ "$DEPLOY" = "y" ] || [ "$DEPLOY" = "Y" ]; then
    echo "🚀 Deploying email functions..."
    firebase deploy --only functions:onUserCreate,functions:onPaymentSuccess,functions:checkTrialExpiry
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Functions deployed successfully"
    else
        echo ""
        echo "❌ Deployment failed"
        exit 1
    fi
fi

echo ""
echo "📋 Deploying Firestore rules..."
cd ..
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Firestore rules deployed"
else
    echo "❌ Failed to deploy Firestore rules"
    exit 1
fi

echo ""
echo "✅ Email System Setup Complete!"
echo "================================"
echo ""
echo "📝 Next steps:"
echo "1. Test registration email by creating a new user"
echo "2. Test payment email by completing a test payment"
echo "3. Check admin dashboard at /admin/dashboard for email stats"
echo "4. Monitor Firebase Functions logs for any issues"
echo ""
echo "📚 Documentation: EMAIL_SYSTEM_SETUP.md"
echo ""

