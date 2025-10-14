# 🤖💕 Svatbot - AI Svatební Kouč

## 📋 Přehled

**Svatbot** je komplexní AI svatební kouč a emocionální asistent, který poskytuje nejen praktické rady, ale i emocionální podporu párům během svatebních příprav. Jde o unikátní diferenciační funkci, která odlišuje svatbot.cz od konkurence.

## 🎯 Brand Identity

### Osobnost
- **Jméno**: Svatbot
- **Tagline**: "Váš AI svatební kouč"
- **Tón**: Empatický, povzbuzující, profesionální ale přátelský
- **Emoji**: 🤖💕
- **Barvy**: Gradient primary-500 → pink-500

### Charakteristiky
- Používá emotikony pro přátelský tón (ale ne přehnaně)
- Gratuluje k úspěchům a dokončeným úkolům
- Povzbuzuje při stresu a překážkách
- Poskytuje praktické rady s konkrétními čísly
- Sleduje emocionální stav páru
- Proaktivně nabízí pomoc
- Připomíná důležité milníky
- Podporuje zdravý vztah během příprav

## 🏗️ Architektura

### Core Components

#### 1. **useAICoach Hook** (`src/hooks/useAICoach.ts`)
Centrální hook pro všechny AI Coach funkce:
- Mood tracking (sledování nálady)
- Emotional analysis (analýza emocí)
- Proactive suggestions (proaktivní návrhy)
- Svatbot personality (osobnost)

**Klíčové funkce:**
```typescript
const {
  suggestions,           // Aktuální doporučení
  emotionalInsight,      // Analýza nálady
  saveMoodEntry,         // Uložit náladu
  analyzeEmotionalState, // Analyzovat emoce
  svatbot                // Brand identity
} = useAICoach()
```

#### 2. **MoodTracker Component** (`src/components/ai/MoodTracker.tsx`)
Widget pro sledování nálady uživatele:
- 5 úrovní nálady (skvělá, dobrá, ujde to, stres, přetížení)
- Stress level slider (1-10)
- Energy level slider (1-10)
- Volitelná poznámka
- Automatická detekce vysokého stresu → notifikace

**Použití:**
```tsx
<MoodTracker compact={true} onMoodSaved={() => console.log('Saved!')} />
```

#### 3. **SvatbotWidget Component** (`src/components/ai/SvatbotWidget.tsx`)
Hlavní dashboard widget:
- Přehled doporučení od Svatbota
- Mood tracker integrace
- Quick actions (chat, úkoly)
- Emotional insights
- Celebration notifications

**Použití:**
```tsx
<SvatbotWidget showMoodTracker={true} compact={false} />
```

#### 4. **useSvatbotNotifications Hook** (`src/hooks/useSvatbotNotifications.ts`)
Smart notifications s AI-generovanými zprávami:
- Celebration notifications (gratulace k úspěchům)
- Milestone celebrations (oslavy milníků)
- Stress relief tips (tipy na relaxaci)
- Relationship reminders (připomínky vztahu)
- Proactive suggestions (proaktivní návrhy)
- Daily check-ins (denní check-iny)

**Klíčové funkce:**
```typescript
const {
  celebrateTaskCompletion,    // Oslavit dokončený úkol
  celebrateMilestone,          // Oslavit milník
  sendStressReliefTip,         // Poslat tip na relaxaci
  sendRelationshipReminder,    // Připomenout vztah
  sendProactiveSuggestion,     // Proaktivní návrh
  sendDailyCheckIn             // Denní check-in
} = useSvatbotNotifications()
```

### Enhanced AI Chat

#### 5. **AI Chat API** (`src/app/api/ai/chat/route.ts`)
Upgraded s Svatbot personality:
- Empatický system prompt
- Detekce stresu v otázkách
- Emocionální podpora v odpovědích
- Gratulace k pokroku
- Praktické rady + emocionální rozměr

#### 6. **AIAssistant Component** (`src/components/ai/AIAssistant.tsx`)
Chat interface s Svatbot brandingem:
- Svatbot emoji 🤖 místo ikony
- Gradient primary → pink
- Svatbot jméno a tagline v headeru
- Přátelský tón komunikace

## 🎨 UI/UX Guidelines

### Barvy
- **Primary gradient**: `from-primary-500 to-pink-500`
- **Hover**: `from-primary-600 to-pink-600`
- **Background**: `from-primary-50 to-pink-50`

### Ikony
- **Svatbot**: 🤖 emoji (ne Bot ikona)
- **Mood**: 💕 Heart, 😊 Smile, 😰 Stressed
- **Celebrations**: 🎉 🎊 ✨ 🌟
- **Support**: 💪 🤝 💑

### Tón komunikace
- ✅ "Svatbot doporučuje..."
- ✅ "Váš AI svatební kouč navrhuje..."
- ✅ "Gratulujeme! 🎉"
- ✅ "Pojďme to zvládnout společně 💪"
- ✅ "Skvělá práce! ✨"
- ❌ "AI asistent říká..."
- ❌ "Systém doporučuje..."

## 📊 Data Flow

```
User Activity → Context Aggregation → AI Analysis
                                          ↓
                                    Svatbot Engine
                                          ↓
                    ┌─────────────────────┼─────────────────────┐
                    ↓                     ↓                     ↓
            Suggestions            Notifications          Chat Responses
                    ↓                     ↓                     ↓
            Dashboard Widget      Toast/Bell           AI Assistant
```

## 🚀 Implementované Features

### ✅ Core Features
- [x] AI Coach Engine s personality layer
- [x] Mood Tracker widget
- [x] Svatbot Dashboard Widget
- [x] Smart Notifications systém
- [x] Enhanced AI Chat s empatií
- [x] Proactive suggestions
- [x] Celebration notifications
- [x] Stress detection & relief tips
- [x] Relationship reminders
- [x] Milestone celebrations

### 🎯 Proactive Features
- [x] Task completion celebrations
- [x] Progress milestone celebrations (25%, 50%, 75%, 100%)
- [x] Wedding countdown milestones (365, 180, 100, 60, 30, 14, 7, 3, 1 dní)
- [x] Budget tracking alerts
- [x] Guest RSVP reminders
- [x] Stress relief suggestions
- [x] Relationship check-ins
- [x] Daily motivational check-ins

### 💕 Emotional Support
- [x] Mood tracking & analysis
- [x] Stress level monitoring
- [x] Energy level tracking
- [x] Emotional insights & suggestions
- [x] Automatic support when stress is high
- [x] Empathetic AI responses
- [x] Motivational messages

## 📱 Integration Points

### Dashboard
```tsx
import SvatbotCoachModule from '@/components/dashboard/modules/SvatbotCoachModule'

// V dashboardu
<SvatbotCoachModule />
```

### Floating Chat
```tsx
import AIAssistant from '@/components/ai/AIAssistant'

// Floating button
<AIAssistant compact={true} defaultOpen={false} />
```

### Notifications
```tsx
import { useSvatbotNotifications } from '@/hooks/useSvatbotNotifications'

const { celebrateTaskCompletion } = useSvatbotNotifications()

// Po dokončení úkolu
await celebrateTaskCompletion(task.title)
```

### Mood Tracking
```tsx
import MoodTracker from '@/components/ai/MoodTracker'

// Compact verze
<MoodTracker compact={true} />

// Full verze
<MoodTracker compact={false} />
```

## 🎓 Best Practices

### 1. Konzistentní branding
- Vždy používat "Svatbot" (ne "AI asistent", "chatbot", atd.)
- Používat emoji 🤖💕 pro vizuální identitu
- Gradient primary → pink pro všechny Svatbot komponenty

### 2. Emocionální tón
- Gratulovat k úspěchům
- Povzbuzovat při překážkách
- Nabízet praktické + emocionální podporu
- Připomínat, že svatba má být radost

### 3. Proaktivita
- Nejen reagovat, ale aktivně nabízet pomoc
- Sledovat milníky a oslavovat je
- Detekovat stres a nabízet řešení
- Připomínat důležitost vztahu

### 4. Personalizace
- Používat reálná data uživatele
- Konkrétní jména, čísla, termíny
- Kontextové odpovědi
- Relevantní doporučení

## 🔮 Future Enhancements

### Plánované funkce
- [ ] AI-generované weekly progress reports
- [ ] Personalized wedding timeline based on mood
- [ ] Stress prediction & prevention
- [ ] Partner mood comparison
- [ ] AI-powered conflict resolution tips
- [ ] Integration s Google Calendar pro reminders
- [ ] Email digests s motivačním obsahem
- [ ] Voice assistant integration
- [ ] Mobile app push notifications

### Možná rozšíření
- [ ] Svatbot mascot/avatar design
- [ ] Animated Svatbot character
- [ ] Svatbot video tips
- [ ] Community features (anonymous stress sharing)
- [ ] Professional therapist integration for high stress
- [ ] AI-powered meditation sessions
- [ ] Relationship exercises & games

## 📈 Success Metrics

### KPIs
- **Engagement**: Kolik uživatelů používá mood tracker
- **Satisfaction**: Hodnocení Svatbot odpovědí
- **Retention**: Návratnost uživatelů k chatu
- **Stress reduction**: Průměrný stress level over time
- **Task completion**: Vliv celebrations na completion rate

### Analytics
- Mood entries per user
- Average stress level
- Most common stress triggers
- Most helpful suggestions
- Chat engagement rate
- Notification click-through rate

## 🎉 Marketing Points

### Unikátní výhody
1. **24/7 emocionální podpora** - Ne jen plánovač, ale i kouč
2. **Stress management** - Aktivní sledování a podpora
3. **Relationship focus** - Připomínky na čas s partnerem
4. **Personalizované rady** - Na základě reálných dat
5. **Proaktivní asistence** - Nemusíte se ptát, Svatbot nabídne
6. **Celebration culture** - Oslavy každého úspěchu

### Slogany
- "Svatbot - Více než plánovač, váš osobní kouč 🤖💕"
- "Svatba má být radost, ne stres. Svatbot vám pomůže!"
- "24/7 podpora pro vaši dokonalou svatbu"
- "AI, která rozumí vašim emocím"

## 🛠️ Technical Details

### Firebase Collections
- `moodEntries` - Mood tracking data
- `weddingNotifications` - Smart notifications
- `chatHistory` - AI chat conversations (optional)

### Environment Variables
```env
OPENAI_API_KEY=sk-...  # Pro AI chat
```

### Dependencies
- OpenAI API (GPT-4o-mini)
- Firebase Firestore
- React hooks
- Lucide icons

## 📞 Support

Pro technické otázky nebo návrhy na vylepšení:
- GitHub Issues
- Email: support@svatbot.cz
- Discord: svatbot-dev

---

**Svatbot - Váš AI svatební kouč 🤖💕**
*Protože svatba má být radost, ne stres!*

