'use client'

import { useState, useEffect, useMemo } from 'react'
import { Calendar, Heart, Lightbulb } from 'lucide-react'
import { useWedding } from '@/hooks/useWedding'
import { useTask } from '@/hooks/useTask'
import { useGuest } from '@/hooks/useGuest'
import { useBudget } from '@/hooks/useBudget'
import { useVendor } from '@/hooks/useVendor'
import { useAuth } from '@/hooks/useAuth'
import { useWeddingDate } from '@/hooks/useDemoSettings'
import { useRecommendationRotation } from '@/hooks/useRecommendationRotation'
import { WEDDING_CHECKLIST } from '@/data/weddingChecklistTemplates'
import { dateUtils } from '@/utils'
import NumberCounter from '@/components/animations/NumberCounter'

interface WeddingCountdownModuleProps {
  onWeddingSettingsClick: () => void
}

interface Recommendation {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  icon: string
  action?: {
    label: string
    link: string
  }
}

// Global interval ID to prevent duplicates across re-mounts
let globalIntervalId: NodeJS.Timeout | null = null

export default function WeddingCountdownModule({ onWeddingSettingsClick }: WeddingCountdownModuleProps) {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const { tasks, stats } = useTask()
  const { guests, stats: guestStats } = useGuest()
  const { budgetItems, stats: budgetStats } = useBudget()
  const { vendors, stats: vendorStats } = useVendor()

  // Use DEMO-aware wedding date
  const { weddingDate, isDemoUser } = useWeddingDate(user?.id, wedding?.weddingDate || null)

  // Random seed that changes on each mount to ensure different order every time
  const [randomSeed] = useState(() => Math.random())

  const daysUntilWedding = weddingDate ? dateUtils.daysUntilWedding(weddingDate) : null

  // Generate intelligent recommendations
  const recommendations = useMemo(() => {
    const recs: Recommendation[] = []

    if (!wedding || !daysUntilWedding) return recs

    // 1. VENUE CHECK
    if (!wedding.venue || !wedding.venue.name) {
      recs.push({
        id: 'venue-missing',
        title: 'Tip: Vyberte m�sto kon�n�',
        description: 'M�sto kon�n� je srdcem va�� svatby. A� ho vyberete, bude snaz�� pl�novat dal�� detaily.',
        priority: 'high',
        category: 'venue',
        icon: '???',
        action: { label: 'Prozkoumat m�sta', link: '/settings' }
      })
    }

    // 2. GUEST LIST CHECK
    if (guestStats.total === 0) {
      recs.push({
        id: 'guests-empty',
        title: 'Za�n�te se seznamem host�',
        description: 'Seznam host� v�m pom��e l�pe odhadnout rozpo�et a velikost m�sta kon�n�.',
        priority: 'medium',
        category: 'guest',
        icon: '??',
        action: { label: 'P�idat hosty', link: '/guests' }
      })
    } else if (guestStats.pending > guestStats.total * 0.5 && daysUntilWedding < 60) {
      recs.push({
        id: 'rsvp-pending',
        title: 'Tip: P�ipome�te se host�m',
        description: `${guestStats.pending} host� je�t� nepotvrdilo ��ast. Mo�n� by ocenili jemnou p�ipom�nku.`,
        priority: 'medium',
        category: 'guest',
        icon: '??',
        action: { label: 'Spr�va host�', link: '/guests' }
      })
    }

    // 3. BUDGET CHECK
    if (budgetStats.totalBudget === 0) {
      recs.push({
        id: 'budget-not-set',
        title: 'Doporu�ujeme nastavit rozpo�et',
        description: 'Rozpo�et v�m pom��e m�t p�ehled o v�daj�ch a pl�novat svatbu podle va�ich mo�nost�.',
        priority: 'medium',
        category: 'budget',
        icon: '??',
        action: { label: 'Nastavit rozpo�et', link: '/budget' }
      })
    } else if (budgetStats.budgetUsed > 90) {
      recs.push({
        id: 'budget-exceeded',
        title: 'Tip: Zkontrolujte rozpo�et',
        description: `Vyu�ili jste ${budgetStats.budgetUsed}% rozpo�tu. Mo�n� je �as se pod�vat na v�daje.`,
        priority: 'medium',
        category: 'budget',
        icon: '??',
        action: { label: 'Zkontrolovat', link: '/budget' }
      })
    }

    // 4. TASK COMPLETION CHECK
    if (stats.overdue > 0) {
      recs.push({
        id: 'tasks-overdue',
        title: 'M�te �koly po term�nu',
        description: `${stats.overdue} �kol� �ek� na dokon�en�. ��dn� stres, sta�� se k nim vr�tit, a� budete m�t �as.`,
        priority: 'medium',
        category: 'task',
        icon: '??',
        action: { label: 'Zobrazit �koly', link: '/tasks' }
      })
    }

    // 5. VENDOR CHECK
    const criticalVendors = ['photographer', 'catering', 'music', 'flowers']
    const bookedCriticalVendors = vendors.filter(v =>
      criticalVendors.includes(v.category) &&
      (v.status === 'contracted' || v.status === 'booked')
    )

    if (bookedCriticalVendors.length < criticalVendors.length && daysUntilWedding < 180) {
      const missing = criticalVendors.length - bookedCriticalVendors.length
      recs.push({
        id: 'vendors-missing',
        title: 'Tip: Prozkoumejte dodavatele',
        description: `St�le hled�te ${missing === 1 ? 'dodavatele' : `${missing} dodavatele`}? M�me pro v�s inspiraci v marketplace.`,
        priority: 'medium',
        category: 'vendor',
        icon: '??',
        action: { label: 'Prozkoumat marketplace', link: '/marketplace' }
      })
    }

    // 6. TIMELINE-BASED RECOMMENDATIONS
    if (daysUntilWedding <= 30 && daysUntilWedding > 7) {
      const phase = WEDDING_CHECKLIST.find(p => p.id === '1-month-before')
      if (phase) {
        phase.items.slice(0, 2).forEach(item => {
          const taskExists = tasks.some(t =>
            t.title.toLowerCase().includes(item.title.toLowerCase().substring(0, 10))
          )
          if (!taskExists) {
            recs.push({
              id: `checklist-${item.id}`,
              title: `Tip: ${item.title}`,
              description: item.description || 'Tento �kol by se hodil pro toto obdob� p��prav.',
              priority: 'medium',
              category: 'timeline',
              icon: item.icon || '??',
              action: { label: 'Zobrazit checklist', link: '/checklist' }
            })
          }
        })
      }
    } else if (daysUntilWedding <= 7 && daysUntilWedding > 0) {
      const phase = WEDDING_CHECKLIST.find(p => p.id === '1-week-before')
      if (phase) {
        phase.items.slice(0, 2).forEach(item => {
          const taskExists = tasks.some(t =>
            t.title.toLowerCase().includes(item.title.toLowerCase().substring(0, 10))
          )
          if (!taskExists) {
            recs.push({
              id: `checklist-${item.id}`,
              title: `Tip: ${item.title}`,
              description: item.description || 'Tento �kol by se hodil dokon�it p�ed svatbou.',
              priority: 'medium',
              category: 'timeline',
              icon: item.icon || '??',
              action: { label: 'Zobrazit checklist', link: '/checklist' }
            })
          }
        })
      }
    }

    // 7. SEATING PLAN CHECK
    if (guestStats.attending > 0 && daysUntilWedding < 30) {
      const guestsWithSeats = guests.filter(g => g.tableNumber !== undefined).length
      if (guestsWithSeats === 0) {
        recs.push({
          id: 'seating-not-started',
          title: 'Tip: Pl�n stol�',
          description: `M�te ${guestStats.attending} potvrzen�ch host�. Mo�n� je �as za��t s pl�nem stol�.`,
          priority: 'medium',
          category: 'general',
          icon: '??',
          action: { label: 'Vytvo�it pl�n', link: '/seating' }
        })
      }
    }

    // 8. INVITATIONS CHECK
    if (guestStats.total > 0 && daysUntilWedding < 90 && daysUntilWedding > 30) {
      const invitedCount = guests.filter(g => g.invitationSent).length
      if (invitedCount === 0) {
        recs.push({
          id: 'invitations-not-sent',
          title: 'Tip: Pozv�nky na svatbu',
          description: 'M�te seznam host�, ale je�t� jste nerozeslali pozv�nky. Ide�ln� �as je 2-3 m�s�ce p�ed svatbou.',
          priority: 'medium',
          category: 'guest',
          icon: '??',
          action: { label: 'Spr�va host�', link: '/guests' }
        })
      }
    }

    // 9. DIETARY RESTRICTIONS CHECK
    if (guestStats.attending > 0 && daysUntilWedding < 45) {
      const guestsWithDiet = guests.filter(g =>
        g.rsvpStatus === 'attending' && g.dietaryRestrictions && g.dietaryRestrictions.length > 0
      ).length
      if (guestsWithDiet > 0) {
        recs.push({
          id: 'dietary-restrictions',
          title: 'Tip: Stravovac� omezen�',
          description: `${guestsWithDiet} host� m� speci�ln� stravovac� po�adavky. Nezapome�te to sd�lit cateringov� slu�b�.`,
          priority: 'medium',
          category: 'guest',
          icon: '???',
          action: { label: 'Zobrazit hosty', link: '/guests' }
        })
      }
    }

    // 10. ACCOMMODATION CHECK
    if (guestStats.total > 20 && daysUntilWedding < 60) {
      const needAccommodation = guests.filter(g => g.accommodationInterest === 'interested').length
      if (needAccommodation > 0) {
        recs.push({
          id: 'accommodation-needed',
          title: 'Tip: Ubytov�n� pro hosty',
          description: `${needAccommodation} host� pot�ebuje ubytov�n�. Doporu�ujeme jim zaslat tipy na hotely v okol�.`,
          priority: 'medium',
          category: 'guest',
          icon: '??',
          action: { label: 'Spr�va ubytov�n�', link: '/accommodation' }
        })
      }
    }

    // 11. BUDGET ITEMS CHECK
    if (budgetItems.length === 0 && budgetStats.totalBudget > 0) {
      recs.push({
        id: 'budget-items-empty',
        title: 'Tip: Rozpo�tov� polo�ky',
        description: 'M�te nastaven� celkov� rozpo�et, ale je�t� jste nevytvo�ili ��dn� polo�ky. Za�n�te s pl�nov�n�m v�daj�.',
        priority: 'medium',
        category: 'budget',
        icon: '??',
        action: { label: 'P�idat polo�ky', link: '/budget' }
      })
    }

    // 12. UNPAID ITEMS CHECK
    if (budgetStats.totalPaid < budgetStats.totalActual && daysUntilWedding < 14) {
      const unpaidAmount = budgetStats.totalActual - budgetStats.totalPaid
      recs.push({
        id: 'unpaid-items',
        title: 'Tip: Nezaplacen� polo�ky',
        description: `Zb�v� zaplatit ${Math.round(unpaidAmount / 1000)}k K�. Zkontrolujte, kter� platby jsou je�t� nevy��zen�.`,
        priority: 'high',
        category: 'budget',
        icon: '??',
        action: { label: 'Zkontrolovat rozpo�et', link: '/budget' }
      })
    }

    // 13. PHOTOGRAPHER CHECK
    const hasPhotographer = vendors.some(v =>
      v.category === 'photographer' && (v.status === 'contracted' || v.status === 'booked')
    )
    if (!hasPhotographer && daysUntilWedding < 120) {
      recs.push({
        id: 'photographer-missing',
        title: 'Tip: Svatebn� fotograf',
        description: 'Fotograf zachyt� va�e nejkr�sn�j�� okam�iky. Doporu�ujeme ho zajistit co nejd��ve.',
        priority: 'high',
        category: 'vendor',
        icon: '??',
        action: { label: 'Naj�t fotografa', link: '/marketplace' }
      })
    }

    // 14. CATERING CHECK
    const hasCatering = vendors.some(v =>
      v.category === 'catering' && (v.status === 'contracted' || v.status === 'booked')
    )
    if (!hasCatering && daysUntilWedding < 90) {
      recs.push({
        id: 'catering-missing',
        title: 'Tip: Catering',
        description: 'J�dlo a pit� jsou d�le�itou sou��st� svatby. Je �as za��t hledat cateringovou slu�bu.',
        priority: 'high',
        category: 'vendor',
        icon: '??',
        action: { label: 'Naj�t catering', link: '/marketplace' }
      })
    }

    // 15. MUSIC/DJ CHECK
    const hasMusic = vendors.some(v =>
      v.category === 'music' && (v.status === 'contracted' || v.status === 'booked')
    )
    if (!hasMusic && daysUntilWedding < 90) {
      recs.push({
        id: 'music-missing',
        title: 'Tip: Hudba na svatbu',
        description: 'Hudba vytvo�� atmosf�ru cel�ho ve�era. Prozkoumejte DJ nebo �ivou kapelu.',
        priority: 'medium',
        category: 'vendor',
        icon: '??',
        action: { label: 'Naj�t hudbu', link: '/marketplace' }
      })
    }

    // 16. FLOWERS CHECK
    const hasFlowers = vendors.some(v =>
      v.category === 'flowers' && (v.status === 'contracted' || v.status === 'booked')
    )
    if (!hasFlowers && daysUntilWedding < 60) {
      recs.push({
        id: 'flowers-missing',
        title: 'Tip: Kv�tinov� v�zdoba',
        description: 'Kv�tiny dodaj� svatb� kr�su a eleganci. Prozkoumejte floristy ve va�em okol�.',
        priority: 'medium',
        category: 'vendor',
        icon: '??',
        action: { label: 'Naj�t floristy', link: '/marketplace' }
      })
    }

    // 17. WEDDING WEBSITE CHECK
    if (daysUntilWedding < 120 && daysUntilWedding > 30) {
      recs.push({
        id: 'wedding-website',
        title: 'Tip: Svatebn� web',
        description: 'Vytvo�te si svatebn� web, kde host� najdou v�echny d�le�it� informace o va�� svatb�.',
        priority: 'low',
        category: 'general',
        icon: '??',
        action: { label: 'Vytvo�it web', link: '/website' }
      })
    }

    // 18. TIMELINE CHECK
    if (daysUntilWedding < 30 && daysUntilWedding > 7) {
      recs.push({
        id: 'wedding-timeline',
        title: 'Tip: �asov� harmonogram',
        description: 'Vytvo�te si detailn� �asov� harmonogram svatebn�ho dne, aby v�e prob�hlo hladce.',
        priority: 'medium',
        category: 'general',
        icon: '?',
        action: { label: 'Vytvo�it timeline', link: '/timeline' }
      })
    }

    // 19. DRESS/SUIT CHECK
    if (daysUntilWedding < 120 && daysUntilWedding > 60) {
      recs.push({
        id: 'wedding-attire',
        title: 'Tip: Svatebn� oble�en�',
        description: 'Je �as za��t hledat svatebn� �aty nebo oblek. �pravy mohou trvat n�kolik t�dn�.',
        priority: 'medium',
        category: 'general',
        icon: '??',
        action: { label: 'Zobrazit checklist', link: '/checklist' }
      })
    }

    // 20. RINGS CHECK
    if (daysUntilWedding < 90 && daysUntilWedding > 30) {
      recs.push({
        id: 'wedding-rings',
        title: 'Tip: Snubn� prst�nky',
        description: 'Snubn� prst�nky jsou symbolem va�eho svazku. Vyberte si je s dostate�n�m p�edstihem.',
        priority: 'medium',
        category: 'general',
        icon: '??',
        action: { label: 'Zobrazit checklist', link: '/checklist' }
      })
    }

    // 21. TRANSPORTATION CHECK
    if (daysUntilWedding < 60 && daysUntilWedding > 14) {
      recs.push({
        id: 'transportation',
        title: 'Tip: Doprava',
        description: 'Zajist�te dopravu pro sebe i hosty. M��e to b�t auto, ko��r nebo autobus pro hosty.',
        priority: 'low',
        category: 'general',
        icon: '??',
        action: { label: 'Zobrazit checklist', link: '/checklist' }
      })
    }

    // 22. DECORATIONS CHECK
    if (daysUntilWedding < 45 && daysUntilWedding > 14) {
      recs.push({
        id: 'decorations',
        title: 'Tip: V�zdoba',
        description: 'Napl�nujte si v�zdobu m�sta kon�n�. M��ete si ji vyrobit sami nebo najmout dekorat�ra.',
        priority: 'low',
        category: 'general',
        icon: '??',
        action: { label: 'Zobrazit moodboard', link: '/moodboard' }
      })
    }

    // 23. WEDDING FAVORS CHECK
    if (daysUntilWedding < 30 && daysUntilWedding > 7) {
      recs.push({
        id: 'wedding-favors',
        title: 'Tip: D�rky pro hosty',
        description: 'P�ipravte mal� d�rky pro hosty jako pod�kov�n� za jejich ��ast.',
        priority: 'low',
        category: 'general',
        icon: '??',
        action: { label: 'N�kupn� seznam', link: '/shopping' }
      })
    }

    // 24. HAIR AND MAKEUP CHECK
    if (daysUntilWedding < 45 && daysUntilWedding > 14) {
      recs.push({
        id: 'hair-makeup',
        title: 'Tip: Vlasy a makeup',
        description: 'Domluvte si term�n na zkou�ku ��esu a makeupu. Ide�ln� 2-4 t�dny p�ed svatbou.',
        priority: 'medium',
        category: 'general',
        icon: '??',
        action: { label: 'Zobrazit checklist', link: '/checklist' }
      })
    }

    // 25. MARRIAGE LICENSE CHECK
    if (daysUntilWedding < 60 && daysUntilWedding > 14) {
      recs.push({
        id: 'marriage-license',
        title: 'Tip: Pr�vn� z�le�itosti',
        description: 'Nezapome�te vy��dit v�echny pot�ebn� dokumenty a doklady na matrice.',
        priority: 'high',
        category: 'general',
        icon: '??',
        action: { label: 'Zobrazit checklist', link: '/checklist' }
      })
    }

    // 26. REHEARSAL DINNER CHECK
    if (daysUntilWedding < 14 && daysUntilWedding > 3) {
      recs.push({
        id: 'rehearsal-dinner',
        title: 'Tip: Zkou�ka ob�adu',
        description: 'Napl�nujte si zkou�ku svatebn�ho ob�adu a p��padn� spole�nou ve�e�i den p�ed svatbou.',
        priority: 'low',
        category: 'general',
        icon: '???',
        action: { label: 'Zobrazit timeline', link: '/timeline' }
      })
    }

    // 27. EMERGENCY KIT CHECK
    if (daysUntilWedding < 7 && daysUntilWedding > 0) {
      recs.push({
        id: 'emergency-kit',
        title: 'Tip: Nouzov� sada',
        description: 'P�ipravte si nouzovou sadu s jehli�kami, n�plastmi, bolehlavem a dal��mi u�ite�n�mi v�cmi.',
        priority: 'low',
        category: 'general',
        icon: '??',
        action: { label: 'N�kupn� seznam', link: '/shopping' }
      })
    }

    // 28. VENDOR CONFIRMATION CHECK
    if (daysUntilWedding < 7 && daysUntilWedding > 0 && vendors.length > 0) {
      recs.push({
        id: 'vendor-confirmation',
        title: 'Tip: Potvr�te dodavatele',
        description: 'Zkontaktujte v�echny dodavatele a potvr�te jim p�esn� �asy a detaily svatebn�ho dne.',
        priority: 'high',
        category: 'vendor',
        icon: '??',
        action: { label: 'Spr�va dodavatel�', link: '/vendors' }
      })
    }

    // 29. FINAL PAYMENT CHECK
    if (daysUntilWedding < 7 && daysUntilWedding > 0) {
      recs.push({
        id: 'final-payments',
        title: 'Tip: Fin�ln� platby',
        description: 'P�ipravte si ob�lky s fin�ln�mi platbami pro dodavatele a spropitn�.',
        priority: 'medium',
        category: 'budget',
        icon: '??',
        action: { label: 'Zkontrolovat rozpo�et', link: '/budget' }
      })
    }

    // 30. RELAX REMINDER
    if (daysUntilWedding < 3 && daysUntilWedding > 0) {
      recs.push({
        id: 'relax-reminder',
        title: 'Nezapome�te si odpo�inout',
        description: 'Posledn� dny p�ed svatbou si u�ijte a odpo�i�te. V�echno zvl�dnete skv�le!',
        priority: 'low',
        category: 'general',
        icon: '??',
      })
    }

    // 31. GUEST COUNT MILESTONE
    if (guestStats.total >= 50 && guestStats.total < 100 && daysUntilWedding > 60) {
      recs.push({
        id: 'guest-milestone-50',
        title: 'M�te u� 50+ host�!',
        description: 'V� seznam host� roste. Nezapome�te pr�b�n� aktualizovat po�ty pro dodavatele.',
        priority: 'low',
        category: 'general',
        icon: '??',
      })
    }

    // 32. BUDGET MILESTONE
    if (budgetStats.totalBudget > 0 && budgetStats.budgetUsed > 50 && budgetStats.budgetUsed < 75) {
      recs.push({
        id: 'budget-milestone',
        title: 'Jste v polovin� rozpo�tu',
        description: 'Vyu�ili jste p�es polovinu rozpo�tu. St�le m�te rezervu na zb�vaj�c� polo�ky.',
        priority: 'low',
        category: 'general',
        icon: '??',
      })
    }

    // 33. TASK COMPLETION MILESTONE
    if (stats.completed > 10 && stats.completed > stats.total * 0.5) {
      recs.push({
        id: 'task-milestone',
        title: 'Skv�l� pokrok v �kolech!',
        description: `Dokon�ili jste u� ${stats.completed} �kol�. Jste na dobr� cest�!`,
        priority: 'low',
        category: 'general',
        icon: '?',
      })
    }

    // 34. VENDOR MILESTONE
    if (vendorStats.totalVendors >= 3 && daysUntilWedding > 30) {
      recs.push({
        id: 'vendor-milestone',
        title: `M�te u� ${vendorStats.totalVendors} dodavatel�`,
        description: 'V� t�m dodavatel� se rozr�st�. Nezapome�te si v�echny kontakty ulo�it na jedno m�sto.',
        priority: 'low',
        category: 'general',
        icon: '??',
      })
    }

    // 35. COUNTDOWN MILESTONES
    if (daysUntilWedding === 100) {
      recs.push({
        id: 'countdown-100',
        title: '100 dn� do svatby!',
        description: 'Zb�v� u� jen 100 dn�! Je �as za��t s fin�ln�mi p��pravami.',
        priority: 'low',
        category: 'general',
        icon: '??',
      })
    } else if (daysUntilWedding === 50) {
      recs.push({
        id: 'countdown-50',
        title: '50 dn� do svatby!',
        description: 'U� jen 50 dn�! Zkontrolujte, �e m�te v�echny kl��ov� v�ci zaji�t�n�.',
        priority: 'low',
        category: 'general',
        icon: '??',
      })
    } else if (daysUntilWedding === 30) {
      recs.push({
        id: 'countdown-30',
        title: 'M�s�c do svatby!',
        description: 'Zb�v� u� jen m�s�c! �as na fin�ln� dolad�n� v�ech detail�.',
        priority: 'low',
        category: 'general',
        icon: '??',
      })
    } else if (daysUntilWedding === 7) {
      recs.push({
        id: 'countdown-7',
        title: 'T�den do svatby!',
        description: 'U� jen t�den! U��vejte si posledn� p��pravy a t�te se na v� velk� den.',
        priority: 'low',
        category: 'general',
        icon: '??',
      })
    } else if (daysUntilWedding === 1) {
      recs.push({
        id: 'countdown-1',
        title: 'Z�tra je v� velk� den!',
        description: 'Z�tra se vd�v�te! Odpo�i�te si, v�echno bude perfektn�. ??',
        priority: 'low',
        category: 'general',
        icon: '??',
      })
    }

    // 36. POSITIVE REINFORCEMENT - kdy� je v�e v po��dku
    if (recs.length === 0) {
      if (wedding.progress.overall > 70) {
        recs.push({
          id: 'great-progress',
          title: 'Skv�l� pr�ce!',
          description: 'M�te za sebou v�t�inu p��prav. U��vejte si cestu k va�emu velk�mu dni.',
          priority: 'low',
          category: 'general',
          icon: '??',
        })
      } else if (wedding.progress.overall > 40) {
        recs.push({
          id: 'good-progress',
          title: 'Jdete na to skv�le!',
          description: 'P��pravy postupuj� podle pl�nu. Nezapome�te si �as od �asu odpo�inout.',
          priority: 'low',
          category: 'general',
          icon: '?',
        })
      } else {
        recs.push({
          id: 'getting-started',
          title: 'V�tejte v p��prav�ch!',
          description: 'Ka�d� svatba za��n� prvn�m krokem. U��vejte si pl�nov�n�.',
          priority: 'low',
          category: 'general',
          icon: '??',
        })
      }
    }

    return recs
  }, [wedding, daysUntilWedding, guestStats, budgetStats, stats, vendors, tasks, guests])

  // Shuffle and prioritize recommendations - only once on mount
  const shuffledRecommendations = useMemo(() => {
    if (recommendations.length === 0) return []

    const urgent = recommendations.filter(r => r.priority === 'urgent')
    const high = recommendations.filter(r => r.priority === 'high')
    const medium = recommendations.filter(r => r.priority === 'medium')
    const low = recommendations.filter(r => r.priority === 'low')

    // Seeded random - prevents re-shuffle on hover
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    }

    const shuffle = (array: Recommendation[], seedOffset: number) => {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const seed = randomSeed * 1000 + seedOffset + i
        const j = Math.floor(seededRandom(seed) * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    }

    const result = [...shuffle(urgent, 0), ...shuffle(high, 100), ...shuffle(medium, 200), ...shuffle(low, 300)]
    return result
  }, [recommendations, randomSeed])

  // Use custom hook for rotation
  const { currentItem: currentRec, isTransitioning } = useRecommendationRotation(shuffledRecommendations, 5000)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-blue-50 border-blue-200 text-blue-700'
      case 'medium': return 'bg-purple-50 border-purple-200 text-purple-700'
      default: return 'bg-green-50 border-green-200 text-green-700'
    }
  }

  const getPriorityIcon = (priority: string) => {
    return <Lightbulb className="w-4 h-4" />
  }

  // If no wedding data, show setup prompt
  if (!wedding) {
    return (
      <div className="module-content text-center">
        <div className="space-y-6">
          <div>
            <div className="text-4xl mb-4">??</div>
            <p className="text-lg font-semibold text-text-primary mb-4">
              Nastavte datum svatby
            </p>
            <button
              onClick={onWeddingSettingsClick}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <Calendar className="w-4 h-4" />
              <span>Nastavit datum</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="module-content !p-4 text-center relative overflow-hidden">
      {/* Floating hearts background */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <Heart className="absolute top-4 left-4 w-8 h-8 text-primary-500 float" fill="currentColor" />
        <Heart className="absolute top-8 right-8 w-6 h-6 text-secondary-500 float-rotate" fill="currentColor" style={{ animationDelay: '0.5s' }} />
        <Heart className="absolute bottom-6 left-12 w-5 h-5 text-accent-500 float" fill="currentColor" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex flex-col">
        {/* Top section - countdown and progress */}
        <div className="flex-shrink-0 space-y-2.5">
          {daysUntilWedding !== null ? (
            <div>
              <div className="text-3xl sm:text-5xl font-bold text-primary-600 scale-in leading-tight">
                <NumberCounter
                  end={daysUntilWedding > 0 ? daysUntilWedding : 0}
                  duration={2000}
                  className="inline-block"
                />
              </div>
              <p className="text-base sm:text-lg font-semibold text-text-primary slide-in-bottom mt-1">
                {daysUntilWedding > 0
                  ? `dn� do svatby`
                  : daysUntilWedding === 0
                    ? 'Svatba je dnes! ??'
                    : 'Svatba prob�hla'
                }
              </p>
              {daysUntilWedding > 0 && weddingDate && (
                <p className="text-xs text-text-muted mt-1">
                  Od {dateUtils.format(new Date(), 'dd.MM.yyyy')} do {dateUtils.format(weddingDate, 'dd.MM.yyyy')}
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="text-3xl mb-2">??</div>
              <p className="text-base font-semibold text-text-primary mb-2">
                Nastavte datum svatby
              </p>
              <button
                onClick={onWeddingSettingsClick}
                className="btn-primary flex items-center space-x-2 mx-auto text-sm py-1.5 px-3"
              >
                <Calendar className="w-4 h-4" />
                <span>Nastavit datum</span>
              </button>
            </div>
          )}

          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-text-muted">Celkov� pokrok</span>
              <span className="text-xs font-semibold">{wedding?.progress?.overall || 0}%</span>
            </div>
            <div className="progress-bar h-1.5">
              <div
                className="progress-fill"
                style={{ width: `${wedding?.progress?.overall || 0}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-text-secondary leading-tight">
            {wedding.progress.overall < 30
              ? "Skv�l� za��tek! Pokra�ujte v z�kladn�m pl�nov�n�."
              : wedding.progress.overall < 70
                ? "V�born�! M�te za sebou v�t�inu p��prav."
                : "Fantastick�! Bl��te se k c�li."
            }
          </p>
        </div>

        {/* Bottom section - stats */}
        <div className="pt-2 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="text-center py-1">
              <div className="text-base sm:text-lg font-bold text-blue-600 leading-tight">
                <NumberCounter end={stats.total} duration={1500} />
              </div>
              <div className="text-xs text-text-muted leading-tight">�kol�</div>
            </div>
            <div className="text-center py-1">
              <div className="text-base sm:text-lg font-bold text-primary-600 leading-tight">
                <NumberCounter end={guestStats.total} duration={1500} />
              </div>
              <div className="text-xs text-text-muted leading-tight">Host�</div>
            </div>
            <div className="text-center py-1">
              <div className="text-base sm:text-lg font-bold text-green-600 leading-tight">
                <NumberCounter end={Math.round(budgetStats.totalBudget / 1000)} duration={1500} suffix="k" />
              </div>
              <div className="text-xs text-text-muted leading-tight">Rozpo�et</div>
            </div>
            <div className="text-center py-1">
              <div className="text-base sm:text-lg font-bold text-purple-600 leading-tight">
                <NumberCounter end={vendorStats.totalVendors} duration={1500} />
              </div>
              <div className="text-xs text-text-muted leading-tight">Dodavatel�</div>
            </div>
          </div>
        </div>

        {/* Wedding Advisor Section */}
        {currentRec && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div
              className={`rounded-lg border p-4 transition-all duration-300 ${getPriorityColor(currentRec.priority)} ${
                isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-3xl flex-shrink-0">{currentRec.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      {getPriorityIcon(currentRec.priority)}
                      <h4 className="text-sm font-semibold">{currentRec.title}</h4>
                    </div>
                    <p className="text-sm leading-relaxed opacity-90">{currentRec.description}</p>
                  </div>
                </div>
                {currentRec.action && (
                  <a
                    href={currentRec.action.link}
                    className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/50 transition-colors group"
                    title={currentRec.action.label}
                  >
                    <svg className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
