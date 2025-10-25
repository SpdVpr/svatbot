# Systém recenzí dodavatelů

## Přehled

Systém umožňuje přihlášeným uživatelům psát recenze k dodavatelům z marketplace. Všechny recenze musí projít schválením administrátorem před zveřejněním.

## Funkce

### Pro uživatele:
- ✅ Psaní recenzí pouze pro přihlášené uživatele
- ✅ Celkové hodnocení (1-5 hvězdiček)
- ✅ Detailní hodnocení (kvalita, komunikace, poměr cena/výkon, profesionalita)
- ✅ Textová recenze s nadpisem (min. 50 znaků)
- ✅ Volitelné informace (datum svatby, využitá služba)
- ✅ Jeden uživatel může recenzovat jednoho dodavatele pouze jednou
- ✅ Zobrazení stavu recenze (čeká na schválení / schváleno / zamítnuto)

### Pro administrátory:
- ✅ Schvalování/zamítání recenzí
- ✅ Přehled všech recenzí s filtrováním podle stavu
- ✅ Statistiky recenzí (čekající, schválené, zamítnuté)
- ✅ Důvod zamítnutí recenze

### Veřejné zobrazení:
- ✅ Zobrazení pouze schválených recenzí
- ✅ Statistiky hodnocení (průměr, rozložení hodnocení)
- ✅ Filtrování recenzí podle hodnocení
- ✅ Řazení recenzí (nejnovější, nejstarší, nejvyšší, nejnižší hodnocení)

## Datová struktura

### Collection: `vendorReviews`

```typescript
{
  id: string
  vendorId: string          // ID dodavatele z marketplace
  userId: string            // ID uživatele (autor)
  userName: string          // Jméno uživatele
  userEmail: string         // Email uživatele
  
  // Hodnocení
  rating: number            // 1-5 (celkové hodnocení)
  title: string             // Nadpis recenze
  text: string              // Text recenze
  ratings: {
    quality: number         // 1-5 (kvalita služeb)
    communication: number   // 1-5 (komunikace)
    value: number          // 1-5 (poměr cena/výkon)
    professionalism: number // 1-5 (profesionalita)
  }
  
  // Volitelné
  images?: string[]         // URL obrázků
  weddingDate?: Date        // Datum svatby
  serviceUsed?: string      // Využitá služba
  
  // Moderace
  status: 'pending' | 'approved' | 'rejected'
  moderatedBy?: string      // ID admina
  moderatedAt?: Date        // Datum schválení/zamítnutí
  moderationNote?: string   // Poznámka od admina
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  
  // Odpověď dodavatele (budoucí feature)
  response?: {
    text: string
    createdAt: Date
  }
}
```

## Komponenty

### Frontend komponenty

1. **ReviewForm** (`src/components/marketplace/ReviewForm.tsx`)
   - Formulář pro psaní nové recenze
   - Validace (min. 50 znaků, povinná pole)
   - Hvězdičkové hodnocení
   - Detailní hodnocení

2. **ReviewCard** (`src/components/marketplace/ReviewCard.tsx`)
   - Zobrazení jednotlivé recenze
   - Celkové i detailní hodnocení
   - Autor, datum, volitelné informace

3. **ReviewList** (`src/components/marketplace/ReviewList.tsx`)
   - Seznam recenzí s filtrováním a řazením
   - Integrace se statistikami

4. **ReviewStats** (`src/components/marketplace/ReviewStats.tsx`)
   - Přehled hodnocení
   - Průměrné hodnocení
   - Rozložení hodnocení (kolik recenzí má 5*, 4*, atd.)
   - Průměrné detailní hodnocení

5. **ReviewModeration** (`src/components/admin/ReviewModeration.tsx`)
   - Admin rozhraní pro schvalování recenzí
   - Přehled čekajících, schválených, zamítnutých recenzí
   - Akce: schválit / zamítnout s důvodem

### Hook

**useVendorReviews** (`src/hooks/useVendorReviews.ts`)
- Načítání recenzí pro dodavatele
- Vytváření nové recenze
- Úprava/smazání recenze (pouze vlastník)
- Schvalování/zamítání recenzí (admin)
- Real-time aktualizace
- Statistiky hodnocení

## Použití

### Na stránce dodavatele

```tsx
import { useVendorReviews } from '@/hooks/useVendorReviews'
import ReviewForm from '@/components/marketplace/ReviewForm'
import ReviewList from '@/components/marketplace/ReviewList'

function VendorDetailPage() {
  const { reviews, stats, hasUserReviewed, createReview } = useVendorReviews(vendorId)
  const [showReviewForm, setShowReviewForm] = useState(false)

  return (
    <>
      {/* Tlačítko pro psaní recenze */}
      {user && !hasUserReviewed(vendorId) && (
        <button onClick={() => setShowReviewForm(true)}>
          Napsat recenzi
        </button>
      )}

      {/* Zobrazení recenzí */}
      <ReviewList reviews={reviews} stats={stats} />

      {/* Formulář pro novou recenzi */}
      {showReviewForm && (
        <ReviewForm
          vendorId={vendorId}
          vendorName={vendor.name}
          onSubmit={async (data) => {
            await createReview(data)
            setShowReviewForm(false)
          }}
          onCancel={() => setShowReviewForm(false)}
        />
      )}
    </>
  )
}
```

### V admin dashboardu

```tsx
import ReviewModeration from '@/components/admin/ReviewModeration'

function AdminDashboard() {
  return (
    <div>
      <ReviewModeration />
    </div>
  )
}
```

## Firestore Security Rules

Přidejte následující pravidla do `firestore.rules`:

```javascript
// Vendor Reviews
match /vendorReviews/{reviewId} {
  // Čtení: všichni mohou číst schválené recenze, autoři a admini vidí své
  allow read: if resource.data.status == 'approved' 
    || resource.data.userId == request.auth.uid
    || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
  
  // Vytvoření: pouze přihlášení uživatelé
  allow create: if request.auth != null
    && request.resource.data.userId == request.auth.uid
    && request.resource.data.status == 'pending'
    && request.resource.data.rating >= 1 
    && request.resource.data.rating <= 5
    && request.resource.data.text.size() >= 50;
  
  // Úprava: pouze vlastník (pokud je status pending) nebo admin
  allow update: if (request.auth.uid == resource.data.userId && resource.data.status == 'pending')
    || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
  
  // Smazání: pouze vlastník nebo admin
  allow delete: if request.auth.uid == resource.data.userId
    || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
}
```

## Firestore Indexes

Vytvořte následující indexy v Firestore Console nebo v `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "vendorReviews",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "vendorId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "vendorReviews",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "vendorReviews",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

## Workflow

### 1. Uživatel píše recenzi
1. Uživatel klikne na "Napsat recenzi" na stránce dodavatele
2. Vyplní formulář (hodnocení, text, detaily)
3. Odešle recenzi
4. Recenze je uložena do Firestore se stavem `pending`
5. Uživatel vidí zprávu: "Děkujeme! Vaše recenze bude zveřejněna po schválení."

### 2. Admin moderuje recenze
1. Admin otevře dashboard → tab "Recenze"
2. Vidí přehled čekajících recenzí
3. Přečte si recenzi
4. Buď:
   - **Schválí** → status se změní na `approved`, recenze se zobrazí veřejně
   - **Zamítne** → zadá důvod, status se změní na `rejected`

### 3. Zobrazení veřejně
1. Na stránce dodavatele se zobrazují pouze recenze se stavem `approved`
2. Uživatelé vidí celkové i detailní hodnocení
3. Mohou filtrovat a řadit recenze

## Budoucí vylepšení

- [ ] Nahrávání obrázků k recenzi
- [ ] Odpovědi dodavatelů na recenze
- [ ] Reakce na recenze (Was this helpful? Ano/Ne)
- [ ] Report nevhodné recenze
- [ ] Notifikace pro dodavatele při nové recenzi
- [ ] Email notifikace adminům při nové čekající recenzi
- [ ] Hromadné schvalování recenzí
- [ ] Export recenzí do CSV
- [ ] Moderace pomocí AI (auto-reject spam/nevhodný obsah)

## Testing

### Testování jako uživatel:
1. Přihlaste se jako běžný uživatel
2. Najděte dodavatele v marketplace
3. Klikněte na "Napsat recenzi"
4. Vyplňte formulář a odešlete
5. Ověřte, že vidíte "Čeká na schválení"

### Testování jako admin:
1. Přihlaste se jako admin
2. Otevřete Admin Dashboard → Recenze
3. Měli byste vidět čekající recenzi
4. Schvalte nebo zamítněte
5. Ověřte změnu stavu

### Testování veřejného zobrazení:
1. Otevřete stránku dodavatele
2. Měli byste vidět pouze schválené recenze
3. Vyzkoušejte filtrování a řazení
4. Ověřte statistiky

## Troubleshooting

### Recenze se nezobrazují
- Zkontrolujte, zda jsou recenze schválené (`status: 'approved'`)
- Ověřte Firestore security rules
- Zkontrolujte console log pro chyby

### Nelze vytvořit recenzi
- Ověřte, že je uživatel přihlášen
- Zkontrolujte, zda uživatel již nerecenzoval tohoto dodavatele
- Ověřte, že text má min. 50 znaků

### Nefungují Firestore queries
- Vytvořte potřebné indexy (Firestore vás naviguje při prvním pokusu)
- Zkontrolujte konzoli Firestore pro chybějící indexy

## Support

Pro otázky a problémy kontaktujte development team.