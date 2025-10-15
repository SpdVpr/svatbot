# 🔥 2025 Animation Trends - SvatBot.cz

Kompletní implementace nejnovějších animačních trendů pro rok 2025.

## 📚 Obsah

1. [Implementované trendy](#implementované-trendy)
2. [Použití komponent](#použití-komponent)
3. [CSS třídy](#css-třídy)
4. [Příklady](#příklady)

---

## Implementované trendy

### ✅ 1. Custom Cursor with Trail
**Komponenta:** `<CustomCursor />`
- Vlastní kurzor myši s efektem stopy
- Automaticky se mění při hoveru nad tlačítky a odkazy
- Prémiový pocit aplikace

### ✅ 2. Magnetic Buttons
**CSS třída:** `.micro-bounce`
- Tlačítka reagují na kliknutí elastickým efektem
- Použito na všech hlavních CTA tlačítkách

### ✅ 3. Scroll-Triggered Parallax
**Komponenta:** `<ParallaxSection speed="slow|medium|fast">`
- Prvky se pohybují různou rychlostí při scrollování
- Vytváří hloubku a trojrozměrnost

### ✅ 4. Number Counters with Easing
**Komponenta:** `<NumberCounter end={180} duration={2000} />`
- Čísla se "narolují" od 0 do finální hodnoty
- Plynulé zpomalení (easing)
- Spouští se při scrollu do view

### ✅ 5. Morphing Blobs
**Komponenta:** `<MorphingBlobs />`
- Abstraktní tvary na pozadí
- Plynule mění velikost a pozici
- Moderní gradient efekt

### ✅ 6. Card Tilt Effect (3D Hover)
**Komponenta:** `<CardTilt maxTilt={15}>`
- Karty se naklání ve 3D při pohybu myši
- Lesklý odlesk světla
- Prémiový efekt

### ✅ 7. Staggered Animations
**CSS třída:** `.stagger-fade-enhanced`
- Prvky se objevují postupně za sebou
- Profesionální dojem
- Použito na feature kartách

### ✅ 8. Floating Elements
**CSS třída:** `.float-enhanced`, `.float-slow`
- Ikony jemně levitují nahoru-dolů
- Upozorňují na sebe
- Použito na ikonách v kartách

### ✅ 9. Glassmorphism with Motion
**CSS třída:** `.glass-morphism`
- Skleněný efekt s rozmazaným pozadím
- Reaguje na hover změnou průhlednosti
- Moderní design

### ✅ 10. Text Reveal Animations
**Komponenta:** `<TextReveal mode="line|char">`
- Text se objevuje písmeno po písmenu nebo řádek po řádku
- Spouští se při scrollu do view

### ✅ 11. Skeleton Loading
**CSS třída:** `.skeleton`, `.skeleton-pulse`
- Moderní loading stavy
- Pulzující "kostry" budoucího obsahu

### ✅ 12. Elastic Animations
**CSS třída:** `.elastic-scale`, `.elastic-rotate`
- Prvky "poskočí" jako guma při interakci
- Hravý, ale ne dětinský efekt

### ✅ 13. Ambient Particles
**Komponenta:** `<AmbientParticles count={30} />`
- Drobné plovoucí částice na pozadí
- Jemné, ale elegantní

### ✅ 14. Scroll Progress Indicator
**Komponenta:** `<ScrollProgress />`
- Ukazatel pokroku scrollování
- Fixní na vrchu stránky
- Gradient efekt

### ✅ 15. Hover Lift Effect
**CSS třída:** `.hover-lift`
- Prvky se zvednou při hoveru
- Stín se zvětší
- Použito na kartách

### ✅ 16. Button Pulse Attention
**CSS třída:** `.button-pulse-attention`
- Tlačítka pulzují pro upozornění
- Použito na hlavním CTA

### ✅ 17. Micro-interactions
**CSS třídy:** `.micro-bounce`, `.icon-spin-hover`, `.checkbox-expand`
- Drobné reakce na hover
- Checkbox se roztáhne
- Ikona se otočí

### ✅ 18. Gradient Animation
**CSS třída:** `.gradient-animate`
- Animovaný gradient pozadí
- Plynulý pohyb barev

### ✅ 19. Page Transitions
**CSS třídy:** `.page-transition-enter`, `.page-transition-exit`, `.page-fade-scale`
- Plynulé přechody mezi stránkami
- Různé efekty (slide, fade, scale)

### ✅ 20. Interactive Timeline
**CSS třídy:** `.timeline-item`, `.timeline-dot-pulse`
- Timeline reaguje na scroll a hover
- Pulzující tečky
- Animované přechody

---

## Použití komponent

### CustomCursor
```tsx
import { CustomCursor } from '@/components/animations'

<CustomCursor />
```

### MorphingBlobs
```tsx
import { MorphingBlobs } from '@/components/animations'

<MorphingBlobs />
```

### CardTilt
```tsx
import { CardTilt } from '@/components/animations'

<CardTilt maxTilt={15}>
  <div className="bg-white p-6 rounded-xl">
    Obsah karty
  </div>
</CardTilt>
```

### NumberCounter
```tsx
import { NumberCounter } from '@/components/animations'

<NumberCounter 
  end={180} 
  duration={2000}
  prefix="$"
  suffix="+"
  decimals={0}
/>
```

### ParallaxSection
```tsx
import { ParallaxSection } from '@/components/animations'

<ParallaxSection speed="slow">
  <div>Obsah s parallax efektem</div>
</ParallaxSection>
```

### AmbientParticles
```tsx
import { AmbientParticles } from '@/components/animations'

<AmbientParticles count={30} />
```

### ScrollProgress
```tsx
import { ScrollProgress } from '@/components/animations'

<ScrollProgress />
```

### TextReveal
```tsx
import { TextReveal } from '@/components/animations'

<TextReveal mode="line" delay={100}>
  Text, který se objeví
</TextReveal>

<TextReveal mode="char" delay={0}>
  Text po písmenech
</TextReveal>
```

---

## CSS třídy

### Hover efekty
- `.hover-lift` - Zvednutí při hoveru
- `.card-hover-scale` - Zvětšení karty při hoveru
- `.micro-bounce` - Elastický bounce při kliknutí

### Floating animace
- `.float-enhanced` - Plovoucí s rotací
- `.float-slow` - Pomalé plovoucí

### Glassmorphism
- `.glass-morphism` - Skleněný efekt s motion

### Loading stavy
- `.skeleton` - Shimmer loading
- `.skeleton-pulse` - Pulzující loading
- `.smart-loader` - Inteligentní loader

### Stagger animace
- `.stagger-fade-enhanced` - Postupné zobrazení s fade

### Button efekty
- `.button-pulse-attention` - Pulzující tlačítko
- `.button-glow` - Glow efekt

### Elastic animace
- `.elastic-scale` - Elastické zvětšení
- `.elastic-rotate` - Elastická rotace

### Timeline
- `.timeline-item` - Timeline položka
- `.timeline-dot-pulse` - Pulzující tečka

### Gradient
- `.gradient-animate` - Animovaný gradient

### Page transitions
- `.page-transition-enter` - Vstup stránky
- `.page-transition-exit` - Výstup stránky
- `.page-fade-scale` - Fade + scale přechod

---

## Příklady

### Feature karta s 3D tilt a floating ikonou
```tsx
<CardTilt>
  <div className="bg-white rounded-2xl p-8 shadow-lg hover-lift">
    <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6 float-enhanced">
      <Sparkles className="w-8 h-8 text-rose-500" />
    </div>
    <h3 className="text-2xl font-bold mb-3">AI Asistent</h3>
    <p className="text-gray-600">Inteligentní kouč 24/7</p>
  </div>
</CardTilt>
```

### Statistika s number counterem
```tsx
<div className="glass-morphism p-6 rounded-xl">
  <h3 className="text-lg mb-2">Odpočet do svatby</h3>
  <div className="text-4xl font-bold text-rose-600">
    <NumberCounter end={180} duration={2500} />
  </div>
  <p className="text-sm text-gray-500">dní do velkého dne!</p>
</div>
```

### Hero sekce s morphing blobs a particles
```tsx
<section className="relative overflow-hidden">
  <MorphingBlobs />
  <AmbientParticles count={30} />
  
  <div className="relative z-10">
    <TextReveal mode="line" className="text-6xl font-bold">
      Plánujte svatbu snů
    </TextReveal>
  </div>
</section>
```

---

## 🎯 Best Practices

1. **Nepoužívejte příliš mnoho animací najednou** - může to být rušivé
2. **Používejte delay pro stagger efekty** - vytváří profesionální dojem
3. **Testujte na mobilních zařízeních** - některé animace mohou být náročné
4. **Používejte `will-change` opatrně** - může ovlivnit výkon
5. **Kombinujte různé trendy** - vytváří unikátní zážitek

---

## 📝 Poznámky

- Všechny CSS animace jsou v `src/styles/2025-trends.css`
- React komponenty jsou v `src/components/animations/`
- Import všech komponent: `import { CustomCursor, CardTilt, ... } from '@/components/animations'`
- Dokumentace: `src/components/animations/README.md`

---

**Vytvořeno pro SvatBot.cz** 🎉✨

