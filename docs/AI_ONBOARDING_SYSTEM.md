# 🤖 AI Onboarding System - Dokumentace

## 📋 Přehled

Kompletní AI-powered onboarding systém pro nové uživatele SvatBot aplikace. Systém automaticky provede uživatele aplikací, poradí s prvním nastavením a sleduje pokrok.

## ✨ Hlavní funkce

### 1. **Interaktivní průvodce (OnboardingWizard)**
- 9 kroků průvodce nastavením
- Progress bar s vizuálním sledováním pokroku
- Tipy od Svatbota pro každý krok
- Možnost přeskočit nebo vrátit se zpět
- Automatické zobrazení pro nové uživatele

### 2. **Dashboard Widget (OnboardingWidget)**
- Kompaktní widget na dashboardu
- Zobrazuje aktuální pokrok (X z 9 kroků)
- Ukazuje další doporučený krok
- Možnost otevřít plný průvodce
- Automaticky se skryje po dokončení

### 3. **Automatická detekce pokroku**
- Sleduje, které kroky uživatel dokončil
- Auto-detekce na základě dat (svatba, úkoly, hosté, rozpočet)
- Ukládá stav do Firestore
- Synchronizace napříč zařízeními

### 4. **Automatické notifikace (useAutoNotifications)**
- Uvítací notifikace pro nové uživatele
- Denní check-in zprávy
- Milestone countdown (365, 180, 100, 60, 30, 14, 7, 3, 1 dní)
- Gratulace k dokončeným úkolům
- Upozornění na úkoly po termínu
- Připomínky nadcházejících úkolů
- Tipy na relaxaci při stresu
- Připomínky vztahu (date night)

## 📁 Struktura souborů

```
src/
├── hooks/
│   ├── useOnboarding.ts              # Hook pro onboarding logiku
│   └── useAutoNotifications.ts       # Hook pro automatické notifikace
├── components/
│   └── onboarding/
│       ├── OnboardingWizard.tsx      # Plný průvodce modal
│       └── OnboardingWidget.tsx      # Kompaktní dashboard widget
└── types/
    └── dashboard.ts                  # Přidán 'onboarding-guide' modul
```

## 🎯 Onboarding kroky

### Krok 1: Vítejte 👋
- Představení Svatbota
- Vysvětlení funkcí AI kouče
- Motivační zpráva

### Krok 2: Základní informace 💑
- Nastavení data svatby
- Jména snoubenců
- Základní rozpočet
- **Auto-detekce**: Dokončeno když jsou vyplněna jména a datum

### Krok 3: První úkoly ✅
- Vytvoření prvních úkolů
- Doporučení začít s místem a fotografem
- **Auto-detekce**: Dokončeno když existuje alespoň 1 úkol

### Krok 4: Seznam hostů 👥
- Import nebo ruční přidání hostů
- Rozdělení do skupin
- **Auto-detekce**: Dokončeno když existuje alespoň 1 host

### Krok 5: Rozpočet 💰
- Nastavení celkového rozpočtu
- Tipy na průměrné ceny
- Doporučení rezervy 10-15%
- **Auto-detekce**: Dokončeno když je nastaven rozpočet > 0

### Krok 6: Časová osa 📅
- Vytvoření timeline příprav
- Doporučení kdy co dělat
- Milníky příprav

### Krok 7: Dodavatelé 🎯
- Prohlížení marketplace
- Přidání vlastních dodavatelů
- Porovnání nabídek

### Krok 8: Rozmístění hostů 🪑
- Vytvoření plánu stolů
- Drag & drop editor
- Lze udělat později (1-2 měsíce před)

### Krok 9: Prozkoumejte aplikaci 🚀
- Dokončení onboardingu
- Odkaz na další funkce
- AI chat, moodboard, svatební web

## 🔔 Automatické notifikace

### Typy notifikací

#### 1. **Uvítací notifikace**
```typescript
// Zobrazí se při prvním přihlášení
"🎉 Vítejte v SvatBot!"
"Jsem Svatbot, váš osobní AI svatební kouč!"
```

#### 2. **Denní check-in**
```typescript
// Každý den ráno
"Dobré ráno! ☀️"
"Nový den, nové možnosti!"
```

#### 3. **Milestone countdown**
```typescript
// Při důležitých milnících
"🎊 30 dní do svatby!"
"Už je to za rohem! Těšíme se s vámi! ✨"
```

#### 4. **Task celebrations**
```typescript
// Po dokončení úkolu
"🎉 Skvělá práce!"
"Dokončili jste: Rezervace místa"
```

#### 5. **Overdue reminders**
```typescript
// Úkoly po termínu
"⏰ Úkoly po termínu"
"Máte 3 úkoly po termínu. Pojďme to společně zvládnout! 💪"
```

#### 6. **Upcoming reminders**
```typescript
// Nadcházející úkoly
"📅 Úkoly na zítra"
"Zítra máte 2 úkoly k dokončení. Nezapomeňte! ✨"
```

#### 7. **Stress relief tips**
```typescript
// Náhodně (30% šance denně)
"Dýchejte! 🌬️"
"Když se cítíte přetížení, zkuste hluboké dýchání..."
```

#### 8. **Relationship reminders**
```typescript
// Náhodně (20% šance týdně)
"💑 Čas pro vás dva"
"Nezapomeňte si naplánovat večer jen pro sebe..."
```

### Frekvence kontrol

- **Každých 5 minut**: Kontrola nového dne a task completions
- **Denně**: Check-in, milestone check, task reminders
- **Náhodně**: Stress tips (30%), relationship reminders (20%)

## 🎨 UI Komponenty

### OnboardingWizard

**Props:**
```typescript
interface OnboardingWizardProps {
  onClose?: () => void
  autoShow?: boolean  // Default: true
}
```

**Funkce:**
- Automatické zobrazení pro nové uživatele
- Progress bar s procentuálním zobrazením
- Navigace vpřed/zpět
- Možnost přeskočit
- Tlačítka pro akce (např. "Přejít na úkoly")
- Dots navigation pro rychlý přesun

### OnboardingWidget

**Funkce:**
- Zobrazuje pokrok (X z 9 kroků)
- Progress bar
- Další doporučený krok
- Tlačítko "Otevřít průvodce"
- Seznam dokončených kroků
- Automaticky se skryje po dokončení

## 💾 Data struktura

### Firestore: `onboarding` collection

```typescript
{
  userId: string
  isNewUser: boolean
  hasCompletedOnboarding: boolean
  currentStep: number
  completedSteps: string[]  // ['welcome', 'basic-info', ...]
  showWelcome: boolean
  lastInteraction: Timestamp
  createdAt: Timestamp
}
```

### Firestore: `weddingNotifications` collection

```typescript
{
  userId: string
  type: WeddingNotificationType
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'task' | 'timeline' | 'budget' | 'guest' | 'vendor' | 'system'
  actionUrl?: string
  data?: any
  read: boolean
  createdAt: Timestamp
  expiresAt?: Timestamp
}
```

## 🚀 Použití

### 1. Dashboard integrace

```typescript
// src/components/dashboard/Dashboard.tsx
import { useAutoNotifications } from '@/hooks/useAutoNotifications'
import OnboardingWizard from '@/components/onboarding/OnboardingWizard'

function Dashboard() {
  // Aktivuje automatické notifikace
  useAutoNotifications()
  
  return (
    <>
      {/* Dashboard content */}
      
      {/* Onboarding wizard - auto-show pro nové uživatele */}
      <OnboardingWizard />
    </>
  )
}
```

### 2. Onboarding widget v modulu

```typescript
// src/components/dashboard/FreeDragDrop.tsx
import OnboardingWidget from '../onboarding/OnboardingWidget'

case 'onboarding-guide':
  return <OnboardingWidget />
```

### 3. Manuální použití hooku

```typescript
import { useOnboarding } from '@/hooks/useOnboarding'

function MyComponent() {
  const {
    onboardingState,
    steps,
    completeStep,
    getNextStep,
    getProgress
  } = useOnboarding()
  
  const nextStep = getNextStep()
  const progress = getProgress()  // 0-100%
  
  // Označit krok jako dokončený
  await completeStep('basic-info')
}
```

## 🎯 Best Practices

### Pro nové uživatele
1. ✅ Onboarding se zobrazí automaticky při prvním přihlášení
2. ✅ Widget je viditelný na dashboardu
3. ✅ Uvítací notifikace se zobrazí okamžitě
4. ✅ Denní check-in začne druhý den

### Pro existující uživatele
1. ✅ Onboarding se nezobrazí
2. ✅ Widget se zobrazí pouze pokud není dokončen
3. ✅ Automatické notifikace fungují normálně
4. ✅ Pokrok se detekuje automaticky

### Testování
```typescript
// Manuální trigger pro testování
const { triggerManualCheck } = useAutoNotifications()
await triggerManualCheck()
```

## 📊 Metriky a sledování

### Sledované události
- Dokončení jednotlivých kroků
- Celkové dokončení onboardingu
- Čas strávený v průvodci
- Přeskočení průvodce
- Interakce s notifikacemi

### Analytics
```typescript
// Příklad sledování
analytics.track('onboarding_step_completed', {
  step: 'basic-info',
  progress: 22,  // %
  timeSpent: 120  // seconds
})
```

## 🔧 Konfigurace

### Upravit kroky onboardingu

```typescript
// src/hooks/useOnboarding.ts
const ONBOARDING_STEPS = [
  {
    id: 'custom-step',
    title: 'Vlastní krok',
    description: 'Popis kroku',
    icon: '🎯',
    priority: 10,
    tips: ['Tip 1', 'Tip 2']
  }
]
```

### Upravit frekvenci notifikací

```typescript
// src/hooks/useAutoNotifications.ts

// Změnit interval kontrol (default: 5 minut)
const interval = setInterval(() => {
  runAutoChecks()
}, 10 * 60 * 1000)  // 10 minut

// Změnit pravděpodobnost tipů
if (Math.random() > 0.5) {  // 50% šance
  await sendStressReliefTip()
}
```

## 🎉 Výsledek

- ✅ Nový uživatel je proveden aplikací krok za krokem
- ✅ AI kouč poskytuje personalizované rady
- ✅ Automatické notifikace motivují a připomínají
- ✅ Pokrok je sledován a ukládán
- ✅ Uživatel ví, co dělat jako první
- ✅ Snížení bounce rate nových uživatelů
- ✅ Zvýšení engagement a retention

