# Admin Dashboard Setup Guide

## Přehled

Tento dokument popisuje nastavení a konfiguraci admin dashboardu s pokročilou analytikou, real-time komunikací a správou uživatelů.

## Funkce

### ✅ Implementováno

1. **User Analytics**
   - Real-time sledování online uživatelů
   - Počet přihlášení a celkový čas v aplikaci
   - Historie sessions
   - Sledování navštívených stránek
   - Export dat do CSV

2. **Admin Messaging**
   - Obousměrná komunikace mezi uživateli a adminy
   - Real-time zprávy
   - Status konverzací (open, pending, closed)
   - Unread count

3. **Feedback System**
   - Uživatelé mohou posílat feedback (bug, feature, improvement, other)
   - Hodnocení aplikace (1-5 hvězdiček)
   - Admin může měnit status a přidávat poznámky
   - Prioritizace feedbacku

4. **Dashboard Stats**
   - Celkový počet uživatelů
   - Aktivní uživatelé (24h)
   - Online uživatelé (real-time)
   - Noví uživatelé (dnes, týden, měsíc)
   - Churn rate
   - Průměrný čas v aplikaci
   - Otevřené konverzace
   - Čekající feedback

### 🚧 Připraveno na implementaci

5. **Finance Dashboard**
   - Struktura pro platby a předplatná
   - Collections: `subscriptions`, `payments`
   - Security rules připraveny
   - UI placeholder vytvořen

6. **Affiliate Program**
   - Struktura pro affiliate partnery
   - Collections: `affiliatePartners`, `affiliateReferrals`
   - Security rules připraveny
   - UI placeholder vytvořen

## Firebase Setup

### 1. Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

Nové security rules zahrnují:
- Admin helper funkce (`isAdmin()`, `isSuperAdmin()`)
- Pravidla pro `userAnalytics` (admin read, system write)
- Pravidla pro `adminMessages` (bidirectional communication)
- Pravidla pro `feedback` (users create, admins manage)
- Rozšířená pravidla pro `subscriptions` a `payments`
- Pravidla pro `affiliatePartners` a `affiliateReferrals`

### 2. Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

Nové indexy:
- `userAnalytics`: isOnline + lastActivityAt, registeredAt, loginCount
- `adminMessages`: status + lastMessageAt, userId + createdAt
- `feedback`: status + priority + createdAt, type + createdAt, userId + createdAt
- `subscriptions`: status + endDate, plan + startDate
- `payments`: status + createdAt, userId + createdAt
- `affiliatePartners`: status + totalEarnings
- `affiliateReferrals`: affiliateId + createdAt, status + createdAt

### 3. Nastavit Admin Role v Firebase Auth

Pro přidělení admin role uživateli použijte Firebase Admin SDK nebo Cloud Function:

```typescript
import { auth } from 'firebase-admin'

// Set custom claims
await auth.setCustomUserClaims(userId, {
  role: 'admin' // nebo 'super_admin'
})
```

Nebo vytvořte Cloud Function:

```typescript
export const setAdminRole = functions.https.onCall(async (data, context) => {
  // Verify caller is super admin
  if (context.auth?.token.role !== 'super_admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only super admins can set roles')
  }

  const { userId, role } = data
  await auth.setCustomUserClaims(userId, { role })
  
  return { success: true }
})
```

## Použití

### Admin Dashboard

1. **Přístup**: `/admin/analytics`
2. **Login**: `/admin/login` (existující admin login)
3. **Požadavky**: Uživatel musí mít `role: 'admin'` nebo `role: 'super_admin'` v custom claims

### Záložky

- **Přehled**: Hlavní statistiky a quick actions
- **Uživatelé**: Tabulka s user analytics, filtry, export
- **Zprávy**: Real-time messaging s uživateli
- **Feedback**: Správa feedbacku od uživatelů
- **Finance**: Placeholder pro platby a předplatná
- **Affiliate**: Placeholder pro affiliate program
- **Vendors**: Link na existující vendor management

### User Tracking

User tracking se automaticky aktivuje pro přihlášené uživatele:

```typescript
// V root layout nebo main app component
import UserTrackingWrapper from '@/components/common/UserTrackingWrapper'

export default function Layout({ children }) {
  return (
    <UserTrackingWrapper>
      {children}
    </UserTrackingWrapper>
  )
}
```

Tracking zahrnuje:
- Login events
- Session duration
- Online/offline status
- Page views
- Feature usage

### Feedback Button

Floating button v pravém dolním rohu pro všechny přihlášené uživatele:
- Automaticky se zobrazuje
- Uživatelé mohou poslat bug report, nápad, zlepšení nebo obecnou zprávu
- Volitelné hodnocení aplikace

## Datová Struktura

### userAnalytics

```typescript
{
  userId: string
  email: string
  displayName: string
  registeredAt: Timestamp
  lastLoginAt: Timestamp
  loginCount: number
  totalSessionTime: number // minutes
  isOnline: boolean
  lastActivityAt: Timestamp
  sessions: [{
    sessionId: string
    startTime: Timestamp
    endTime?: Timestamp
    duration: number
    pages: string[]
  }]
  pageViews: {
    [pageName: string]: number
  }
  featuresUsed: string[]
}
```

### adminMessages

```typescript
{
  conversationId: string
  userId: string
  userName: string
  userEmail: string
  messages: [{
    id: string
    senderId: string
    senderType: 'user' | 'admin'
    senderName: string
    content: string
    timestamp: Timestamp
    read: boolean
  }]
  status: 'open' | 'closed' | 'pending'
  lastMessageAt: Timestamp
  unreadCount: number
  createdAt: Timestamp
}
```

### feedback

```typescript
{
  userId: string
  userEmail: string
  userName?: string
  type: 'bug' | 'feature' | 'improvement' | 'other'
  subject: string
  message: string
  rating?: number // 1-5
  page?: string
  screenshot?: string
  status: 'new' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  createdAt: Timestamp
  resolvedAt?: Timestamp
  adminNotes?: string
  assignedTo?: string
}
```

## Komponenty

### Admin Components

- `AdminDashboardStats`: Hlavní statistiky a přehled
- `UserAnalyticsTable`: Tabulka s uživatelskou analytikou
- `AdminMessaging`: Real-time messaging systém
- `FeedbackManagement`: Správa feedbacku

### User Components

- `FeedbackButton`: Floating button pro feedback
- `UserTrackingWrapper`: Wrapper pro automatický tracking

### Hooks

- `useAdminDashboard()`: Načítání dashboard statistik
- `useUserAnalytics()`: Real-time user analytics
- `useAdminMessages()`: Messaging systém
- `useFeedback()`: Feedback management
- `useUserTracking()`: Automatické sledování aktivity

## Bezpečnost

### Permissions

- **Super Admin**: Plný přístup ke všem funkcím
- **Admin**: Přístup k analytics, messages, feedback
- **User**: Může posílat feedback a zprávy, vidí pouze své konverzace

### Security Rules

- Admin funkce jsou chráněny `isAdmin()` a `isSuperAdmin()` funkcemi
- Uživatelé mohou číst pouze své vlastní data
- Pouze system/cloud functions mohou zapisovat do analytics
- Platby mohou vytvářet pouze Stripe webhooks

## Další Kroky

### Finance Module

1. Implementovat Stripe integration
2. Vytvořit subscription plans
3. Implementovat payment processing
4. Vytvořit invoice generation
5. Přidat payment history UI

### Affiliate Module

1. Vytvořit affiliate registration flow
2. Implementovat tracking kódy
3. Vytvořit commission calculation
4. Implementovat payout system
5. Přidat affiliate dashboard

### Rozšíření Analytics

1. Přidat grafy (Chart.js nebo Recharts)
2. Implementovat user cohort analysis
3. Přidat funnel analytics
4. Vytvořit custom reports
5. Export do PDF

## Troubleshooting

### User tracking nefunguje

1. Zkontrolujte, že je uživatel přihlášen
2. Ověřte Firebase permissions
3. Zkontrolujte browser console pro chyby

### Admin nemá přístup

1. Ověřte custom claims v Firebase Auth
2. Zkontrolujte security rules
3. Refresh token (logout/login)

### Real-time updates nefungují

1. Zkontrolujte Firebase connection
2. Ověřte Firestore indexes
3. Zkontrolujte browser console

## Support

Pro otázky nebo problémy kontaktujte vývojový tým nebo vytvořte issue v repository.

