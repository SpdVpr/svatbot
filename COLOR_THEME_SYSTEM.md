# 🎨 Systém barevných palet - Dokumentace

## 📋 Přehled

Implementován kompletní systém pro výběr barevných palet aplikace. Uživatelé si mohou vybrat z 6 světlých pastelových barevných témat, která se aplikují na celou aplikaci v reálném čase.

## ✨ Funkce

### 🎨 Dostupné barevné palety

1. **Růžová romance** (výchozí)
   - Jemná růžová s fialovými odstíny
   - Primární: #F8BBD9
   - Sekundární: #E1D5E7
   - Akcent: #F7DC6F

2. **Levandulový sen**
   - Uklidňující fialové tóny
   - Primární: #D4C5F9
   - Sekundární: #E9D5FF
   - Akcent: #FCD6FF

3. **Nebeská modř**
   - Svěží modré odstíny
   - Primární: #BAE6FD
   - Sekundární: #DBEAFE
   - Akcent: #FDE68A

4. **Mátová svěžest**
   - Osvěžující zelené tóny
   - Primární: #BBF7D0
   - Sekundární: #D1FAE5
   - Akcent: #FDE047

5. **Broskvový západ**
   - Teplé broskvové odstíny
   - Primární: #FECACA
   - Sekundární: #FED7AA
   - Akcent: #FDE68A

6. **Korálový útes**
   - Živé korálové barvy
   - Primární: #FBCFE8
   - Sekundární: #FED7AA
   - Akcent: #A7F3D0

### 🎯 Klíčové vlastnosti

- ✅ **Okamžitá aplikace** - Změny se projeví ihned bez refreshe stránky
- ✅ **Perzistence** - Výběr se ukládá do Firebase a localStorage
- ✅ **Per-user nastavení** - Každý uživatel má své vlastní téma
- ✅ **Globální aplikace** - Téma se aplikuje na celou aplikaci
- ✅ **Demo účet ochrana** - Zamčené demo účty nemohou měnit téma
- ✅ **Vizuální náhled** - Každá paleta zobrazuje barevné vzorky

## 🏗️ Architektura

### Nové soubory

```
src/
├── types/
│   └── colorTheme.ts              # Definice barevných palet a typů
├── hooks/
│   └── useColorTheme.ts           # Hook pro správu barevného tématu
└── components/
    └── theme/
        └── ColorThemeProvider.tsx # Provider pro aplikaci CSS proměnných
```

### Upravené soubory

```
src/
├── app/
│   ├── layout.tsx                 # Přidán ColorThemeProvider
│   └── globals.css                # Přidány CSS proměnné
├── components/
│   └── dashboard/
│       ├── FreeDragDrop.tsx       # Přidán color selector
│       └── SimpleDragDrop.tsx     # Přidán color selector
└── tailwind.config.js             # Aktualizovány barvy na CSS proměnné
```

## 🔧 Technická implementace

### 1. Definice barevných palet (`colorTheme.ts`)

```typescript
export type ColorTheme = 
  | 'rose' 
  | 'lavender' 
  | 'sky' 
  | 'mint' 
  | 'peach' 
  | 'coral'

export interface ColorPalette {
  id: ColorTheme
  name: string
  description: string
  colors: {
    primary: string
    primaryLight: string
    primaryDark: string
    secondary: string
    secondaryLight: string
    accent: string
    accentLight: string
    background: string
    backgroundAlt: string
  }
}
```

### 2. Hook pro správu tématu (`useColorTheme.ts`)

```typescript
export function useColorTheme() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  
  // Načítání z Firebase
  // Ukládání do Firebase + localStorage
  // Ochrana demo účtu
  
  return {
    colorTheme,
    currentPalette,
    changeTheme,
    loading,
    canChangeTheme
  }
}
```

### 3. Provider pro aplikaci CSS (`ColorThemeProvider.tsx`)

```typescript
export default function ColorThemeProvider({ children }) {
  const { currentPalette } = useColorTheme()

  useEffect(() => {
    // Aplikuje CSS proměnné na :root
    root.style.setProperty('--color-primary', colors.primary)
    // ... další proměnné
    
    // Aktualizuje background gradient
    body.className = body.className.replace(...)
  }, [currentPalette])

  return <>{children}</>
}
```

### 4. CSS proměnné (`globals.css`)

```css
:root {
  /* Dynamic color theme variables */
  --color-primary: #F8BBD9;
  --color-primary-light: #fce7f3;
  --color-primary-dark: #f472b6;
  --color-secondary: #E1D5E7;
  --color-secondary-light: #f3e8ff;
  --color-accent: #F7DC6F;
  --color-accent-light: #fef3c7;
}
```

### 5. Tailwind konfigurace

```javascript
colors: {
  primary: {
    50: 'var(--color-primary-light, #fdf2f8)',
    100: 'var(--color-primary-light, #fce7f3)',
    500: 'var(--color-primary, #F8BBD9)', // Dynamic
    // ...
  }
}
```

## 📍 Umístění ovládání

Výběr barevné palety je dostupný v **lište s úpravou layoutu** na dashboardu:

1. **FreeDragDrop** (pokročilý layout)
   - Pravá strana lišty
   - Mezi "Šířka plochy" a "Upravit layout"
   - Ikona palety 🎨

2. **SimpleDragDrop** (jednoduchý layout)
   - Pravá strana lišty
   - Před tlačítkem "Upravit layout"
   - Ikona palety 🎨

## 💾 Ukládání dat

### Firebase struktura

```
colorThemes/
  └── {userId}_{weddingId}
      ├── theme: 'rose' | 'lavender' | 'sky' | 'mint' | 'peach' | 'coral'
      ├── userId: string
      ├── weddingId: string
      └── updatedAt: timestamp
```

### localStorage

```javascript
localStorage.setItem('svatbot-color-theme-{userId}', theme)
```

## 🎨 UI komponenty

### Dropdown menu

- **Šířka**: 320px (w-80)
- **Pozice**: Absolute, zarovnáno vpravo
- **Styl**: Glassmorphism s backdrop-blur
- **Animace**: Smooth transitions
- **Z-index**: 50

### Položka palety

- **Název**: Zobrazuje název palety
- **Popis**: Krátký popisek
- **Barevné vzorky**: 3 kruhy s barvami (primary, secondary, accent)
- **Aktivní stav**: Checkmark ✓ a zvýraznění
- **Hover efekt**: Scale a změna pozadí

## 🔒 Bezpečnost

- ✅ Demo účty (zamčené) nemohou měnit téma
- ✅ Validace userId a weddingId před uložením
- ✅ Fallback na localStorage při selhání Firebase
- ✅ Výchozí téma při chybě načítání

## 🚀 Použití

### Pro uživatele

1. Přihlaste se do aplikace
2. Na dashboardu klikněte na ikonu palety 🎨 v pravé části lišty
3. Vyberte požadovanou barevnou paletu
4. Změny se aplikují okamžitě
5. Vaše volba se automaticky uloží

### Pro vývojáře

```typescript
// Použití hooku
import { useColorTheme } from '@/hooks/useColorTheme'

function MyComponent() {
  const { colorTheme, currentPalette, changeTheme } = useColorTheme()
  
  // Získání aktuálního tématu
  console.log(colorTheme) // 'rose'
  
  // Získání aktuální palety
  console.log(currentPalette.colors.primary) // '#F8BBD9'
  
  // Změna tématu
  changeTheme('lavender')
}
```

## 🎯 Budoucí vylepšení

- [ ] Vlastní barevné palety (user-defined)
- [ ] Import/export barevných schémat
- [ ] Tmavý režim pro každou paletu
- [ ] Náhled tématu před aplikací
- [ ] Barevná témata pro svatební web
- [ ] AI doporučení barev podle typu svatby

## 📝 Poznámky

- Všechny barvy jsou světlé pastelové odstíny pro svatební atmosféru
- Systém je navržen pro snadné přidání nových palet
- CSS proměnné umožňují dynamické změny bez rebuildu
- Kompatibilní se všemi moderními prohlížeči

