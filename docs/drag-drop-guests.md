# Drag and Drop pro Hosty - Dokumentace

## Přehled

Implementovali jsme jednoduchou drag and drop funkcionalitu pro přehazování hostů na stránce `/guests` s plnou optimalizací pro mobilní zařízení. Funkcionalita je vždy aktivní v list view - žádné zapínání/vypínání není potřeba.

## Funkce

### Desktop
- **Jednoduché Drag and Drop**: Klikněte a přetáhněte jakoukoli položku hosta pro změnu pořadí
- **Vizuální feedback**: Animace při přetahování, zvýraznění cílové pozice
- **Hover efekty**: Jemné animace při najetí myší
- **Tooltip**: Nápověda při najetí na položku

### Mobilní zařízení
- **Touch drag**: Podržte a přetáhněte hosty prstem pro změnu pořadí
- **Haptic feedback**: Vibrační odezva při zahájení a dokončení přetahování
- **Optimalizované ovládání**: Celá položka je draggable, lepší responzivita
- **Visual feedback**: Plynulé animace a zvýraznění během přetahování

## Technická implementace

### Komponenty
- `GuestList.tsx` - Hlavní komponenta s drag and drop logikou
- `drag-drop.css` - Styly optimalizované pro mobilní zařízení

### Klíčové funkce
```typescript
// Desktop drag and drop
handleDragStart(e: React.DragEvent, guestId: string, index: number)
handleDragOver(e: React.DragEvent, index: number)
handleDrop(e: React.DragEvent, dropIndex: number)

// Mobile touch handlers
handleTouchStart(e: React.TouchEvent, guestId: string)
handleTouchMove(e: React.TouchEvent)
handleTouchEnd(e: React.TouchEvent)

// Reorder function
reorderGuests(reorderedGuests: Guest[])
```

### Props
```typescript
interface GuestListProps {
  onGuestReorder?: (guests: Guest[]) => void  // Callback při změně pořadí
}
```

## Použití

### Automatické zapnutí
- Drag and drop je automaticky aktivní v list view
- Žádné zapínání/vypínání není potřeba
- Funguje okamžitě po přepnutí do list view

### Přehazování hostů
**Desktop:**
- Klikněte a přetáhněte jakoukoli položku hosta na novou pozici
- Tooltip zobrazí nápovědu při najetí myší
- Vizuální indikátory ukážou kam host bude umístěn

**Mobilní:**
- Podržte jakoukoli část položky hosta a přetáhněte na novou pozici
- Haptic feedback potvrdí zahájení a dokončení akce
- Celá položka je draggable pro lepší použitelnost

## Mobilní optimalizace

### Touch targets
- Minimální velikost 44x44px pro touch elementy
- Větší drag handle na mobilních zařízeních

### Haptic feedback
- Vibrační odezva při zahájení přetahování (50ms)
- Potvrzovací vibrace při dokončení (3x 50ms pulzy)

### Accessibility
- ARIA labels pro screen readery
- Keyboard navigation support
- High contrast mode support
- Reduced motion support

### Performance
- Optimalizované animace s CSS transforms
- Debounced touch events
- Efficient re-rendering

## CSS třídy

### Základní třídy
- `.touch-drag-item` - Základní drag item
- `.dragging` - Aktivní přetahování
- `.drag-over` - Cílová pozice
- `.drag-handle` - Ovládací prvek

### Mobilní optimalizace
- `.haptic-feedback` - Vizuální feedback
- `.touch-feedback` - Touch interakce
- `.dragging-active` - Globální drag stav

## Kompatibilita

### Prohlížeče
- Chrome/Safari/Firefox (desktop i mobile)
- Edge
- iOS Safari
- Android Chrome

### Zařízení
- Desktop (myš)
- Tablet (touch)
- Smartphone (touch)
- Hybrid zařízení (myš + touch)

## Budoucí vylepšení

### Plánované funkce
- [ ] Bulk reordering (výběr více hostů)
- [ ] Kategorie-based grouping během drag
- [ ] Undo/Redo funkcionalita
- [ ] Keyboard shortcuts
- [ ] Drag and drop mezi kategoriemi

### Možná rozšíření
- [ ] Animované přesuny
- [ ] Drag preview customization
- [ ] Multi-select drag
- [ ] Gesture recognition (swipe to reorder)

## Troubleshooting

### Časté problémy
1. **Drag nefunguje na mobilu**: Zkontrolujte touch-action CSS
2. **Haptic feedback nefunguje**: Vyžaduje HTTPS nebo localhost
3. **Animace jsou pomalé**: Zkontrolujte prefers-reduced-motion

### Debug
```javascript
// Zapnout debug logging
localStorage.setItem('debug-drag-drop', 'true')
```

## Testování

### Manuální testy
1. Desktop drag and drop
2. Mobile touch drag
3. Haptic feedback
4. Accessibility (screen reader, keyboard)
5. Performance (velký počet hostů)

### Automatizované testy
```bash
npm run test -- --testNamePattern="drag.*drop"
```
