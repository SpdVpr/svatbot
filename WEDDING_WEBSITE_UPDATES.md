# Wedding Website Builder - Informace o svatbě - Aktualizace

## Přehled změn

Byly implementovány následující vylepšení pro sekci "Informace o svatbě" ve wedding website builderu:

### 1. Barevná paleta pro Dress Code
- **Nová funkcionalita**: Přidána možnost definovat barevnou paletu svatby
- **Umístění**: Integrováno do sekce Dress Code
- **Funkce**:
  - Možnost přidat až 6 barev
  - Color picker pro snadný výběr barev
  - Textové pole pro ruční zadání hex kódů
  - Možnost odstranění jednotlivých barev
  - Zobrazení barevné palety na svatebním webu

### 2. Google Maps integrace
- **Nová funkcionalita**: Automatické zobrazení Google Maps pro místa konání
- **Umístění**: Obřad i hostina sekce
- **Funkce**:
  - Automatické vložení mapy při zadání adresy
  - Fallback na odkaz do Google Maps pokud není API klíč
  - Responzivní design
  - Customizovatelná výška a styling

## Technické detaily

### Nové soubory
1. `src/components/wedding-website/GoogleMapsEmbed.tsx` - Komponenta pro Google Maps
2. `src/components/wedding-website/__tests__/GoogleMapsEmbed.test.tsx` - Testy

### Upravené soubory
1. `src/types/wedding-website.ts` - Přidán `colorPalette?: string[]` do `InfoContent`
2. `src/components/wedding-website/builder/sections/InfoSectionEditor.tsx` - Editor pro barevnou paletu
3. `src/components/wedding-website/templates/classic/InfoSection.tsx` - Zobrazení v Classic šabloně
4. `src/components/wedding-website/templates/modern/InfoSection.tsx` - Zobrazení v Modern šabloně

### Požadavky na prostředí
- **Google Maps API klíč**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` v `.env`
- Již nakonfigurováno v `.env.example`

## Použití

### Pro administrátory (Wedding Builder)
1. Otevřete sekci "Informace o svatbě"
2. V sekci "Dress Code & Barevná paleta":
   - Vyberte dress code
   - Klikněte na "+ Přidat barvu" pro přidání barev
   - Použijte color picker nebo zadejte hex kód
3. Zadejte adresy pro obřad/hostinu - mapy se zobrazí automaticky

### Pro návštěvníky webu
- Barevná paleta se zobrazí pod dress code informacemi
- Google Maps se zobrazí pod adresou místa konání
- Pokud není API klíč, zobrazí se odkaz na Google Maps

## Testování

Spusťte testy:
```bash
npm test -- --testPathPattern=GoogleMapsEmbed.test.tsx
```

Všechny testy prošly úspěšně ✅

## Kompatibilita

- ✅ Classic Elegance šablona
- ✅ Modern Minimalist šablona
- ✅ Responzivní design
- ✅ Fallback pro chybějící API klíč
- ✅ TypeScript podpora
- ✅ Testovací pokrytí

### 3. Responzivní layout pro místa konání
- **Nová funkcionalita**: Dynamické přizpůsobení layoutu podle počtu vyplněných míst
- **Chování**:
  - **1 místo** (pouze obřad NEBO pouze hostina): Roztáhne se na celou šířku
  - **2 místa** (obřad A hostina): Zobrazí se vedle sebe ve dvou sloupcích
- **Výhoda**: Lepší využití prostoru, zejména na širokých obrazovkách

## Testování

Spusťte všechny testy:
```bash
npm test -- --testPathPattern="GoogleMapsEmbed|InfoSection"
```

Všechny testy prošly úspěšně ✅

## Další možná vylepšení

1. **Interaktivní mapa**: Možnost přidat markery, směrování
2. **Více map poskytovatelů**: Seznam.cz, OpenStreetMap
3. **Barevné návrhy**: Přednastavené barevné palety
4. **Export barev**: Export do různých formátů (CSS, Figma, atd.)
