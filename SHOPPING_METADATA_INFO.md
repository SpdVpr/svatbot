# 🛒 Shopping Module - Metadata Loading Info

## ✅ Podporované e-shopy

### **Funguje dobře:**
- ✅ **Temu** - Načítá název, obrázek, cenu
- ✅ **Xzone.cz** - Načítá název, obrázek
- ✅ **Mall.cz** - Načítá Open Graph metadata
- ✅ **Datart.cz** - Načítá Open Graph metadata
- ✅ **Notino.cz** - Načítá Open Graph metadata

### **Částečně funguje:**
- ⚠️ **Shein** - Načítá data z JavaScript objektů (může být nestabilní)
- ⚠️ **AliExpress** - Závisí na regionu a ochraně

### **Nefunguje (blokuje server-side requesty):**
- ❌ **Alza.cz** - Blokuje automatické requesty
- ❌ **Amazon** - Vyžaduje cookies a session
- ❌ **eBay** - Vyžaduje autentizaci

---

## 🔧 Jak to funguje

### **1. Automatické načítání**
Když uživatel vloží URL:
1. Počká se 1.5 sekundy (debounce)
2. API endpoint `/api/metadata` se pokusí načíst HTML
3. Parsuje Open Graph meta tagy nebo JavaScript objekty
4. Auto-vyplní dostupná pole (název, obrázek, cena)

### **2. Manuální vyplnění**
Pokud automatické načítání selže:
- Uživatel může vyplnit všechna pole ručně
- Není to chyba - některé stránky prostě blokují automatické načítání

---

## 💡 Tipy pro uživatele

### **Pokud se metadata nenačtou:**
1. ✅ **Zkopírujte název produktu** z původní stránky
2. ✅ **Klikněte pravým na obrázek** → "Kopírovat adresu obrázku"
3. ✅ **Vložte URL obrázku** do pole "URL obrázku"
4. ✅ **Zadejte cenu ručně**

### **Nejlepší praxe:**
- 📸 Pro obrázky použijte přímý link (končí na .jpg, .png, .webp)
- 💰 Cenu zadávejte jako číslo (např. 1299.90)
- 🏷️ Vyberte správnou kategorii pro lepší organizaci

---

## 🛠️ Technické detaily

### **Podporované formáty metadat:**
```html
<!-- Open Graph -->
<meta property="og:title" content="Název produktu">
<meta property="og:image" content="https://...">
<meta property="product:price:amount" content="1299">

<!-- Schema.org -->
<span itemprop="name">Název produktu</span>
<span itemprop="price" content="1299">1299 Kč</span>
<img itemprop="image" src="https://...">

<!-- Shein specific -->
<script>
window.gbProductDetailData = {
  detail: {
    goods_name: "Název",
    goods_img: "https://...",
    salePrice: { amount: "12.99" }
  }
}
</script>
```

### **Proč některé stránky nefungují:**
1. **CORS ochrana** - Server blokuje requesty z jiných domén
2. **Cloudflare** - Vyžaduje JavaScript challenge
3. **Rate limiting** - Omezení počtu requestů
4. **Session cookies** - Vyžadují přihlášení
5. **Bot detection** - Detekují automatické requesty

---

## 🚀 Budoucí vylepšení

### **Možná řešení:**
- 🔄 **Proxy služba** - Obejití CORS ochrany
- 🤖 **Headless browser** - Puppeteer/Playwright pro JS-heavy stránky
- 💾 **Cache** - Ukládání často načítaných produktů
- 🔌 **Browser extension** - Načítání přímo z prohlížeče uživatele

---

## 📝 Poznámky

- Automatické načítání je **bonus feature**, ne požadavek
- Manuální vyplnění je vždy možné a plně podporované
- Některé e-shopy aktivně blokují automatické načítání (je to jejich právo)
- Pro nejlepší výsledky použijte e-shopy, které podporují Open Graph meta tagy

