# 🔇 Production Logging - Dokumentace

## Přehled

Aplikace SvatBot nyní používá **production-safe logging systém**, který automaticky vypíná debug logy v produkčním prostředí.

## Co bylo změněno

### 1. Vytvořen Logger Utility (`src/lib/logger.ts`)

Nový logger automaticky detekuje prostředí a v produkci vypíná všechny debug výpisy:

```typescript
import logger from '@/lib/logger'

// V development: zobrazí se v konzoli
// V production: nic se nezobrazí
logger.log('📥 Loaded user data from Firestore')
logger.warn('⚠️ Firestore not available')

// Chyby se zobrazí vždy (i v produkci)
logger.error('❌ Error loading data')
```

### 2. Upravené soubory

Všechny `console.log/warn/error/info` výpisy byly nahrazeny `logger` ekvivalenty v těchto souborech:

#### Hooks
- ✅ `src/hooks/useAuth.ts` - autentizace uživatelů
- ✅ `src/hooks/useWedding.ts` - správa svatebních dat
- ✅ `src/hooks/useDashboard.ts` - dashboard layout
- ✅ `src/hooks/useMoodboard.ts` - moodboard obrázky
- ✅ `src/hooks/useTask.ts` - úkoly
- ✅ `src/hooks/useAffiliate.ts` - affiliate systém

#### Pages
- ✅ `src/app/page.tsx` - hlavní stránka
- ✅ `src/app/tasks/page.tsx` - stránka úkolů

#### Components
- ✅ `src/components/tasks/TaskList.tsx` - seznam úkolů

#### Stores
- ✅ `src/store/vendorStore.ts` - vendor marketplace

#### Libraries
- ✅ `src/lib/affiliateTracking.ts` - affiliate tracking

## Jak to funguje

### Development Mode
```bash
NODE_ENV=development npm run dev
```
- ✅ Všechny logy se zobrazují v konzoli
- ✅ Emoji ikony pro lepší čitelnost
- ✅ Detailní debug informace

### Production Mode
```bash
NODE_ENV=production npm run build
npm start
```
- 🔇 Debug logy jsou vypnuté
- 🔇 Warning logy jsou vypnuté
- ✅ Error logy se stále zobrazují (pro monitoring)
- 🚀 Čistá konzole pro uživatele

## Typy logů

| Metoda | Development | Production | Použití |
|--------|-------------|------------|---------|
| `logger.log()` | ✅ Zobrazí | ❌ Skryje | Debug informace |
| `logger.info()` | ✅ Zobrazí | ❌ Skryje | Informační zprávy |
| `logger.warn()` | ✅ Zobrazí | ❌ Skryje | Varování |
| `logger.error()` | ✅ Zobrazí | ✅ Zobrazí | Chyby (vždy) |
| `logger.debug()` | ✅ Zobrazí | ❌ Skryje | Detailní debug |

## Příklady použití

### Před (starý způsob)
```typescript
console.log('📥 Loaded user data from Firestore:', userData)
console.warn('⚠️ Firestore not available, using localStorage')
console.error('❌ Error loading data:', error)
```

### Po (nový způsob)
```typescript
import logger from '@/lib/logger'

logger.log('📥 Loaded user data from Firestore:', userData)
logger.warn('⚠️ Firestore not available, using localStorage')
logger.error('❌ Error loading data:', error)
```

## Výhody

### 1. Čistá konzole v produkci
- Uživatelé neuvidí technické debug zprávy
- Profesionální vzhled aplikace
- Lepší UX

### 2. Snadné debugování ve vývoji
- Všechny logy jsou stále dostupné v development módu
- Emoji ikony pro rychlou orientaci
- Detailní informace o stavu aplikace

### 3. Monitoring chyb
- Chyby se stále logují i v produkci
- Možnost integrace s monitoring nástroji (Sentry, LogRocket)
- Zachování důležitých error logů

### 4. Výkon
- Méně výpisů do konzole = lepší výkon
- Menší overhead v produkci

## Migrace dalších souborů

Pokud najdete další soubory s `console.log`, použijte tento postup:

### 1. Přidejte import
```typescript
import logger from '@/lib/logger'
```

### 2. Nahraďte console výpisy
```typescript
// Před
console.log('message')
console.warn('warning')
console.error('error')

// Po
logger.log('message')
logger.warn('warning')
logger.error('error')
```

### 3. Nebo použijte skript
```powershell
# Automatická náhrada pro konkrétní soubor
.\scripts\replace-console-logs.ps1
```

## Monitoring v produkci

Pro monitoring chyb v produkci doporučujeme integrovat:

### Sentry
```typescript
// src/lib/logger.ts
import * as Sentry from '@sentry/nextjs'

export const logger = {
  error: (...args: any[]) => {
    console.error(...args)
    // Odeslat do Sentry
    Sentry.captureException(args[0])
  }
}
```

### LogRocket
```typescript
import LogRocket from 'logrocket'

export const logger = {
  error: (...args: any[]) => {
    console.error(...args)
    LogRocket.captureException(args[0])
  }
}
```

## Testování

### Test v development módu
```bash
npm run dev
# Otevřete konzoli - měli byste vidět všechny logy
```

### Test v production módu
```bash
npm run build
npm start
# Otevřete konzoli - debug logy by měly být skryté
```

## Zbývající úkoly

Následující soubory stále mohou obsahovat `console.log` výpisy:

- `src/app/guests/page.tsx` - stránka hostů
- `src/components/guests/*` - komponenty hostů
- Další komponenty a hooks podle potřeby

Doporučujeme postupně migrovat všechny soubory na nový logger systém.

## Závěr

✅ **Aplikace je nyní připravena pro produkci s čistou konzolí**

- Debug logy jsou vypnuté v produkci
- Chyby se stále logují pro monitoring
- Development experience zůstává stejný
- Profesionální vzhled pro uživatele

---

**Vytvořeno:** 2025-01-28  
**Verze:** 1.0.0  
**Status:** ✅ Implementováno

