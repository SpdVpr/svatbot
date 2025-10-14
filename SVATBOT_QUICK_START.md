# 🚀 Svatbot - Quick Start Guide

## ⚡ Rychlé spuštění za 5 minut

### 1. Přidat Svatbot do Dashboardu

**Soubor:** `src/components/dashboard/Dashboard.tsx`

```tsx
// Import
import SvatbotCoachModule from '@/components/dashboard/modules/SvatbotCoachModule'

// Přidat do module definitions (řádek ~50)
const availableModules = [
  // ... existující moduly
  
  {
    id: 'svatbot-coach',
    title: 'Svatbot - Váš AI Kouč',
    component: SvatbotCoachModule,
    defaultSize: { w: 2, h: 3 },
    minSize: { w: 2, h: 2 },
    category: 'ai',
    icon: '🤖',
    description: 'AI svatební kouč s emocionální podporou'
  },
]
```

### 2. Přidat Floating Chat Button

**Soubor:** `src/components/dashboard/Dashboard.tsx` (na konci return)

```tsx
return (
  <div className="min-h-screen bg-gray-50">
    {/* ... existující obsah ... */}
    
    {/* Floating Svatbot Chat */}
    <AIAssistant compact={true} defaultOpen={false} />
  </div>
)
```

### 3. Přidat Task Celebrations

**Soubor:** `src/hooks/useTask.ts` nebo `src/components/tasks/TaskCard.tsx`

```tsx
import { useSvatbotNotifications } from '@/hooks/useSvatbotNotifications'

// V komponentě
const { celebrateTaskCompletion } = useSvatbotNotifications()

// Při dokončení úkolu
const handleCompleteTask = async (task: Task) => {
  await updateTask(task.id, { status: 'completed' })
  
  // 🎉 Svatbot gratulace
  await celebrateTaskCompletion(task.title)
}
```

### 4. Testovat

```bash
# Spustit dev server
npm run dev

# Otevřít http://localhost:3000
# 1. Přihlásit se
# 2. Jít na dashboard
# 3. Měli byste vidět Svatbot widget
# 4. Kliknout na floating chat button (🤖 vpravo dole)
# 5. Zkusit chat: "Ahoj Svatbot!"
```

## 🎯 Základní použití

### Mood Tracking

```tsx
import MoodTracker from '@/components/ai/MoodTracker'

// Compact verze (pro dashboard)
<MoodTracker compact={true} />

// Full verze (pro samostatnou stránku)
<MoodTracker compact={false} />
```

### Svatbot Widget

```tsx
import SvatbotWidget from '@/components/ai/SvatbotWidget'

// S mood trackerem
<SvatbotWidget showMoodTracker={true} compact={false} />

// Bez mood trackeru
<SvatbotWidget showMoodTracker={false} compact={true} />
```

### Smart Notifications

```tsx
import { useSvatbotNotifications } from '@/hooks/useSvatbotNotifications'

const {
  celebrateTaskCompletion,    // Gratulace k úkolu
  celebrateMilestone,          // Oslava milníku
  sendStressReliefTip,         // Tip na relaxaci
  sendRelationshipReminder,    // Připomínka vztahu
  sendProactiveSuggestion,     // Proaktivní návrh
  sendDailyCheckIn             // Denní check-in
} = useSvatbotNotifications()

// Použití
await celebrateTaskCompletion('Rezervace místa')
await celebrateMilestone('progress', 50)
await sendStressReliefTip()
```

## 🎨 Styling

### Svatbot Barvy

```tsx
// Gradient button
className="bg-gradient-to-r from-primary-500 to-pink-500 hover:from-primary-600 hover:to-pink-600"

// Background
className="bg-gradient-to-r from-primary-50 to-pink-50"

// Border
className="border-l-4 border-primary-500"
```

### Svatbot Emoji

```tsx
// Hlavní ikona
<span className="text-2xl">🤖</span>

// S gradienten
<div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-pink-500 rounded-full flex items-center justify-center">
  <span className="text-xl">🤖</span>
</div>
```

## 📝 Příklady notifikací

### Task Completion

```tsx
// Po dokončení úkolu
await celebrateTaskCompletion('Výběr místa konání')

// Výsledek:
// 🎉 "Skvělá práce! 'Výběr místa konání' je hotový. Jste o krok blíž k dokonalé svatbě!"
```

### Progress Milestone

```tsx
// Při dosažení 50% pokroku
await celebrateMilestone('progress', 50)

// Výsledek:
// 🎊 "50% dokončeno! Polovina hotovo! Jste přesně v půlce cesty k dokonalé svatbě! 💕"
```

### Wedding Countdown

```tsx
// 30 dní do svatby
await celebrateMilestone('countdown', 30)

// Výsledek:
// 🎊 "30 dní do svatby! Měsíc do svatby! Už je to tady! Nezapomeňte dýchat a užívat si to! 💕"
```

### Stress Relief

```tsx
// Když uživatel má vysoký stres
await sendStressReliefTip()

// Výsledek:
// 🧘 "Čas na pauzu - Svatební přípravy mohou být náročné. Zkuste si dát pauzu - procházka, meditace nebo čaj s partnerem. 💕"
```

## 🔧 Konfigurace

### Změnit Svatbot jméno

**Soubor:** `src/hooks/useAICoach.ts`

```typescript
export const SVATBOT_PERSONALITY = {
  name: 'Svatbot',  // ← Změnit zde
  tagline: 'Váš AI svatební kouč',
  // ...
}
```

### Upravit AI prompt

**Soubor:** `src/hooks/useAICoach.ts`

```typescript
export const SVATBOT_SYSTEM_PROMPT = `
Jsi Svatbot - AI svatební kouč...
// ← Upravit prompt zde
`
```

### Přidat vlastní notifikace

**Soubor:** `src/hooks/useSvatbotNotifications.ts`

```typescript
// Přidat novou funkci
const sendCustomNotification = useCallback(async () => {
  await createNotification(
    WeddingNotificationType.SYSTEM_UPDATE,
    'Vlastní titulek 🎉',
    'Vlastní zpráva od Svatbota!',
    {
      priority: 'medium',
      category: 'system',
      data: { type: 'custom' }
    }
  )
}, [createNotification])

return {
  // ... existující
  sendCustomNotification  // ← Přidat do return
}
```

## 🐛 Časté problémy

### Chat neodpovídá

```bash
# Zkontrolovat .env.local
OPENAI_API_KEY=sk-...

# Restartovat dev server
npm run dev
```

### Notifikace nepřicházejí

```typescript
// Zkontrolovat Firebase rules
// firestore.rules
match /weddingNotifications/{notifId} {
  allow read, write: if request.auth != null;
}
```

### Mood tracker neuloží

```typescript
// Zkontrolovat Firebase rules
// firestore.rules
match /moodEntries/{entryId} {
  allow read, write: if request.auth != null;
}
```

## 📚 Další zdroje

- **Kompletní dokumentace**: `docs/SVATBOT_AI_COACH.md`
- **Implementační průvodce**: `SVATBOT_IMPLEMENTATION_GUIDE.md`
- **API dokumentace**: Inline JSDoc v souborech

## 🎉 Hotovo!

Svatbot je nyní připraven k použití! 🤖💕

### Checklist

- [ ] Přidán do dashboardu
- [ ] Floating chat button funguje
- [ ] Task celebrations fungují
- [ ] Mood tracker funguje
- [ ] Notifikace přicházejí
- [ ] AI chat odpovídá

### Next Steps

1. Testovat s reálnými uživateli
2. Sbírat feedback
3. Upravit tón podle potřeby
4. Přidat do marketingu

---

**Potřebujete pomoc?**
- Email: support@svatbot.cz
- GitHub: [svatbot/issues](https://github.com/SpdVpr/svatbot/issues)

**Svatbot - Váš AI svatební kouč 🤖💕**

