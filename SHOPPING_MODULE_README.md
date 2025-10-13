# 🛒 Nákupní seznam (Shopping List) - Dokumentace

## 📋 Přehled

Nový modul **Nákupní seznam** umožňuje uživatelům spravovat produkty a zboží, které chtějí na svatbu pořídit. Modul automaticky načítá metadata z URL produktů (název, obrázek, cena) a zobrazuje je v přehledné galerii.

---

## ✨ Hlavní funkce

### 1. **Automatické načítání metadat z URL**
- Vložte URL produktu (např. z e-shopu)
- Automaticky se načte:
  - 📝 Název produktu
  - 🖼️ Obrázek produktu
  - 💰 Cena
  - 📄 Popis
- Pokud se metadata nenačtou, uživatel je může doplnit ručně

### 2. **Galerie produktů**
- **Grid view** - mřížka s velkými obrázky
- **List view** - seznam s kompaktním zobrazením
- Hover efekty s akcemi (zakoupit, upravit, smazat, otevřít odkaz)

### 3. **Statistiky**
- 📦 Celkem produktů
- ✅ Zakoupeno (počet + procenta)
- ⏳ Zbývá koupit
- 💵 Celková hodnota (celkem + zaplaceno + zbývá)

### 4. **Filtrace a vyhledávání**
- 🔍 Fulltextové vyhledávání
- 🏷️ Filtr podle kategorie
- 📊 Filtr podle stavu (všechny / zakoupeno / zbývá koupit)

### 5. **Kategorie produktů**
- 🎨 Dekorace
- 👗 Oblečení
- 💍 Doplňky
- 🎁 Dárky
- 📝 Papírenské zboží
- 💐 Květiny
- 🍰 Jídlo a pití
- 📷 Technika
- 📦 Ostatní

### 6. **Stavy produktů**
- 💭 Přání (wishlist)
- 🛒 Koupit (to-buy)
- 📦 Objednáno (ordered)
- ✅ Zakoupeno (purchased)
- ❌ Zrušeno (cancelled)

---

## 🗂️ Struktura souborů

```
src/
├── types/
│   └── shopping.ts                          # TypeScript typy
├── hooks/
│   └── useShopping.ts                       # React hook pro shopping list
├── components/
│   ├── dashboard/modules/
│   │   └── ShoppingListModule.tsx           # Dashboard modul
│   └── shopping/
│       ├── ShoppingItemCard.tsx             # Karta produktu
│       └── ShoppingItemForm.tsx             # Formulář pro přidání/úpravu
├── app/
│   ├── shopping/
│   │   └── page.tsx                         # Hlavní stránka shopping list
│   └── api/
│       └── metadata/
│           └── route.ts                     # API endpoint pro načítání metadat
└── SHOPPING_MODULE_README.md                # Tato dokumentace
```

---

## 🎨 Design koncepty

### **Barvy**
- **Primární barva**: Fialová (`purple-600`) - konzistentní s ostatními moduly
- **Sekundární barvy**:
  - Zelená pro "zakoupeno"
  - Oranžová pro "zbývá koupit"
  - Modrá pro celkovou hodnotu

### **Ikony**
- 🛒 ShoppingCart - hlavní ikona modulu
- 📦 Package - produkty
- ✅ CheckCircle - zakoupeno
- ⏳ Clock - zbývá koupit
- 📈 TrendingUp - celková hodnota

### **Komponenty**
- `wedding-card` - standardní karta s gradientem a stínem
- Hover efekty s `scale` a `shadow` transformacemi
- Smooth transitions (300ms)

---

## 🔧 Technické detaily

### **Firebase Firestore struktura**

```typescript
collection: 'shopping'
{
  id: string                    // Auto-generated
  weddingId: string             // Reference na svatbu
  userId: string                // Reference na uživatele
  name: string                  // Název produktu
  url?: string                  // URL produktu
  imageUrl?: string             // URL obrázku
  price?: number                // Cena
  currency: string              // Měna (CZK, EUR, USD)
  description?: string          // Popis
  category?: ShoppingCategory   // Kategorie
  priority?: 'low' | 'medium' | 'high'
  status: 'wishlist' | 'to-buy' | 'ordered' | 'purchased' | 'cancelled'
  isPurchased: boolean          // Rychlý přístup k stavu
  purchaseDate?: Date           // Datum nákupu
  notes?: string                // Poznámky
  tags: string[]                // Tagy
  createdAt: Date               // Datum vytvoření
  updatedAt: Date               // Datum poslední úpravy
}
```

### **API Endpoint: /api/metadata**

**Request:**
```
GET /api/metadata?url=https://example.com/product
```

**Response:**
```json
{
  "title": "Název produktu",
  "description": "Popis produktu",
  "image": "https://example.com/image.jpg",
  "price": "1299.00",
  "currency": "CZK"
}
```

**Podporované meta tagy:**
- `og:title`, `<title>`
- `og:description`, `<meta name="description">`
- `og:image`
- `product:price:amount`, `og:price:amount`
- `product:price:currency`

---

## 📱 Responzivita

### **Mobile (< 768px)**
- Grid: 1 sloupec
- Statistiky: 1 sloupec
- Filtry: vertikální stack

### **Tablet (768px - 1024px)**
- Grid: 2 sloupce
- Statistiky: 2 sloupce
- Filtry: horizontální řádek

### **Desktop (> 1024px)**
- Grid: 3-4 sloupce
- Statistiky: 4 sloupce
- Filtry: horizontální řádek s view toggle

---

## 🚀 Použití

### **1. Dashboard modul**

Modul se automaticky zobrazí na dashboardu:

```tsx
<ShoppingListModule />
```

Zobrazuje:
- Celkový počet produktů
- Progress bar zakoupených produktů
- Statistiky (zakoupeno / zbývá)
- Cenové statistiky
- Tlačítko "Spravovat nákupy"

### **2. Hlavní stránka**

Přístup přes: `/shopping`

```tsx
import { useShopping } from '@/hooks/useShopping'

const { items, stats, loading, addItem, updateItem, deleteItem } = useShopping()
```

### **3. Přidání produktu**

```tsx
await addItem({
  name: 'Svatební dekorace',
  url: 'https://example.com/product',
  price: 1299,
  currency: 'CZK',
  category: 'decoration',
  status: 'wishlist'
})
```

### **4. Aktualizace produktu**

```tsx
await updateItem(itemId, {
  status: 'purchased',
  notes: 'Zakoupeno v obchodě XYZ'
})
```

---

## 🎯 Integrace s ostatními moduly

### **Budget modul**
- Produkty lze propojit s rozpočtem
- Ceny se mohou automaticky přenést do budget items

### **Tasks modul**
- Lze vytvořit úkoly pro nákup produktů
- Automatické označení úkolu jako hotového při zakoupení

### **Vendors modul**
- Propojení produktů s dodavateli
- Sledování, od koho byl produkt zakoupen

---

## 🔮 Budoucí vylepšení

1. **Automatické propojení s Budget**
   - Tlačítko "Přidat do rozpočtu"
   - Synchronizace cen

2. **Sdílení seznamu**
   - Sdílení s partnerem/rodinou
   - Označení "kdo to koupí"

3. **Notifikace**
   - Upozornění na slevy (pokud je URL sledována)
   - Připomínky k nákupu

4. **Import z e-shopů**
   - Rozšíření podpory pro více e-shopů
   - Lepší parsing cen a obrázků

5. **Wishlist export**
   - Export do PDF
   - Sdílení přes link

---

## 📊 Statistiky a metriky

Modul sleduje:
- ✅ Počet produktů (celkem / zakoupeno / zbývá)
- 💰 Finanční metriky (celková hodnota / zaplaceno / zbývá)
- 📈 Progress (% zakoupených produktů)
- 🏷️ Rozložení podle kategorií
- 📊 Rozložení podle stavů

---

## 🎨 UI/UX principy

1. **Jednoduchost** - minimalistický design, jasné akce
2. **Vizuální feedback** - hover efekty, animace, progress bary
3. **Konzistence** - stejný design jako ostatní moduly
4. **Responzivita** - funguje na všech zařízeních
5. **Rychlost** - real-time aktualizace přes Firebase

---

## 🐛 Známé limitace

1. **Metadata parsing**
   - Ne všechny e-shopy mají správné meta tagy
   - Některé stránky blokují scraping
   - Řešení: Ruční doplnění údajů

2. **CORS**
   - Některé domény mohou blokovat API požadavky
   - Řešení: Proxy server nebo ruční zadání

3. **Ceny**
   - Ceny se neaktualizují automaticky
   - Řešení: Manuální aktualizace nebo budoucí webhook

---

## 📝 Changelog

### v1.0.0 (2025-01-13)
- ✅ Základní funkcionalita
- ✅ Automatické načítání metadat
- ✅ Grid a List view
- ✅ Filtrace a vyhledávání
- ✅ Dashboard modul
- ✅ Statistiky
- ✅ Firebase integrace

---

**Vytvořeno pro SvatBot.cz** 💍

