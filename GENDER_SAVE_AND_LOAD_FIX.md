# 🔧 Gender Save & Load Fix - FINAL

## 🐛 Problém

**Uživatel hlásil:**
> "Nastavím pohlaví, napíše se mi 'účet úspěšně aktualizován' ale pohlaví uložené není."

**Příčina:**
1. ❌ Pohlaví se ukládalo do Firestore
2. ❌ Ale při načítání se nečetlo z Firestore
3. ❌ Cache se nevymazávala po změně
4. ❌ Data se načítala JEN pro ověřené emaily

---

## ✅ Řešení

### **1. Oprava načítání z Firestore**

**PŘED (špatně):**
```typescript
// src/hooks/useAuth.ts - řádky 48-87
const convertFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  // Check cache first
  const cached = userDataCache.get(firebaseUser.uid)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.user  // ← Vrací cache, i když se data změnila!
  }

  let userData = null

  // Only try to access Firestore if user has verified email
  if (firebaseUser.emailVerified) {  // ← Problém! Google login má verified, ale...
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (userDoc.exists()) {
        userData = userDoc.data()
      }
    } catch (error) {
      console.warn('Firestore not available...')
    }
  } else {
    console.log('User email not verified, skipping Firestore user data fetch')
  }

  const user: User = {
    id: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName: firebaseUser.displayName || userData?.displayName || '',
    photoURL: firebaseUser.photoURL || userData?.photoURL,
    gender: userData?.gender,  // ← Nikdy se nenačte, protože cache!
    createdAt: userData?.createdAt?.toDate() || new Date(),
    updatedAt: new Date()
  }

  userDataCache.set(firebaseUser.uid, { user, timestamp: Date.now() })
  return user
}
```

**PO (správně):**
```typescript
// src/hooks/useAuth.ts - řádky 48-88
const convertFirebaseUser = async (firebaseUser: FirebaseUser, forceRefresh = false): Promise<User> => {
  // Check cache first (unless force refresh)
  if (!forceRefresh) {  // ← Přidán parametr forceRefresh
    const cached = userDataCache.get(firebaseUser.uid)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('✅ Using cached user data for:', firebaseUser.uid)
      return cached.user
    }
  }

  let userData = null

  // Always try to get user data from Firestore (not just for verified emails)
  try {  // ← Odstraněna podmínka emailVerified
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
    if (userDoc.exists()) {
      userData = userDoc.data()
      console.log('📥 Loaded user data from Firestore:', { gender: userData?.gender })
    } else {
      console.log('⚠️ No Firestore document found for user:', firebaseUser.uid)
    }
  } catch (error) {
    console.warn('Firestore not available for user data, using Firebase Auth data only:', error)
  }

  const user: User = {
    id: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName: firebaseUser.displayName || userData?.displayName || '',
    photoURL: firebaseUser.photoURL || userData?.photoURL,
    gender: userData?.gender,  // ← Teď se načte správně!
    createdAt: userData?.createdAt?.toDate() || new Date(),
    updatedAt: new Date()
  }

  userDataCache.set(firebaseUser.uid, { user, timestamp: Date.now() })
  return user
}
```

**Klíčové změny:**
1. ✅ Přidán parametr `forceRefresh` pro vynucení načtení z Firestore
2. ✅ Odstraněna podmínka `emailVerified` - data se načítají vždy
3. ✅ Přidány console.logy pro debugging

---

### **2. Přidána funkce refreshUser**

```typescript
// src/hooks/useAuth.ts - řádky 355-373
// Refresh user data from Firestore (useful after profile updates)
const refreshUser = async () => {
  const currentUser = auth.currentUser
  if (!currentUser) return

  console.log('🔄 Refreshing user data from Firestore...')
  
  // Clear cache for this user
  userDataCache.delete(currentUser.uid)  // ← Vymaže cache!
  
  // Force refresh from Firestore
  const updatedUser = await convertFirebaseUser(currentUser, true)  // ← forceRefresh = true
  setUser(updatedUser)
  
  console.log('✅ User data refreshed:', { gender: updatedUser.gender })
}

return {
  user: isInitialized ? user : undefined,
  isLoading,
  isInitialized,
  error,
  register,
  login,
  loginWithGoogle,
  logout,
  clearError,
  refreshUser  // ← Nová funkce exportována!
}
```

**Výhody:**
- ✅ Vymaže cache
- ✅ Vynutí načtení z Firestore
- ✅ Aktualizuje user state
- ✅ Loguje výsledek

---

### **3. ProfileTab volá refreshUser místo reload**

**PŘED (špatně):**
```typescript
// src/components/account/ProfileTab.tsx
// Reload page to refresh user data if gender changed
if (formData.gender !== user?.gender) {
  setTimeout(() => {
    window.location.reload()  // ← Celá stránka se znovu načte!
  }, 1500)
} else {
  setIsEditing(false)
}
```

**PO (správně):**
```typescript
// src/components/account/ProfileTab.tsx - řádky 95-101
// Refresh user data if gender changed
if (formData.gender !== user?.gender && refreshUser) {
  console.log('🔄 Gender changed, refreshing user data...')
  await refreshUser()  // ← Jen refresh user data, ne celá stránka!
}

setIsEditing(false)
```

**Výhody:**
- ✅ Rychlejší (bez reload stránky)
- ✅ Lepší UX (žádné blikání)
- ✅ Zachová stav aplikace

---

### **4. Přidány console.logy pro debugging**

```typescript
// src/components/account/ProfileTab.tsx - řádky 52-66
// Update gender in Firestore (FIRST, before email)
if (formData.gender !== user?.gender) {
  console.log('💾 Saving gender to Firestore:', { 
    userId: auth.currentUser.uid, 
    oldGender: user?.gender, 
    newGender: formData.gender 
  })
  const userRef = doc(db, 'users', auth.currentUser.uid)
  await updateDoc(userRef, {
    gender: formData.gender,
    updatedAt: new Date()
  })
  console.log('✅ Gender saved to Firestore')
  hasChanges = true
}
```

---

## 🧪 Testování

### **Scénář A: Změna pohlaví (Google Login)**
1. Přihlaš se přes Google
2. Otevři profil
3. Klikni "Upravit"
4. Vyber 👰 Žena
5. Klikni "Uložit"
6. **Očekávaný výsledek:**
   - ✅ Console: "💾 Saving gender to Firestore: { userId: '...', oldGender: undefined, newGender: 'female' }"
   - ✅ Console: "✅ Gender saved to Firestore"
   - ✅ Console: "🔄 Gender changed, refreshing user data..."
   - ✅ Console: "🔄 Refreshing user data from Firestore..."
   - ✅ Console: "📥 Loaded user data from Firestore: { gender: 'female' }"
   - ✅ Console: "✅ User data refreshed: { gender: 'female' }"
   - ✅ Zobrazí se: "Profil byl úspěšně aktualizován"
   - ✅ V non-edit módu vidíš růžový badge: 👰 Žena
   - ✅ **ŽÁDNÝ reload stránky!**

### **Scénář B: AI Kouč používá pohlaví**
1. Změň pohlaví na 👰 Žena
2. Jdi na dashboard
3. Počkej na zprávu od Svatbota
4. **Očekávaný výsledek:**
   - ✅ Zprávy jsou v ženském rodě:
     - "☀️ Dobré ráno, krásko!"
     - "💪 Jsi skvělá!"
     - "✨ Jsi úžasná!"
   - ✅ Emoji odpovídají pohlaví (👰 místo 🤵)

### **Scénář C: Změna z ženy na muže**
1. Změň pohlaví na 🤵 Muž
2. Jdi na dashboard
3. Počkej na zprávu od Svatbota
4. **Očekávaný výsledek:**
   - ✅ Zprávy jsou v mužském rodě:
     - "☀️ Dobré ráno, šampione!"
     - "💪 Jsi skvělý!"
     - "✨ Jsi úžasný!"
   - ✅ Emoji odpovídají pohlaví (🤵 místo 👰)

---

## 📊 Před vs. Po

### **Před opravou:**
- ❌ Pohlaví se ukládalo, ale nenačítalo
- ❌ Cache se nevymazávala
- ❌ Data se načítala JEN pro ověřené emaily
- ❌ Reload celé stránky po změně
- ❌ AI Kouč používal výchozí zprávy (ženské)

### **Po opravě:**
- ✅ Pohlaví se ukládá i načítá správně
- ✅ Cache se vymaže po změně
- ✅ Data se načítají vždy (i pro neověřené emaily)
- ✅ Jen refresh user data (bez reload stránky)
- ✅ AI Kouč používá správné zprávy podle pohlaví

---

## 🎯 Klíčové změny v kódu

### **Soubor:** `src/hooks/useAuth.ts`

**Řádky 48-88:** Opravená `convertFirebaseUser` funkce
- Přidán parametr `forceRefresh`
- Odstraněna podmínka `emailVerified`
- Přidány console.logy

**Řádky 355-373:** Nová funkce `refreshUser`
- Vymaže cache
- Vynutí načtení z Firestore
- Aktualizuje user state

**Řádek 387:** Export `refreshUser`
- Přidáno do return objektu

---

### **Soubor:** `src/components/account/ProfileTab.tsx`

**Řádek 23:** Import `refreshUser`
```typescript
const { user, refreshUser } = useAuth()
```

**Řádky 52-66:** Přidány console.logy pro debugging
- Loguje ukládání pohlaví

**Řádky 95-101:** Volání `refreshUser` místo reload
- Rychlejší, lepší UX

---

## 🔮 AI Kouč a pohlaví

AI Kouč už správně používá pohlaví na těchto místech:

### **1. Ranní motivace (6-11h)**
```typescript
// src/hooks/useAICoach.ts - řádky 268-287
const morningMessagesFemale = [
  { title: '☀️ Dobré ráno, krásko!', message: '...' },
  { title: '🌅 Krásné ráno!', message: 'TY jsi úžasná! 💕' }
]
const morningMessagesMale = [
  { title: '☀️ Dobré ráno, šampione!', message: '...' },
  { title: '🌅 Krásné ráno!', message: 'TY jsi úžasný! 💪' }
]
const messages = isFemale ? morningMessagesFemale : isMale ? morningMessagesMale : morningMessagesFemale
```

### **2. Odpolední povzbuzení (12-17h)**
```typescript
// src/hooks/useAICoach.ts - řádky 297-338
const afternoonMessagesFemale = [
  { title: '🎉 Skvělá práce!', message: 'Dnes jsi dokončila...' },
  { title: '💪 Makáš!', message: 'Tvůj budoucí manžel má štěstí!' }
]
const afternoonMessagesMale = [
  { title: '🎉 Skvělá práce!', message: 'Dnes jsi dokončil...' },
  { title: '💪 Makáš!', message: 'Tvoje budoucí manželka má štěstí!' }
]
```

### **3. Večerní relaxace (18-23h)**
```typescript
// src/hooks/useAICoach.ts - řádky 342-361
const eveningMessagesFemale = [
  { title: '🌙 Čas na odpočinek', message: '...sklenku vína! 🍷' },
  { title: '💆‍♀️ Uvolni se', message: 'Možná teplá koupel? 🛁' }
]
const eveningMessagesMale = [
  { title: '🌙 Čas na odpočinek', message: '...pivo! 🍺' },
  { title: '💆‍♂️ Uvolni se', message: 'Možná sport nebo film? 🎮' }
]
```

### **4. Milníky (odpočet do svatby)**
```typescript
// src/hooks/useAICoach.ts - řádky 369-388
const messageFemale = 'Budeš v něm vypadat jako princezna! 👑💕'
const messageMale = 'Bude to úžasný zážitek! 🤵💪'
```

### **5. Péče o sebe**
```typescript
// src/hooks/useAICoach.ts - řádky 404-425
const selfCareMessagesFemale = [
  { title: '💅 Péče o sebe', message: 'Kdy naposledy jsi byla u kadeřníka...' },
  { title: '🧘‍♀️ Relaxuj', message: 'Nezapomeň na jógu, meditaci...' }
]
const selfCareMessagesMale = [
  { title: '💈 Péče o sebe', message: 'Kdy naposledy jsi byl u holiče...' },
  { title: '🏋️‍♂️ Relaxuj', message: 'Nezapomeň na sport, běh...' }
]
```

### **6. Pozitivní afirmace**
```typescript
// src/hooks/useAICoach.ts - řádky 429-450
const affirmationsFemale = [
  { title: '✨ Jsi úžasná!', message: 'TY jsi krásná - uvnitř i navenek! 💕' },
  { title: '👑 Jsi princezna!', message: 'Budeš ta nejkrásnější princezna!' }
]
const affirmationsMale = [
  { title: '✨ Jsi úžasný!', message: 'TY jsi skvělý - uvnitř i navenek! 💪' },
  { title: '🤵 Jsi šampion!', message: 'Budeš ten nejlepší ženich!' }
]
```

---

## 📝 Závěr

Všechny problémy jsou vyřešeny:
1. ✅ Pohlaví se ukládá do Firestore
2. ✅ Pohlaví se načítá z Firestore
3. ✅ Cache se vymaže po změně
4. ✅ Rychlý refresh bez reload stránky
5. ✅ AI Kouč používá správné zprávy podle pohlaví

**Hlavní fix:** 
- Přidán parametr `forceRefresh` do `convertFirebaseUser`
- Nová funkce `refreshUser` pro vymazání cache a refresh dat
- ProfileTab volá `refreshUser` místo `window.location.reload()`
- Odstraněna podmínka `emailVerified` pro načítání dat

**Výsledek:** Pohlaví se teď ukládá i načítá správně a AI Kouč používá správné zprávy! 🎉

