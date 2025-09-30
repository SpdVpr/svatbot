# Marketplace - Upload obrázků pro dodavatele

## 📋 Přehled

Systém pro nahrávání obrázků umožňuje dodavatelům prezentovat svou práci pomocí fotografií. Každý dodavatel může nahrát:
- **Hlavní obrázky** (max 5) - fotografie firmy, vybavení, prostoru
- **Portfolio** (max 15) - fotografie z realizovaných svateb a projektů
- **Video URL** - odkaz na YouTube/Vimeo video

## 🎯 Funkce

### Pro dodavatele:
- ✅ Drag & drop upload obrázků
- ✅ Náhled před nahráním
- ✅ Progress indikátor při nahrávání
- ✅ Validace velikosti (max 5MB na obrázek)
- ✅ Validace formátu (JPG, PNG, WEBP)
- ✅ Možnost odstranit obrázky
- ✅ Real-time preview nahraných obrázků

### Pro návštěvníky:
- ✅ Galerie obrázků na detail stránce dodavatele
- ✅ Náhled hlavních obrázků
- ✅ Portfolio galerie (zobrazení prvních 9, možnost zobrazit všechny)
- ✅ Video prezentace (YouTube/Vimeo embed)
- ✅ Responzivní grid layout

## 🏗️ Architektura

### Komponenty

#### 1. `ImageUploadSection` (`src/components/marketplace/ImageUploadSection.tsx`)

Univerzální komponenta pro upload obrázků s následujícími funkcemi:

**Props:**
```typescript
interface ImageUploadSectionProps {
  images: string[]              // Pole URL nahraných obrázků
  onImagesChange: (images: string[]) => void  // Callback při změně
  maxImages?: number            // Max počet obrázků (default: 10)
  title: string                 // Nadpis sekce
  description: string           // Popis sekce
  type: 'main' | 'portfolio'   // Typ obrázků
}
```

**Funkce:**
- Drag & drop area
- File input (multiple)
- Preview pending images
- Upload progress
- Success/error states
- Remove images
- Image counter

**Validace:**
- Maximální počet obrázků
- Maximální velikost souboru (5MB)
- Povolené formáty (image/*)

**UI States:**
- **Uploading** - spinner + "Nahrávání..."
- **Uploaded** - zelený checkmark
- **Error** - červený alert icon + chybová hláška
- **Hover** - tlačítko pro odstranění

#### 2. `MarketplaceVendorForm` - Krok 4 (Portfolio & Dostupnost)

Integruje `ImageUploadSection` pro:
- Hlavní obrázky (max 5)
- Portfolio obrázky (max 15)
- Video URL input

```typescript
<ImageUploadSection
  images={formData.images}
  onImagesChange={(images) => handleChange('images', images)}
  maxImages={5}
  title="Hlavní obrázky"
  description="Nahrájte hlavní fotografie vaší firmy..."
  type="main"
/>

<ImageUploadSection
  images={formData.portfolioImages}
  onImagesChange={(images) => handleChange('portfolioImages', images)}
  maxImages={15}
  title="Portfolio"
  description="Ukažte svou práci! Nahrájte fotografie..."
  type="portfolio"
/>
```

#### 3. Vendor Detail Page - Galerie

Zobrazuje nahrané obrázky v responzivním gridu:

**Hlavní obrázky:**
- Grid 2-3 sloupce (responsive)
- Aspect ratio 1:1
- Hover efekt (opacity)

**Portfolio:**
- Grid 2-3 sloupce (responsive)
- Zobrazení prvních 9 obrázků
- Tlačítko "Zobrazit všech X fotografií"

**Video:**
- Aspect ratio 16:9
- YouTube/Vimeo embed
- Responsive iframe

#### 4. Admin Panel - Náhled obrázků

Admin může vidět všechny nahrané obrázky v detail modalu:
- Hlavní obrázky (grid 3-4 sloupce)
- Portfolio obrázky (grid 3-4 sloupce)
- Počet obrázků v každé kategorii

## 🔥 Firebase Storage

### Storage Structure

```
svatbot-app.firebasestorage.app/
├── svatbot/
│   └── {userId}/
│       ├── {timestamp}_image1.jpg
│       ├── {timestamp}_image2.jpg
│       └── ...
└── portfolio/
    └── {userId}/
        ├── {timestamp}_portfolio1.jpg
        ├── {timestamp}_portfolio2.jpg
        └── ...
```

### Storage Rules

```javascript
// Vendor images (marketplace)
match /svatbot/{userId}/{fileName} {
  allow read: if true; // Public read
  allow write: if isOwner(userId) && isValidImageFile();
  allow delete: if isOwner(userId) || isAdmin();
}

// Portfolio images
match /portfolio/{userId}/{fileName} {
  allow read: if true; // Public read
  allow write: if isOwner(userId) && isValidImageFile();
  allow delete: if isOwner(userId) || isAdmin();
}

function isValidImageFile() {
  return request.resource.contentType.matches('image/.*') &&
         request.resource.size < 10 * 1024 * 1024; // 10MB limit
}
```

### Upload Process

**✅ Aktuální implementace (Firebase Storage s kompresí):**
1. Uživatel vybere soubory
2. **Komprese obrázku** pomocí Canvas API:
   - Hlavní obrázky: max 1920x1920px, kvalita 85%, max 800KB
   - Portfolio: max 1600x1600px, kvalita 80%, max 600KB
   - Automatická optimalizace kvality pro dosažení cílové velikosti
3. Upload komprimovaného obrázku do Firebase Storage pomocí `uploadBytes()`
4. Získání download URL pomocí `getDownloadURL()`
5. URL se uloží do Firestore
6. Zobrazí se v galerii s info o úspoře místa

**Kompresní parametry:**
```typescript
// Hlavní obrázky (svatbot/)
{
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  maxSizeKB: 800
}

// Portfolio obrázky (portfolio/)
{
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.8,
  maxSizeKB: 600
}
```

**Výhody komprese:**
- ✅ Úspora 60-80% velikosti souboru
- ✅ Rychlejší nahrávání
- ✅ Rychlejší načítání pro návštěvníky
- ✅ Nižší náklady na Firebase Storage
- ✅ Lepší výkon aplikace

## 📱 Responsive Design

### Mobile (< 768px)
- Upload area: plná šířka
- Grid: 2 sloupce
- Touch-friendly tlačítka

### Tablet (768px - 1024px)
- Upload area: plná šířka
- Grid: 3 sloupce
- Hover efekty

### Desktop (> 1024px)
- Upload area: plná šířka
- Grid: 3-4 sloupce
- Hover efekty + tooltips

## 🎨 UI/UX Features

### Upload Area
- **Drag & Drop** - vizuální feedback při přetahování
- **Click to upload** - alternativa k drag & drop
- **Progress counter** - "X / Y nahráno"
- **File type info** - "PNG, JPG, WEBP do 5MB"

### Image Preview
- **Pending state** - šedý border, spinner
- **Uploading state** - overlay s spinnerem
- **Uploaded state** - zelený overlay s checkmarkem
- **Error state** - červený overlay s error ikonou
- **Hover state** - tlačítko pro odstranění

### Gallery Display
- **Grid layout** - responzivní
- **Aspect ratio** - konzistentní 1:1
- **Lazy loading** - optimalizace výkonu
- **Lightbox** - (připraveno pro budoucí implementaci)

## 🔐 Bezpečnost

### Validace na frontendu
- ✅ Typ souboru (image/*)
- ✅ Velikost souboru (max 5MB)
- ✅ Počet souborů (max 5/15)
- ✅ Autentizace uživatele

### Validace na backendu (Firebase Storage Rules)
- ✅ Typ souboru (image/.*)
- ✅ Velikost souboru (max 10MB)
- ✅ Vlastnictví (userId)
- ✅ Autentizace

### Ochrana dat
- ✅ Public read (marketplace je veřejný)
- ✅ Authenticated write (pouze přihlášení uživatelé)
- ✅ Owner delete (pouze vlastník nebo admin)

## 🚀 Optimalizace

### ✅ Implementované optimalizace
- ✅ **Komprese obrázků** - Canvas API s automatickou optimalizací kvality
- ✅ **Firebase Storage** - CDN s globální distribucí
- ✅ **Lazy loading** - obrázky se načítají až při zobrazení
- ✅ **Responzivní grid** - optimalizované pro všechna zařízení
- ✅ **Progress feedback** - uživatel vidí průběh komprese a uploadu
- ✅ **Compression ratio** - zobrazení úspory místa

### 🔄 Budoucí vylepšení
- ⏳ Generování thumbnailů (Firebase Functions)
- ⏳ WebP format (lepší komprese než JPEG)
- ⏳ Responsive images (srcset pro různé velikosti)
- ⏳ Image CDN (ImageKit, Cloudinary)
- ⏳ Progressive loading (blur-up effect)

### Doporučené vylepšení

#### 1. Image Compression
```typescript
import imageCompression from 'browser-image-compression'

const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  }
  return await imageCompression(file, options)
}
```

#### 2. Thumbnail Generation
```typescript
// Firebase Function
export const generateThumbnail = functions.storage
  .object()
  .onFinalize(async (object) => {
    const bucket = admin.storage().bucket()
    const filePath = object.name
    const fileName = path.basename(filePath)
    
    // Generate thumbnail using Sharp
    const thumbnail = await sharp(tempFilePath)
      .resize(300, 300, { fit: 'cover' })
      .toBuffer()
    
    // Upload thumbnail
    await bucket.file(`thumbnails/${fileName}`).save(thumbnail)
  })
```

#### 3. Progressive Loading
```typescript
<img
  src={thumbnailUrl}
  data-src={fullImageUrl}
  className="lazy-load"
  loading="lazy"
/>
```

## 🧪 Testování

### Manuální test
1. ✅ Otevřít `/marketplace/register`
2. ✅ Přejít na krok 4
3. ✅ Drag & drop obrázky
4. ✅ Zkontrolovat preview
5. ✅ Zkontrolovat upload progress
6. ✅ Odeslat formulář
7. ✅ Zkontrolovat detail stránku dodavatele
8. ✅ Zkontrolovat admin panel

### Edge cases
- [ ] Příliš velký soubor (> 5MB)
- [ ] Neplatný formát (PDF, TXT)
- [ ] Příliš mnoho souborů (> max)
- [ ] Duplicitní soubory
- [ ] Pomalé připojení
- [ ] Chyba při uploadu
- [ ] Odstranění obrázku během uploadu

## 📊 Metriky

### Sledované metriky
- Průměrný počet obrázků na dodavatele
- Průměrná velikost obrázků
- Úspěšnost uploadů (%)
- Čas uploadu
- Chybovost uploadů

### Cíle
- 🎯 Průměrně 3-5 hlavních obrázků
- 🎯 Průměrně 8-12 portfolio obrázků
- 🎯 95%+ úspěšnost uploadů
- 🎯 < 3s čas uploadu na obrázek

## ✅ Implementace komprese a uploadu

### Krok 1: Komprese obrázku
```typescript
import { compressImage, formatFileSize } from '@/utils/imageCompression'

// Komprese s různými parametry podle typu
const compressionOptions = type === 'main'
  ? { maxWidth: 1920, maxHeight: 1920, quality: 0.85, maxSizeKB: 800 }
  : { maxWidth: 1600, maxHeight: 1600, quality: 0.8, maxSizeKB: 600 }

const compressedResult = await compressImage(file, compressionOptions)

console.log(`✅ Komprese: ${formatFileSize(compressedResult.originalSize)} → ${formatFileSize(compressedResult.compressedSize)} (${compressedResult.compressionRatio}% úspora)`)
```

### Krok 2: Upload do Firebase Storage
```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/config/firebase'

// Vytvoření unikátního názvu souboru
const timestamp = Date.now()
const folder = type === 'main' ? 'svatbot' : 'portfolio'
const filename = `${folder}/${user.uid}/${timestamp}_${file.name}`

// Upload komprimovaného souboru
const storageRef = ref(storage, filename)
const snapshot = await uploadBytes(storageRef, compressedResult.file)
const downloadURL = await getDownloadURL(snapshot.ref)
```

### Krok 3: Uložení URL do Firestore
```typescript
// URL se uloží do pole images nebo portfolioImages
onImagesChange([...images, downloadURL])

// Při odeslání formuláře se uloží do Firestore
await addDoc(collection(db, 'marketplaceVendors'), {
  ...vendorData,
  images: formData.images,  // Pole URL z Firebase Storage
  portfolioImages: formData.portfolioImages
})
```

### Výsledek
- ✅ Obrázky jsou komprimované (60-80% úspora)
- ✅ Uložené v Firebase Storage (CDN)
- ✅ URL v Firestore (rychlý přístup)
- ✅ Veřejně přístupné (marketplace je public)

## 📞 Podpora

Pro otázky nebo problémy:
- GitHub Issues
- Email: support@svatbot.cz
- Admin panel: Sekce "Podpora"

