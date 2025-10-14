# 🔧 Svatbot Firebase Fix - Mood Entries

## ❌ Problém

Mood Tracker nemohl ukládat data do Firebase kvůli chybějícím Firestore security rules:

```
Error saving mood entry: FirebaseError: Missing or insufficient permissions.
POST https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel 400 (Bad Request)
```

## ✅ Řešení

### 1. Přidány Firestore Security Rules

**Soubor:** `firestore.rules`

Přidána nová sekce pro `moodEntries` kolekci:

```javascript
// Mood Entries collection - Svatbot AI Coach mood tracking
match /moodEntries/{entryId} {
  // Allow read if authenticated and user owns the entry
  allow read: if isAuthenticated() &&
                 resource.data.userId == request.auth.uid;

  // Allow create if authenticated and userId matches
  allow create: if isAuthenticated() &&
                   request.resource.data.keys().hasAll(['userId', 'weddingId', 'mood', 'stressLevel', 'energyLevel']) &&
                   request.auth.uid == request.resource.data.userId &&
                   exists(/databases/$(database)/documents/weddings/$(request.resource.data.weddingId)) &&
                   get(/databases/$(database)/documents/weddings/$(request.resource.data.weddingId)).data.userId == request.auth.uid;

  // Allow update if authenticated and user owns the entry
  allow update: if isAuthenticated() &&
                   resource.data.userId == request.auth.uid;

  // Allow delete if authenticated and user owns the entry
  allow delete: if isAuthenticated() &&
                   resource.data.userId == request.auth.uid;
}
```

### 2. Přidány Firestore Indexes

**Soubor:** `firestore.indexes.json`

Přidány 2 composite indexy pro efektivní dotazování:

```json
{
  "collectionGroup": "moodEntries",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "userId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "createdAt",
      "order": "DESCENDING"
    }
  ]
},
{
  "collectionGroup": "moodEntries",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "weddingId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "createdAt",
      "order": "DESCENDING"
    }
  ]
}
```

### 3. Nasazení do Firebase

```bash
# Deploy security rules
firebase deploy --only firestore:rules
# ✅ Deploy complete!

# Deploy indexes
firebase deploy --only firestore:indexes
# ✅ Deploy complete!
```

## 🔒 Security Features

### Data Isolation
- ✅ Každý uživatel vidí pouze své mood entries
- ✅ Nelze číst mood entries jiných uživatelů
- ✅ Nelze upravovat mood entries jiných uživatelů

### Validation
- ✅ Vyžaduje autentifikaci (`isAuthenticated()`)
- ✅ Ověřuje vlastnictví (`userId == request.auth.uid`)
- ✅ Ověřuje existenci svatby (`exists(/databases/.../weddings/...)`)
- ✅ Ověřuje vlastnictví svatby
- ✅ Validuje povinná pole (`userId`, `weddingId`, `mood`, `stressLevel`, `energyLevel`)

### Permissions
- ✅ **Read**: Pouze vlastní entries
- ✅ **Create**: Pouze pro vlastní userId a vlastní svatbu
- ✅ **Update**: Pouze vlastní entries
- ✅ **Delete**: Pouze vlastní entries

## 📊 Data Structure

### MoodEntry Document

```typescript
interface MoodEntry {
  id: string                    // Auto-generated
  userId: string                // Auth user ID
  weddingId: string             // Wedding ID
  mood: 'great' | 'good' | 'okay' | 'stressed' | 'overwhelmed'
  stressLevel: number           // 1-10
  energyLevel: number           // 1-10
  note?: string                 // Optional note
  createdAt: Timestamp          // Auto-generated
}
```

### Firestore Path

```
/moodEntries/{entryId}
```

### Example Document

```json
{
  "id": "abc123",
  "userId": "user123",
  "weddingId": "wedding456",
  "mood": "stressed",
  "stressLevel": 8,
  "energyLevel": 4,
  "note": "Hodně práce s přípravami",
  "createdAt": "2025-01-14T10:30:00Z"
}
```

## 🧪 Testing

### Test Mood Tracker

1. **Otevřít aplikaci**
   ```
   http://localhost:3001
   ```

2. **Přihlásit se**
   - Použít existující účet

3. **Najít Svatbot modul**
   - Měl by být viditelný na dashboardu (row 0, column 2)

4. **Zaznamenat náladu**
   - Kliknout na mood (např. "Stres" 😰)
   - Nastavit stress level (např. 8)
   - Nastavit energy level (např. 4)
   - Přidat poznámku (volitelné)
   - Kliknout "Uložit"

5. **Ověřit uložení**
   - ✅ Měla by se zobrazit zpráva "Nálada uložena"
   - ✅ Žádná chyba v console
   - ✅ Data by měla být viditelná v Firebase Console

6. **Ověřit notifikaci**
   - Pokud stress level ≥7, měla by přijít podpůrná notifikace
   - Notifikace by měla obsahovat emoji 💕
   - Notifikace by měla mít empatický tón

### Test Firebase Console

1. **Otevřít Firebase Console**
   ```
   https://console.firebase.google.com/project/svatbot-app/firestore
   ```

2. **Navigovat na moodEntries kolekci**
   - Měla by existovat kolekce `moodEntries`
   - Měly by být viditelné dokumenty

3. **Ověřit data**
   - Každý dokument by měl mít všechna povinná pole
   - `userId` by měl odpovídat přihlášenému uživateli
   - `weddingId` by měl odpovídat aktivní svatbě
   - `createdAt` by měl být timestamp

## 🔍 Debugging

### Zkontrolovat Firestore Rules

```bash
# Zobrazit aktuální rules
firebase firestore:rules:get

# Testovat rules
firebase firestore:rules:test
```

### Zkontrolovat Indexes

```bash
# Zobrazit aktuální indexy
firebase firestore:indexes

# Nasadit indexy
firebase deploy --only firestore:indexes
```

### Console Logs

**Úspěšné uložení:**
```
✅ Mood entry saved successfully
```

**Chyba permissions:**
```
❌ Error saving mood entry: FirebaseError: Missing or insufficient permissions.
```

**Chyba validace:**
```
❌ Error saving mood entry: FirebaseError: Invalid document data.
```

## 📈 Performance

### Indexy

Vytvořené indexy zajišťují rychlé dotazování:

1. **userId + createdAt (DESC)**
   - Pro načítání mood entries konkrétního uživatele
   - Seřazené od nejnovějších

2. **weddingId + createdAt (DESC)**
   - Pro načítání mood entries konkrétní svatby
   - Seřazené od nejnovějších

### Query Examples

```typescript
// Načíst mood entries uživatele (poslední týden)
const oneWeekAgo = new Date()
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

const q = query(
  collection(db, 'moodEntries'),
  where('userId', '==', userId),
  where('createdAt', '>=', oneWeekAgo),
  orderBy('createdAt', 'desc'),
  limit(50)
)

// Načíst mood entries svatby
const q = query(
  collection(db, 'moodEntries'),
  where('weddingId', '==', weddingId),
  orderBy('createdAt', 'desc'),
  limit(100)
)
```

## 🚀 Deployment

### Production Deployment

```bash
# 1. Build aplikace
npm run build

# 2. Deploy Firestore rules
firebase deploy --only firestore:rules

# 3. Deploy Firestore indexes
firebase deploy --only firestore:indexes

# 4. Deploy aplikace (Vercel)
vercel --prod
```

### Vercel Environment Variables

Ujistěte se, že jsou nastaveny:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
OPENAI_API_KEY=...
```

## ✅ Checklist

### Před nasazením
- [x] Firestore rules přidány
- [x] Firestore indexes přidány
- [x] Rules nasazeny do Firebase
- [x] Indexes nasazeny do Firebase
- [x] Testováno lokálně
- [x] Žádné chyby v console

### Po nasazení
- [ ] Testovat na production
- [ ] Ověřit uložení mood entries
- [ ] Ověřit notifikace
- [ ] Zkontrolovat Firebase Console
- [ ] Monitorovat chyby

## 🎉 Výsledek

**Mood Tracker nyní funguje správně!** 🤖💕

### Co funguje:
- ✅ Uložení mood entries do Firebase
- ✅ Načítání mood entries z Firebase
- ✅ Data isolation mezi uživateli
- ✅ Validace dat
- ✅ Security rules
- ✅ Composite indexes
- ✅ Automatické notifikace při vysokém stresu

### Unikátní features:
- 🎯 **Emocionální tracking** - Sledování nálady a stresu
- 💪 **Stress detection** - Automatická detekce vysokého stresu
- 💕 **Proactive support** - Automatické podpůrné zprávy
- 📊 **Insights** - Analýza nálady za týden
- 🤖 **AI Coach** - Personalizované návrhy

---

**Svatbot - Váš AI svatební kouč 🤖💕**

*S emocionální inteligencí a podporou!*

**Status:** ✅ **FIXED & DEPLOYED**  
**Datum:** 2025-01-14

