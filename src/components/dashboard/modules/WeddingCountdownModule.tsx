'use client'

import { useState, useEffect, useMemo } from 'react'
import { Calendar, Heart, Lightbulb } from 'lucide-react'
import { useWedding } from '@/hooks/useWedding'
import { useTask } from '@/hooks/useTask'
import { useGuest } from '@/hooks/useGuest'
import { useBudget } from '@/hooks/useBudget'
import { useVendor } from '@/hooks/useVendor'
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
  const { wedding } = useWedding()
  const { tasks, stats } = useTask()
  const { guests, stats: guestStats } = useGuest()
  const { budgetItems, stats: budgetStats } = useBudget()
  const { vendors, stats: vendorStats } = useVendor()

  // Random seed that changes on each mount to ensure different order every time
  const [randomSeed] = useState(() => Math.random())

  const daysUntilWedding = wedding?.weddingDate ? dateUtils.daysUntilWedding(wedding.weddingDate) : null

  // Generate intelligent recommendations
  const recommendations = useMemo(() => {
    const recs: Recommendation[] = []

    if (!wedding || !daysUntilWedding) return recs

    // 1. VENUE CHECK
    if (!wedding.venue || !wedding.venue.name) {
      recs.push({
        id: 'venue-missing',
        title: 'Tip: Vyberte místo konání',
        description: 'Místo konání je srdcem vaší svatby. Až ho vyberete, bude snazší plánovat další detaily.',
        priority: 'high',
        category: 'venue',
        icon: '🏛️',
        action: { label: 'Prozkoumat místa', link: '/settings' }
      })
    }

    // 2. GUEST LIST CHECK
    if (guestStats.total === 0) {
      recs.push({
        id: 'guests-empty',
        title: 'Začněte se seznamem hostů',
        description: 'Seznam hostů vám pomůže lépe odhadnout rozpočet a velikost místa konání.',
        priority: 'medium',
        category: 'guest',
        icon: '👥',
        action: { label: 'Přidat hosty', link: '/guests' }
      })
    } else if (guestStats.pending > guestStats.total * 0.5 && daysUntilWedding < 60) {
      recs.push({
        id: 'rsvp-pending',
        title: 'Tip: Připomeňte se hostům',
        description: `${guestStats.pending} hostů ještě nepotvrdilo účast. Možná by ocenili jemnou připomínku.`,
        priority: 'medium',
        category: 'guest',
        icon: '📧',
        action: { label: 'Správa hostů', link: '/guests' }
      })
    }

    // 3. BUDGET CHECK
    if (budgetStats.totalBudget === 0) {
      recs.push({
        id: 'budget-not-set',
        title: 'Doporučujeme nastavit rozpočet',
        description: 'Rozpočet vám pomůže mít přehled o výdajích a plánovat svatbu podle vašich možností.',
        priority: 'medium',
        category: 'budget',
        icon: '💰',
        action: { label: 'Nastavit rozpočet', link: '/budget' }
      })
    } else if (budgetStats.budgetUsed > 90) {
      recs.push({
        id: 'budget-exceeded',
        title: 'Tip: Zkontrolujte rozpočet',
        description: `Využili jste ${budgetStats.budgetUsed}% rozpočtu. Možná je čas se podívat na výdaje.`,
        priority: 'medium',
        category: 'budget',
        icon: '💳',
        action: { label: 'Zkontrolovat', link: '/budget' }
      })
    }

    // 4. TASK COMPLETION CHECK
    if (stats.overdue > 0) {
      recs.push({
        id: 'tasks-overdue',
        title: 'Máte úkoly po termínu',
        description: `${stats.overdue} úkolů čeká na dokončení. Žádný stres, stačí se k nim vrátit, až budete mít čas.`,
        priority: 'medium',
        category: 'task',
        icon: '📋',
        action: { label: 'Zobrazit úkoly', link: '/tasks' }
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
        description: `Stále hledáte ${missing === 1 ? 'dodavatele' : `${missing} dodavatele`}? Máme pro vás inspiraci v marketplace.`,
        priority: 'medium',
        category: 'vendor',
        icon: '🎯',
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
              description: item.description || 'Tento úkol by se hodil pro toto období příprav.',
              priority: 'medium',
              category: 'timeline',
              icon: item.icon || '📌',
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
              description: item.description || 'Tento úkol by se hodil dokončit před svatbou.',
              priority: 'medium',
              category: 'timeline',
              icon: item.icon || '💡',
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
          title: 'Tip: Plán stolů',
          description: `Máte ${guestStats.attending} potvrzených hostů. Možná je čas začít s plánem stolů.`,
          priority: 'medium',
          category: 'general',
          icon: '🪑',
          action: { label: 'Vytvořit plán', link: '/seating' }
        })
      }
    }

    // 8. INVITATIONS CHECK
    if (guestStats.total > 0 && daysUntilWedding < 90 && daysUntilWedding > 30) {
      const invitedCount = guests.filter(g => g.invitationSent).length
      if (invitedCount === 0) {
        recs.push({
          id: 'invitations-not-sent',
          title: 'Tip: Pozvánky na svatbu',
          description: 'Máte seznam hostů, ale ještě jste nerozeslali pozvánky. Ideální čas je 2-3 měsíce před svatbou.',
          priority: 'medium',
          category: 'guest',
          icon: '💌',
          action: { label: 'Správa hostů', link: '/guests' }
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
          title: 'Tip: Stravovací omezení',
          description: `${guestsWithDiet} hostů má speciální stravovací požadavky. Nezapomeňte to sdělit cateringové službě.`,
          priority: 'medium',
          category: 'guest',
          icon: '🍽️',
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
          title: 'Tip: Ubytování pro hosty',
          description: `${needAccommodation} hostů potřebuje ubytování. Doporučujeme jim zaslat tipy na hotely v okolí.`,
          priority: 'medium',
          category: 'guest',
          icon: '🏨',
          action: { label: 'Správa ubytování', link: '/accommodation' }
        })
      }
    }

    // 11. BUDGET ITEMS CHECK
    if (budgetItems.length === 0 && budgetStats.totalBudget > 0) {
      recs.push({
        id: 'budget-items-empty',
        title: 'Tip: Rozpočtové položky',
        description: 'Máte nastavený celkový rozpočet, ale ještě jste nevytvořili žádné položky. Začněte s plánováním výdajů.',
        priority: 'medium',
        category: 'budget',
        icon: '📊',
        action: { label: 'Přidat položky', link: '/budget' }
      })
    }

    // 12. UNPAID ITEMS CHECK
    if (budgetStats.totalPaid < budgetStats.totalActual && daysUntilWedding < 14) {
      const unpaidAmount = budgetStats.totalActual - budgetStats.totalPaid
      recs.push({
        id: 'unpaid-items',
        title: 'Tip: Nezaplacené položky',
        description: `Zbývá zaplatit ${Math.round(unpaidAmount / 1000)}k Kč. Zkontrolujte, které platby jsou ještě nevyřízené.`,
        priority: 'high',
        category: 'budget',
        icon: '💸',
        action: { label: 'Zkontrolovat rozpočet', link: '/budget' }
      })
    }

    // 13. PHOTOGRAPHER CHECK
    const hasPhotographer = vendors.some(v =>
      v.category === 'photographer' && (v.status === 'contracted' || v.status === 'booked')
    )
    if (!hasPhotographer && daysUntilWedding < 120) {
      recs.push({
        id: 'photographer-missing',
        title: 'Tip: Svatební fotograf',
        description: 'Fotograf zachytí vaše nejkrásnější okamžiky. Doporučujeme ho zajistit co nejdříve.',
        priority: 'high',
        category: 'vendor',
        icon: '📸',
        action: { label: 'Najít fotografa', link: '/marketplace' }
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
        description: 'Jídlo a pití jsou důležitou součástí svatby. Je čas začít hledat cateringovou službu.',
        priority: 'high',
        category: 'vendor',
        icon: '🍰',
        action: { label: 'Najít catering', link: '/marketplace' }
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
        description: 'Hudba vytvoří atmosféru celého večera. Prozkoumejte DJ nebo živou kapelu.',
        priority: 'medium',
        category: 'vendor',
        icon: '🎵',
        action: { label: 'Najít hudbu', link: '/marketplace' }
      })
    }

    // 16. FLOWERS CHECK
    const hasFlowers = vendors.some(v =>
      v.category === 'flowers' && (v.status === 'contracted' || v.status === 'booked')
    )
    if (!hasFlowers && daysUntilWedding < 60) {
      recs.push({
        id: 'flowers-missing',
        title: 'Tip: Květinová výzdoba',
        description: 'Květiny dodají svatbě krásu a eleganci. Prozkoumejte floristy ve vašem okolí.',
        priority: 'medium',
        category: 'vendor',
        icon: '💐',
        action: { label: 'Najít floristy', link: '/marketplace' }
      })
    }

    // 17. WEDDING WEBSITE CHECK
    if (daysUntilWedding < 120 && daysUntilWedding > 30) {
      recs.push({
        id: 'wedding-website',
        title: 'Tip: Svatební web',
        description: 'Vytvořte si svatební web, kde hosté najdou všechny důležité informace o vaší svatbě.',
        priority: 'low',
        category: 'general',
        icon: '🌐',
        action: { label: 'Vytvořit web', link: '/website' }
      })
    }

    // 18. TIMELINE CHECK
    if (daysUntilWedding < 30 && daysUntilWedding > 7) {
      recs.push({
        id: 'wedding-timeline',
        title: 'Tip: Časový harmonogram',
        description: 'Vytvořte si detailní časový harmonogram svatebního dne, aby vše proběhlo hladce.',
        priority: 'medium',
        category: 'general',
        icon: '⏰',
        action: { label: 'Vytvořit timeline', link: '/timeline' }
      })
    }

    // 19. DRESS/SUIT CHECK
    if (daysUntilWedding < 120 && daysUntilWedding > 60) {
      recs.push({
        id: 'wedding-attire',
        title: 'Tip: Svatební oblečení',
        description: 'Je čas začít hledat svatební šaty nebo oblek. Úpravy mohou trvat několik týdnů.',
        priority: 'medium',
        category: 'general',
        icon: '👰',
        action: { label: 'Zobrazit checklist', link: '/checklist' }
      })
    }

    // 20. RINGS CHECK
    if (daysUntilWedding < 90 && daysUntilWedding > 30) {
      recs.push({
        id: 'wedding-rings',
        title: 'Tip: Snubní prstýnky',
        description: 'Snubní prstýnky jsou symbolem vašeho svazku. Vyberte si je s dostatečným předstihem.',
        priority: 'medium',
        category: 'general',
        icon: '💍',
        action: { label: 'Zobrazit checklist', link: '/checklist' }
      })
    }

    // 21. TRANSPORTATION CHECK
    if (daysUntilWedding < 60 && daysUntilWedding > 14) {
      recs.push({
        id: 'transportation',
        title: 'Tip: Doprava',
        description: 'Zajistěte dopravu pro sebe i hosty. Může to být auto, kočár nebo autobus pro hosty.',
        priority: 'low',
        category: 'general',
        icon: '🚗',
        action: { label: 'Zobrazit checklist', link: '/checklist' }
      })
    }

    // 22. DECORATIONS CHECK
    if (daysUntilWedding < 45 && daysUntilWedding > 14) {
      recs.push({
        id: 'decorations',
        title: 'Tip: Výzdoba',
        description: 'Naplánujte si výzdobu místa konání. Můžete si ji vyrobit sami nebo najmout dekoratéra.',
        priority: 'low',
        category: 'general',
        icon: '🎨',
        action: { label: 'Zobrazit moodboard', link: '/moodboard' }
      })
    }

    // 23. WEDDING FAVORS CHECK
    if (daysUntilWedding < 30 && daysUntilWedding > 7) {
      recs.push({
        id: 'wedding-favors',
        title: 'Tip: Dárky pro hosty',
        description: 'Připravte malé dárky pro hosty jako poděkování za jejich účast.',
        priority: 'low',
        category: 'general',
        icon: '🎁',
        action: { label: 'Nákupní seznam', link: '/shopping' }
      })
    }

    // 24. HAIR AND MAKEUP CHECK
    if (daysUntilWedding < 45 && daysUntilWedding > 14) {
      recs.push({
        id: 'hair-makeup',
        title: 'Tip: Vlasy a makeup',
        description: 'Domluvte si termín na zkoušku účesu a makeupu. Ideálně 2-4 týdny před svatbou.',
        priority: 'medium',
        category: 'general',
        icon: '💄',
        action: { label: 'Zobrazit checklist', link: '/checklist' }
      })
    }

    // 25. MARRIAGE LICENSE CHECK
    if (daysUntilWedding < 60 && daysUntilWedding > 14) {
      recs.push({
        id: 'marriage-license',
        title: 'Tip: Právní záležitosti',
        description: 'Nezapomeňte vyřídit všechny potřebné dokumenty a doklady na matrice.',
        priority: 'high',
        category: 'general',
        icon: '📋',
        action: { label: 'Zobrazit checklist', link: '/checklist' }
      })
    }

    // 26. REHEARSAL DINNER CHECK
    if (daysUntilWedding < 14 && daysUntilWedding > 3) {
      recs.push({
        id: 'rehearsal-dinner',
        title: 'Tip: Zkouška obřadu',
        description: 'Naplánujte si zkoušku svatebního obřadu a případně společnou večeři den před svatbou.',
        priority: 'low',
        category: 'general',
        icon: '🍽️',
        action: { label: 'Zobrazit timeline', link: '/timeline' }
      })
    }

    // 27. EMERGENCY KIT CHECK
    if (daysUntilWedding < 7 && daysUntilWedding > 0) {
      recs.push({
        id: 'emergency-kit',
        title: 'Tip: Nouzová sada',
        description: 'Připravte si nouzovou sadu s jehličkami, náplastmi, bolehlavem a dalšími užitečnými věcmi.',
        priority: 'low',
        category: 'general',
        icon: '🩹',
        action: { label: 'Nákupní seznam', link: '/shopping' }
      })
    }

    // 28. VENDOR CONFIRMATION CHECK
    if (daysUntilWedding < 7 && daysUntilWedding > 0 && vendors.length > 0) {
      recs.push({
        id: 'vendor-confirmation',
        title: 'Tip: Potvrďte dodavatele',
        description: 'Zkontaktujte všechny dodavatele a potvrďte jim přesné časy a detaily svatebního dne.',
        priority: 'high',
        category: 'vendor',
        icon: '📞',
        action: { label: 'Správa dodavatelů', link: '/vendors' }
      })
    }

    // 29. FINAL PAYMENT CHECK
    if (daysUntilWedding < 7 && daysUntilWedding > 0) {
      recs.push({
        id: 'final-payments',
        title: 'Tip: Finální platby',
        description: 'Připravte si obálky s finálními platbami pro dodavatele a spropitné.',
        priority: 'medium',
        category: 'budget',
        icon: '💰',
        action: { label: 'Zkontrolovat rozpočet', link: '/budget' }
      })
    }

    // 30. RELAX REMINDER
    if (daysUntilWedding < 3 && daysUntilWedding > 0) {
      recs.push({
        id: 'relax-reminder',
        title: 'Nezapomeňte si odpočinout',
        description: 'Poslední dny před svatbou si užijte a odpočiňte. Všechno zvládnete skvěle!',
        priority: 'low',
        category: 'general',
        icon: '🧘',
      })
    }

    // 31. GUEST COUNT MILESTONE
    if (guestStats.total >= 50 && guestStats.total < 100 && daysUntilWedding > 60) {
      recs.push({
        id: 'guest-milestone-50',
        title: 'Máte už 50+ hostů!',
        description: 'Váš seznam hostů roste. Nezapomeňte průběžně aktualizovat počty pro dodavatele.',
        priority: 'low',
        category: 'general',
        icon: '🎊',
      })
    }

    // 32. BUDGET MILESTONE
    if (budgetStats.totalBudget > 0 && budgetStats.budgetUsed > 50 && budgetStats.budgetUsed < 75) {
      recs.push({
        id: 'budget-milestone',
        title: 'Jste v polovině rozpočtu',
        description: 'Využili jste přes polovinu rozpočtu. Stále máte rezervu na zbývající položky.',
        priority: 'low',
        category: 'general',
        icon: '📈',
      })
    }

    // 33. TASK COMPLETION MILESTONE
    if (stats.completed > 10 && stats.completed > stats.total * 0.5) {
      recs.push({
        id: 'task-milestone',
        title: 'Skvělý pokrok v úkolech!',
        description: `Dokončili jste už ${stats.completed} úkolů. Jste na dobré cestě!`,
        priority: 'low',
        category: 'general',
        icon: '✅',
      })
    }

    // 34. VENDOR MILESTONE
    if (vendorStats.totalVendors >= 3 && daysUntilWedding > 30) {
      recs.push({
        id: 'vendor-milestone',
        title: `Máte už ${vendorStats.totalVendors} dodavatelů`,
        description: 'Váš tým dodavatelů se rozrůstá. Nezapomeňte si všechny kontakty uložit na jedno místo.',
        priority: 'low',
        category: 'general',
        icon: '🤝',
      })
    }

    // 35. COUNTDOWN MILESTONES
    if (daysUntilWedding === 100) {
      recs.push({
        id: 'countdown-100',
        title: '100 dní do svatby!',
        description: 'Zbývá už jen 100 dní! Je čas začít s finálními přípravami.',
        priority: 'low',
        category: 'general',
        icon: '💯',
      })
    } else if (daysUntilWedding === 50) {
      recs.push({
        id: 'countdown-50',
        title: '50 dní do svatby!',
        description: 'Už jen 50 dní! Zkontrolujte, že máte všechny klíčové věci zajištěné.',
        priority: 'low',
        category: 'general',
        icon: '🎯',
      })
    } else if (daysUntilWedding === 30) {
      recs.push({
        id: 'countdown-30',
        title: 'Měsíc do svatby!',
        description: 'Zbývá už jen měsíc! Čas na finální doladění všech detailů.',
        priority: 'low',
        category: 'general',
        icon: '📅',
      })
    } else if (daysUntilWedding === 7) {
      recs.push({
        id: 'countdown-7',
        title: 'Týden do svatby!',
        description: 'Už jen týden! Užívejte si poslední přípravy a těšte se na váš velký den.',
        priority: 'low',
        category: 'general',
        icon: '🎉',
      })
    } else if (daysUntilWedding === 1) {
      recs.push({
        id: 'countdown-1',
        title: 'Zítra je váš velký den!',
        description: 'Zítra se vdáváte! Odpočiňte si, všechno bude perfektní. 💕',
        priority: 'low',
        category: 'general',
        icon: '💖',
      })
    }

    // 36. POSITIVE REINFORCEMENT - když je vše v pořádku
    if (recs.length === 0) {
      if (wedding.progress.overall > 70) {
        recs.push({
          id: 'great-progress',
          title: 'Skvělá práce!',
          description: 'Máte za sebou většinu příprav. Užívejte si cestu k vašemu velkému dni.',
          priority: 'low',
          category: 'general',
          icon: '🎉',
        })
      } else if (wedding.progress.overall > 40) {
        recs.push({
          id: 'good-progress',
          title: 'Jdete na to skvěle!',
          description: 'Přípravy postupují podle plánu. Nezapomeňte si čas od času odpočinout.',
          priority: 'low',
          category: 'general',
          icon: '✨',
        })
      } else {
        recs.push({
          id: 'getting-started',
          title: 'Vítejte v přípravách!',
          description: 'Každá svatba začíná prvním krokem. Užívejte si plánování.',
          priority: 'low',
          category: 'general',
          icon: '💝',
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
      <div className="wedding-card text-center">
        <div className="space-y-6">
          <div>
            <div className="text-4xl mb-4">📅</div>
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
    <div className="wedding-card !p-4 text-center relative overflow-hidden">
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
                  ? `dní do svatby`
                  : daysUntilWedding === 0
                    ? 'Svatba je dnes! 🎉'
                    : 'Svatba proběhla'
                }
              </p>
              {daysUntilWedding > 0 && wedding?.weddingDate && (
                <p className="text-xs text-text-muted mt-1">
                  Od {dateUtils.format(new Date(), 'dd.MM.yyyy')} do {dateUtils.format(wedding.weddingDate, 'dd.MM.yyyy')}
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="text-3xl mb-2">📅</div>
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
              <span className="text-xs text-text-muted">Celkový pokrok</span>
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
              ? "Skvělý začátek! Pokračujte v základním plánování."
              : wedding.progress.overall < 70
                ? "Výborně! Máte za sebou většinu příprav."
                : "Fantastické! Blížíte se k cíli."
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
              <div className="text-xs text-text-muted leading-tight">Úkolů</div>
            </div>
            <div className="text-center py-1">
              <div className="text-base sm:text-lg font-bold text-primary-600 leading-tight">
                <NumberCounter end={guestStats.total} duration={1500} />
              </div>
              <div className="text-xs text-text-muted leading-tight">Hostů</div>
            </div>
            <div className="text-center py-1">
              <div className="text-base sm:text-lg font-bold text-green-600 leading-tight">
                <NumberCounter end={Math.round(budgetStats.totalBudget / 1000)} duration={1500} suffix="k" />
              </div>
              <div className="text-xs text-text-muted leading-tight">Rozpočet</div>
            </div>
            <div className="text-center py-1">
              <div className="text-base sm:text-lg font-bold text-purple-600 leading-tight">
                <NumberCounter end={vendorStats.totalVendors} duration={1500} />
              </div>
              <div className="text-xs text-text-muted leading-tight">Dodavatelů</div>
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
