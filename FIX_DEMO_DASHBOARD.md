# 🔧 Oprava Dashboard pro Demo Účet

## 🐛 Problém

Moduly **"Harmonogram svatebního dne"** (`ai-timeline`) a **"Moodboard"** (`moodboard`) nejsou viditelné na dashboardu demo účtu, protože:

1. Byly automaticky skryté pro demo uživatele v `useDashboard.ts`
2. Staré nastavení je uložené v localStorage

## ✅ Řešení

### 1. Oprava kódu (HOTOVO ✅)

Odstranil jsem logiku, která automaticky skrývala tyto moduly pro demo uživatele v `src/hooks/useDashboard.ts`.

### 2. Vyčištění localStorage (NUTNÉ)

Pro zobrazení modulů je potřeba vyčistit localStorage v prohlížeči.

#### Možnost A: Manuální vyčištění (Doporučeno)

1. **Otevřete svatbot.cz**
2. **Otevřete Developer Console** (F12)
3. **Spusťte tento kód**:

```javascript
// Vyčistit dashboard layout pro demo uživatele
const demoUserId = '1QyfaI0JWugRDw6SP0XtlL1cRUf2';
localStorage.removeItem(`svatbot-dashboard-layout-${demoUserId}`);

// Obnovit stránku
location.reload();
```

#### Možnost B: Kompletní vyčištění

```javascript
// Vyčistit všechno
localStorage.clear();
sessionStorage.clear();

// Obnovit stránku
location.reload();
```

### 3. Zobrazení skrytých modulů

Po vyčištění localStorage:

1. **Přihlaste se jako demo** (demo@svatbot.cz / demo123)
2. **Přejděte na Dashboard**
3. **Klikněte na "Upravit rozložení"** (ikona tužky v pravém horním rohu)
4. **Najděte skryté moduly** v seznamu
5. **Klikněte na ikonu oka** u modulů "AI Timeline" a "Moodboard"
6. **Uložte změny**

## 📋 Ověření

Po opravě byste měli vidět:

### Dashboard
- ✅ Modul "Harmonogram svatebního dne" (AI Timeline)
- ✅ Modul "Moodboard"

### Navigace
- ✅ Stránka `/svatebni-den` - Harmonogram svatebního dne
- ✅ Stránka `/moodboard` - Moodboard s obrázky

### Data v demo účtu
- ✅ 5 položek v harmonogramu svatebního dne
- ✅ 6 obrázků v moodboardu

## 🔍 Technické detaily

### Změny v kódu

**`src/hooks/useDashboard.ts`**

**PŘED:**
```typescript
// For demo users, hide AI modules
if (isDemoUser) {
  validModules = validModules.map((m: DashboardModule) => {
    if (m.type === 'ai-timeline' || m.type === 'moodboard') {
      return { ...m, isVisible: false }
    }
    return m
  })
}
```

**PO:**
```typescript
// Removed - no longer hiding modules for demo users
```

### Moduly v DEFAULT_DASHBOARD_MODULES

```typescript
{
  id: 'ai-timeline',
  type: 'ai-timeline',
  title: 'AI Timeline',
  size: 'large',
  position: { row: 5, column: 0 },
  isVisible: true,  // ✅ Viditelný
  isLocked: false,
  order: 10
},
{
  id: 'moodboard',
  type: 'moodboard',
  title: 'Moodboard',
  size: 'medium',
  position: { row: 5, column: 2 },
  isVisible: true,  // ✅ Viditelný
  isLocked: false,
  order: 11
}
```

## 📊 Demo data

### Harmonogram svatebního dne (5 položek)

1. **Příprava nevěsty** (09:00 - 11:00)
   - Kategorie: Příprava
   - Trvání: 2 hodiny

2. **Svatební obřad** (14:00 - 14:30)
   - Kategorie: Obřad
   - Trvání: 30 minut

3. **Gratulace a focení** (14:30 - 15:30)
   - Kategorie: Obřad
   - Trvání: 1 hodina

4. **Svatební hostina** (16:00 - 19:00)
   - Kategorie: Hostina
   - Trvání: 3 hodiny

5. **Večerní zábava** (19:00 - 02:00)
   - Kategorie: Zábava
   - Trvání: 7 hodin

### Moodboard (6 obrázků)

1. Svatební kytice
2. Svatební dort
3. Dekorace stolu
4. Svatební šaty
5. Místo konání
6. Svatební prsteny

## 🚀 Deployment

Změny byly pushnuty na GitHub a automaticky deploynuty na Vercel.

**Commit:**
```
feat: Show AI Timeline and Moodboard modules for demo user

- Removed logic that automatically hid ai-timeline and moodboard modules for demo users
- Both modules are now visible by default for all users including demo
- Users can still manually hide/show modules via dashboard edit mode
```

## 🧪 Testování

### Krok 1: Vyčistit localStorage
```javascript
localStorage.removeItem('svatbot-dashboard-layout-1QyfaI0JWugRDw6SP0XtlL1cRUf2');
location.reload();
```

### Krok 2: Přihlásit se
- Email: `demo@svatbot.cz`
- Password: `demo123`

### Krok 3: Zkontrolovat Dashboard
- Měli byste vidět moduly "AI Timeline" a "Moodboard"
- Pokud ne, klikněte na "Upravit rozložení" a zobrazte je

### Krok 4: Zkontrolovat stránky
- `/svatebni-den` - měli byste vidět 5 položek harmonogramu
- `/moodboard` - měli byste vidět 6 obrázků

## 📝 Poznámky

- Moduly jsou nyní viditelné pro všechny uživatele včetně demo
- Uživatelé mohou stále manuálně skrýt/zobrazit moduly přes edit mode
- localStorage se automaticky aktualizuje při změně rozložení
- Po vyčištění localStorage se použije výchozí rozložení z `DEFAULT_DASHBOARD_MODULES`

---

**Vytvořeno**: 2025-01-03
**Status**: ✅ Opraveno v kódu, čeká na vyčištění localStorage

