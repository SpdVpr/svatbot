# 📊 Mood Tracker & AI Kouč - Dokumentace

## 🎯 Co to je?

Mood Tracker je systém pro sledování emocionálního stavu uživatelů během svatebních příprav. Svatbot (AI kouč) analyzuje tyto data a poskytuje personalizovanou podporu a motivaci.

---

## 🔄 Jak to funguje?

### 1. **Uložení nálady do Firebase**

Když uživatel vyplní mood tracker a klikne na "Odeslat":

```typescript
// src/hooks/useAICoach.ts - řádky 129-165
const saveMoodEntry = async (
  mood: 'great' | 'good' | 'okay' | 'stressed' | 'overwhelmed',
  stressLevel: number,  // 1-10
  energyLevel: number,  // 1-10
  note?: string
) => {
  const moodEntry = {
    userId: user.id,
    weddingId: wedding.id,
    mood,
    stressLevel,
    energyLevel,
    note,
    createdAt: serverTimestamp()
  }
  
  // Uložení do Firebase kolekce 'moodEntries'
  await addDoc(collection(db, 'moodEntries'), moodEntry)
  
  // Pokud je stres >= 7, vytvoří se notifikace
  if (stressLevel >= 7) {
    await createNotification(
      'Svatbot je tu pro vás 💕',
      'Vidím, že je to teď náročné. Pamatujte - svatba má být radost!'
    )
  }
}
```

**Firebase struktura:**
```
moodEntries/
  {randomId}/
    userId: "abc123"
    weddingId: "xyz789"
    mood: "stressed"
    stressLevel: 7
    energyLevel: 4
    note: "Hodně práce s organizací"
    createdAt: Timestamp
```

---

### 2. **Načtení dat z Firebase**

```typescript
// src/hooks/useAICoach.ts - řádky 168-192
const getRecentMoods = async (days: number = 7) => {
  const daysAgo = new Date()
  daysAgo.setDate(daysAgo.getDate() - days)
  
  const q = query(
    collection(db, 'moodEntries'),
    where('userId', '==', user.id),
    where('createdAt', '>=', daysAgo),
    orderBy('createdAt', 'desc'),
    limit(20)
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}
```

**Co se načítá:**
- Posledních 7 dní nálad
- Maximálně 20 záznamů
- Seřazeno od nejnovějšího
- Pouze pro přihlášeného uživatele

---

### 3. **Analýza emocionálního stavu**

```typescript
// src/hooks/useAICoach.ts - řádky 195-246
const analyzeEmotionalState = async () => {
  const recentMoods = await getRecentMoods(7)
  
  // Výpočet průměrného stresu
  const avgStress = recentMoods.reduce((sum, m) => sum + m.stressLevel, 0) / recentMoods.length
  
  // Výpočet celkové nálady
  const moodScores = {
    great: 5,
    good: 4,
    okay: 3,
    stressed: 2,
    overwhelmed: 1
  }
  const avgMoodScore = recentMoods.reduce((sum, m) => sum + moodScores[m.mood], 0) / recentMoods.length
  
  // Určení celkové nálady
  const overallMood = 
    avgMoodScore >= 4 ? 'positive' :
    avgMoodScore >= 3 ? 'neutral' : 'stressed'
  
  // Generování doporučení
  const suggestions = []
  const needsSupport = avgStress >= 6 || overallMood === 'stressed'
  
  if (needsSupport) {
    suggestions.push('Zkuste si naplánovat večer jen pro vás dva 💑')
    suggestions.push('Delegujte některé úkoly na rodinu 🤝')
    suggestions.push('Pamatujte: Dokonalá svatba neexistuje! 💕')
  }
  
  if (avgStress >= 7) {
    suggestions.push('Zvažte kratší pauzu - třeba víkendový výlet 🌄')
  }
  
  return {
    overallMood,
    stressLevel: Math.round(avgStress),
    recentMoods,
    suggestions,
    needsSupport
  }
}
```

**Logika analýzy:**

| Průměrný stres | Celková nálada | Akce |
|----------------|----------------|------|
| < 5 | Pozitivní | Žádná speciální podpora |
| 5-6 | Neutrální | Základní tipy |
| ≥ 6 | Stresovaná | Doporučení na relaxaci |
| ≥ 7 | Přetížená | Notifikace + urgentní podpora |

---

### 4. **Personalizované zprávy podle pohlaví**

```typescript
// src/hooks/useAICoach.ts - řádky 248-417
const generateSuggestions = async () => {
  const isFemale = user.gender === 'female'
  const isMale = user.gender === 'male'
  
  // Ranní motivace pro ženy
  const morningMessagesFemale = [
    { title: '☀️ Dobré ráno, krásko!', message: 'Dnes budeš zářit!' },
    { title: '🌅 Krásné ráno!', message: 'TY jsi úžasná!' }
  ]
  
  // Ranní motivace pro muže
  const morningMessagesMale = [
    { title: '☀️ Dobré ráno, šampione!', message: 'Dnes to zvládneš!' },
    { title: '🌅 Krásné ráno!', message: 'TY jsi úžasný!' }
  ]
  
  const messages = isFemale ? morningMessagesFemale : morningMessagesMale
  // ... další logika
}
```

**Typy zpráv:**
- 🌅 **Ranní motivace** (6-11h) - 40% šance
- 💪 **Odpolední povzbuzení** (12-17h) - 30% šance
- 🌙 **Večerní relaxace** (18-23h) - 40% šance
- 🎊 **Milníky svatby** (365, 180, 100, 60, 30, 14, 7, 3, 1 dní)
- 💑 **Vztahové připomínky** - 30% šance
- 💅 **Péče o sebe** - 25% šance
- ✨ **Pozitivní afirmace** - 20% šance

---

## 🧪 Jak otestovat funkčnost?

### Krok 1: Otevři testovací stránku
```
http://localhost:3000/test-mood
```

### Krok 2: Přihlaš se
- Musíš být přihlášený uživatel
- Musíš mít vytvořenou svatbu

### Krok 3: Přidej náladu
1. Vyber náladu (😄 Skvělá, 😊 Dobrá, 😐 Ujde to, 😰 Stres, 😫 Přetížení)
2. Nastav úroveň stresu (1-10)
3. Nastav úroveň energie (1-10)
4. Volitelně přidej poznámku
5. Klikni "Odeslat"

### Krok 4: Zkontroluj Firebase
1. Otevři Firebase Console: https://console.firebase.google.com/
2. Přejdi na projekt `svatbot-app`
3. Firestore Database → `moodEntries`
4. Měl by tam být nový záznam s tvými daty

### Krok 5: Zkontroluj analýzu
- Na testovací stránce uvidíš:
  - **Celková nálada** (Pozitivní/Neutrální/Stresovaná)
  - **Průměrná úroveň stresu** (1-10)
  - **Doporučení** (pokud je stres ≥ 6)
  - **Historii nálad** (tabulka se všemi záznamy)

### Krok 6: Testuj různé scénáře

**Scénář A: Nízký stres**
- Nálada: 😄 Skvělá
- Stres: 2/10
- Očekávaný výsledek: Žádná speciální doporučení

**Scénář B: Střední stres**
- Nálada: 😐 Ujde to
- Stres: 6/10
- Očekávaný výsledek: Doporučení na relaxaci

**Scénář C: Vysoký stres**
- Nálada: 😰 Stres
- Stres: 8/10
- Očekávaný výsledek: Notifikace + urgentní podpora

---

## 📱 Kde se zobrazují data?

### 1. **Dashboard - Svatbot Kouč modul**
- Zobrazuje aktuální náladu
- Ukazuje průměrný stres
- Nabízí mood tracker
- Zobrazuje personalizované zprávy

### 2. **AI Chat stránka** (`/ai`)
- Svatbot má kontext o tvé náladě
- Přizpůsobuje odpovědi podle emocionálního stavu
- Nabízí podporu při vysokém stresu

### 3. **Notifikace**
- Při stresu ≥ 7 se vytvoří notifikace
- Zobrazí se v notifikačním centru
- Obsahuje povzbuzující zprávu

---

## 🔍 Debugging

### Zkontroluj konzoli prohlížeče
```javascript
// Měly by se zobrazit logy:
console.log('✅ Mood entry saved to Firebase')
console.log('📊 Emotional insight:', emotionalInsight)
console.log('💬 Generated suggestions:', suggestions)
```

### Zkontroluj Firebase Console
1. **Firestore Database** → `moodEntries`
   - Měly by tam být záznamy s `userId`, `weddingId`, `mood`, `stressLevel`, atd.

2. **Firestore Database** → `notifications`
   - Při vysokém stresu by tam měla být notifikace

### Zkontroluj Network tab
- Měly by být požadavky na Firebase:
  - `POST` na `firestore.googleapis.com` (ukládání)
  - `GET` na `firestore.googleapis.com` (načítání)

---

## 🎨 Personalizace podle pohlaví

### Ženy (gender: 'female')
- Oslovení: "krásko", "princezna"
- Emoji: 👰, 💅, 🌺
- Tipy: kadeřník, manikúra, koupel, jóga
- Tón: něžný, povzbuzující

### Muži (gender: 'male')
- Oslovení: "šampione", "chlape"
- Emoji: 🤵, 💪, 🏋️‍♂️
- Tipy: holič, sport, pivo, film
- Tón: motivační, kamarádský

### Jiné (gender: 'other')
- Používá neutrální oslovení
- Defaultně ženy varianty

---

## ⚙️ Nastavení pohlaví

### Kde nastavit pohlaví:

**1. Při registraci:**
- Při vytváření nového účtu si vyber pohlaví (👰 Žena, 🤵 Muž, 💫 Jiné)
- Pohlaví se uloží do Firebase a použije se pro personalizaci

**2. V profilu:**
- Klikni na ikonu účtu v pravém horním rohu
- Vyber záložku **"Profil"**
- Klikni na **"Upravit"**
- V sekci **"Pohlaví"** vyber: 👰 Žena, 🤵 Muž, nebo 💫 Jiné
- Klikni na **"Uložit změny"**
- Stránka se automaticky obnoví a zprávy od Svatbota se přizpůsobí

### Technické detaily:
```typescript
// Uložení do Firestore
users/{userId}
  - gender: 'female' | 'male' | 'other'
  - updatedAt: Timestamp

// Použití v AI Kouči
const isFemale = user.gender === 'female'
const isMale = user.gender === 'male'

// Výběr zpráv
const messages = isFemale ? messagesFemale :
                isMale ? messagesMale :
                messagesFemale // default
```

---

## 📊 Metriky a statistiky

### Co se sleduje:
- ✅ Počet záznamů nálady
- ✅ Průměrný stres za 7 dní
- ✅ Celková nálada (pozitivní/neutrální/stresovaná)
- ✅ Potřeba podpory (needsSupport flag)
- ✅ Frekvence vysokého stresu

### Co se NESLEDUJE:
- ❌ Konkrétní obsah poznámek (soukromé)
- ❌ Identifikační údaje mimo userId
- ❌ Historie mimo 7 dní (pro analýzu)

---

## 🚀 Budoucí vylepšení

1. **Grafy a vizualizace**
   - Graf vývoje nálady v čase
   - Heatmapa stresových dnů

2. **Predikce**
   - AI predikce stresových období
   - Doporučení preventivních opatření

3. **Párová analýza**
   - Porovnání nálady obou partnerů
   - Doporučení na společné aktivity

4. **Export dat**
   - Export historie do PDF
   - Sdílení s terapeutem/koučem

---

## 📞 Kontakt

Pokud máš otázky nebo najdeš bug, napiš na: support@svatbot.cz

