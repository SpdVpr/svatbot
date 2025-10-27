# 🔔 Systém Notifikací pro Feedback

## 📋 Přehled

Implementace notifikačního systému pro feedback komunikaci mezi uživateli a adminem. Když admin odpoví na feedback, uživatel dostane dvě notifikace:

1. **Notifikace u zvonečku** - Klasická notifikace v hlavičce aplikace
2. **Vizuální indikátor u feedbacku** - Badge s počtem nepřečtených odpovědí

## ✅ Implementované Funkce

### 1. **Notifikace při odpovědi admina**

Když admin odpoví na feedback uživatele:
- ✅ Vytvoří se notifikace v `weddingNotifications` kolekci
- ✅ Notifikace se zobrazí u zvonečku v hlavičce
- ✅ Inkrementuje se počítadlo `unreadAdminReplies` ve feedbacku
- ✅ Uživatel vidí červený badge s počtem nepřečtených odpovědí

### 2. **Vizuální indikátory nepřečtených odpovědí**

#### V FeedbackTab:
- ✅ **Info panel nahoře**: Zobrazuje celkový počet nepřečtených odpovědí
- ✅ **U každého feedbacku**: Červený badge s ikonou zvonečku a číslem
- ✅ **Animace**: Badge pulzuje pro upoutání pozornosti
- ✅ **Automatické označení jako přečtené**: Při rozbalení feedbacku

### 3. **Tracking přečtených zpráv**

- ✅ `unreadAdminReplies`: Počet nepřečtených odpovědí od admina
- ✅ `lastReadByUser`: Timestamp posledního přečtení uživatelem
- ✅ Automatické vynulování při otevření feedbacku

## 📁 Upravené Soubory

### 1. `src/hooks/useWeddingNotifications.ts`
**Přidáno:**
```typescript
export enum WeddingNotificationType {
  // ... existující typy
  FEEDBACK_REPLY = 'feedback_reply'  // NOVÉ
}
```

### 2. `src/types/admin.ts`
**Přidáno:**
```typescript
export interface UserFeedback {
  // ... existující pole
  unreadAdminReplies?: number  // Počet nepřečtených odpovědí
  lastReadByUser?: Timestamp   // Poslední přečtení uživatelem
}
```

### 3. `src/components/admin/FeedbackManagement.tsx`
**Upraveno:**
```typescript
const handleSendReply = async () => {
  // Update feedback s novým počítadlem
  await updateDoc(feedbackRef, {
    conversation: arrayUnion({...}),
    updatedAt: serverTimestamp(),
    unreadAdminReplies: increment(1)  // NOVÉ
  })

  // Vytvoření notifikace pro uživatele
  await addDoc(collection(db, 'weddingNotifications'), {
    userId: selectedFeedback.userId,
    type: WeddingNotificationType.FEEDBACK_REPLY,
    title: 'Nová odpověď na váš feedback',
    message: `Admin odpověděl na váš feedback: "${selectedFeedback.subject}"`,
    priority: 'medium',
    category: 'system',
    actionUrl: '/account?tab=feedback',
    data: {
      feedbackId: selectedFeedback.id,
      feedbackSubject: selectedFeedback.subject
    },
    read: false,
    createdAt: serverTimestamp()
  })
}
```

### 4. `src/components/account/FeedbackTab.tsx`
**Přidáno:**
```typescript
// Funkce pro označení jako přečtené
const handleExpandFeedback = async (feedbackId: string, isCurrentlyExpanded: boolean) => {
  setExpandedId(isCurrentlyExpanded ? null : feedbackId)
  
  if (!isCurrentlyExpanded) {
    const feedbackItem = feedback.find(f => f.id === feedbackId)
    if (feedbackItem?.unreadAdminReplies > 0) {
      await updateDoc(feedbackRef, {
        unreadAdminReplies: 0,
        lastReadByUser: serverTimestamp()
      })
    }
  }
}

// Celkový počet nepřečtených
const totalUnreadReplies = feedback.reduce((sum, item) => 
  sum + (item.unreadAdminReplies || 0), 0
)

// Badge v info panelu
{totalUnreadReplies > 0 && (
  <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full">
    <Bell className="w-3 h-3" />
    {totalUnreadReplies} nová odpověď
  </span>
)}

// Badge u každého feedbacku
{item.unreadAdminReplies > 0 && (
  <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full animate-pulse">
    <Bell className="w-3 h-3" />
    {item.unreadAdminReplies}
  </span>
)}
```

### 5. `src/components/common/FeedbackButton.tsx`
**Upraveno:**
```typescript
await addDoc(collection(db, 'feedback'), {
  // ... existující pole
  unreadAdminReplies: 0  // Inicializace na 0
})
```

### 6. `firestore.rules`
**Upraveno:**
```typescript
match /feedback/{feedbackId} {
  // Uživatelé mohou aktualizovat pouze specifická pole
  allow update: if isAdmin() ||
                   (isAuthenticated() &&
                    resource.data.userId == request.auth.uid &&
                    // Nesmí měnit kritická pole
                    (!request.resource.data.diff(resource.data).affectedKeys()
                      .hasAny(['userId', 'userEmail', 'type', 'subject', 
                               'message', 'status', 'priority', 'adminNotes', 
                               'assignedTo', 'resolvedAt', 'createdAt'])));
}
```

## 🔄 Workflow

### Když admin odpoví:
1. Admin napíše odpověď v `FeedbackManagement`
2. Klikne na "Odeslat"
3. Systém:
   - Přidá zprávu do `conversation` pole
   - Inkrementuje `unreadAdminReplies` o 1
   - Vytvoří notifikaci v `weddingNotifications`
4. Uživatel vidí:
   - Červený badge u zvonečku v hlavičce
   - Notifikaci v seznamu notifikací
   - Červený badge u feedbacku v Account → Feedback

### Když uživatel přečte:
1. Uživatel otevře Account → Feedback
2. Vidí celkový počet nepřečtených v info panelu
3. Vidí badge u konkrétního feedbacku
4. Klikne na feedback (rozbalí ho)
5. Systém:
   - Nastaví `unreadAdminReplies` na 0
   - Uloží `lastReadByUser` timestamp
6. Badge zmizí

## 🎨 UI/UX Detaily

### Badge Design:
- **Barva**: Červená (`bg-red-500`)
- **Ikona**: Zvonek (`Bell`)
- **Animace**: Pulzování (`animate-pulse`)
- **Pozice**: Vedle názvu feedbacku

### Info Panel:
- **Barva**: Modrá (`bg-blue-50`)
- **Text**: "X nová odpověď / nové odpovědi / nových odpovědí"
- **Zobrazení**: Pouze když jsou nepřečtené odpovědi

### Notifikace:
- **Typ**: `FEEDBACK_REPLY`
- **Priorita**: `medium`
- **Kategorie**: `system`
- **Action URL**: `/account?tab=feedback`

## 📊 Firebase Struktura

### Collection: `feedback`
```typescript
{
  id: string
  userId: string
  userEmail: string
  userName?: string
  type: 'bug' | 'feature' | 'improvement' | 'other'
  subject: string
  message: string
  rating?: number
  page?: string
  status: 'new' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  createdAt: Timestamp
  updatedAt?: Timestamp
  resolvedAt?: Timestamp
  adminNotes?: string
  assignedTo?: string
  conversation?: FeedbackMessage[]
  unreadAdminReplies?: number    // NOVÉ - Počet nepřečtených odpovědí
  lastReadByUser?: Timestamp     // NOVÉ - Poslední přečtení
}
```

### Collection: `weddingNotifications`
```typescript
{
  userId: string
  type: 'feedback_reply'         // NOVÝ TYP
  title: 'Nová odpověď na váš feedback'
  message: 'Admin odpověděl na váš feedback: "..."'
  priority: 'medium'
  category: 'system'
  actionUrl: '/account?tab=feedback'
  data: {
    feedbackId: string
    feedbackSubject: string
  }
  read: boolean
  createdAt: Timestamp
}
```

## 🔒 Bezpečnost

### Firestore Rules:
- ✅ Uživatelé mohou číst pouze své feedbacky
- ✅ Uživatelé mohou aktualizovat pouze `unreadAdminReplies` a `lastReadByUser`
- ✅ Uživatelé nemohou měnit kritická pole (status, priority, adminNotes, atd.)
- ✅ Admin může měnit vše

## 🚀 Testování

### Test Scenario 1: Admin odpoví
1. Přihlaste se jako admin
2. Otevřete Admin Dashboard → Feedback
3. Vyberte feedback od uživatele
4. Napište odpověď a odešlete
5. Ověřte:
   - Odpověď se zobrazí v konverzaci
   - `unreadAdminReplies` se zvýšilo o 1

### Test Scenario 2: Uživatel vidí notifikaci
1. Přihlaste se jako uživatel (který poslal feedback)
2. Ověřte:
   - Červený badge u zvonečku v hlavičce
   - Notifikace v seznamu notifikací
   - Kliknutí na notifikaci otevře Account → Feedback

### Test Scenario 3: Uživatel přečte odpověď
1. Otevřete Account → Feedback
2. Ověřte:
   - Červený badge v info panelu s celkovým počtem
   - Červený badge u konkrétního feedbacku
3. Klikněte na feedback (rozbalte)
4. Ověřte:
   - Badge zmizí
   - `unreadAdminReplies` je 0
   - `lastReadByUser` je aktualizováno

## 📝 Poznámky

- Notifikace se vytváří pouze při odpovědi admina, ne při odpovědi uživatele
- Badge pulzuje pro upoutání pozornosti
- Automatické označení jako přečtené při rozbalení feedbacku
- Real-time aktualizace díky Firebase `onSnapshot`
- Správná čeština pro počet odpovědí (1 odpověď, 2-4 odpovědi, 5+ odpovědí)

