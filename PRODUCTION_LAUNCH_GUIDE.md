# 🚀 Průvodce ostrým startem produkce

## Přehled

Tento dokument popisuje kroky pro přípravu aplikace na ostrý start produkce a vyčištění testovacích dat.

## Problém

V admin dashboardu jsou zobrazeny nesprávné statistiky kvůli testovacím účtům:
- **Celkem uživatelů**: 30 (včetně testovacích)
- **Aktivní uživatelé**: 0 (špatný výpočet)
- **Měsíční příjmy**: 4 605 Kč (testovací platby)
- **Aktivní předplatné**: 27 (testovací subscriptions)

## Řešení

Implementovali jsme systém pro označení a filtrování testovacích účtů:

### 1. Flag `isTestAccount` v userAnalytics

Každý uživatel v kolekci `userAnalytics` může být označen jako testovací účet pomocí pole `isTestAccount: boolean`.

### 2. Automatické filtrování v statistikách

Dashboard nyní automaticky **vylučuje testovací účty** z produkčních statistik:
- Počet uživatelů
- Aktivní uživatelé (opraveno na 30 dní)
- Příjmy a platby
- Předplatné

### 3. Nástroje pro správu testovacích účtů

#### A) User Analytics Table
- Filtr pro zobrazení: Všechny účty / Produkční / Testovací
- Tlačítko pro označení jednotlivých účtů jako testovací
- Badge "Test" u testovacích účtů

#### B) Test Account Cleanup Panel
Nový panel v admin dashboardu (sekce "Další nástroje") s funkcemi:
- **Analyzovat účty** - zobrazí statistiku testovacích vs. produkčních účtů
- **Označit všechny jako testovací** - hromadná akce
- **Označit všechny jako produkční** - hromadná akce
- **Smazat testovací účty** - permanentní odstranění

#### C) Toggle v hlavním dashboardu
- Přepínač "Zahrnout testovací účty" v hlavičce dashboardu
- Umožňuje dočasně zobrazit statistiky včetně testovacích účtů

## 📋 Doporučený postup pro ostrý start

### Krok 1: Analýza současného stavu
1. Přejděte do **Admin Dashboard** → sekce **Další nástroje**
2. V panelu **Správa testovacích účtů** klikněte na **"Analyzovat účty"**
3. Zkontrolujte počty:
   - Celkem účtů
   - Produkční účty
   - Testovací účty

### Krok 2: Označení testovacích účtů
**Varianta A - Hromadné označení:**
1. V panelu **Správa testovacích účtů** klikněte na **"Označit všechny jako testovací"**
2. Potvrďte akci
3. Všechny současné účty budou označeny jako testovací

**Varianta B - Selektivní označení:**
1. Přejděte na záložku **Uživatelé** v admin dashboardu
2. U každého testovacího účtu klikněte na ikonu 🧪 (TestTube)
3. Účet bude označen jako testovací

### Krok 3: Ověření statistik
1. Vraťte se na záložku **Přehled**
2. Zkontrolujte, že statistiky nyní ukazují **0** nebo správné hodnoty:
   - Celkem uživatelů: 0 (pokud jsou všichni testovací)
   - Aktivní uživatelé: 0
   - Měsíční příjmy: 0 Kč
   - Aktivní předplatné: 0

### Krok 4: Ostrý start
1. Aplikace je připravena na produkci
2. Nové registrace budou automaticky **produkční účty** (bez flagu `isTestAccount`)
3. Statistiky se budou počítat pouze z produkčních účtů

### Krok 5: Pozdější cleanup (volitelné)
Po několika týdnech/měsících produkce:
1. Vraťte se do panelu **Správa testovacích účtů**
2. Klikněte na **"Smazat testovací účty"**
3. Potvrďte akci (⚠️ nelze vrátit zpět!)
4. Všechny testovací účty budou permanentně smazány

## 🔍 Technické detaily

### Opravené výpočty statistik

#### Aktivní uživatelé
- **Před**: Přihlášení za posledních 24 hodin
- **Po**: Přihlášení za posledních **30 dní** (správně)

#### Filtrování testovacích účtů
```typescript
// V useAdminDashboard hook
userAnalytics.forEach(doc => {
  const data = doc.data() as UserAnalytics
  
  if (data.isTestAccount) {
    testAccountUserIds.add(doc.id)
    return // Skip test accounts
  }
  
  // Count only production accounts
  totalUsers++
  // ...
})
```

### Firebase kolekce

#### userAnalytics/{userId}
```typescript
{
  userId: string
  email: string
  displayName: string
  isTestAccount?: boolean  // ✨ NOVÉ POLE
  registeredAt: Timestamp
  lastLoginAt: Timestamp
  loginCount: number
  totalSessionTime: number
  // ...
}
```

## ⚠️ Důležité poznámky

1. **Testovací účty nejsou smazány** - pouze označeny a vyfiltrovány ze statistik
2. **Testovací uživatelé se mohou stále přihlásit** - jejich data zůstávají v databázi
3. **Smazání je permanentní** - použijte funkci "Smazat testovací účty" až když jste si jisti
4. **Nové účty jsou automaticky produkční** - není třeba nic nastavovat

## 🎯 Výsledek

Po provedení těchto kroků:
- ✅ Dashboard zobrazuje pouze produkční statistiky
- ✅ Testovací účty jsou jasně označeny
- ✅ Můžete kdykoli přepnout zobrazení testovacích dat
- ✅ Připraveno na ostrý start produkce


