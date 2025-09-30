# Image Compression - Komprese obrázků

## 📋 Přehled

Systém automatické komprese obrázků před nahráním do Firebase Storage. Zajišťuje optimální poměr mezi kvalitou a velikostí souboru, což vede k:
- ⚡ Rychlejšímu nahrávání
- 💰 Nižším nákladům na storage
- 🚀 Rychlejšímu načítání pro uživatele
- 📱 Lepšímu výkonu na mobilních zařízeních

## 🎯 Kompresní parametry

### Marketplace Vendors

#### Hlavní obrázky (`svatbot/`)
```typescript
{
  maxWidth: 1920,      // Full HD šířka
  maxHeight: 1920,     // Full HD výška
  quality: 0.85,       // 85% kvalita (vysoká)
  maxSizeKB: 800       // Max 800KB
}
```
**Použití:** Logo firmy, fotografie prostoru, vybavení

#### Portfolio obrázky (`portfolio/`)
```typescript
{
  maxWidth: 1600,      // Menší než hlavní
  maxHeight: 1600,     // Menší než hlavní
  quality: 0.8,        // 80% kvalita (dobrá)
  maxSizeKB: 600       // Max 600KB
}
```
**Použití:** Fotografie ze svateb, realizované projekty

### Moodboard

#### Inspirační obrázky (`moodboards/`)
```typescript
{
  maxWidth: 1200,      // Střední velikost
  maxHeight: 1200,     // Střední velikost
  quality: 0.8,        // 80% kvalita
  maxSizeKB: 500       // Max 500KB
}
```

#### Thumbnaily (`moodboards/thumbnails/`)
```typescript
{
  maxWidth: 300,       // Malý náhled
  maxHeight: 300,      // Malý náhled
  quality: 0.7,        // 70% kvalita (dostačující)
  maxSizeKB: 50        // Max 50KB
}
```

## 🔧 Implementace

### Utility funkce (`src/utils/imageCompression.ts`)

#### 1. `compressImage()`
Hlavní funkce pro kompresi obrázků.

```typescript
export async function compressImage(
  file: File, 
  options: CompressionOptions = {}
): Promise<CompressedImageResult>
```

**Parametry:**
- `file` - Původní soubor
- `options` - Kompresní parametry

**Návratová hodnota:**
```typescript
{
  file: File,              // Komprimovaný soubor
  originalSize: number,    // Původní velikost v bytech
  compressedSize: number,  // Komprimovaná velikost v bytech
  compressionRatio: number // Úspora v procentech
}
```

**Proces:**
1. Vytvoření Canvas elementu
2. Načtení obrázku do Image objektu
3. Výpočet nových rozměrů (zachování aspect ratio)
4. Vykreslení na canvas
5. Iterativní komprese s různou kvalitou
6. Vrácení nejlepšího výsledku

#### 2. `createThumbnail()`
Vytvoření malého náhledu.

```typescript
export async function createThumbnail(
  file: File,
  size: number = 200
): Promise<File>
```

**Použití:**
- Náhledy v galeriích
- Preview v seznamech
- Rychlé načítání

#### 3. `isValidImageFile()`
Validace typu souboru.

```typescript
export function isValidImageFile(file: File): boolean
```

**Podporované formáty:**
- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/webp`

#### 4. `formatFileSize()`
Formátování velikosti pro zobrazení.

```typescript
export function formatFileSize(bytes: number): string
```

**Příklad:**
- `1024` → `"1 KB"`
- `1048576` → `"1 MB"`
- `5242880` → `"5 MB"`

## 📊 Výsledky komprese

### Typické úspory

| Typ obrázku | Původní velikost | Po kompresi | Úspora |
|-------------|------------------|-------------|--------|
| Fotografie z mobilu (4K) | 8-12 MB | 400-800 KB | 90-95% |
| DSLR fotografie | 5-8 MB | 500-800 KB | 85-90% |
| Screenshot | 2-4 MB | 200-400 KB | 80-90% |
| Logo/grafika | 500 KB - 2 MB | 100-300 KB | 70-85% |

### Příklad z konzole

```
📸 Komprese obrázku: svatba_foto_001.jpg (8.5 MB)
✅ Komprese dokončena: 8.5 MB → 650 KB (92% úspora)
🔥 Nahrán do Firebase Storage: portfolio/abc123/1234567890_svatba_foto_001.jpg
```

## 🎨 UI/UX Feedback

### Progress indikátory

#### 1. Uploading state
```tsx
<div className="absolute inset-0 bg-black bg-opacity-60">
  <Loader2 className="w-8 h-8 animate-spin" />
  <p className="text-xs">Komprese a nahrávání...</p>
</div>
```

#### 2. Success state
```tsx
<div className="absolute inset-0 bg-green-500 bg-opacity-20">
  <div className="w-12 h-12 bg-green-500 rounded-full">
    <CheckIcon />
  </div>
  <div className="bg-green-600 text-white text-xs px-2 py-1 rounded">
    -{compressionRatio}% velikost
  </div>
</div>
```

#### 3. Error state
```tsx
<div className="absolute inset-0 bg-red-500 bg-opacity-20">
  <AlertCircle className="w-8 h-8" />
  <p className="text-xs">{error}</p>
</div>
```

## 🔐 Bezpečnost

### Validace na frontendu

```typescript
// Kontrola typu souboru
if (!isValidImageFile(file)) {
  throw new Error('Nepodporovaný formát obrázku')
}

// Kontrola velikosti
const maxSize = 10 * 1024 * 1024 // 10MB
if (file.size > maxSize) {
  throw new Error('Soubor je příliš velký (max 10MB)')
}

// Kontrola počtu souborů
if (files.length > maxFiles) {
  throw new Error(`Můžete nahrát maximálně ${maxFiles} obrázků`)
}
```

### Validace na backendu (Firebase Storage Rules)

```javascript
function isValidImageFile() {
  return request.resource.contentType.matches('image/.*') &&
         request.resource.size < 10 * 1024 * 1024; // 10MB limit
}
```

## ⚡ Výkon

### Optimalizace

#### 1. Canvas API
- Hardwarová akcelerace
- Nativní podpora v prohlížečích
- Rychlá komprese (< 1s pro většinu obrázků)

#### 2. Asynchronní zpracování
```typescript
// Paralelní komprese více obrázků
const compressionPromises = files.map(file => compressImage(file, options))
const results = await Promise.all(compressionPromises)
```

#### 3. Web Workers (budoucí vylepšení)
```typescript
// Komprese v separátním vlákně
const worker = new Worker('/workers/image-compression.js')
worker.postMessage({ file, options })
```

## 📱 Responzivní obrázky

### Budoucí implementace

#### 1. Generování více velikostí
```typescript
const sizes = [
  { width: 400, suffix: 'small' },
  { width: 800, suffix: 'medium' },
  { width: 1200, suffix: 'large' },
  { width: 1920, suffix: 'xlarge' }
]

for (const size of sizes) {
  const compressed = await compressImage(file, {
    maxWidth: size.width,
    maxHeight: size.width,
    quality: 0.8
  })
  // Upload s příponou _small, _medium, atd.
}
```

#### 2. Srcset v HTML
```tsx
<img
  src={image.url}
  srcSet={`
    ${image.url_small} 400w,
    ${image.url_medium} 800w,
    ${image.url_large} 1200w,
    ${image.url_xlarge} 1920w
  `}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  alt="Vendor image"
/>
```

## 🧪 Testování

### Manuální test

```typescript
// Test komprese
const file = new File([blob], 'test.jpg', { type: 'image/jpeg' })
const result = await compressImage(file, {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  maxSizeKB: 800
})

console.log('Original:', formatFileSize(result.originalSize))
console.log('Compressed:', formatFileSize(result.compressedSize))
console.log('Ratio:', result.compressionRatio + '%')
```

### Automatické testy

```typescript
describe('Image Compression', () => {
  it('should compress image to target size', async () => {
    const file = createMockImageFile(5 * 1024 * 1024) // 5MB
    const result = await compressImage(file, { maxSizeKB: 500 })
    expect(result.compressedSize).toBeLessThan(500 * 1024)
  })

  it('should maintain aspect ratio', async () => {
    const file = createMockImageFile(2000, 1000) // 2:1 ratio
    const result = await compressImage(file, { maxWidth: 1000 })
    // Check that ratio is preserved
  })

  it('should handle invalid files', async () => {
    const file = new File(['text'], 'test.txt', { type: 'text/plain' })
    await expect(compressImage(file)).rejects.toThrow()
  })
})
```

## 📊 Monitoring

### Metriky ke sledování

```typescript
// Log komprese
console.log({
  filename: file.name,
  originalSize: result.originalSize,
  compressedSize: result.compressedSize,
  compressionRatio: result.compressionRatio,
  duration: Date.now() - startTime,
  userId: user.uid,
  type: 'marketplace_vendor'
})
```

### Firebase Analytics

```typescript
import { logEvent } from 'firebase/analytics'

logEvent(analytics, 'image_compressed', {
  compression_ratio: result.compressionRatio,
  original_size_mb: (result.originalSize / 1024 / 1024).toFixed(2),
  compressed_size_kb: (result.compressedSize / 1024).toFixed(0),
  image_type: type
})
```

## 🚀 Budoucí vylepšení

### 1. WebP format
- Lepší komprese než JPEG (25-35% menší)
- Podpora v moderních prohlížečích
- Fallback na JPEG pro starší prohlížeče

### 2. AVIF format
- Nejlepší komprese (50% menší než JPEG)
- Postupně rostoucí podpora
- Fallback chain: AVIF → WebP → JPEG

### 3. Progressive JPEG
- Postupné načítání (blur-up effect)
- Lepší UX při pomalém připojení

### 4. Image CDN
- ImageKit, Cloudinary, nebo Imgix
- On-the-fly transformace
- Automatická optimalizace
- Globální CDN

## 📞 Podpora

Pro otázky nebo problémy:
- GitHub Issues
- Email: support@svatbot.cz
- Dokumentace: `/docs`

