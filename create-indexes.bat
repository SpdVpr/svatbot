@echo off
echo.
echo ========================================
echo 🔥 Firebase Firestore Indexes Creator
echo ========================================
echo.

echo ⚠️  Firebase nepodporuje automatické vytváření indexů přes URL.
echo    Ale můžete použít tyto rychlé metody:
echo.

echo 🚀 METODA 1 - Firebase CLI (NEJRYCHLEJŠÍ):
echo    firebase deploy --only firestore:indexes
echo.

echo 🔗 METODA 2 - Přímé odkazy (klikněte pro otevření):
echo.

echo 1. Vendors (Marketplace):
echo    https://console.firebase.google.com/project/svatbot-app/firestore/indexes
echo.

echo 2. Tasks (Úkoly):
echo    https://console.firebase.google.com/project/svatbot-app/firestore/indexes
echo.

echo 3. RSVP System:
echo    https://console.firebase.google.com/project/svatbot-app/firestore/indexes
echo.

echo 🎯 METODA 3 - Automatické generování odkazů:
echo    1. Spusťte: npm run dev
echo    2. Otevřete: http://localhost:3001
echo    3. Zkuste marketplace nebo úkoly
echo    4. V browser console (F12) uvidíte přímé odkazy na vytvoření indexů
echo    5. Klikněte na odkazy - indexy se vytvoří automaticky
echo.

echo ✅ Chcete spustit Firebase CLI příkaz? (y/n)
set /p choice=

if /i "%choice%"=="y" (
    echo.
    echo 🚀 Spouštím Firebase CLI...
    firebase deploy --only firestore:indexes
) else (
    echo.
    echo 📖 Otevřete Firebase Console manuálně:
    start https://console.firebase.google.com/project/svatbot-app/firestore/indexes
)

echo.
echo ✅ Hotovo! Zkontrolujte Firebase Console pro stav indexů.
pause
