# 🎨 Průvodce animacemi pro svatební šablony

Tento dokument popisuje, jak používat pokročilé animace ve svatebních šablonách.

## 📚 Obsah

1. [Základní použití](#základní-použití)
2. [Dostupné animace](#dostupné-animace)
3. [Helper komponenty](#helper-komponenty)
4. [Best practices](#best-practices)
5. [Příklady](#příklady)

---

## Základní použití

### CSS třídy

Všechny animace jsou dostupné jako CSS třídy. Stačí je přidat k elementu:

```tsx
<div className="scale-in">
  Tento element se animovaně zobrazí
</div>
```

### S delay (zpožděním)

Pro postupné zobrazování použijte `style` prop:

```tsx
<div className="slide-in-left" style={{ animationDelay: '0.3s' }}>
  Tento element se zobrazí po 300ms
</div>
```

---

## Dostupné animace

### 1. **Fade & Scale**

- `fade-in` - Postupné zobrazení (opacity 0 → 1)
- `scale-in` - Zvětšení z malého (scale 0.8 → 1)
- `zoom-in` - Rychlé přiblížení (scale 0 → 1)

**Použití:**
```tsx
<h1 className="scale-in">Nadpis</h1>
<p className="fade-in" style={{ animationDelay: '0.2s' }}>Text</p>
```

### 2. **Slide Animations**

- `slide-in-left` - Vjezd zleva
- `slide-in-right` - Vjezd zprava
- `slide-in-bottom` - Vjezd zdola
- `slide-up` - Posun nahoru

**Použití:**
```tsx
<div className="slide-in-left">Jméno nevěsty</div>
<div className="slide-in-right">Jméno ženicha</div>
```

### 3. **Bounce & Elastic**

- `bounce-in` - Odskočení při zobrazení
- `elastic-bounce` - Elastický odskok
- `bounce-gentle` - Jemné opakované poskakování

**Použití:**
```tsx
<div className="bounce-in">Datum svatby</div>
<Heart className="bounce-gentle" />
```

### 4. **Rotation**

- `rotate-in` - Rotace při zobrazení
- `flip-in` - Překlopení
- `float-rotate` - Plovoucí rotace (nekonečná)

**Použití:**
```tsx
<div className="rotate-in">Karta</div>
<Heart className="float-rotate" />
```

### 5. **Float & Pulse**

- `float` - Plovoucí pohyb nahoru/dolů
- `heartbeat` - Pulzování jako srdce
- `pulse-glow` - Pulzující záře
- `shimmer` - Lesklý efekt

**Použití:**
```tsx
<Heart className="heartbeat" fill="currentColor" />
<div className="float">Plovoucí prvek</div>
<div className="pulse-glow">Důležité tlačítko</div>
```

### 6. **Wave**

- `wave` - Vlnová animace

**Použití:**
```tsx
<div className="wave">Loading...</div>
```

### 7. **Stagger (postupné zobrazení)**

Pro postupné zobrazení více prvků:

```tsx
<div className="stagger-item" style={{ animationDelay: '0ms' }}>Item 1</div>
<div className="stagger-item" style={{ animationDelay: '100ms' }}>Item 2</div>
<div className="stagger-item" style={{ animationDelay: '200ms' }}>Item 3</div>
```

Nebo použijte map:

```tsx
{items.map((item, index) => (
  <div 
    key={index}
    className="stagger-item"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    {item}
  </div>
))}
```

---

## Helper komponenty

Pro snadnější použití jsou k dispozici helper komponenty v `src/components/wedding-website/AnimatedSection.tsx`:

### AnimatedSection

Wrapper pro jednoduchou animaci:

```tsx
import AnimatedSection from '@/components/wedding-website/AnimatedSection'

<AnimatedSection animation="slide-in-left" delay={300}>
  <h1>Nadpis</h1>
</AnimatedSection>
```

### AnimatedList

Pro stagger animace seznamů:

```tsx
import { AnimatedList } from '@/components/wedding-website/AnimatedSection'

<AnimatedList staggerDelay={100}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</AnimatedList>
```

### FloatingElement

Pro plovoucí efekt:

```tsx
import { FloatingElement } from '@/components/wedding-website/AnimatedSection'

<FloatingElement rotate={true}>
  <Heart className="w-8 h-8 text-rose-500" />
</FloatingElement>
```

### PulsingElement

Pro pulzující efekt:

```tsx
import { PulsingElement } from '@/components/wedding-website/AnimatedSection'

<PulsingElement heartbeat={true}>
  <Heart className="w-8 h-8 text-rose-500" />
</PulsingElement>
```

### HoverScaleCard

Pro karty s hover efektem:

```tsx
import { HoverScaleCard } from '@/components/wedding-website/AnimatedSection'

<HoverScaleCard scale={1.05}>
  <div className="p-6 bg-white rounded-lg shadow">
    <h3>Karta</h3>
  </div>
</HoverScaleCard>
```

---

## Best Practices

### 1. **Používejte delay pro postupné zobrazení**

❌ Špatně:
```tsx
<h1 className="scale-in">Nadpis</h1>
<p className="scale-in">Text</p>
<button className="scale-in">Tlačítko</button>
```

✅ Správně:
```tsx
<h1 className="scale-in">Nadpis</h1>
<p className="scale-in" style={{ animationDelay: '0.2s' }}>Text</p>
<button className="scale-in" style={{ animationDelay: '0.4s' }}>Tlačítko</button>
```

### 2. **Kombinujte animace pro lepší efekt**

```tsx
<div className="scale-in">
  <Heart className="heartbeat" fill="currentColor" />
</div>
```

### 3. **Používejte stagger pro seznamy**

```tsx
{images.map((image, index) => (
  <div 
    key={index}
    className="stagger-item"
    style={{ animationDelay: `${index * 150}ms` }}
  >
    <img src={image} alt="" />
  </div>
))}
```

### 4. **Přidejte hover efekty**

```tsx
<div className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
  <img src={image} alt="" />
</div>
```

### 5. **Respektujte přístupnost**

Všechny animace automaticky respektují `prefers-reduced-motion`. Uživatelé s citlivostí na pohyb neuvidí animace.

---

## Příklady

### Hero sekce

```tsx
export default function HeroSection({ content }) {
  return (
    <section className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {/* Jména - postupné zobrazení */}
        <h1 className="scale-in">
          <span className="slide-in-left">{bride}</span>
          <span className="heartbeat mx-4" style={{ animationDelay: '0.3s' }}>
            &
          </span>
          <span className="slide-in-right" style={{ animationDelay: '0.2s' }}>
            {groom}
          </span>
        </h1>

        {/* Datum */}
        <div className="bounce-in" style={{ animationDelay: '0.5s' }}>
          <Calendar className="float" />
          <span>{weddingDate}</span>
        </div>

        {/* Tagline */}
        <p className="slide-in-bottom" style={{ animationDelay: '0.7s' }}>
          {tagline}
        </p>
      </div>
    </section>
  )
}
```

### Galerie s obrázky

```tsx
export default function GallerySection({ images }) {
  return (
    <section>
      <h2 className="scale-in">Galerie</h2>
      <div className="grid grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="stagger-item overflow-hidden rounded-lg"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <img
              src={image}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
```

### Info sekce s ikonami

```tsx
export default function InfoSection({ venue, time, address }) {
  const items = [
    { icon: MapPin, text: venue, delay: 0 },
    { icon: Clock, text: time, delay: 100 },
    { icon: Navigation, text: address, delay: 200 }
  ]

  return (
    <section>
      <h2 className="scale-in">Informace</h2>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="stagger-item flex items-center space-x-3"
            style={{ animationDelay: `${item.delay}ms` }}
          >
            <item.icon className="float" />
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
```

---

## 🎯 Checklist pro novou šablonu

Při vytváření nové šablony se ujistěte, že:

- [ ] Hero sekce má animace pro jména (slide-in-left/right)
- [ ] Srdíčko nebo & má heartbeat animaci
- [ ] Datum má bounce-in nebo scale-in
- [ ] Tagline má slide-in-bottom
- [ ] Obrázky v galerii mají stagger animaci
- [ ] Ikony mají float animaci
- [ ] Karty mají hover:scale efekt
- [ ] Tlačítka mají hover efekty
- [ ] Sekce mají postupné zobrazení (delay)
- [ ] Loading stavy mají wave nebo shimmer

---

## 📝 Poznámky

- Všechny animace jsou v `src/styles/advanced-animations.css`
- Tailwind konfigurace je v `tailwind.config.js`
- Helper komponenty jsou v `src/components/wedding-website/AnimatedSection.tsx`
- Demo všech animací je na `/animations-demo`

---

**Vytvořeno pro svatební web builder svatbot.cz** 💍

