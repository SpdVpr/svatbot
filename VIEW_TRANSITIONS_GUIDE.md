# View Transitions API - Implementační Průvodce

## ✅ IMPLEMENTOVÁNO V PROJEKTU

View Transitions API je **plně implementováno** v následujících komponentách:

### 🎯 Implementované komponenty

1. **SimpleToast** (`src/components/notifications/SimpleToast.tsx`)
   - ✅ Toast notifikace s plynulým slide-in efektem
   - ✅ Každý toast má unikátní view-transition-name

2. **AccountModal** (`src/components/account/AccountModal.tsx`)
   - ✅ Modal s fade + scale animací
   - ✅ Backdrop s blur efektem
   - ✅ Zabránění scrollování pozadí

3. **NotesModal** (`src/components/notes/NotesModal.tsx`)
   - ✅ Modal s fade + scale animací
   - ✅ Backdrop s blur efektem
   - ✅ Zabránění scrollování pozadí

4. **WeddingSettings** (`src/components/wedding/WeddingSettings.tsx`)
   - ✅ Modal s fade + scale animací
   - ✅ Backdrop s blur efektem
   - ✅ Zabránění scrollování pozadí

5. **MobileMenu** (`src/components/navigation/MobileMenu.tsx`)
   - ✅ Sidebar s slide animací
   - ✅ Backdrop s blur efektem
   - ✅ Zabránění scrollování pozadí

6. **Dashboard** (`src/components/dashboard/Dashboard.tsx`)
   - ✅ Všechny modály se otevírají/zavírají s View Transitions
   - ✅ Helper funkce pro konzistentní použití

---

## 📖 Obsah

1. [Co je View Transitions API](#co-je-view-transitions-api)
2. [Proč používat View Transitions](#proč-používat-view-transitions)
3. [Implementace v projektu](#implementace-v-projektu)
4. [Použití](#použití)
5. [Příklady](#příklady)
6. [Browser Support](#browser-support)
7. [Best Practices](#best-practices)

---

## Co je View Transitions API

View Transitions API je nová webová technologie, která umožňuje vytvářet plynulé animace mezi různými stavy UI **bez nutnosti složitých animačních knihoven**.

### Klíčové výhody:
- ✅ **Nativní browser API** - žádné externí závislosti
- ✅ **Automatické animace** - browser se stará o interpolaci
- ✅ **Výkonné** - využívá GPU akceleraci
- ✅ **Jednoduché použití** - pár řádků kódu
- ✅ **Fallback support** - graceful degradation pro starší prohlížeče

---

## Proč používat View Transitions

### Před (bez View Transitions):
```tsx
// Složité animace s framer-motion nebo CSS transitions
const [isOpen, setIsOpen] = useState(false)

<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.3 }}
>
  Modal content
</motion.div>
```

### Po (s View Transitions):
```tsx
// Jednoduché a čisté
const { startTransition } = useViewTransition()

<div style={{ viewTransitionName: 'modal' }}>
  Modal content
</div>

// Animace se děje automaticky!
startTransition(() => setIsOpen(!isOpen))
```

---

## Implementace v projektu

### 1. Soubory

#### Hook: `src/hooks/useViewTransition.ts`
Poskytuje React hook pro snadné použití View Transitions API.

**Funkce:**
- `useViewTransition()` - základní hook
- `useFloatingTransition()` - specializovaný hook pro floating elements
- `getViewTransitionName()` - utility pro přidání view-transition-name

#### CSS: `src/styles/view-transitions.css`
Definuje animace pro různé typy elementů:
- Modals
- Toasts
- Floating buttons
- Dropdowns
- Sidebars
- Cards

#### Komponenty: `src/components/common/ViewTransitionModal.tsx`
Ready-to-use komponenty:
- `ViewTransitionModal` - Modal s animacemi
- `ViewTransitionToast` - Toast notifikace
- `ViewTransitionFloatingButton` - Plovoucí tlačítko

### 2. Import v globals.css

```css
/* Import View Transitions API styles (Next.js 16) */
@import '../styles/view-transitions.css';
```

---

## Použití

### Základní použití

```tsx
import { useViewTransition } from '@/hooks/useViewTransition'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)
  const { startTransition } = useViewTransition()

  const handleToggle = () => {
    startTransition(() => {
      setIsOpen(!isOpen)
    })
  }

  return (
    <div>
      <button onClick={handleToggle}>Toggle</button>
      {isOpen && (
        <div style={{ viewTransitionName: 'my-element' }}>
          Content
        </div>
      )}
    </div>
  )
}
```

### Floating Elements

```tsx
import { useFloatingTransition } from '@/hooks/useViewTransition'

function FloatingModal() {
  const [isOpen, setIsOpen] = useState(false)
  const { animateModal } = useFloatingTransition()

  const handleOpen = () => {
    animateModal(() => setIsOpen(true))
  }

  return (
    <div>
      <button onClick={handleOpen}>Open Modal</button>
      {isOpen && (
        <div style={{ viewTransitionName: 'modal' }}>
          Modal content
        </div>
      )}
    </div>
  )
}
```

### Ready-to-use komponenty

```tsx
import ViewTransitionModal from '@/components/common/ViewTransitionModal'

function MyPage() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ViewTransitionModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Můj Modal"
      transitionName="my-modal"
    >
      <p>Obsah modalu</p>
    </ViewTransitionModal>
  )
}
```

---

## Příklady

### 1. Modal Dialog

```tsx
import { useFloatingTransition, getViewTransitionName } from '@/hooks/useViewTransition'

function MyModal({ isOpen, onClose }) {
  const { animateModal } = useFloatingTransition()

  const handleClose = () => {
    animateModal(() => onClose())
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="absolute inset-0 bg-black/50"
        style={getViewTransitionName('modal-backdrop')}
      />
      <div 
        className="relative bg-white rounded-lg p-6"
        style={getViewTransitionName('modal')}
      >
        <button onClick={handleClose}>Close</button>
        <p>Modal content</p>
      </div>
    </div>
  )
}
```

### 2. Toast Notification

```tsx
import { ViewTransitionToast } from '@/components/common/ViewTransitionModal'

function MyComponent() {
  const [showToast, setShowToast] = useState(false)

  return (
    <>
      <button onClick={() => setShowToast(true)}>
        Show Toast
      </button>

      <ViewTransitionToast
        isVisible={showToast}
        type="success"
        title="Success!"
        message="Operation completed successfully"
        onClose={() => setShowToast(false)}
      />
    </>
  )
}
```

### 3. Floating Button

```tsx
import { ViewTransitionFloatingButton } from '@/components/common/ViewTransitionModal'
import { MessageCircle } from 'lucide-react'

function MyApp() {
  const [showButton, setShowButton] = useState(true)

  return (
    <ViewTransitionFloatingButton
      isVisible={showButton}
      onClick={() => console.log('Clicked!')}
      icon={<MessageCircle className="w-6 h-6" />}
      label="Chat s námi"
      position="bottom-right"
    />
  )
}
```

### 4. Expandable Card

```tsx
import { useViewTransition } from '@/hooks/useViewTransition'

function ExpandableCard() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { startTransition } = useViewTransition()

  const handleToggle = () => {
    startTransition(() => {
      setIsExpanded(!isExpanded)
    })
  }

  return (
    <div 
      onClick={handleToggle}
      style={{ viewTransitionName: 'card-1' }}
      className="border rounded-lg p-4 cursor-pointer"
    >
      <h3>Card Title</h3>
      {isExpanded && (
        <p>Expanded content with smooth animation!</p>
      )}
    </div>
  )
}
```

---

## Browser Support

### Podporované prohlížeče:
- ✅ Chrome 111+
- ✅ Edge 111+
- ✅ Opera 97+
- ⚠️ Safari 18+ (částečná podpora)
- ❌ Firefox (zatím nepodporováno)

### Fallback strategie:
Náš hook automaticky detekuje podporu a poskytuje fallback:

```tsx
const { startTransition, isSupported } = useViewTransition()

if (isSupported) {
  // Použije View Transitions API
  startTransition(() => setState(newState))
} else {
  // Okamžitá změna bez animace
  setState(newState)
}
```

---

## Best Practices

### 1. Unikátní view-transition-name
Každý element musí mít **unikátní** `view-transition-name`:

```tsx
// ✅ SPRÁVNĚ
<div style={{ viewTransitionName: 'modal-1' }}>Modal 1</div>
<div style={{ viewTransitionName: 'modal-2' }}>Modal 2</div>

// ❌ ŠPATNĚ - duplicitní názvy
<div style={{ viewTransitionName: 'modal' }}>Modal 1</div>
<div style={{ viewTransitionName: 'modal' }}>Modal 2</div>
```

### 2. Použijte utility funkce

```tsx
import { getViewTransitionName } from '@/hooks/useViewTransition'

// Místo:
<div style={{ viewTransitionName: 'my-element' }}>

// Použijte:
<div style={getViewTransitionName('my-element')}>
```

### 3. Accessibility - Reduced Motion

CSS automaticky respektuje `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-duration: 0.01ms !important;
  }
}
```

### 4. Performance

View Transitions jsou výkonné, ale:
- ✅ Používejte pro floating elements (modals, toasts, dropdowns)
- ✅ Používejte pro page transitions
- ⚠️ Nepoužívejte pro každý malý element
- ⚠️ Nepoužívejte pro rychle se měnící elementy (např. každý frame animace)

### 5. Debugging

Pro debugging přidejte do CSS:

```css
::view-transition-old(*),
::view-transition-new(*) {
  outline: 2px solid red;
}
```

---

## Demo

Navštivte demo stránku pro živé příklady:

```
http://localhost:3000/view-transitions-demo
```

Nebo v produkci:
```
https://svatbot.cz/view-transitions-demo
```

---

## Další zdroje

- [MDN - View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [Chrome Developers - Smooth transitions](https://developer.chrome.com/docs/web-platform/view-transitions/)
- [Can I Use - View Transitions](https://caniuse.com/view-transitions)

---

## Závěr

View Transitions API je **game-changer** pro moderní webové aplikace. Poskytuje:
- 🚀 Nativní výkon
- 🎨 Krásné animace
- 💻 Jednoduché API
- 📱 Skvělou UX

**Začněte používat View Transitions dnes a vylepšete UX vaší aplikace!** 🎉

