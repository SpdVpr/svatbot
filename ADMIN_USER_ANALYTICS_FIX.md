# Admin User Analytics - Oprava a vylepšení

## 🎯 Provedené změny

### 1. Oprava načítání dat z userAnalytics kolekce

**Problém:** Hook `useUserAnalytics` načítal data z kolekce `users` místo `userAnalytics`, kde jsou skutečná tracking data.

**Řešení:**
- Změněn dotaz z `collection(db, 'users')` na `collection(db, 'userAnalytics')`
- Data se nyní správně načítají z kolekce, kde jsou uloženy statistiky:
  - `loginCount` - počet přihlášení
  - `totalSessionTime` - celkový čas strávený v aplikaci
  - `isOnline` - aktuální online status
  - `lastActivityAt` - poslední aktivita
  - `sessions` - seznam session

**Soubor:** `src/hooks/useAdminDashboard.ts`

### 2. Přidání AI dotazů do statistik

**Problém:** Admin neviděl, kolik AI dotazů jednotliví uživatelé použili.

**Řešení:**
- Přidáno načítání `aiQueriesCount` z kolekce `usageStats` pro každého uživatele
- Data se načítají paralelně pomocí `Promise.all`
- Přidáno pole `aiQueriesCount` do typu `UserAnalytics`

**Soubory:**
- `src/hooks/useAdminDashboard.ts` - načítání dat
- `src/types/admin.ts` - přidáno pole do interface

### 3. Nový sloupec "AI dotazy" v tabulce

**Přidáno:**
- Nový sloupec zobrazující počet AI dotazů pro každého uživatele
- Ikona Sparkles pro vizuální odlišení
- Sloupec je řaditelný (kliknutím na hlavičku)

**Soubor:** `src/components/admin/UserAnalyticsTable.tsx`

### 4. Řazení sloupců kliknutím

**Problém:** Nebylo možné řadit data podle jednotlivých sloupců.

**Řešení:**
- Implementováno klikatelné hlavičky sloupců
- Toggle mezi vzestupným (ASC) a sestupným (DESC) řazením
- Vizuální indikátory směru řazení (šipky nahoru/dolů)
- Řaditelné sloupce:
  - Poslední aktivita
  - Počet přihlášení
  - Celkový čas
  - AI dotazy

**Funkce:**
- Kliknutí na sloupec → seřadí sestupně
- Další kliknutí na stejný sloupec → seřadí vzestupně
- Kliknutí na jiný sloupec → seřadí nový sloupec sestupně

**Soubor:** `src/components/admin/UserAnalyticsTable.tsx`

### 5. Aktualizace CSV exportu

**Přidáno:**
- Sloupec "AI dotazy" do CSV exportu
- Sloupec "Sessions" do CSV exportu

**Soubor:** `src/components/admin/UserAnalyticsTable.tsx`

### 6. Firestore pravidla

**Změna:**
- Přidáno právo pro adminy číst všechny `usageStats` dokumenty
- Původně: pouze vlastník mohl číst své statistiky
- Nyní: admin může číst všechny statistiky pro dashboard

**Soubor:** `firestore.rules`

```javascript
match /usageStats/{userId} {
  // User can read their own stats, admins can read all
  allow read: if isAuthenticated() && (isOwner(userId) || isAdmin());
  // ...
}
```

### 7. User Tracking aktivace

**Problém:** User tracking nebyl aktivován v root layoutu.

**Řešení:**
- Přidán `UserTrackingWrapper` do root layoutu (`src/app/layout.tsx`)
- Wrapper automaticky inicializuje tracking pro všechny přihlášené uživatele
- Tracking zahrnuje:
  - Login events
  - Session duration
  - Online/offline status
  - Page views
  - Feature usage

**Soubory:**
- `src/app/layout.tsx` - přidán wrapper
- `src/components/common/UserTrackingWrapper.tsx` - zjednodušen (odstraněn duplicitní FeedbackButton)

## 📊 Datová struktura

### userAnalytics/{userId}
```typescript
{
  userId: string
  email: string
  displayName: string
  registeredAt: Timestamp
  lastLoginAt: Timestamp
  loginCount: number              // ✅ Nyní se správně zobrazuje
  totalSessionTime: number        // ✅ Nyní se správně zobrazuje (v minutách)
  isOnline: boolean              // ✅ Nyní se správně zobrazuje
  lastActivityAt: Timestamp
  sessions: UserSession[]
  pageViews: Record<string, number>
  featuresUsed: string[]
}
```

### usageStats/{userId}
```typescript
{
  userId: string
  weddingId: string
  aiQueriesCount: number         // ✅ Nyní se zobrazuje v admin tabulce
  aiChatQueriesToday: number
  aiMoodboardsToday: number
  lastAIResetDate: string
  // ... další pole
}
```

## 🚀 Deployment

Změny byly nasazeny:
```bash
firebase deploy --only firestore:rules
```

## ✅ Výsledek

Admin dashboard nyní správně zobrazuje:
- ✅ Počet přihlášení pro každého uživatele
- ✅ Celkový čas strávený v aplikaci
- ✅ Online/Offline status
- ✅ Počet AI dotazů
- ✅ Řazení podle všech sloupců (kliknutím)
- ✅ Automatické sledování aktivity uživatelů

## 🔍 Testování

Pro otestování:
1. Přihlásit se jako admin na `/admin/dashboard`
2. Přejít na záložku "Uživatelé"
3. Ověřit, že se zobrazují:
   - Počty přihlášení
   - Celkový čas
   - Online status
   - AI dotazy
4. Kliknout na hlavičky sloupců a ověřit řazení
5. Exportovat CSV a ověřit, že obsahuje všechny sloupce

## 📝 Poznámky

- User tracking se spouští automaticky při přihlášení uživatele
- Data se ukládají do `userAnalytics` kolekce
- Online status se aktualizuje každých 30 sekund
- Uživatel je označen jako offline po 5 minutách neaktivity
- AI dotazy se načítají z `usageStats` kolekce

