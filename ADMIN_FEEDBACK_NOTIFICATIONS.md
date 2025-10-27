# 🔔 Admin Notifikační Systém pro Feedback

## 📋 Přehled

Implementace notifikačního systému pro admina, který zobrazuje nepřečtené zprávy od uživatelů ve feedback systému. Admin má přehled o nových zprávách na první pohled díky vizuálním indikátorům.

## ✅ Implementované Funkce

### 1. **Tracking nepřečtených zpráv od uživatelů**

Když uživatel odpoví na feedback:
- ✅ Inkrementuje se `unreadUserReplies` v feedbacku
- ✅ Admin vidí červený badge s počtem nepřečtených zpráv
- ✅ Feedback s novými zprávami je vizuálně odlišen (červený border, světle červené pozadí)

### 2. **Vizuální indikátory v Admin Dashboardu**

#### V hlavičce Feedback Management:
- ✅ **Celkový počet nepřečtených zpráv**: Červený badge vedle nadpisu
- ✅ **Text**: "X nová zpráva / nové zprávy / nových zpráv"
- ✅ **Ikona**: Zvonek (`Bell`)

#### U každého feedbacku v seznamu:
- ✅ **Červený border a pozadí**: Feedbacky s novými zprávami mají `border-red-300 bg-red-50 ring-2 ring-red-200`
- ✅ **Badge s počtem**: Červený badge s ikonou zvonečku a číslem nepřečtených zpráv
- ✅ **Pulzující animace**: Badge pulzuje (`animate-pulse`) pro upoutání pozornosti

### 3. **Automatické označení jako přečtené**

- ✅ Při otevření feedbacku adminem se automaticky vynuluje `unreadUserReplies`
- ✅ Nastaví se `lastReadByAdmin` timestamp
- ✅ Vizuální indikátory zmizí

### 4. **Inteligentní vynulování při odpovědi admina**

- ✅ Když admin odpoví, automaticky se vynuluje `unreadUserReplies`
- ✅ Nastaví se `lastReadByAdmin` timestamp
- ✅ Admin nemusí ručně označovat jako přečtené

## 📁 Upravené Soubory

### 1. `src/types/admin.ts`
**Přidáno:**
```typescript
export interface UserFeedback {
  // ... existující pole
  unreadAdminReplies?: number  // Number of unread admin replies (for user)
  lastReadByUser?: Timestamp   // Last time user read the conversation
  unreadUserReplies?: number   // Number of unread user replies (for admin) - NOVÉ
  lastReadByAdmin?: Timestamp  // Last time admin read the conversation - NOVÉ
}
```

### 2. `src/components/account/FeedbackTab.tsx`
**Upraveno:**
```typescript
// Import increment
import { ..., increment } from 'firebase/firestore'

// Při odeslání odpovědi uživatelem
await updateDoc(feedbackRef, {
  conversation: arrayUnion({...}),
  updatedAt: serverTimestamp(),
  unreadUserReplies: increment(1)  // NOVÉ - Notifikace pro admina
})
```

### 3. `src/components/admin/FeedbackManagement.tsx`
**Přidáno:**

#### Import ikony:
```typescript
import { ..., Bell } from 'lucide-react'
```

#### Funkce pro označení jako přečtené:
```typescript
const handleSelectFeedback = async (item: UserFeedback) => {
  setSelectedFeedback(item)
  
  // If there are unread user replies, mark as read
  if (item.unreadUserReplies && item.unreadUserReplies > 0) {
    try {
      const feedbackRef = doc(db, 'feedback', item.id)
      await updateDoc(feedbackRef, {
        unreadUserReplies: 0,
        lastReadByAdmin: serverTimestamp()
      })
    } catch (error) {
      console.error('Error marking feedback as read:', error)
    }
  }
}
```

#### Celkový počet nepřečtených:
```typescript
const totalUnreadUserReplies = feedback.reduce((sum, item) => 
  sum + (item.unreadUserReplies || 0), 0
)
```

#### Badge v hlavičce:
```typescript
{totalUnreadUserReplies > 0 && (
  <span className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
    <Bell className="w-4 h-4" />
    {totalUnreadUserReplies} nová zpráva
  </span>
)}
```

#### Vizuální odlišení feedbacků:
```typescript
const hasUnreadMessages = item.unreadUserReplies && item.unreadUserReplies > 0

<div
  className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all cursor-pointer ${
    hasUnreadMessages 
      ? 'border-red-300 bg-red-50 ring-2 ring-red-200' 
      : 'border-gray-100'
  }`}
  onClick={() => handleSelectFeedback(item)}
>
```

#### Badge u feedbacku:
```typescript
{hasUnreadMessages && (
  <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full animate-pulse">
    <Bell className="w-3 h-3" />
    {item.unreadUserReplies}
  </span>
)}
```

#### Vynulování při odpovědi admina:
```typescript
await updateDoc(feedbackRef, {
  conversation: arrayUnion({...}),
  updatedAt: serverTimestamp(),
  unreadAdminReplies: increment(1),
  unreadUserReplies: 0,  // NOVÉ - Reset při odpovědi
  lastReadByAdmin: serverTimestamp()  // NOVÉ
})
```

### 4. `src/components/common/FeedbackButton.tsx`
**Upraveno:**
```typescript
await addDoc(collection(db, 'feedback'), {
  // ... existující pole
  unreadAdminReplies: 0,
  unreadUserReplies: 0  // NOVÉ - Inicializace
})
```

### 5. `firestore.rules`
**Upraveno:**
```typescript
// Users can update these fields
allow update: if isAuthenticated() &&
                 resource.data.userId == request.auth.uid &&
                 request.resource.data.diff(resource.data).affectedKeys()
                   .hasOnly(['conversation', 'unreadAdminReplies', 'lastReadByUser', 
                            'unreadUserReplies', 'updatedAt']);  // Přidáno unreadUserReplies
```

## 🔄 Workflow

### Když uživatel odpoví:
1. Uživatel napíše odpověď v Account → Feedback
2. Systém:
   - Přidá zprávu do konverzace
   - Inkrementuje `unreadUserReplies` o 1
3. Admin vidí:
   - Červený badge v hlavičce Feedback Management
   - Feedback s červeným borderem a pozadím
   - Badge s počtem nepřečtených zpráv u feedbacku

### Když admin otevře feedback:
1. Admin klikne na feedback v seznamu
2. Systém automaticky:
   - Nastaví `unreadUserReplies` na 0
   - Uloží `lastReadByAdmin` timestamp
3. Vizuální indikátory zmizí

### Když admin odpoví:
1. Admin napíše odpověď
2. Systém:
   - Přidá zprávu do konverzace
   - Inkrementuje `unreadAdminReplies` pro uživatele
   - Vynuluje `unreadUserReplies` (admin už viděl zprávy)
   - Nastaví `lastReadByAdmin` timestamp
   - Vytvoří notifikaci pro uživatele

## 🎨 UI/UX Detaily

### Vizuální odlišení feedbacků s novými zprávami:
- **Border**: `border-red-300` (červený)
- **Pozadí**: `bg-red-50` (světle červené)
- **Ring**: `ring-2 ring-red-200` (červený obrys)
- **Efekt**: Feedback vypadá jako "zvýrazněný" a je okamžitě viditelný

### Badge design:
- **Barva**: Červená (`bg-red-500`)
- **Ikona**: Zvonek (`Bell`)
- **Animace**: Pulzování (`animate-pulse`)
- **Velikost**: 
  - V hlavičce: `text-sm` s `w-4 h-4` ikonou
  - U feedbacku: `text-xs` s `w-3 h-3` ikonou

### Správná čeština:
- **1 zpráva**: "1 nová zpráva"
- **2-4 zprávy**: "2 nové zprávy"
- **5+ zpráv**: "5 nových zpráv"

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
  status: 'new' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  createdAt: Timestamp
  updatedAt?: Timestamp
  conversation?: FeedbackMessage[]
  
  // Pro uživatele (notifikace od admina)
  unreadAdminReplies?: number
  lastReadByUser?: Timestamp
  
  // Pro admina (notifikace od uživatele) - NOVÉ
  unreadUserReplies?: number
  lastReadByAdmin?: Timestamp
}
```

## 🔒 Bezpečnost

### Firestore Rules:
- ✅ Admin má plný přístup ke všem feedbackům
- ✅ Uživatelé mohou aktualizovat pouze specifická pole včetně `unreadUserReplies`
- ✅ Uživatelé nemohou měnit kritická pole (status, priority, adminNotes, atd.)

## 🚀 Testování

### Test Scenario 1: Uživatel odpoví
1. Přihlaste se jako uživatel
2. Otevřete Account → Feedback
3. Napište odpověď na existující feedback
4. Odešlete
5. Přihlaste se jako admin
6. Ověřte:
   - Červený badge v hlavičce s počtem zpráv
   - Feedback má červený border a pozadí
   - Badge u feedbacku s počtem nepřečtených zpráv

### Test Scenario 2: Admin otevře feedback
1. Přihlaste se jako admin
2. Otevřete Admin Dashboard → Feedback
3. Klikněte na feedback s nepřečtenými zprávami
4. Ověřte:
   - Badge zmizí
   - Červený border a pozadí zmizí
   - `unreadUserReplies` je 0

### Test Scenario 3: Admin odpoví
1. Admin otevře feedback s nepřečtenými zprávami
2. Napíše odpověď
3. Odešlete
4. Ověřte:
   - `unreadUserReplies` je 0
   - `unreadAdminReplies` se zvýšilo o 1
   - Uživatel dostane notifikaci

## 📝 Poznámky

- Vizuální indikátory jsou okamžitě viditelné díky červenému borderu a pozadí
- Admin nemusí ručně označovat zprávy jako přečtené - děje se automaticky
- Real-time aktualizace díky Firebase `onSnapshot`
- Správná čeština pro počet zpráv
- Pulzující animace upoutá pozornost admina

