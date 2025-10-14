# 🤖💕 Svatbot AI Coach - Implementační Průvodce

## 🎯 Co bylo implementováno

Kompletní **Svatbot - AI Svatební Kouč** systém s následujícími funkcemi:

### ✅ Core Components
1. **useAICoach Hook** - Centrální AI engine s personality layer
2. **MoodTracker** - Widget pro sledování nálady
3. **SvatbotWidget** - Dashboard widget s doporučeními
4. **useSvatbotNotifications** - Smart notifications systém
5. **Enhanced AI Chat** - Upgraded s empatickou osobností
6. **SvatbotCoachModule** - Dashboard modul

### ✅ Features
- 🎉 Celebration notifications (gratulace k úspěchům)
- 🎊 Milestone celebrations (oslavy milníků)
- 💕 Emotional support (emocionální podpora)
- 🧘 Stress relief tips (tipy na relaxaci)
- 💑 Relationship reminders (připomínky vztahu)
- 📊 Mood tracking & analysis (sledování nálady)
- 🤖 Proactive suggestions (proaktivní návrhy)
- ✨ Daily check-ins (denní check-iny)

## 📁 Nové soubory

```
src/
├── hooks/
│   ├── useAICoach.ts                    # Core AI Coach engine
│   └── useSvatbotNotifications.ts       # Smart notifications
├── components/
│   ├── ai/
│   │   ├── MoodTracker.tsx              # Mood tracking widget
│   │   ├── SvatbotWidget.tsx            # Dashboard widget
│   │   └── AIAssistant.tsx              # Updated s Svatbot branding
│   └── dashboard/
│       └── modules/
│           └── SvatbotCoachModule.tsx   # Dashboard modul
└── app/
    └── api/
        └── ai/
            └── chat/
                └── route.ts              # Updated s Svatbot personality

docs/
└── SVATBOT_AI_COACH.md                  # Kompletní dokumentace

SVATBOT_IMPLEMENTATION_GUIDE.md          # Tento soubor
```

## 🚀 Jak použít

### 1. Dashboard Integration

Přidat Svatbot modul do dashboardu:

```tsx
// src/components/dashboard/Dashboard.tsx
import SvatbotCoachModule from '@/components/dashboard/modules/SvatbotCoachModule'

// V module definitions
const modules = [
  {
    id: 'svatbot-coach',
    title: 'Svatbot - Váš AI Kouč',
    component: SvatbotCoachModule,
    defaultSize: { w: 2, h: 3 },
    minSize: { w: 2, h: 2 },
    icon: '🤖'
  },
  // ... ostatní moduly
]
```

### 2. Floating Chat Button

Přidat floating Svatbot chat button:

```tsx
// src/app/layout.tsx nebo Dashboard.tsx
import AIAssistant from '@/components/ai/AIAssistant'

export default function Layout() {
  return (
    <>
      {/* Váš obsah */}
      
      {/* Floating Svatbot chat */}
      <AIAssistant compact={true} defaultOpen={false} />
    </>
  )
}
```

### 3. Task Completion Celebrations

Automaticky gratulovat při dokončení úkolu:

```tsx
// src/hooks/useTask.ts nebo TaskCard.tsx
import { useSvatbotNotifications } from '@/hooks/useSvatbotNotifications'

const { celebrateTaskCompletion } = useSvatbotNotifications()

// Po dokončení úkolu
const completeTask = async (taskId: string) => {
  const task = tasks.find(t => t.id === taskId)
  
  // Označit jako dokončený
  await updateTask(taskId, { status: 'completed' })
  
  // Svatbot gratulace
  if (task) {
    await celebrateTaskCompletion(task.title)
  }
}
```

### 4. Milestone Celebrations

Oslavit milníky pokroku:

```tsx
// src/hooks/useWedding.ts
import { useSvatbotNotifications } from '@/hooks/useSvatbotNotifications'

const { celebrateMilestone } = useSvatbotNotifications()

// Při aktualizaci pokroku
const updateProgress = async (newProgress: number) => {
  await updateWedding({ progress: newProgress })
  
  // Oslavit milníky
  if ([25, 50, 75, 100].includes(newProgress)) {
    await celebrateMilestone('progress', newProgress)
  }
}
```

### 5. Mood Tracking Page

Vytvořit samostatnou stránku pro mood tracking:

```tsx
// src/app/mood/page.tsx
import MoodTracker from '@/components/ai/MoodTracker'

export default function MoodPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Sledování nálady</h1>
      <MoodTracker compact={false} />
    </div>
  )
}
```

### 6. Proactive Notifications

Nastavit proaktivní notifikace (např. denní check-in):

```tsx
// src/app/api/cron/daily-checkin/route.ts
import { useSvatbotNotifications } from '@/hooks/useSvatbotNotifications'

export async function GET() {
  const { sendDailyCheckIn } = useSvatbotNotifications()
  
  // Poslat denní check-in všem uživatelům
  await sendDailyCheckIn()
  
  return Response.json({ success: true })
}
```

## 🎨 Branding Guidelines

### Konzistentní terminologie

✅ **Používat:**
- "Svatbot"
- "Váš AI svatební kouč"
- "Svatbot doporučuje..."
- "Gratulujeme! 🎉"
- "Pojďme to zvládnout společně 💪"

❌ **Nepoužívat:**
- "AI asistent"
- "Chatbot"
- "Systém doporučuje..."
- "AI říká..."

### Vizuální identita

**Barvy:**
```css
/* Primary gradient */
background: linear-gradient(to right, #primary-500, #pink-500);

/* Hover */
background: linear-gradient(to right, #primary-600, #pink-600);

/* Background */
background: linear-gradient(to right, #primary-50, #pink-50);
```

**Ikony:**
- Svatbot: 🤖 (emoji, ne Bot ikona)
- Mood: 💕 😊 😰
- Celebrations: 🎉 🎊 ✨ 🌟
- Support: 💪 🤝 💑

## 📊 Firebase Setup

### Nové kolekce

```typescript
// moodEntries collection
interface MoodEntry {
  id: string
  userId: string
  weddingId: string
  mood: 'great' | 'good' | 'okay' | 'stressed' | 'overwhelmed'
  stressLevel: number  // 1-10
  energyLevel: number  // 1-10
  note?: string
  createdAt: Timestamp
}

// Firestore rules
match /moodEntries/{entryId} {
  allow read, write: if request.auth != null 
    && request.auth.uid == resource.data.userId;
}
```

### Indexy

Vytvořit composite indexy ve Firebase Console:
- `moodEntries`: `userId` (ASC) + `createdAt` (DESC)
- `weddingNotifications`: `userId` (ASC) + `createdAt` (DESC) + `read` (ASC)

## 🧪 Testing

### Test Svatbot Chat

```bash
# Otevřít aplikaci
npm run dev

# Navigovat na /ai
# Kliknout na Svatbot chat button
# Zkusit otázky:
- "Jak se mám připravit na svatbu?"
- "Jsem ve stresu, co mám dělat?"
- "Kolik mám dokončených úkolů?"
```

### Test Mood Tracker

```bash
# Navigovat na dashboard
# Najít Svatbot widget
# Kliknout na mood (např. "Stres")
# Nastavit stress level na 8+
# Uložit
# Zkontrolovat notifikace - měla by přijít podpůrná zpráva
```

### Test Celebrations

```bash
# Dokončit úkol
# Zkontrolovat notifikace
# Měla by přijít gratulační zpráva od Svatbota
```

## 🔧 Configuration

### Environment Variables

```env
# .env.local
OPENAI_API_KEY=sk-...  # Pro AI chat (povinné)
```

### Customization

Upravit Svatbot personality v `src/hooks/useAICoach.ts`:

```typescript
export const SVATBOT_PERSONALITY = {
  name: 'Svatbot',  // Změnit jméno
  tagline: 'Váš AI svatební kouč',  // Změnit tagline
  tone: 'empatický, povzbuzující...',  // Upravit tón
  // ...
}
```

## 📈 Analytics & Monitoring

### Sledovat metriky

```typescript
// src/lib/analytics.ts
export const SVATBOT_EVENTS = {
  MOOD_TRACKED: 'svatbot_mood_tracked',
  SUGGESTION_CLICKED: 'svatbot_suggestion_clicked',
  CHAT_MESSAGE_SENT: 'svatbot_chat_message',
  CELEBRATION_SHOWN: 'svatbot_celebration_shown',
  STRESS_RELIEF_SENT: 'svatbot_stress_relief'
}

// Použití
trackEvent(SVATBOT_EVENTS.MOOD_TRACKED, {
  mood: 'stressed',
  stressLevel: 8
})
```

## 🐛 Troubleshooting

### Svatbot neodpovídá v chatu

**Problém:** Chat vrací "momentálně nejsem dostupný"

**Řešení:**
1. Zkontrolovat `OPENAI_API_KEY` v `.env.local`
2. Ověřit, že API key je platný
3. Zkontrolovat OpenAI API limity

### Notifikace se neodesílají

**Problém:** Celebration notifications nepřicházejí

**Řešení:**
1. Zkontrolovat Firebase Firestore rules
2. Ověřit, že `weddingNotifications` kolekce existuje
3. Zkontrolovat console pro chyby

### Mood tracker neuloží data

**Problém:** Po kliknutí na "Uložit" se nic nestane

**Řešení:**
1. Zkontrolovat Firebase connection
2. Ověřit Firestore rules pro `moodEntries`
3. Zkontrolovat browser console pro chyby

## 🚀 Deployment

### Vercel Deployment

```bash
# Build test
npm run build

# Deploy
vercel --prod

# Nastavit environment variables ve Vercel dashboard:
# OPENAI_API_KEY=sk-...
```

### Firebase Setup

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

## 📚 Další dokumentace

- **Kompletní dokumentace**: `docs/SVATBOT_AI_COACH.md`
- **API dokumentace**: `docs/API.md`
- **Component docs**: Inline JSDoc v souborech

## 🎉 Next Steps

### Doporučené další kroky:

1. **Přidat Svatbot do dashboardu**
   - Integrovat `SvatbotCoachModule` do dashboard modules
   - Nastavit default pozici a velikost

2. **Nastavit proaktivní notifikace**
   - Implementovat cron job pro denní check-iny
   - Nastavit milestone tracking

3. **Testovat s reálnými uživateli**
   - Beta test s několika páry
   - Sbírat feedback na tón a užitečnost

4. **Marketing**
   - Vytvořit landing page sekci o Svatbotovi
   - Přidat do onboardingu představení Svatbota
   - Social media posts o AI kouči

5. **Analytics**
   - Nastavit tracking pro všechny Svatbot interakce
   - Sledovat engagement a satisfaction

## 💡 Tips & Best Practices

### Pro vývojáře

1. **Vždy používat Svatbot branding**
   - Konzistentní terminologie
   - Správné barvy a ikony

2. **Testovat emocionální tón**
   - Odpovědi by měly být empatické
   - Gratulace by měly být upřímné

3. **Respektovat privacy**
   - Mood data jsou citlivá
   - Nikdy nesdílet bez souhlasu

### Pro designéry

1. **Svatbot má osobnost**
   - Přátelský, ne robotický
   - Empatický, ne chladný

2. **Vizuální konzistence**
   - Vždy gradient primary → pink
   - Vždy emoji 🤖, ne ikona

3. **Accessibility**
   - Dostatečný kontrast
   - Screen reader friendly

## 🤝 Contributing

Máte nápad na vylepšení Svatbota?

1. Fork repository
2. Vytvořit feature branch
3. Implementovat změny
4. Otestovat
5. Vytvořit Pull Request

## 📞 Support

- **Email**: support@svatbot.cz
- **GitHub Issues**: [svatbot/issues](https://github.com/SpdVpr/svatbot/issues)
- **Discord**: svatbot-dev

---

**Svatbot - Váš AI svatební kouč 🤖💕**

*Implementováno s láskou pro páry plánující svatbu* ✨

*Verze: 1.0.0*
*Datum: 2025-01-14*

