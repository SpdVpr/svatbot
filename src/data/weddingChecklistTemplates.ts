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

// Kompletní svatební checklist podle obrázku
export const WEDDING_CHECKLIST: ChecklistPhase[] = [
  {
    id: '12-months-before',
    title: '12 měsíců před svatbou',
    description: 'Orientační plánování - základní kroky',
    icon: '📋',
    items: [
      {
        id: '12m-001',
        title: 'Oznámení zásnub',
        description: 'Oznámit zásnuby rodině a přátelům',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '1 den',
        tips: [
          'Sdílejte radostnou zprávu s nejbližšími',
          'Zvažte společnou oslavu',
          'Pořiďte si zásnubní fotky'
        ],
        icon: '💍',
        order: 1
      },
      {
        id: '12m-002',
        title: 'Místo svatby',
        description: 'Vybrat a rezervovat místo konání svatby',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'urgent',
        estimatedDuration: '2-4 týdny',
        tips: [
          'Prohlédněte si více míst',
          'Zkontrolujte dostupnost v váš termín',
          'Ověřte kapacitu a služby',
          'Rezervujte co nejdříve'
        ],
        icon: '🏛️',
        order: 2
      },
      {
        id: '12m-003',
        title: 'Termín svatby',
        description: 'Stanovit konkrétní datum svatby',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'urgent',
        estimatedDuration: '1 týden',
        tips: [
          'Zkontrolujte dostupnost klíčových hostů',
          'Vyhněte se státním svátkům',
          'Zvažte roční období a počasí',
          'Ověřte dostupnost místa'
        ],
        icon: '📅',
        order: 3
      },
      {
        id: '12m-004',
        title: 'Oddávající',
        description: 'Vybrat a domluvit oddávajícího',
        category: 'legal',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '1-2 týdny',
        tips: [
          'Zjistěte si požadavky matričního úřadu',
          'Domluvte si osobní schůzku',
          'Prodiskutujte průběh obřadu',
          'Ověřte dostupnost v váš termín'
        ],
        icon: '👔',
        order: 4
      },
      {
        id: '12m-005',
        title: 'Seznam hostů',
        description: 'Vytvořit předběžný seznam svatebních hostů',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '1-2 týdny',
        tips: [
          'Začněte s nejbližší rodinou',
          'Respektujte kapacitu místa',
          'Rozdělte hosty na obřad a hostinu',
          'Připravte záložní seznam'
        ],
        icon: '📝',
        order: 5
      },
      {
        id: '12m-006',
        title: 'Svědci',
        description: 'Vybrat a požádat svědky',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '1 týden',
        tips: [
          'Vyberte si důvěryhodné osoby',
          'Požádejte je osobně',
          'Vysvětlete jejich úlohu',
          'Ověřte jejich dostupnost'
        ],
        icon: '👥',
        order: 6
      },
      {
        id: '12m-007',
        title: 'Rozpočet (nastavení hranice)',
        description: 'Stanovit celkový rozpočet svatby',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'urgent',
        estimatedDuration: '1 týden',
        tips: [
          'Buďte realističní',
          'Počítejte s rezervou 10-15%',
          'Rozdělte rozpočet podle kategorií',
          'Sledujte výdaje průběžně'
        ],
        icon: '💰',
        order: 7
      },
      {
        id: '12m-008',
        title: 'Fotograf/ka',
        description: 'Vybrat a rezervovat svatebního fotografa',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'urgent',
        estimatedDuration: '2-3 týdny',
        tips: [
          'Prohlédněte si portfolio',
          'Ověřte dostupnost v váš termín',
          'Domluvte si osobní setkání',
          'Prodiskutujte styl fotografování'
        ],
        icon: '📸',
        order: 8
      },
      {
        id: '12m-009',
        title: 'Kameraman/ka',
        description: 'Vybrat a rezervovat svatebního kameramana',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '2-3 týdny',
        tips: [
          'Prohlédněte si ukázková videa',
          'Ověřte dostupnost',
          'Prodiskutujte styl videa',
          'Domluvte si balíček služeb'
        ],
        icon: '🎥',
        order: 9
      },
      {
        id: '12m-010',
        title: 'Tisk svatebního oznámení',
        description: 'Navrhnout a objednat svatební oznámení',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '2-3 týdny',
        tips: [
          'Vyberte design včas',
          'Nechte si udělat korekturu',
          'Objednejte o 10% více',
          'Zvolte kvalitní papír'
        ],
        icon: '💌',
        order: 10
      }
    ]
  },
  {
    id: '6-9-months-before',
    title: '6-9 měsíců před svatbou',
    description: 'Důležité rezervace a přípravy',
    icon: '📆',
    items: [
      {
        id: '6-9m-001',
        title: 'Rozeslat svatební oznámení',
        description: 'Rozeslat oznámení všem pozvaným hostům',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '1 týden',
        tips: [
          'Pošlete 8-12 týdnů před svatbou',
          'Uveďte termín pro potvrzení účasti',
          'Přiložte mapu a kontakty',
          'Zkontrolujte adresy'
        ],
        icon: '✉️',
        order: 1
      },
      {
        id: '6-9m-002',
        title: 'Catering/občerstvení',
        description: 'Vybrat a rezervovat catering',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'urgent',
        estimatedDuration: '2-4 týdny',
        tips: [
          'Domluvte si ochutnávku',
          'Ověřte reference',
          'Prodiskutujte menu',
          'Zjistěte si možnosti pro alergiky'
        ],
        icon: '🍽️',
        order: 2
      },
      {
        id: '6-9m-003',
        title: 'Svatební šaty',
        description: 'Vybrat a objednat svatební šaty',
        category: 'beauty',
        phase: 'before-wedding',
        priority: 'urgent',
        estimatedDuration: '4-6 týdnů',
        tips: [
          'Počítejte s časem na úpravy',
          'Vyzkoušejte si více stylů',
          'Objednejte včas',
          'Naplánujte zkušební zkoušky'
        ],
        icon: '👰',
        order: 3
      },
      {
        id: '6-9m-004',
        title: 'Oděv pro ženicha',
        description: 'Vybrat a objednat oblek pro ženicha',
        category: 'beauty',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '2-3 týdny',
        tips: [
          'Slaďte s barvou svatby',
          'Počítejte s úpravami',
          'Vyberte pohodlný střih',
          'Domluvte si zkoušku'
        ],
        icon: '🤵',
        order: 4
      },
      {
        id: '6-9m-005',
        title: 'Snubní prstýnky',
        description: 'Vybrat a objednat snubní prstýnky',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '2-4 týdny',
        tips: [
          'Změřte si velikost prstenu',
          'Vyberte materiál a design',
          'Počítejte s časem na výrobu',
          'Zvažte gravírování'
        ],
        icon: '💍',
        order: 5
      },
      {
        id: '6-9m-006',
        title: 'Ubytování pro svatebčany',
        description: 'Zajistit ubytování pro hosty z daleka',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '1-2 týdny',
        tips: [
          'Vyjednejte skupinové slevy',
          'Vyberte místa blízko místu svatby',
          'Informujte hosty o možnostech',
          'Rezervujte včas'
        ],
        icon: '🏨',
        order: 6
      },
      {
        id: '6-9m-007',
        title: 'Svatební dort',
        description: 'Vybrat a objednat svatební dort',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '1-2 týdny',
        tips: [
          'Domluvte si ochutnávku',
          'Vyberte design',
          'Ověřte možnosti dopravy',
          'Prodiskutujte velikost'
        ],
        icon: '🎂',
        order: 7
      },
      {
        id: '6-9m-008',
        title: 'Hudba (DJ / kapela)',
        description: 'Vybrat a rezervovat hudební doprovod',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '2-3 týdny',
        tips: [
          'Poslechněte si ukázky',
          'Domluvte si playlist',
          'Ověřte technické vybavení',
          'Prodiskutujte program večera'
        ],
        icon: '🎵',
        order: 8
      }
    ]
  },
  {
    id: '3-5-months-before',
    title: '3-5 měsíců před svatbou',
    description: 'Finalizace detailů a přípravy',
    icon: '✨',
    items: [
      {
        id: '3-5m-001',
        title: 'Makeup a vlasová stylistka',
        description: 'Vybrat a rezervovat vizážistku a kadeřnici',
        category: 'beauty',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '2-3 týdny',
        tips: [
          'Domluvte si zkušební makeup',
          'Domluvte si zkušební účes',
          'Přineste si inspirační fotky',
          'Ověřte dostupnost v den svatby'
        ],
        icon: '💄',
        order: 1
      },
      {
        id: '3-5m-002',
        title: 'Výslužky',
        description: 'Vybrat a objednat dárky pro hosty',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '1-2 týdny',
        tips: [
          'Vyberte něco osobního',
          'Počítejte s rezervou',
          'Zvažte personalizaci',
          'Objednejte včas'
        ],
        icon: '🎁',
        order: 2
      },
      {
        id: '3-5m-003',
        title: 'Ochutnávka a sestavení menu',
        description: 'Finální ochutnávka a výběr svatebního menu',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '1 den',
        tips: [
          'Vezměte si partnera',
          'Zvažte preference hostů',
          'Prodiskutujte alergeny',
          'Finalizujte počet chodů'
        ],
        icon: '🍴',
        order: 3
      },
      {
        id: '3-5m-004',
        title: 'Květinová výzdoba',
        description: 'Finalizovat květinovou výzdobu',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '1-2 týdny',
        tips: [
          'Vyberte sezónní květiny',
          'Slaďte s celkovým designem',
          'Počítejte s alergií hostů',
          'Domluvte si dodávku'
        ],
        icon: '💐',
        order: 4
      }
    ]
  },
  {
    id: '2-months-before',
    title: '2 měsíce před svatbou',
    description: 'Finální přípravy a kontroly',
    icon: '📋',
    items: [
      {
        id: '2m-001',
        title: 'Hudba na obřad',
        description: 'Vybrat hudbu pro svatební obřad',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '1 týden',
        tips: [
          'Vyberte vstupní hudbu',
          'Vyberte hudbu během obřadu',
          'Vyberte výstupní hudbu',
          'Ověřte technické možnosti'
        ],
        icon: '🎼',
        order: 1
      },
      {
        id: '2m-002',
        title: 'Zasedací pořádek',
        description: 'Vytvořit zasedací pořádek hostů',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '1-2 týdny',
        tips: [
          'Zvažte vztahy mezi hosty',
          'Umístěte rodinu blízko',
          'Vytvořte vyvážené stoly',
          'Připravte záložní plán'
        ],
        icon: '🪑',
        order: 2
      },
      {
        id: '2m-003',
        title: 'Zkouška makeupu',
        description: 'Zkušební svatební makeup',
        category: 'beauty',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '2-3 hodiny',
        tips: [
          'Naplánujte 1-2 měsíce před svatbou',
          'Přineste si inspirační fotky',
          'Vyfotografujte výsledek',
          'Prodiskutujte úpravy'
        ],
        icon: '💋',
        order: 3
      },
      {
        id: '2m-004',
        title: 'Zkouška účesu',
        description: 'Zkušební svatební účes',
        category: 'beauty',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '2-3 hodiny',
        tips: [
          'Naplánujte společně se zkouškou makeupu',
          'Přineste si svatební doplňky',
          'Vyfotografujte z různých úhlů',
          'Zkuste různé varianty'
        ],
        icon: '💇',
        order: 4
      },
      {
        id: '2m-005',
        title: 'Sweet bar',
        description: 'Naplánovat a objednat sweet bar',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '1 týden',
        tips: [
          'Vyberte různé druhy sladkostí',
          'Slaďte s barvami svatby',
          'Počítejte s alergeny',
          'Domluvte si dodávku'
        ],
        icon: '🍬',
        order: 5
      },
      {
        id: '2m-006',
        title: 'Kontrola dokladů (platnost)',
        description: 'Zkontrolovat platnost všech dokladů',
        category: 'legal',
        phase: 'before-wedding',
        priority: 'urgent',
        estimatedDuration: '1 hodina',
        tips: [
          'Zkontrolujte občanské průkazy',
          'Zkontrolujte rodné listy',
          'Ověřte si požadavky matričního úřadu',
          'V případě potřeby obnovte doklady'
        ],
        icon: '📄',
        order: 6
      },
      {
        id: '2m-007',
        title: 'Dekorace',
        description: 'Finalizovat svatební dekorace',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '1-2 týdny',
        tips: [
          'Slaďte s celkovým designem',
          'Připravte si seznam',
          'Domluvte si dodávku',
          'Naplánujte instalaci'
        ],
        icon: '🎨',
        order: 7
      },
      {
        id: '2m-008',
        title: 'Potvrdit všechny dodavatele',
        description: 'Potvrdit všechny rezervace a dodavatele',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'urgent',
        estimatedDuration: '1 den',
        tips: [
          'Zavolejte všem dodavatelům',
          'Potvrďte časy a místa',
          'Ověřte finální detaily',
          'Sdělte kontaktní osobu'
        ],
        icon: '✅',
        order: 8
      },
      {
        id: '2m-009',
        title: 'Tiskoviny na svatbu - Jmenovky',
        description: 'Vytisknout jmenovky pro hosty',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '1 týden',
        tips: [
          'Zkontrolujte správnost jmen',
          'Slaďte s designem svatby',
          'Vytiskněte o pár navíc',
          'Připravte si držáky'
        ],
        icon: '🏷️',
        order: 9
      },
      {
        id: '2m-010',
        title: 'Tiskoviny na svatbu - Menu',
        description: 'Vytisknout svatební menu',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '1 týden',
        tips: [
          'Uveďte všechny chody',
          'Označte alergeny',
          'Slaďte s designem',
          'Vytiskněte dostatek kopií'
        ],
        icon: '📋',
        order: 10
      },
      {
        id: '2m-011',
        title: 'Tiskoviny na svatbu - Čísla stolů',
        description: 'Připravit čísla nebo názvy stolů',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '1 týden',
        tips: [
          'Vyberte čísla nebo názvy',
          'Slaďte s designem',
          'Připravte si stojánky',
          'Zkontrolujte viditelnost'
        ],
        icon: '🔢',
        order: 11
      },
      {
        id: '2m-012',
        title: 'Tiskoviny na svatbu - Zasedací pořádek',
        description: 'Vytisknout zasedací pořádek',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'high',
        estimatedDuration: '1 týden',
        tips: [
          'Zkontrolujte správnost jmen',
          'Uveďte čísla stolů',
          'Připravte si stojan',
          'Vytiskněte záložní kopii'
        ],
        icon: '📊',
        order: 12
      },
      {
        id: '2m-013',
        title: 'Doprava pro hosty',
        description: 'Zajistit dopravu pro hosty',
        category: 'preparation',
        phase: 'before-wedding',
        priority: 'medium',
        estimatedDuration: '1-2 týdny',
        tips: [
          'Zjistěte počet hostů bez auta',
          'Domluvte si autobus nebo taxi',
          'Informujte hosty o možnostech',
          'Připravte si časový plán'
        ],
        icon: '🚌',
        order: 13
      }
    ]
  },
  {
    id: '1-month-before',
    title: '1 měsíc před svatbou',
    description: 'Poslední přípravy',
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
        tips: [
          'Zkontrolujte velikost',
          'Ověřte gravírování',
          'Vyzkoušejte si je',
          'Uložte na bezpečné místo'
        ],
        icon: '💍',
        order: 1
      },
      {
        id: '1m-002',
        title: 'Hudba (playlist)',
        description: 'Finalizovat playlist pro svatbu',
        category: 'preparation',
        phase: '1-week-before',
        priority: 'high',
        estimatedDuration: '2-3 hodiny',
        tips: [
          'Vyberte první tanec',
          'Připravte si oblíbené písničky',
          'Domluvte se s DJ/kapelou',
          'Připravte si záložní seznam'
        ],
        icon: '🎵',
        order: 2
      },
      {
        id: '1m-003',
        title: 'Rozlučka se svobodou',
        description: 'Naplánovat a oslavit rozlučku se svobodou',
        category: 'other',
        phase: '1-week-before',
        priority: 'medium',
        estimatedDuration: '1 den',
        tips: [
          'Naplánujte s předstihem',
          'Informujte účastníky',
          'Vyberte vhodný termín',
          'Užijte si to!'
        ],
        icon: '🎉',
        order: 3
      },
      {
        id: '1m-004',
        title: 'Matrika (doklady)',
        description: 'Dodat všechny potřebné doklady na matriku',
        category: 'legal',
        phase: '1-week-before',
        priority: 'urgent',
        estimatedDuration: '1 den',
        tips: [
          'Ověřte si seznam požadovaných dokladů',
          'Připravte si originály i kopie',
          'Domluvte si termín',
          'Přijďte včas'
        ],
        icon: '📝',
        order: 4
      },
      {
        id: '1m-005',
        title: 'Kadeřnictví',
        description: 'Návštěva kadeřnictví pro svatební účes',
        category: 'beauty',
        phase: '1-week-before',
        priority: 'high',
        estimatedDuration: '2-3 hodiny',
        tips: [
          'Domluvte si termín s předstihem',
          'Přineste si inspirační fotky',
          'Zvažte zkušební účes'
        ],
        icon: '💇‍♀️',
        order: 5
      },
      {
        id: '1m-006',
        title: 'Kosmetika',
        description: 'Kosmetické ošetření před svatbou',
        category: 'beauty',
        phase: '1-week-before',
        priority: 'high',
        estimatedDuration: '1-2 hodiny',
        tips: [
          'Naplánujte 2-3 dny před svatbou',
          'Vyhněte se novým procedurám',
          'Hydratace je klíčová'
        ],
        icon: '✨',
        order: 6
      }
    ]
  },
  {
    id: '1-week-before',
    title: '1 týden před svatbou',
    description: 'Důležité úkoly týden před velkým dnem',
    icon: '📅',
    items: [
      {
        id: 'week-001',
        title: 'Napsat svatební sliby',
        description: 'Připravit a napsat osobní svatební sliby',
        category: 'preparation',
        phase: '1-week-before',
        priority: 'high',
        estimatedDuration: '2-3 hodiny',
        tips: [
          'Buďte upřímní a osobní',
          'Nechte si čas na přemýšlení',
          'Zkuste si je nahlas přečíst'
        ],
        icon: '💌',
        order: 1
      },
      {
        id: 'week-002',
        title: 'Vyzvednout šaty',
        description: 'Vyzvednout svatební šaty z salonu',
        category: 'preparation',
        phase: '1-week-before',
        priority: 'urgent',
        estimatedDuration: '1 hodina',
        tips: [
          'Zkontrolujte všechny úpravy',
          'Vyzkoušejte si je naposledy',
          'Zajistěte bezpečnou dopravu'
        ],
        icon: '👗',
        order: 2
      },
      {
        id: 'week-003',
        title: 'Potvrdit časy dodavatelům',
        description: 'Potvrdit přesné časy příjezdu všem dodavatelům',
        category: 'preparation',
        phase: '1-week-before',
        priority: 'urgent',
        estimatedDuration: '1-2 hodiny',
        tips: [
          'Zavolejte všem dodavatelům',
          'Potvrďte místo a čas',
          'Sdělte kontaktní osobu'
        ],
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
        tips: [
          'Naplánujte 1-2 dny před svatbou',
          'Vyberte klasickou barvu',
          'Zvažte gelové nehty pro delší výdrž'
        ],
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
        tips: [
          'Ideálně společně s manikúrou',
          'Důležité i pro uzavřené boty',
          'Relaxační moment před svatbou'
        ],
        icon: '🦶',
        order: 5
      },
      {
        id: 'week-006',
        title: 'Projít harmonogram svatebního dne',
        description: 'Projít a finalizovat časový harmonogram svatebního dne',
        category: 'preparation',
        phase: '1-week-before',
        priority: 'urgent',
        estimatedDuration: '2 hodiny',
        tips: [
          'Sdělte harmonogram všem účastníkům',
          'Vytiskněte kopie pro klíčové osoby',
          'Počítejte s časovou rezervou'
        ],
        icon: '⏰',
        order: 6
      }
    ]
  },
  {
    id: 'after-wedding',
    title: 'Po svatbě',
    description: 'Úkoly po svatebním dni',
    icon: '✅',
    items: [
      {
        id: 'after-001',
        title: 'Vrátit půjčené šaty',
        description: 'Vrátit půjčené nebo zapůjčené svatební šaty',
        category: 'post-wedding',
        phase: 'after-wedding',
        priority: 'high',
        estimatedDuration: '1 hodina',
        tips: [
          'Zkontrolujte termín vrácení',
          'Nechte vyčistit profesionálně',
          'Zkontrolujte stav před vrácením'
        ],
        icon: '👗',
        order: 1
      },
      {
        id: 'after-002',
        title: 'Odvoz zapůjčených dekorací/nábytku',
        description: 'Vrátit všechny zapůjčené dekorace a nábytek',
        category: 'post-wedding',
        phase: 'after-wedding',
        priority: 'high',
        estimatedDuration: '2-3 hodiny',
        tips: [
          'Domluvte si pomoc s odvozem',
          'Zkontrolujte seznam zapůjčených věcí',
          'Poděkujte půjčovatelům'
        ],
        icon: '📦',
        order: 2
      },
      {
        id: 'after-003',
        title: 'Vyzvednout oddací listy (pokud je nezašlou)',
        description: 'Vyzvednout oficiální oddací list z matričního úřadu',
        category: 'legal',
        phase: 'after-wedding',
        priority: 'high',
        estimatedDuration: '1 hodina',
        tips: [
          'Ověřte si úřední hodiny',
          'Vezměte si občanské průkazy',
          'Zjistěte si počet potřebných kopií'
        ],
        icon: '📜',
        order: 3
      },
      {
        id: 'after-004',
        title: 'Doplatit faktury',
        description: 'Uhradit všechny zbývající faktury od dodavatelů',
        category: 'post-wedding',
        phase: 'after-wedding',
        priority: 'urgent',
        estimatedDuration: '1-2 hodiny',
        tips: [
          'Zkontrolujte všechny smlouvy',
          'Ověřte správnost faktur',
          'Požádejte o potvrzení o úhradě'
        ],
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
        tips: [
          'Odpojte se od starostí',
          'Užijte si čas spolu',
          'Vytvářejte nové vzpomínky'
        ],
        icon: '✈️',
        order: 5
      },
      {
        id: 'after-006',
        title: 'Povinnosti pro nevěstu',
        description: 'Administrativní úkony po svatbě (změna příjmení, dokladů, atd.)',
        category: 'legal',
        phase: 'after-wedding',
        priority: 'medium',
        estimatedDuration: 'několik týdnů',
        tips: [
          'Změna občanského průkazu',
          'Změna řidičského průkazu',
          'Změna v bance a pojišťovně',
          'Aktualizace dokladů'
        ],
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

