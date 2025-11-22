# Google Places Integrace - Návod pro dodavatele

## 🎯 Co to je a proč to potřebujete?

Propojením vašeho Google Business profilu s SvatBot marketplace automaticky zobrazíme:
- ⭐ Vaše Google hodnocení (rating)
- 📊 Počet Google recenzí
- 💬 5 nejnovějších Google recenzí
- 🔗 Odkaz na váš Google Maps profil

**Výhody:**
- Zvýšená důvěryhodnost (Google recenze jsou ověřené)
- Automatická aktualizace hodnocení (1× denně)
- Více recenzí = více zákazníků
- Žádná ruční práce - vše automaticky

---

## 📋 Jak najít Google Place ID (3 způsoby)

### Způsob 1: Přes Google Maps URL (NEJJEDNODUŠŠÍ) ✅

1. Otevřete [Google Maps](https://www.google.com/maps)
2. Vyhledejte svou firmu
3. Zkopírujte URL adresu z prohlížeče
4. Vložte ji do registračního formuláře

**Příklady URL:**
```
https://maps.google.com/?cid=1234567890123456789
https://goo.gl/maps/abc123xyz
https://www.google.com/maps/place/Foto+Studio+Praha/@50.0755,14.4378,17z/...
```

### Způsob 2: Přes Place ID Finder

1. Otevřete [Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder)
2. Vyhledejte svou firmu
3. Zkopírujte Place ID (začína na "ChIJ...")
4. Vložte ho do registračního formuláře

**Příklad Place ID:**
```
ChIJN1t_tDeuEmsRUsoyG83frY4
```

### Způsob 3: Přes Google Business Profile

1. Přihlaste se do [Google Business Profile](https://business.google.com/)
2. Vyberte svou firmu
3. Klikněte na "Zobrazit profil"
4. Zkopírujte URL z prohlížeče

---

## 🔧 Implementace v SvatBot

### Pro dodavatele (registrace)

Při registraci na marketplace vyplňte sekci "Google hodnocení":

```
┌─────────────────────────────────────┐
│ 🌟 Google hodnocení (volitelné)    │
├─────────────────────────────────────┤
│                                     │
│ Google Maps URL:                    │
│ [https://maps.google.com/?cid=...] │
│                                     │
│ Google Place ID (pokud znáte):     │
│ [ChIJN1t_tDeuEmsRUsoyG83frY4]     │
│                                     │
└─────────────────────────────────────┘
```

**Stačí vyplnit jedno z polí!**

### Pro adminy

Admin může:
- Manuálně aktualizovat Google data (tlačítko v admin dashboardu)
- Zobrazit datum poslední aktualizace
- Vidět chybové stavy (pokud Place ID není validní)

---

## 📊 Jak to vypadá na marketplace

### Na kartě dodavatele:

```
┌─────────────────────────────────────┐
│ [Foto dodavatele]                   │
│                                     │
│ Foto Studio Praha                  │
│ Profesionální svatební fotografie  │
│                                     │
│ ⭐ 4.9 (15 SvatBot recenzí)        │
│ 🌐 4.8 (127 Google recenzí)        │
│                                     │
│ 📍 Praha, Středočeský kraj         │
└─────────────────────────────────────┘
```

### Na detailu dodavatele:

```
┌─────────────────────────────────────┐
│ RECENZE A HODNOCENÍ                 │
├─────────────────────────────────────┤
│                                     │
│ SvatBot recenze (15) ✅ Ověřené    │
│ [Seznam SvatBot recenzí...]         │
│                                     │
├─────────────────────────────────────┤
│                                     │
│ Google recenze (127) 🌐             │
│ ⭐ 4.8 / 5.0                        │
│                                     │
│ [5 nejnovějších Google recenzí]     │
│                                     │
│ [Zobrazit všechny na Google Maps]   │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔄 Automatická aktualizace

- **Frekvence:** 1× denně (v noci)
- **Náklady:** ZDARMA (v rámci Google free tieru)
- **Limit:** 11,700 requestů/měsíc zdarma
- **Naše spotřeba:** ~3,000 requestů/měsíc (100 dodavatelů × 1× denně)

### Jak to funguje:

```
1. Firebase Function (scheduled)
   ↓
2. Každý den ve 3:00 ráno
   ↓
3. Zavolá Google Places API pro každého dodavatele
   ↓
4. Uloží data do Firestore
   ↓
5. Marketplace zobrazuje aktuální data (bez API callů)
```

---

## ❓ FAQ

**Q: Je to povinné?**
A: Ne, je to volitelné. Ale silně doporučené pro zvýšení důvěryhodnosti.

**Q: Co když nemám Google Business profil?**
A: Vytvořte si ho zdarma na [business.google.com](https://business.google.com/)

**Q: Jak často se data aktualizují?**
A: Automaticky 1× denně. Admin může aktualizovat i manuálně.

**Q: Zobrazí se všechny moje Google recenze?**
A: Na marketplace se zobrazí 5 nejnovějších. Odkaz "Zobrazit všechny" vede na Google Maps.

**Q: Co když zadám špatné Place ID?**
A: Systém to detekuje a zobrazí chybovou hlášku. Můžete to opravit v editaci profilu.

**Q: Můžu to změnit později?**
A: Ano, kdykoliv můžete upravit Google Place ID přes editační odkaz.

---

## 🛠️ Technické detaily (pro vývojáře)

### API Endpoint:
```
POST /api/google-places/details
Body: { placeId: "ChIJ..." }
```

### Environment Variables:
```bash
GOOGLE_PLACES_API_KEY=your_api_key_here
```

### Firebase Function:
```typescript
// functions/src/scheduled/updateGoogleRatings.ts
export const updateGoogleRatings = functions
  .pubsub
  .schedule('0 3 * * *') // Every day at 3 AM
  .onRun(async (context) => {
    // Update all vendors
  })
```

### Vendor Data Model:
```typescript
interface MarketplaceVendor {
  // ...
  google?: {
    placeId?: string
    mapsUrl?: string
    rating?: number
    reviewCount?: number
    reviews?: GoogleReview[]
    lastUpdated?: Date
  }
}
```

