// Předpřipravené checklisty pro svatební plánování
// Tyto úkoly lze jedním kliknutím přesunout do modulu Úkoly

export interface ChecklistItem {
  id: string
  title: string
  description?: string
  category: 'beauty' | 'preparation' | 'post-wedding' | 'legal' | 'other'
  phase: 'before-wedding' | '1-week-before' | '1-day-before' | 'wedding-day' | 'after-wedding'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedDuration?: string // např. "2 hodiny", "30 minut"
  tips?: string[]
  icon?: string
  order: number
}

export interface ChecklistPhase {
  id: string
  title: string
  description: string
  icon: string
  items: ChecklistItem[]
}

// Kompletní svatební checklist
export const WEDDING_CHECKLIST: ChecklistPhase[] = [
  {
    id: '12-months-before',
    title: '12+ měsíců před svatbou',
    description: 'Základní plán a rozhodnutí',
    icon: '💌',
    items: [
      {
        id: '12m-001',
        title: 'Oznámení zásnub',
        description: 'Sdělit rodině a přátelům',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '1 den',
        icon: '💍',
        order: 1
      },
      {
        id: '12m-002',
        title: 'Stanovit rozpočet',
        description: 'Nastavit hranici',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'urgent',
        estimatedDuration: '1 týden',
        icon: '💰',
        order: 2
      },
      {
        id: '12m-003',
        title: 'Stanovit konkrétní datum svatby',
        description: 'Vybrat termín svatby',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'urgent',
        estimatedDuration: '1 týden',
        icon: '📅',
        order: 3
      },
      {
        id: '12m-004',
        title: 'Vybrat a rezervovat místo konání svatby',
        description: 'Rezervovat místo svatby',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'urgent',
        estimatedDuration: '2-4 týdny',
        icon: '🏛️',
        order: 4
      },
      {
        id: '12m-005',
        title: 'Vybrat a domluvit oddávajícího',
        description: 'Domluvit oddávajícího',
        category: 'legal',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '1-2 týdny',
        icon: '👔',
        order: 5
      },
      {
        id: '12m-006',
        title: 'Vytvořit předběžný seznam hostů',
        description: 'Seznam svatebních hostů',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '1-2 týdny',
        icon: '📝',
        order: 6
      },
      {
        id: '12m-007',
        title: 'Vybrat a požádat svědky',
        description: 'Požádat svědky',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '1 týden',
        icon: '👥',
        order: 7
      },
      {
        id: '12m-008',
        title: 'Vybrat a rezervovat fotografa',
        description: 'Rezervovat svatebního fotografa',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'urgent',
        estimatedDuration: '2-3 týdny',
        icon: '📸',
        order: 8
      },
      {
        id: '12m-009',
        title: 'Vybrat a rezervovat kameramana',
        description: 'Rezervovat svatebního kameramana',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '2-3 týdny',
        icon: '🎥',
        order: 9
      },
      {
        id: '12m-010',
        title: 'Navrhnout a objednat svatební oznámení',
        description: 'Objednat svatební oznámení',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '2-3 týdny',
        icon: '💌',
        order: 10
      }
    ]
  },
  {
    id: '6-9-months-before',
    title: '6–9 měsíců před svatbou',
    description: 'Rezervace, klíčoví dodavatelé, outfit',
    icon: '🔍',
    items: [
      {
        id: '6-9m-001',
        title: 'Rozeslat svatební oznámení hostům',
        description: 'Rozeslat oznámení všem pozvaným',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '1 týden',
        icon: '✉️',
        order: 1
      },
      {
        id: '6-9m-002',
        title: 'Vybrat a rezervovat catering / občerstvení',
        description: 'Rezervovat catering',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'urgent',
        estimatedDuration: '2-4 týdny',
        icon: '🍽️',
        order: 2
      },
      {
        id: '6-9m-003',
        title: 'Vybrat a objednat svatební šaty',
        description: 'Objednat svatební šaty',
        category: 'beauty',
        phase: 'before-wedding',
        priority: 'urgent',
        estimatedDuration: '4-6 týdnů',
        icon: '👰',
        order: 3
      },
      {
        id: '6-9m-004',
        title: 'Vybrat a objednat oblek pro ženicha',
        description: 'Objednat oblek pro ženicha',
        category: 'beauty',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '2-3 týdny',
        icon: '🤵',
        order: 4
      },
      {
        id: '6-9m-005',
        title: 'Vybrat a objednat snubní prstýnky',
        description: 'Objednat snubní prstýnky',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '2-4 týdny',
        icon: '💍',
        order: 5
      },
      {
        id: '6-9m-006',
        title: 'Zajistit ubytování pro hosty',
        description: 'Ubytování pro svatebčany',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '1-2 týdny',
        icon: '🏨',
        order: 6
      },
      {
        id: '6-9m-007',
        title: 'Vybrat a objednat svatební dort',
        description: 'Objednat svatební dort',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '1-2 týdny',
        icon: '🎂',
        order: 7
      },
      {
        id: '6-9m-008',
        title: 'Vybrat a rezervovat DJ / kapelu',
        description: 'Rezervovat hudební doprovod',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '2-3 týdny',
        icon: '🎵',
        order: 8
      },
      {
        id: '6-9m-009',
        title: 'Vybrat a rezervovat floristku',
        description: 'Rezervovat floristku pro květinovou výzdobu',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '1-2 týdny',
        icon: '💐',
        order: 9
      }
    ]
  },
  {
    id: '3-5-months-before',
    title: '3–5 měsíců před svatbou',
    description: 'Detailní plánování a ladění stylu',
    icon: '💡',
    items: [
      {
        id: '3-5m-001',
        title: 'Vybrat a rezervovat vizážistku a kadeřnici',
        description: 'Rezervovat makeup a vlasovou stylistku',
        category: 'beauty',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '2-3 týdny',
        icon: '💄',
        order: 1
      },
      {
        id: '3-5m-002',
        title: 'Ochutnávka a sestavení menu',
        description: 'Finální ochutnávka a výběr menu',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '1 den',
        icon: '🍴',
        order: 2
      },
      {
        id: '3-5m-003',
        title: 'Finalizovat květinovou výzdobu',
        description: 'Domluvit květinovou výzdobu',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '1-2 týdny',
        icon: '💐',
        order: 3
      },
      {
        id: '3-5m-004',
        title: 'Vybrat a objednat výslužky / dárky pro hosty',
        description: 'Objednat dárky pro hosty',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '1-2 týdny',
        icon: '🎁',
        order: 4
      }
    ]
  },
  {
    id: '2-months-before',
    title: '2 měsíce před svatbou',
    description: 'Finalizace všech rezervací a tiskovin',
    icon: '📋',
    items: [
      {
        id: '2m-001',
        title: 'Potvrdit všechny dodavatele a rezervace',
        description: 'Potvrdit všechny rezervace',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'urgent',
        estimatedDuration: '1 den',
        icon: '✅',
        order: 1
      },
      {
        id: '2m-002',
        title: 'Vytvořit zasedací pořádek hostů',
        description: 'Zasedací pořádek',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '1-2 týdny',
        icon: '🪑',
        order: 2
      },
      {
        id: '2m-003',
        title: 'Finalizovat svatební dekorace',
        description: 'Domluvit dekorace',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '1-2 týdny',
        icon: '🎀',
        order: 3
      },
      {
        id: '2m-004',
        title: 'Naplánovat a objednat sweet bar',
        description: 'Objednat sweet bar',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '1 týden',
        icon: '🍬',
        order: 4
      },
      {
        id: '2m-005',
        title: 'Zkontrolovat platnost všech dokladů',
        description: 'Kontrola dokladů',
        category: 'legal',
        phase: 'before-wedding',
        priority: 'urgent',
        estimatedDuration: '1 hodina',
        icon: '📋',
        order: 5
      },
      {
        id: '2m-006',
        title: 'Vybrat hudbu na obřad',
        description: 'Hudba pro svatební obřad',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '1 týden',
        icon: '🎼',
        order: 6
      },
      {
        id: '2m-007',
        title: 'Vytisknout jmenovky pro hosty',
        description: 'Tisknout jmenovky',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '1 týden',
        icon: '🏷️',
        order: 7
      },
      {
        id: '2m-008',
        title: 'Vytisknout svatební menu',
        description: 'Tisknout menu',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '1 týden',
        icon: '📄',
        order: 8
      },
      {
        id: '2m-009',
        title: 'Připravit čísla / názvy stolů',
        description: 'Čísla stolů',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '1 týden',
        icon: '🔢',
        order: 9
      },
      {
        id: '2m-010',
        title: 'Vytisknout zasedací pořádek',
        description: 'Tisknout zasedací pořádek',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '1 týden',
        icon: '📊',
        order: 10
      },
      {
        id: '2m-011',
        title: 'Zajistit dopravu pro hosty',
        description: 'Doprava pro hosty',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '1-2 týdny',
        icon: '🚌',
        order: 11
      },
      {
        id: '2m-012',
        title: 'Zkouška makeupu',
        description: 'Zkouška makeupu',
        category: 'beauty',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '2-3 hodiny',
        icon: '💋',
        order: 12
      },
      {
        id: '2m-013',
        title: 'Zkouška účesu',
        description: 'Zkouška účesu',
        category: 'beauty',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '2-3 hodiny',
        icon: '💇',
        order: 13
      }
    ]
  },
  {
    id: '1-month-before',
    title: '1 měsíc před svatbou',
    description: 'Poslední doladění a osobní přípravy',
    icon: '⏰',
    items: [
      {
        id: '1m-001',
        title: 'Vyzvednout prstýnky',
        description: 'Vyzvednout snubní prstýnky',
        category: 'preparation',
        phase: '1-week-before',
        priority: 'urgent',
        estimatedDuration: '1 hodina',
        icon: '💍',
        order: 1
      },
      {
        id: '1m-002',
        title: 'Finalizovat svatební playlist',
        description: 'Finalizovat playlist',
        category: 'preparation',
        phase: '1-week-before',
        priority: 'high',
        estimatedDuration: '2-3 hodiny',
        icon: '🎵',
        order: 2
      },
      {
        id: '1m-003',
        title: 'Oslavit rozlučku se svobodou',
        description: 'Oslavit rozlučku se svobodou',
        category: 'other',
        phase: '1-week-before',
        priority: 'medium',
        estimatedDuration: '1 den',
        icon: '🎉',
        order: 3
      },
      {
        id: '1m-004',
        title: 'Dodat doklady na matriku',
        description: 'Dodat doklady na matriku',
        category: 'legal',
        phase: '1-week-before',
        priority: 'urgent',
        estimatedDuration: '1 den',
        icon: '📝',
        order: 4
      },
      {
        id: '1m-005',
        title: 'Navštívit kadeřnictví (střih, barva)',
        description: 'Kadeřnictví před svatbou',
        category: 'beauty',
        phase: '1-week-before',
        priority: 'high',
        estimatedDuration: '2-3 hodiny',
        icon: '💇‍♀️',
        order: 5
      },
      {
        id: '1m-006',
        title: 'Kosmetické ošetření před svatbou',
        description: 'Kosmetika před svatbou',
        category: 'beauty',
        phase: '1-week-before',
        priority: 'high',
        estimatedDuration: '1-2 hodiny',
        icon: '✨',
        order: 6
      }
    ]
  },
  {
    id: '1-week-before',
    title: '1 týden před svatbou',
    description: 'Finální kontrola a příprava svatebního dne',
    icon: '📅',
    items: [
      {
        id: 'week-001',
        title: 'Napsat svatební sliby',
        description: 'Připravit osobní svatební sliby',
        category: 'preparation',
        phase: '1-week-before',
        priority: 'high',
        estimatedDuration: '2-3 hodiny',
        icon: '💌',
        order: 1
      },
      {
        id: 'week-002',
        title: 'Vyzvednout svatební šaty',
        description: 'Vyzvednout šaty z salonu',
        category: 'preparation',
        phase: '1-week-before',
        priority: 'urgent',
        estimatedDuration: '1 hodina',
        icon: '👗',
        order: 2
      },
      {
        id: 'week-003',
        title: 'Potvrdit časy všem dodavatelům',
        description: 'Potvrdit přesné časy příjezdu',
        category: 'preparation',
        phase: '1-week-before',
        priority: 'urgent',
        estimatedDuration: '1-2 hodiny',
        icon: '📞',
        order: 3
      },
      {
        id: 'week-004',
        title: 'Manikúra',
        description: 'Profesionální manikúra',
        category: 'beauty',
        phase: '1-week-before',
        priority: 'medium',
        estimatedDuration: '1 hodina',
        icon: '💅',
        order: 4
      },
      {
        id: 'week-005',
        title: 'Pedikúra',
        description: 'Profesionální pedikúra',
        category: 'beauty',
        phase: '1-week-before',
        priority: 'medium',
        estimatedDuration: '1 hodina',
        icon: '🦶',
        order: 5
      },
      {
        id: 'week-006',
        title: 'Projít a finalizovat harmonogram dne',
        description: 'Finalizovat časový harmonogram',
        category: 'preparation',
        phase: '1-week-before',
        priority: 'urgent',
        estimatedDuration: '2 hodiny',
        icon: '⏰',
        order: 6
      }
    ]
  },
  {
    id: 'after-wedding',
    title: 'Po svatbě',
    description: 'Uzavření a líbánky',
    icon: '🏝️',
    items: [
      {
        id: 'after-001',
        title: 'Vrátit půjčené svatební šaty',
        description: 'Vrátit zapůjčené šaty',
        category: 'post-wedding',
        phase: 'after-wedding',
        priority: 'high',
        estimatedDuration: '1 hodina',
        icon: '👗',
        order: 1
      },
      {
        id: 'after-002',
        title: 'Vrátit zapůjčené dekorace/nábytek',
        description: 'Vrátit dekorace a nábytek',
        category: 'post-wedding',
        phase: 'after-wedding',
        priority: 'high',
        estimatedDuration: '2-3 hodiny',
        icon: '📦',
        order: 2
      },
      {
        id: 'after-003',
        title: 'Vyzvednout oddací list z matriky',
        description: 'Vyzvednout oddací list',
        category: 'legal',
        phase: 'after-wedding',
        priority: 'high',
        estimatedDuration: '1 hodina',
        icon: '📜',
        order: 3
      },
      {
        id: 'after-004',
        title: 'Doplatit faktury dodavatelům',
        description: 'Uhradit zbývající faktury',
        category: 'post-wedding',
        phase: 'after-wedding',
        priority: 'urgent',
        estimatedDuration: '1-2 hodiny',
        icon: '💰',
        order: 4
      },
      {
        id: 'after-005',
        title: 'Užít si líbánky',
        description: 'Odpočinek a svatební cesta',
        category: 'post-wedding',
        phase: 'after-wedding',
        priority: 'high',
        estimatedDuration: '1-2 týdny',
        icon: '✈️',
        order: 5
      },
      {
        id: 'after-006',
        title: 'Vyřídit administrativu (změna příjmení, dokladů atd.)',
        description: 'Administrativní úkony po svatbě',
        category: 'legal',
        phase: 'after-wedding',
        priority: 'medium',
        estimatedDuration: 'několik týdnů',
        icon: '📋',
        order: 6
      }
    ]
  }
]

// Pomocná funkce pro získání všech položek checklistu
export const getAllChecklistItems = (): ChecklistItem[] => {
  return WEDDING_CHECKLIST.flatMap(phase => phase.items)
}

// Pomocná funkce pro získání položek podle fáze
export const getChecklistItemsByPhase = (phase: ChecklistItem['phase']): ChecklistItem[] => {
  return getAllChecklistItems().filter(item => item.phase === phase)
}

// Pomocná funkce pro získání položek podle kategorie
export const getChecklistItemsByCategory = (category: ChecklistItem['category']): ChecklistItem[] => {
  return getAllChecklistItems().filter(item => item.category === category)
}

// Mapování kategorií checklistu na kategorie úkolů
export const CHECKLIST_TO_TASK_CATEGORY_MAP: Record<ChecklistItem['category'], string> = {
  'beauty': 'beauty',
  'preparation': 'organization',
  'post-wedding': 'other',
  'legal': 'legal',
  'other': 'other'
}

// Defaultní přesuny položek do jiných fází
// Tyto položky se defaultně zobrazí v jiné fázi než je jejich původní umístění
export const DEFAULT_PHASE_MAP: Record<string, string> = {
  '3-5m-001': '6-9-months-before',  // Vizážistka → 6-9 měsíců
  '6-9m-005': '3-5-months-before',  // Snubní prstýnky → 3-5 měsíců
  '2m-003': '3-5-months-before',    // Dekorace → 3-5 měsíců
  '2m-004': '3-5-months-before',    // Sweet bar → 3-5 měsíců
  '12m-005': '6-9-months-before',   // Oddávající → 6-9 měsíců
  '2m-011': '3-5-months-before'     // Doprava pro hosty → 3-5 měsíců
}

