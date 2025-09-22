# 🔥 Firebase Firestore Indexy - Návod k Nasazení

## 🚨 **DŮLEŽITÉ: Indexy jsou potřeba pro správné fungování aplikace!**

Aplikace SvatBot používá složité Firestore dotazy, které vyžadují composite indexy. Bez těchto indexů nebudou fungovat:
- Filtrování úkolů podle stavu a data
- Vyhledávání dodavatelů podle kategorie
- RSVP systém s řazením podle data
- Marketplace s filtrováním

## 📋 **Aktuální Stav**

✅ **Máme připravené**: `firestore.indexes.json` s definovanými indexy  
❌ **Chybí**: Nasazení indexů do Firebase Console

## 🚀 **Jak Nasadit Indexy**

### **Metoda 1: Firebase CLI (Doporučeno)**

```bash
# 1. Ujistěte se, že máte Firebase CLI
npm install -g firebase-tools

# 2. Přihlaste se do Firebase
firebase login

# 3. Inicializujte projekt (pokud ještě není)
firebase init firestore

# 4. Nasaďte indexy
firebase deploy --only firestore:indexes
```

### **Metoda 2: Manuálně přes Firebase Console**

1. **Otevřete Firebase Console**: https://console.firebase.google.com
2. **Vyberte projekt**: `svatbot-app`
3. **Jděte na**: Firestore Database > Indexes
4. **Klikněte**: "Create index"
5. **Vytvořte každý index** podle seznamu níže

## 📊 **Seznam Potřebných Indexů**

### **1. Weddings Collection**
```
Collection: weddings
Fields: userId (Ascending), createdAt (Descending)
```

### **2. Tasks Collection**
```
Collection: tasks
Fields: weddingId (Ascending), phase (Ascending), priority (Descending)

Collection: tasks  
Fields: weddingId (Ascending), status (Ascending), dueDate (Ascending)
```

### **3. Guests Collection**
```
Collection: guests
Fields: weddingId (Ascending), category (Ascending)

Collection: guests
Fields: weddingId (Ascending), rsvpStatus (Ascending)
```

### **4. Budget Items Collection**
```
Collection: budgetItems
Fields: weddingId (Ascending), category (Ascending)
```

### **5. Timeline Events Collection**
```
Collection: timelineEvents
Fields: weddingId (Ascending), startTime (Ascending)
```

### **6. Vendors Collection (Marketplace)**
```
Collection: vendors
Fields: active (Ascending), createdAt (Descending)

Collection: vendors
Fields: active (Ascending), category (Ascending), createdAt (Descending)

Collection: vendors
Fields: active (Ascending), verified (Ascending), createdAt (Descending)

Collection: vendors
Fields: active (Ascending), featured (Ascending), createdAt (Descending)

Collection: vendors
Fields: category (Ascending), location (Ascending), rating (Descending)
```

### **7. RSVP Collections**
```
Collection: rsvpInvitations
Fields: weddingId (Ascending), createdAt (Descending)

Collection: rsvpResponses
Fields: respondedAt (Descending)
```

### **8. Venues Collection**
```
Collection: venues
Fields: region (Ascending), rating (Descending)

Collection: venues
Fields: venueType (Ascending), featured (Descending)
```

## ✅ **Ověření Nasazení**

Po nasazení indexů:

1. **Zkontrolujte Firebase Console**:
   - Firestore Database > Indexes
   - Měli byste vidět všechny indexy se stavem "Building" nebo "Enabled"

2. **Testujte aplikaci**:
   - Otevřete aplikaci na http://localhost:3001
   - Přihlaste se a zkuste všechny funkce
   - Zkontrolujte browser console - neměly by být chyby o chybějících indexech

3. **Zkontrolujte logy**:
   ```bash
   # V browser console by neměly být chyby typu:
   # "The query requires an index"
   ```

## 🐛 **Troubleshooting**

### **Chyba: "The query requires an index"**
```
✅ Řešení: Nasaďte chybějící index pomocí Firebase CLI nebo Console
```

### **Chyba: "Firebase CLI not found"**
```bash
npm install -g firebase-tools
firebase login
```

### **Chyba: "Permission denied"**
```
✅ Řešení: Ujistěte se, že máte admin práva k Firebase projektu
```

### **Indexy se "Building" příliš dlouho**
```
✅ Normální: Může trvat několik minut až hodin podle množství dat
✅ Sledujte: Firebase Console > Firestore > Indexes
```

## 📈 **Monitoring**

Po nasazení sledujte:
- **Firebase Console > Usage**: Počet čtení/zápisů
- **Firebase Console > Performance**: Rychlost dotazů
- **Browser Console**: Chyby v aplikaci

## 🎯 **Výsledek**

Po správném nasazení indexů:
✅ Všechny Firestore dotazy budou rychlé  
✅ Aplikace bude fungovat bez chyb  
✅ Marketplace bude správně filtrovat dodavatele  
✅ RSVP systém bude fungovat plynule  
✅ Úkoly se budou správně řadit a filtrovat  

## 🚀 **Nasazení NYNÍ**

```bash
# Spusťte tento příkaz pro okamžité nasazení:
firebase deploy --only firestore:indexes

# Nebo použijte Firebase Console pro manuální vytvoření
```

**⚠️ Bez těchto indexů aplikace nebude fungovat správně!**
