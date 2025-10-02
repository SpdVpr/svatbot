# 📸 Systém fotek ubytování a pokojů - Dokumentace

## 🎯 Přehled

Kompletní systém pro nahrávání, správu a zobrazování fotek ubytování a pokojů. Zahrnuje kompresi obrázků, Firebase Storage integraci, responzivní galerii a vizuální progress indikátory.

## 🏗️ Architektura

### Komponenty

#### 1. **RoomImageUpload** (`src/components/accommodation/RoomImageUpload.tsx`)
- **Účel**: Nahrávání fotek pokojů s drag & drop
- **Funkce**:
  - Drag & drop interface
  - Komprese obrázků před nahráním
  - Vizuální progress indikátor s procenty
  - Náhledy během nahrávání
  - Validace souborů (typ, velikost)
  - Mazání fotek

#### 1b. **AccommodationImageUpload** (`src/components/accommodation/AccommodationImageUpload.tsx`)
- **Účel**: Nahrávání fotek ubytování (jednodušší verze)
- **Funkce**:
  - Drag & drop interface
  - Komprese obrázků před nahráním
  - Jednoduchý loading indikátor
  - Auto-upload po výběru
  - Validace souborů (typ, velikost)
  - Mazání fotek

#### 2. **RoomImageGallery** (`src/components/accommodation/RoomImageGallery.tsx`)
- **Účel**: Zobrazení fotek pokojů v plnohodnotné galerii
- **Funkce**:
  - Fullscreen modal galerie
  - Navigace šipkami (klávesnice i myš)
  - Thumbnail strip
  - Počítadlo fotek
  - Responzivní design

#### 3. **RoomImageEditor** (`src/components/accommodation/RoomImageEditor.tsx`)
- **Účel**: Editace fotek existujících pokojů
- **Funkce**:
  - Toggle mezi view/edit módem
  - Inline editace fotek
  - Save/Cancel akce

### Hook rozšíření

#### **useAccommodation** (`src/hooks/useAccommodation.ts`)
- **Rozšíření**: Přidáno `images?: string[]` do `RoomFormData`
- **Funkce**: Podpora fotek při vytváření pokojů

## 🔧 Technické detaily

### Firebase Storage struktura
```
weddings/{weddingId}/accommodations/rooms/{timestamp}_{filename}
```

### Komprese obrázků
- **Rozměry**: Max 1600x1600px
- **Kvalita**: 80%
- **Max velikost**: 800KB
- **Formát**: JPEG (po kompresi)

### Storage pravidla
```javascript
// Wedding photos and documents (including accommodation room photos)
match /weddings/{weddingId}/{allPaths=**} {
  allow read: if isAuthenticated() &&
                 firestore.exists(/databases/(default)/documents/weddings/$(weddingId)) &&
                 firestore.get(/databases/(default)/documents/weddings/$(weddingId)).data.userId == request.auth.uid;
  allow write: if isAuthenticated() &&
                  firestore.exists(/databases/(default)/documents/weddings/$(weddingId)) &&
                  firestore.get(/databases/(default)/documents/weddings/$(weddingId)).data.userId == request.auth.uid &&
                  request.resource.size < 10 * 1024 * 1024 && // 10MB limit
                  request.resource.contentType.matches('image/.*');
  allow delete: if isAuthenticated() &&
                   firestore.exists(/databases/(default)/documents/weddings/$(weddingId)) &&
                   firestore.get(/databases/(default)/documents/weddings/$(weddingId)).data.userId == request.auth.uid;
}
```

## 📱 Uživatelské rozhraní

### Vytváření pokoje
1. **Formulář pokoje** obsahuje sekci "Fotky pokoje"
2. **Drag & drop area** pro nahrávání fotek
3. **Grid náhledů** s progress indikátory
4. **Kompresní statistiky** zobrazené po nahrání

### Detail ubytování
1. **Karta pokoje** zobrazuje první fotku
2. **Indikátor počtu fotek** (+X fotek)
3. **Kliknutí na fotku** otevře galerii
4. **Hover efekt** pro interaktivitu

### Galerie fotek
1. **Fullscreen modal** s černým pozadím
2. **Navigace šipkami** (klávesnice + UI)
3. **Thumbnail strip** pro rychlý přechod
4. **Počítadlo fotek** (X / Y)
5. **ESC klávesa** pro zavření

## 🚀 Použití

### Základní implementace
```tsx
import RoomImageUpload from '@/components/accommodation/RoomImageUpload'

function RoomForm() {
  const [roomImages, setRoomImages] = useState<string[]>([])
  
  return (
    <RoomImageUpload
      images={roomImages}
      onImagesChange={setRoomImages}
      maxImages={10}
    />
  )
}
```

### Galerie s hookem
```tsx
import RoomImageGallery, { useRoomImageGallery } from '@/components/accommodation/RoomImageGallery'

function AccommodationDetail() {
  const { isOpen, images, roomName, initialIndex, openGallery, closeGallery } = useRoomImageGallery()
  
  return (
    <>
      <img 
        onClick={() => openGallery(room.images, room.name, 0)}
        src={room.images[0]} 
      />
      
      <RoomImageGallery
        images={images}
        roomName={roomName}
        isOpen={isOpen}
        onClose={closeGallery}
        initialIndex={initialIndex}
      />
    </>
  )
}
```

## 🔒 Bezpečnost

### Validace souborů
- **Typy**: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
- **Velikost**: Max 10MB před kompresí
- **Komprese**: Automatická před nahráním

### Přístupová práva
- **Čtení**: Vlastník svatby
- **Zápis**: Vlastník svatby + validace typu souboru
- **Mazání**: Vlastník svatby

## 📊 Výkon

### Optimalizace
- **Lazy loading** obrázků v galerii
- **Komprese** před nahráním (úspora ~60-80%)
- **Thumbnail generování** pro rychlé náhledy
- **CDN** přes Firebase Storage

### Limity
- **Max fotek na pokoj**: 10
- **Max velikost souboru**: 10MB
- **Podporované formáty**: JPEG, PNG, WebP

## 🔄 Budoucí rozšíření

### Plánované funkce
1. **Bulk upload** více fotek najednou
2. **Drag & drop reordering** fotek
3. **Automatické thumbnail generování**
4. **EXIF data čištění** pro soukromí
5. **Watermark** pro ochranu fotek
6. **Slideshow mód** v galerii

### Možná vylepšení
1. **AI popisky** fotek
2. **Automatická kategorizace** (koupelna, ložnice, atd.)
3. **360° fotky** podporu
4. **Video podpora** pro room tours
5. **Integrace s Google Photos**

## 🐛 Řešení problémů

### Časté problémy
1. **Fotka se nenahraje**: Zkontrolujte velikost a formát
2. **Pomalé nahrávání**: Komprese může trvat u velkých fotek
3. **Galerie se neotevře**: Zkontrolujte, že jsou fotky v room.images

### Debug tipy
```javascript
// Logování komprese
console.log(`📸 Komprese: ${originalSize} → ${compressedSize} (${ratio}% úspora)`)

// Kontrola Storage pravidel
firebase.storage().ref().child('test').put(file)
```

## ✅ Testování

### Manuální testy
1. **Upload**: Nahrání různých formátů a velikostí
2. **Galerie**: Navigace, zavírání, responzivita
3. **Komprese**: Kontrola velikosti před/po
4. **Permissions**: Test s různými uživateli

### Automatické testy
```bash
npm test -- --testPathPattern=RoomImage
```

---

**Status**: ✅ Implementováno a funkční
**Verze**: 1.0.0
**Poslední aktualizace**: 2025-01-02
