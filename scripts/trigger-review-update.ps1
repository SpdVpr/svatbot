# PowerShell script to trigger review update by changing status
# This will cause the onReviewUpdate trigger to fire

$reviewId = "RX1XzurnZ0dT3ip6RiZM"
$vendorId = "6hbYP30M1OjrrYb9r5ux"

Write-Host "🔄 Triggering review update for vendor rating calculation..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Change status to pending
Write-Host "1️⃣ Changing review status to 'pending'..." -ForegroundColor Yellow
firebase firestore:update "vendorReviews/$reviewId" --data '{\"status\":\"pending\"}'

Start-Sleep -Seconds 2

# Step 2: Change status back to approved (this will trigger onReviewUpdate)
Write-Host "2️⃣ Changing review status back to 'approved' (this triggers rating update)..." -ForegroundColor Yellow
firebase firestore:update "vendorReviews/$reviewId" --data '{\"status\":\"approved\"}'

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ Done! Check Firebase Functions logs to see if trigger fired." -ForegroundColor Green
Write-Host "   Logs: https://console.firebase.google.com/project/svatbot-app/functions/logs" -ForegroundColor Gray
Write-Host ""
Write-Host "📊 Check vendor rating:" -ForegroundColor Cyan
$vendorUrl = "https://console.firebase.google.com/project/svatbot-app/firestore/databases/-default-/data/~2FmarketplaceVendors~2F$vendorId"
Write-Host "   $vendorUrl" -ForegroundColor Gray

