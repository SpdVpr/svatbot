# Opravy systému notifikací

## Datum: 2025-11-22

## Problémy, které byly opraveny

### 1. ❌ Duplicitní notifikace při dokončení úkolů

**Problém:**
- Při dokončení úkolu se vytvořila notifikace
- `useAutoNotifications` běží každých 5 minut a kontroluje úkoly dokončené za poslední hodinu
- Při každém běhu se znovu vytvořila notifikace pro stejný úkol
- **Výsledek**: 12 duplicitních notifikací za hodinu pro jeden dokončený úkol!

**Řešení:**
- Přidán tracking systém `celebratedTasksRef` který sleduje, které úkoly už byly oslaveny
- Data se ukládají do localStorage s klíčem `svatbot_celebrated_tasks_${userId}`
- Před vytvořením notifikace se kontroluje, zda úkol už nebyl oslaven
- Automatické čištění: pokud je úkol označen jako nedokončený, odstraní se z seznamu oslavených

**Soubory:**
- `src/hooks/useAutoNotifications.ts`

### 2. ❌ Notifikace se znovu objevují jako nepřečtené

**Problém:**
- Cleanup mechanismus používal localStorage klíč který se nikdy neresetoval
- Cleanup běžel jen jednou při prvním načtení
- Nové duplicitní notifikace se už nečistily

**Řešení:**
- Cleanup klíč nyní obsahuje timestamp
- Cleanup se spouští každou hodinu (místo jen jednou)
- Vylepšený algoritmus pro detekci duplicit (zahrnuje `taskTitle` v unique key)
- Přidána funkce `deleteOldNotifications()` která maže přečtené notifikace starší než 7 dní

**Soubory:**
- `src/hooks/useWeddingNotifications.ts`

### 3. ❌ Staré notifikace se hromadily

**Problém:**
- Notifikace se nikdy automaticky nemazaly
- Databáze se plnila starými notifikacemi

**Řešení:**
- Přidána funkce `deleteOldNotifications()` která maže přečtené notifikace starší než 7 dní
- Automatické spouštění jednou denně v rámci `runAutoChecks()`
- Nepřečtené notifikace se zachovávají bez ohledu na stáří

**Soubory:**
- `src/hooks/useWeddingNotifications.ts`
- `src/hooks/useAutoNotifications.ts`

## Technické detaily

### Tracking oslavených úkolů

```typescript
// Ref pro sledování oslavených úkolů
const celebratedTasksRef = useRef<Set<string>>(new Set())

// Načtení z localStorage při mount
useEffect(() => {
  if (!user?.id) return
  
  const celebratedKey = `svatbot_celebrated_tasks_${user.id}`
  const celebratedStored = localStorage.getItem(celebratedKey)
  if (celebratedStored) {
    celebratedTasksRef.current = new Set(JSON.parse(celebratedStored))
  }
}, [user?.id])

// Kontrola před vytvořením notifikace
const newlyCompleted = recentlyCompleted.filter(t => 
  !celebratedTasksRef.current.has(t.id)
)

// Označení jako oslavený
celebratedTasksRef.current.add(task.id)
localStorage.setItem(celebratedKey, JSON.stringify(Array.from(celebratedTasksRef.current)))
```

### Vylepšený cleanup duplicit

```typescript
// Timestamp-based cleanup key
const cleanupKey = `notifications-cleanup-done-${user.id}`
const wasCleanupDone = localStorage.getItem(cleanupKey)

if (wasCleanupDone) {
  const lastCleanup = parseInt(wasCleanupDone)
  const now = Date.now()
  // Cleanup každou hodinu
  if (now - lastCleanup < 60 * 60 * 1000) {
    setCleanupDone(true)
    return
  }
}

// Vylepšený unique key zahrnující taskTitle
const taskTitle = data.data?.taskTitle || ''
const uniqueKey = `${data.userId}_${data.type}_${data.title}_${taskTitle}`
```

### Automatické mazání starých notifikací

```typescript
const deleteOldNotifications = useCallback(async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  
  for (const docSnapshot of snapshot.docs) {
    const data = docSnapshot.data()
    const createdAt = data.createdAt?.toDate()
    
    // Smazat pouze přečtené notifikace starší než 7 dní
    if (createdAt && createdAt < sevenDaysAgo && data.read) {
      await deleteDoc(doc(db, 'weddingNotifications', docSnapshot.id))
    }
  }
}, [user?.id])
```

## Testování

### Manuální test
1. Přihlaste se do aplikace
2. Dokončete úkol
3. Počkejte 5-10 minut
4. Zkontrolujte, že se nevytvořila duplicitní notifikace
5. Označte notifikace jako přečtené
6. Odhlaste se a znovu přihlaste
7. Zkontrolujte, že notifikace zůstávají přečtené

### Debug funkce
```typescript
// V konzoli prohlížeče
const { deleteAllNotifications, resetCleanup } = useWeddingNotifications()

// Smazat všechny notifikace
await deleteAllNotifications()

// Resetovat cleanup flag
resetCleanup()
```

## Další vylepšení

### Budoucí možnosti:
1. Přidat UI pro správu notifikací (archivace, filtrování)
2. Přidat nastavení frekvence notifikací
3. Přidat možnost vypnout určité typy notifikací
4. Přidat push notifikace (PWA)
5. Přidat email notifikace pro důležité události

