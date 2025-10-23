# SvatBot Email System Setup Script (PowerShell)
# This script helps you configure the email system for Firebase Functions

Write-Host "🚀 SvatBot Email System Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
try {
    $null = firebase --version
    Write-Host "✅ Firebase CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI is not installed" -ForegroundColor Red
    Write-Host "Please install it with: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if logged in to Firebase
try {
    $null = firebase projects:list 2>&1
    Write-Host "✅ Logged in to Firebase" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Firebase" -ForegroundColor Red
    Write-Host "Please login with: firebase login" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Prompt for email credentials
Write-Host "📧 Email Configuration (vedos.cz SMTP)" -ForegroundColor Cyan
Write-Host "--------------------------------------" -ForegroundColor Cyan
Write-Host ""

$EMAIL_USER = Read-Host "Email address (default: info@svatbot.cz)"
if ([string]::IsNullOrWhiteSpace($EMAIL_USER)) {
    $EMAIL_USER = "info@svatbot.cz"
}

$EMAIL_PASSWORD = Read-Host "Email password" -AsSecureString
$EMAIL_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($EMAIL_PASSWORD)
)

Write-Host ""

if ([string]::IsNullOrWhiteSpace($EMAIL_PASSWORD_PLAIN)) {
    Write-Host "❌ Email password is required" -ForegroundColor Red
    exit 1
}

# Set Firebase Functions config
Write-Host "⚙️  Setting Firebase Functions configuration..." -ForegroundColor Cyan
Write-Host ""

try {
    $emailFrom = "SvatBot.cz <$EMAIL_USER>"
    firebase functions:config:set `
        "email.user=$EMAIL_USER" `
        "email.password=$EMAIL_PASSWORD_PLAIN" `
        "email.from=$emailFrom"

    Write-Host ""
    Write-Host "Configuration set successfully" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "Failed to set configuration" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Building Functions..." -ForegroundColor Cyan
Push-Location functions

try {
    npm run build
    Write-Host "✅ Build successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location

Write-Host ""
$DEPLOY = Read-Host "🚀 Deploy email functions now? (y/n)"
Write-Host ""

if ($DEPLOY -eq "y" -or $DEPLOY -eq "Y") {
    Write-Host "🚀 Deploying email functions..." -ForegroundColor Cyan
    
    try {
        firebase deploy --only functions:onUserCreate,functions:onPaymentSuccess,functions:checkTrialExpiry
        Write-Host ""
        Write-Host "✅ Functions deployed successfully" -ForegroundColor Green
    } catch {
        Write-Host ""
        Write-Host "❌ Deployment failed" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📋 Deploying Firestore rules..." -ForegroundColor Cyan

try {
    firebase deploy --only firestore:rules
    Write-Host "✅ Firestore rules deployed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to deploy Firestore rules" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Email System Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test registration email by creating a new user"
Write-Host "2. Test payment email by completing a test payment"
Write-Host "3. Check admin dashboard at /admin/dashboard for email stats"
Write-Host "4. Monitor Firebase Functions logs for any issues"
Write-Host ""
Write-Host "Documentation: EMAIL_SYSTEM_SETUP.md" -ForegroundColor Cyan
Write-Host ""

