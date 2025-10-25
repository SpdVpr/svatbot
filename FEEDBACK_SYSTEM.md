# 💬 Feedback & Komunikační Systém

## 📋 Přehled

Kompletní obousměrný komunikační systém mezi uživateli a adminem pro SvatBot aplikaci.

## ✅ Implementované Funkce

### 1. **Feedback Button pro Uživatele**
- 🎯 **Umístění**: Plovoucí tlačítko v pravém dolním rohu na VŠECH stránkách (kromě landing page a admin)
- 📍 **Komponenty**:
  - `src/components/common/FeedbackButton.tsx` - Samotný button
  - `src/components/common/GlobalFeedbackButton.tsx` - Globální wrapper
- 🎨 **Design**: Modrý kruhový button s ikonou zprávy
- 🌐 **Globální dostupnost**: Automaticky se zobrazuje na všech stránkách pro přihlášené uživatele

#### Funkce:
- ✅ Otevírá modální okno pro odeslání feedbacku
- ✅ Typy zpráv:
  - 🐛 **Bug** - Nahlášení chyby
  - 💡 **Nápad** - Návrh nové funkce
  - 📈 **Vylepšení** - Návrh na zlepšení
  - 💬 **Jiné** - Obecná zpráva
- ✅ Povinná pole: Předmět, Zpráva
- ✅ Volitelné: Hodnocení aplikace (1-5 hvězdiček)
- ✅ Automaticky ukládá:
  - ID uživatele
  - Email uživatele
  - Jméno uživatele
  - Aktuální stránku (URL)
  - Timestamp
  - Prioritu (bug = high, ostatní = medium)

### 2. **Feedback Tab v Uživatelském Účtu**
- 📍 **Komponenta**: `src/components/account/FeedbackTab.tsx`
- 🎯 **Umístění**: Account Modal → Záložka "Feedback"

#### Funkce:
- ✅ Zobrazuje všechny odeslané zprávy uživatele
- ✅ Expandable karty s detaily
- ✅ Zobrazuje stav zprávy:
  - 🕐 **Nový** - Čeká na zpracování
  - 🔄 **Řeší se** - Admin na tom pracuje
  - ✅ **Vyřešeno** - Problém vyřešen
  - 🔒 **Uzavřeno** - Zpráva uzavřena
- ✅ Zobrazuje odpovědi od admina
- ✅ Real-time aktualizace (Firebase onSnapshot)
- ✅ Zobrazuje hodnocení, pokud bylo zadáno
- ✅ Zobrazuje datum vytvoření a vyřešení

### 3. **Admin Dashboard - Feedback Management**
- 📍 **Komponenta**: `src/components/admin/FeedbackManagement.tsx`
- 🎯 **Umístění**: Admin Dashboard → Záložka "Feedback"

#### Funkce:
- ✅ Přehled všech feedbacků od uživatelů
- ✅ Filtry:
  - Podle typu (bug, feature, improvement, other)
  - Podle stavu (new, in-progress, resolved, closed)
- ✅ Detailní zobrazení každého feedbacku
- ✅ **Odpovídání uživatelům**:
  - Textové pole pro napsání odpovědi
  - Tlačítko "💾 Uložit odpověď"
  - Možnost upravit existující odpověď
  - Odpověď se zobrazí uživateli v jeho Feedback Tab
- ✅ Změna stavu:
  - 🔄 Začít řešit
  - ✅ Vyřešit
  - 🔒 Uzavřít
- ✅ Zobrazuje:
  - Typ zprávy s barevným označením
  - Prioritu
  - Hodnocení (pokud bylo zadáno)
  - Email uživatele
  - Datum vytvoření
  - Stránku, ze které byla zpráva odeslána
- ✅ Real-time aktualizace

## 🗄️ Firebase Struktura

### Collection: `feedback`

```typescript
{
  id: string                    // Auto-generated
  userId: string                // Auth user ID
  userEmail: string             // User email
  userName?: string             // User display name
  type: 'bug' | 'feature' | 'improvement' | 'other'
  subject: string               // Předmět zprávy
  message: string               // Text zprávy
  rating?: number               // 1-5 (volitelné)
  page?: string                 // URL stránky
  status: 'new' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  createdAt: Timestamp          // Datum vytvoření
  resolvedAt?: Timestamp        // Datum vyřešení
  adminNotes?: string           // Odpověď od admina
  assignedTo?: string           // ID admina (budoucí funkce)
}
```

## 🔒 Firestore Security Rules

```javascript
// Feedback - Users can create, admins can manage
match /feedback/{feedbackId} {
  // Users can read their own feedback, admins can read all
  allow read: if isAuthenticated() &&
                 (resource.data.userId == request.auth.uid || isAdmin());

  // Users can create feedback
  allow create: if isAuthenticated() &&
                   request.resource.data.userId == request.auth.uid &&
                   request.resource.data.keys().hasAll(['userId', 'userEmail', 'type', 'subject', 'message', 'status']);

  // Only admins can update (change status, add notes)
  allow update: if isAdmin();

  // Only admins can delete
  allow delete: if isAdmin();
}
```

## 🎨 UI/UX Features

### Uživatelské rozhraní:
- ✅ Plovoucí tlačítko vždy viditelné
- ✅ Modální okno s přehledným formulářem
- ✅ Barevné označení typů zpráv
- ✅ Hvězdičkové hodnocení
- ✅ Success animace po odeslání
- ✅ Expandable karty v Feedback Tab
- ✅ Zvýraznění odpovědí od admina (modrý box)
- ✅ Ikony pro lepší orientaci

### Admin rozhraní:
- ✅ Přehledné karty s klíčovými informacemi
- ✅ Filtry pro rychlé vyhledávání
- ✅ Detailní modální okno
- ✅ Oddělené sekce pro odpověď a změnu stavu
- ✅ Barevné označení priorit a stavů
- ✅ Možnost upravit existující odpověď

## 🔄 Workflow

### Uživatel:
1. Klikne na plovoucí tlačítko 💬
2. Vybere typ zprávy (bug, nápad, vylepšení, jiné)
3. Vyplní předmět a zprávu
4. Volitelně přidá hodnocení
5. Odešle feedback
6. Může sledovat stav v Account Modal → Feedback
7. Vidí odpověď od admina, když je přidána

### Admin:
1. Otevře Admin Dashboard → Feedback
2. Vidí všechny feedbacky
3. Může filtrovat podle typu a stavu
4. Klikne na feedback pro detail
5. Napíše odpověď pro uživatele
6. Uloží odpověď (uživatel ji okamžitě vidí)
7. Změní stav (Začít řešit / Vyřešit / Uzavřít)

## 📊 Real-time Synchronizace

- ✅ Uživatel vidí změny stavu okamžitě
- ✅ Admin vidí nové feedbacky okamžitě
- ✅ Odpovědi se zobrazují v reálném čase
- ✅ Používá Firebase `onSnapshot` pro live updates

## 🚀 Použití

### Pro uživatele:
```typescript
// Feedback button je automaticky dostupný globálně
// Přidán v src/app/layout.tsx:
import GlobalFeedbackButton from '@/components/common/GlobalFeedbackButton'

<Suspense fallback={null}>
  <GlobalFeedbackButton />
</Suspense>

// Zobrazuje se automaticky na všech stránkách kromě:
// - Landing page (pro nepřihlášené uživatele)
// - Admin stránky (/admin/*)
// - Veřejné svatební stránky (/w/*)
// - Sdílené stránky (/share/*)
```

### Pro admina:
```typescript
// Feedback management je v admin dashboardu
import FeedbackManagement from '@/components/admin/FeedbackManagement'

// V admin/dashboard/page.tsx:
{activeTab === 'feedback' && <FeedbackManagement />}
```

## 🎯 Budoucí Vylepšení

- [ ] Přiložení screenshotů k feedbacku
- [ ] Přiřazení feedbacku konkrétnímu adminovi
- [ ] Email notifikace pro admina při novém feedbacku
- [ ] Email notifikace pro uživatele při odpovědi
- [ ] Kategorie/tagy pro lepší organizaci
- [ ] Vyhledávání v feedbacku
- [ ] Export feedbacku do CSV
- [ ] Statistiky feedbacku (nejčastější problémy, atd.)
- [ ] Veřejný roadmap založený na feedbacku

## ✅ Testování

1. **Uživatelský test**:
   - Přihlásit se jako běžný uživatel
   - Kliknout na plovoucí tlačítko 💬
   - Odeslat feedback
   - Otevřít Account Modal → Feedback
   - Zkontrolovat, že se zpráva zobrazuje

2. **Admin test**:
   - Přihlásit se jako admin
   - Otevřít Admin Dashboard → Feedback
   - Najít testovací feedback
   - Napsat odpověď a uložit
   - Změnit stav na "Vyřešeno"

3. **Real-time test**:
   - Otevřít aplikaci ve dvou oknech
   - Jedno jako uživatel, druhé jako admin
   - Odeslat feedback jako uživatel
   - Zkontrolovat, že se okamžitě zobrazí adminovi
   - Odpovědět jako admin
   - Zkontrolovat, že se odpověď okamžitě zobrazí uživateli

## 📝 Poznámky

- Systém je plně funkční a připravený k produkčnímu použití
- Všechny komponenty jsou optimalizované pro mobile i desktop
- Real-time synchronizace zajišťuje okamžitou komunikaci
- Security rules zajišťují, že uživatelé vidí pouze své feedbacky
- Admin má přístup ke všem feedbackům

