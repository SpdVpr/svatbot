# 🚦 AI Limits Implementation - Omezení AI funkcí pro Free uživatele

## 📋 Přehled

Implementovali jsme systém denních limitů pro AI funkce u free/trial uživatelů:

### Limity pro Free Trial uživatele:
- ✅ **AI Chat Asistent**: 3 dotazy denně
- ✅ **AI Moodboard Generátor**: 1 moodboard denně
- ✅ **Šablony webu**: Pouze 2 základní šablony (Classic Elegance, Modern Minimalist)

### Premium uživatelé:
- ✅ **Neomezené AI dotazy**
- ✅ **Neomezené AI moodboardy**
- ✅ **Přístup ke všem šablonám webu**

---

## 🏗️ Architektura

### 1. Typy a konfigurace

**Soubor**: `src/types/subscription.ts`

Rozšířené typy:
```typescript
export interface SubscriptionLimits {
  // ... existing fields
  aiChatQueriesPerDay: number | 'unlimited'
  aiMoodboardsPerDay: number | 'unlimited'
  websiteTemplates: 'basic' | 'all'
}

export interface UsageStats {
  // ... existing fields
  aiChatQueriesToday: number
  aiMoodboardsToday: number
  lastAIResetDate: string // YYYY-MM-DD format
}
```

**Konfigurace limitů**:
- Free Trial: 3 chat queries, 1 moodboard, basic templates
- Premium Monthly: unlimited, unlimited, all templates
- Premium Yearly: unlimited, unlimited, all templates

---

### 2. Hook pro správu limitů

**Soubor**: `src/hooks/useAILimits.ts`

**Funkce**:
```typescript
export function useAILimits() {
  return {
    limitsInfo: AILimitsInfo,
    incrementUsage: (featureType: 'chat' | 'moodboard') => Promise<boolean>,
    canUseFeature: (featureType: 'chat' | 'moodboard') => boolean,
    getRemainingUses: (featureType: 'chat' | 'moodboard') => number | 'unlimited',
    getLimitMessage: (featureType: 'chat' | 'moodboard') => string,
    refreshLimits: () => Promise<void>
  }
}
```

**Automatický reset**:
- Limity se resetují každý den o půlnoci
- Kontrola při načtení: pokud `lastAIResetDate !== today`, resetuje countery

---

### 3. AI Chat Asistent

**Soubor**: `src/hooks/useAI.ts`

**Změny**:
```typescript
const askHybrid = async (question: string, skipLimitCheck = false) => {
  if (!skipLimitCheck) {
    const { canUseFeature, incrementUsage, getLimitMessage } = useAILimits()
    
    if (!canUseFeature('chat')) {
      throw new Error(getLimitMessage('chat'))
    }
    
    await incrementUsage('chat')
  }
  // ... rest of the function
}
```

**UI komponenta**: `src/components/ai/AIAssistant.tsx`
- Zobrazuje zbývající počet dotazů
- Blokuje input při dosažení limitu
- Tlačítko "Upgrade" pro přechod na Premium

---

### 4. AI Moodboard Generátor

**Soubor**: `src/hooks/useMoodboard.ts`

**Změny**:
```typescript
const generateAIMoodboard = async (selectedImageIds, options) => {
  const { canUseFeature, incrementUsage, getLimitMessage } = useAILimits()
  
  if (!canUseFeature('moodboard')) {
    throw new Error(getLimitMessage('moodboard'))
  }
  
  await incrementUsage('moodboard')
  // ... rest of the function
}
```

**UI komponenta**: `src/components/moodboard/AIMoodboardGenerator.tsx`
- Zobrazuje warning banner s limitem
- Blokuje tlačítko "Vygenerovat" při dosažení limitu
- Tlačítko "Upgrade" pro přechod na Premium

---

### 5. Šablony svatebního webu

**Soubor**: `src/components/wedding-website/builder/TemplateSelector.tsx`

**Logika**:
```typescript
const FREE_TEMPLATES = ['classic-elegance', 'modern-minimalist']

const isTemplateLocked = (templateId: string) => {
  if (canAccessAllTemplates) return false
  return !FREE_TEMPLATES.includes(templateId)
}
```

**UI**:
- Premium banner nahoře stránky
- Locked overlay na premium šablonách
- Ikona zámku + tlačítko "Odemknout"

---

## 🗄️ Firestore struktura

### Collection: `usageStats/{userId}`

```typescript
{
  userId: string
  weddingId: string
  
  // Existing fields
  guestsCount: number
  tasksCount: number
  budgetItemsCount: number
  vendorsCount: number
  photosCount: number
  lastLoginAt: Timestamp
  totalLogins: number
  weddingWebsiteViews: number
  rsvpResponses: number
  aiQueriesCount: number  // Total lifetime counter
  
  // NEW: Daily AI limits
  aiChatQueriesToday: number      // Resets daily
  aiMoodboardsToday: number       // Resets daily
  lastAIResetDate: string         // YYYY-MM-DD format
  
  updatedAt: Timestamp
}
```

---

## 🔐 Firestore Security Rules

Pravidla již existují v `firestore.rules`:

```javascript
match /usageStats/{userId} {
  // User can read their own stats
  allow read: if isAuthenticated() && isOwner(userId);

  // User can create/update their own stats
  allow create, update: if isAuthenticated() &&
                           isOwner(userId) &&
                           request.resource.data.userId == request.auth.uid;

  // User cannot delete stats
  allow delete: if false;
}
```

---

## 🎨 UI/UX Design

### AI Chat Asistent
```
┌─────────────────────────────────────┐
│ ⚠️ Zbývá 2 z 3 dotazů dnes  [Upgrade]│
├─────────────────────────────────────┤
│ [Input field]                  [Send]│
└─────────────────────────────────────┘
```

Při dosažení limitu:
```
┌─────────────────────────────────────┐
│ ⚠️ Dosáhli jste denního limitu...   │
│    Upgrade na Premium pro neomezené │
│    dotazy                   [Upgrade]│
├─────────────────────────────────────┤
│ [Dosáhli jste denního limitu] [Send]│
│ (disabled)                  (disabled)│
└─────────────────────────────────────┘
```

### AI Moodboard Generátor
```
┌─────────────────────────────────────┐
│ ⚠️ Zbývá 1 z 1 moodboardů dnes      │
│    Limity se resetují každý den     │
│    o půlnoci              [Upgrade] │
└─────────────────────────────────────┘
```

### Šablony webu
```
┌─────────────────────────────────────┐
│ 👑 Máte přístup ke 2 základním      │
│    šablonám. Upgrade na Premium     │
│    pro přístup ke všem designům     │
│                           [Upgrade] │
└─────────────────────────────────────┘

[Classic Elegance]  [Modern Minimalist]
     (Free)              (Free)

[Romantic Boho]     [Luxury Gold]
  🔒 Premium         🔒 Premium
  [Odemknout]        [Odemknout]
```

---

## 🧪 Testování

### Test 1: Free uživatel - AI Chat
1. Přihlásit se jako free trial uživatel
2. Otevřít AI asistenta
3. Poslat 3 dotazy
4. Ověřit, že 4. dotaz je blokován
5. Ověřit zobrazení upgrade tlačítka

### Test 2: Free uživatel - Moodboard
1. Přihlásit se jako free trial uživatel
2. Otevřít Moodboard
3. Vygenerovat 1 AI moodboard
4. Ověřit, že 2. generování je blokováno
5. Ověřit zobrazení upgrade tlačítka

### Test 3: Free uživatel - Šablony
1. Přihlásit se jako free trial uživatel
2. Otevřít Website Builder
3. Ověřit přístup k Classic Elegance a Modern Minimalist
4. Ověřit zamčení ostatních šablon
5. Kliknout na zamčenou šablonu - ověřit, že se neaplikuje

### Test 4: Premium uživatel
1. Přihlásit se jako premium uživatel
2. Ověřit neomezený přístup k AI chatu
3. Ověřit neomezený přístup k AI moodboardům
4. Ověřit přístup ke všem šablonám

### Test 5: Denní reset
1. Nastavit `lastAIResetDate` na včerejší datum v Firestore
2. Načíst stránku
3. Ověřit, že countery byly resetovány na 0

---

## 📊 Monitoring

### Metriky k sledování:
- Počet free uživatelů, kteří dosáhli limitu
- Conversion rate: free → premium po dosažení limitu
- Průměrný počet AI dotazů na uživatele
- Průměrný počet AI moodboardů na uživatele

### Firebase Analytics události:
```typescript
// Při dosažení limitu
analytics.logEvent('ai_limit_reached', {
  feature: 'chat' | 'moodboard',
  user_plan: 'free_trial'
})

// Při kliknutí na Upgrade
analytics.logEvent('upgrade_clicked', {
  source: 'ai_chat_limit' | 'moodboard_limit' | 'template_locked'
})
```

---

## 🚀 Deployment

### Checklist:
- [x] Aktualizovat typy v `subscription.ts`
- [x] Vytvořit `useAILimits` hook
- [x] Upravit `useAI` hook
- [x] Upravit `useMoodboard` hook
- [x] Upravit AI chat komponentu
- [x] Upravit moodboard generátor komponentu
- [x] Upravit template selector komponentu
- [x] Ověřit Firestore pravidla
- [ ] Otestovat všechny scénáře
- [ ] Deploy na production

---

## 💡 Budoucí vylepšení

1. **Email notifikace**: Poslat email, když uživatel dosáhne limitu
2. **Push notifikace**: Upozornit uživatele na reset limitů
3. **Flexibilní limity**: Možnost nastavit různé limity pro různé plány
4. **Bonus kredity**: Dát uživatelům bonus kredity za doporučení
5. **Analytics dashboard**: Zobrazit uživatelům jejich usage statistiky

