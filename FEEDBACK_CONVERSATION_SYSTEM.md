# 💬 Systém Obousměrné Komunikace - Feedback

## ✅ Implementováno

Kompletní systém obousměrné komunikace mezi uživateli a adminem přes feedback systém.

## 🎯 Funkce

### Pro Uživatele:

1. **Zobrazení Feedbacku v Profilu**
   - Záložka "Feedback" v Account Modal (ikona profilu)
   - Přehled všech odeslaných zpráv
   - Real-time aktualizace

2. **Zobrazení Konverzace**
   - Vidí původní admin odpověď (`adminNotes`)
   - Vidí celou historii konverzace
   - Zprávy jsou barevně odlišené (admin = modrá, uživatel = primary)
   - Časové razítko u každé zprávy

3. **Odpovídání na Admin Zprávy**
   - Textové pole pro napsání odpovědi
   - Tlačítko "Odeslat" s ikonou
   - Loading stav při odesílání
   - Automatické vymazání pole po odeslání

4. **Uzavřené Konverzace**
   - Pokud je feedback uzavřen (`status: 'closed'`), nelze odpovídat
   - Zobrazí se informace "Tato konverzace byla uzavřena"

### Pro Admina:

1. **Zobrazení Konverzace**
   - Vidí celou historii komunikace
   - Zprávy jsou barevně odlišené
   - Scrollovatelná oblast pro dlouhé konverzace

2. **Odpovídání Uživatelům**
   - Textové pole pro napsání odpovědi
   - Tlačítko "Odeslat" s ikonou
   - Loading stav při odesílání
   - Real-time aktualizace

3. **Správa Konverzací**
   - Může uzavřít konverzaci (status: 'closed')
   - Uzavřené konverzace nelze dále komentovat

## 📁 Upravené Soubory

### 1. `src/types/admin.ts`
```typescript
// Nový interface pro zprávy v konverzaci
export interface FeedbackMessage {
  from: 'user' | 'admin'
  message: string
  timestamp: Timestamp
  userName?: string
}

// Rozšířený UserFeedback interface
export interface UserFeedback {
  // ... existující pole
  conversation?: FeedbackMessage[]  // NOVÉ
  updatedAt?: Timestamp             // NOVÉ
}
```

### 2. `src/components/account/FeedbackTab.tsx`
**Přidáno:**
- Import `arrayUnion`, `serverTimestamp`, `updateDoc`
- State pro `replyText` a `sendingReply`
- Funkce `handleSendReply()` pro odesílání odpovědí
- UI pro zobrazení konverzace s avatary
- Textové pole a tlačítko pro odpověď
- Kontrola uzavřených konverzací

**Klíčové změny:**
```typescript
// Odesílání odpovědi
const handleSendReply = async (feedbackId: string) => {
  await updateDoc(feedbackRef, {
    conversation: arrayUnion({
      from: 'user',
      message: reply,
      timestamp: serverTimestamp(),
      userName: user.displayName || user.email
    }),
    updatedAt: serverTimestamp()
  })
}
```

### 3. `src/components/admin/FeedbackManagement.tsx`
**Přidáno:**
- Import `arrayUnion`, `serverTimestamp`, `updateDoc`
- State pro `replyText` a `sendingReply`
- Funkce `handleSendReply()` pro admin odpovědi
- UI pro zobrazení celé konverzace
- Textové pole a tlačítko pro admin odpověď
- Scrollovatelná oblast pro dlouhé konverzace

## 🔥 Firestore Struktura

### Feedback Document:
```javascript
{
  id: "feedback_id",
  userId: "user_uid",
  userEmail: "user@example.com",
  userName: "Jan Novák",
  type: "bug" | "feature" | "improvement" | "other",
  subject: "Předmět zprávy",
  message: "Původní zpráva od uživatele",
  status: "new" | "in-progress" | "resolved" | "closed",
  priority: "low" | "medium" | "high",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  
  // První admin odpověď (zachováno pro zpětnou kompatibilitu)
  adminNotes: "První odpověď od admina",
  
  // Nová konverzace
  conversation: [
    {
      from: "admin",
      message: "Děkujeme za zpětnou vazbu...",
      timestamp: Timestamp,
      userName: "Admin"
    },
    {
      from: "user",
      message: "Děkuji za odpověď...",
      timestamp: Timestamp,
      userName: "Jan Novák"
    },
    // ... další zprávy
  ]
}
```

## 🎨 UI/UX Detaily

### Uživatelské Rozhraní:

**Avatary:**
- Admin: Modrý kruh s písmenem "A"
- Uživatel: Primary barva s prvním písmenem jména

**Barevné Schéma:**
- Admin zprávy: `bg-blue-50 border-blue-200`
- Uživatel zprávy: `bg-primary-50 border-primary-200`

**Layout:**
- Admin zprávy: Vlevo
- Uživatel zprávy: Vpravo (flex-row-reverse)

**Textové Pole:**
- 2-3 řádky
- Placeholder: "Napište odpověď..."
- Disabled při odesílání

**Tlačítko Odeslat:**
- Ikona Send nebo Loader2 (při odesílání)
- Disabled pokud je pole prázdné nebo se odesílá
- Primary/Blue barva

### Admin Rozhraní:

**Konverzační Oblast:**
- Max výška: 96 (24rem)
- Scrollovatelná
- Šedé pozadí (`bg-gray-50`)
- Padding pro lepší čitelnost

**Prázdný Stav:**
- Zobrazí se pokud není žádná konverzace
- Text: "Zatím žádná konverzace. Napište první odpověď níže."

## 🔒 Bezpečnost

### Firestore Security Rules:

```javascript
// Uživatelé mohou číst a upravovat pouze svůj feedback
match /feedback/{feedbackId} {
  allow read: if request.auth != null && 
    (resource.data.userId == request.auth.uid || 
     get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role != null);
  
  allow update: if request.auth != null && 
    resource.data.userId == request.auth.uid &&
    // Uživatel může přidávat pouze do conversation pole
    request.resource.data.diff(resource.data).affectedKeys().hasOnly(['conversation', 'updatedAt']);
}
```

## 🧪 Testování

### Test Workflow:

1. **Jako Uživatel:**
   - Přihlaste se
   - Odešlete feedback přes plovoucí tlačítko
   - Otevřete Account Modal → Feedback
   - Počkejte na admin odpověď

2. **Jako Admin:**
   - Přihlaste se do admin panelu
   - Otevřete Admin Dashboard → Feedback
   - Vyberte feedback
   - Napište odpověď a odešlete

3. **Zpět jako Uživatel:**
   - Obnovte stránku (nebo počkejte na real-time update)
   - Otevřete Account Modal → Feedback
   - Měli byste vidět admin odpověď
   - Napište odpověď zpět
   - Klikněte "Odeslat"

4. **Zpět jako Admin:**
   - Měli byste vidět uživatelovu odpověď v konverzaci
   - Můžete odpovědět znovu
   - Nebo uzavřít konverzaci

## 📊 Real-time Aktualizace

Obě strany používají `onSnapshot` listener:

```typescript
// Automatická aktualizace při změnách
const unsubscribe = onSnapshot(q, (snapshot) => {
  const feedbackData = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  setFeedback(feedbackData)
})
```

## 🎉 Výhody Systému

1. **Real-time Komunikace** - Obě strany vidí zprávy okamžitě
2. **Historie Konverzace** - Celá historie je uložena
3. **Zpětná Kompatibilita** - Zachováno pole `adminNotes`
4. **Uzavírání Konverzací** - Admin může uzavřít vyřešené tickety
5. **Uživatelsky Přívětivé** - Intuitivní chat-like rozhraní
6. **Barevné Rozlišení** - Jasně viditelné kdo píše
7. **Časové Razítka** - U každé zprávy

## 🚀 Další Možná Vylepšení

- [ ] Notifikace při nové zprávě
- [ ] Označení nepřečtených zpráv
- [ ] Přikládání souborů/obrázků
- [ ] Emoji reakce
- [ ] Typing indicator (píše...)
- [ ] Email notifikace při odpovědi
- [ ] Push notifikace
- [ ] Hromadné odpovědi (šablony)
- [ ] Přiřazování ticketů konkrétním adminům
- [ ] SLA tracking (čas odpovědi)

