# 🔑 SvatBot.cz - Průvodce přihlášením

## 🚀 **Rychlé přihlášení (3 způsoby)**

### **Způsob 1: Demo účet (nejjednodušší) 🎭**

**Krok za krokem:**
1. Otevřete http://localhost:3000
2. Klikněte **"Začít plánování"** nebo **"Přihlásit se"**
3. Klikněte **"Použít demo účet"** (🎭 tlačítko)
4. Klikněte **"Přihlásit se emailem"**

**Demo údaje se automaticky vyplní:**
- **Email**: `demo@svatbot.cz`
- **Heslo**: `demo123`

**Co uvidíte:**
- Přímý přístup do dashboardu
- Demo svatba "Jana & Petr"
- 180 dní do svatby
- 73% pokrok
- Všechny funkce aplikace

---

### **Způsob 2: Vlastní registrace 📝**

**Krok za krokem:**
1. Otevřete http://localhost:3000
2. Klikněte **"Začít plánování"**
3. Vyplňte formulář:
   - **Jméno**: Vaše jméno
   - **Příjmení**: Vaše příjmení
   - **Email**: Váš email
   - **Heslo**: Min. 6 znaků
   - **Potvrdit heslo**: Stejné heslo
   - ✅ **Souhlas s podmínkami**
4. Klikněte **"Vytvořit účet"**
5. Projděte 6-krokový onboarding
6. Uvidíte dashboard s vaší svatbou

---

### **Způsob 3: Přihlášení existujícím účtem 🔄**

**Pokud už máte účet:**
1. Otevřete http://localhost:3000
2. Klikněte **"Přihlásit se"**
3. Přepněte na **"Přihlaste se"**
4. Vyplňte:
   - **Email**: Váš registrovaný email
   - **Heslo**: Vaše heslo
5. Klikněte **"Přihlásit se emailem"**

---

## 🎯 **Doporučený postup pro testování:**

### **1. Začněte s demo účtem**
```
Email: demo@svatbot.cz
Heslo: demo123
```
- Okamžitý přístup
- Předvyplněná data
- Všechny funkce k dispozici

### **2. Prohlédněte si dashboard**
- Odpočítávání dní do svatby
- Progress tracking (73%)
- Quick actions (4 karty)
- Nadcházející úkoly
- Statistiky podle fází

### **3. Testujte funkcionalita**
- Responsive design (mobile/tablet/desktop)
- Smooth animace
- Loading states
- Error handling

---

## 🔧 **Troubleshooting**

### **Problém: Aplikace se nenačítá**
```bash
# Zkontrolujte, že server běží
npm run dev

# Otevřete http://localhost:3000
```

### **Problém: Chyba při přihlášení**
- Zkuste demo účet (`demo@svatbot.cz` / `demo123`)
- Zkontrolujte konzoli (F12) pro chyby
- Restartujte server (`Ctrl+C` a `npm run dev`)

### **Problém: Prázdný dashboard**
- Demo účet automaticky načte demo svatbu
- Pro nové účty projděte onboarding flow

### **Problém: Firebase chyby**
- Demo účet funguje bez Firebase
- Pro produkci potřebujete Firebase konfiguraci

---

## 📱 **Co můžete testovat po přihlášení:**

### **Dashboard Features**
- ✅ Odpočítávání dní do svatby
- ✅ Celkový progress (73%)
- ✅ Quick actions (4 karty)
- ✅ Nadcházející úkoly (3 položky)
- ✅ Progress podle fází (7 fází)
- ✅ Rychlé statistiky

### **UI/UX Features**
- ✅ Responsive design
- ✅ Smooth animace
- ✅ Hover efekty
- ✅ Loading states
- ✅ Svatební color palette

### **Technical Features**
- ✅ State management (Zustand)
- ✅ TypeScript typy
- ✅ Error handling
- ✅ Real-time updates (mock)

---

## 🎨 **Demo data přehled:**

### **Demo svatba:**
- **Snoubenec**: Jana & Petr
- **Datum**: 180 dní od dneška
- **Hosté**: 85 pozvaných
- **Rozpočet**: 450.000 Kč
- **Styl**: Klasicky elegantní
- **Region**: Praha

### **Progress:**
- **Celkový**: 73%
- **Základy**: 100% ✅
- **Místo konání**: 85%
- **Hosté**: 80%
- **Rozpočet**: 65%
- **Design**: 45%
- **Organizace**: 30%
- **Finální**: 0%

---

## 🚀 **Další kroky po přihlášení:**

### **Prozkoumejte aplikaci:**
1. **Dashboard** - hlavní přehled
2. **Quick actions** - 4 hlavní funkce
3. **Progress tracking** - sledování pokroku
4. **Responsive design** - testujte na mobilu

### **Připraveno pro implementaci:**
1. **Checklist systém** - task management
2. **Guest management** - správa hostů
3. **Budget tracking** - detailní rozpočet
4. **Timeline builder** - časový plán

---

## 📞 **Potřebujete pomoc?**

### **Rychlé řešení:**
1. **Demo účet**: `demo@svatbot.cz` / `demo123`
2. **Restart serveru**: `Ctrl+C` → `npm run dev`
3. **Vyčistit cache**: Smazat `.next` složku

### **Status check:**
- ✅ Server běží: http://localhost:3000
- ✅ Demo účet funguje
- ✅ Dashboard se načítá
- ✅ Responsive design

---

**🎉 Užijte si testování SvatBot.cz aplikace!**

**Tip**: Začněte s demo účtem pro nejrychlejší přístup k funkcionalitě.
