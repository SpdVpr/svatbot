import { TaskTemplate, TaskCategory } from '@/types/task'

// Předpřipravené úkoly pro svatební plánování
export const taskTemplates: TaskTemplate[] = [
  // FOUNDATION - Základy (52-26 týdnů před)
  {
    id: 'foundation-001',
    title: 'Stanovit datum svatby',
    description: 'Vybrat konkrétní datum svatby a ověřit dostupnost klíčových hostů',
    category: 'foundation',
    priority: 'urgent',
    recommendedWeeksBefore: 52,
    isRequired: true,
    estimatedHours: 2,
    tips: [
      'Zkontrolujte dostupnost nejbližší rodiny',
      'Vyhněte se státním svátkům',
      'Zvažte roční období a počasí'
    ],
    order: 1
  },
  {
    id: 'foundation-002',
    title: 'Stanovit rozpočet svatby',
    description: 'Určit celkový rozpočet a rozdělit ho podle kategorií',
    category: 'foundation',
    priority: 'urgent',
    recommendedWeeksBefore: 52,
    isRequired: true,
    estimatedHours: 3,
    tips: [
      'Počítejte s 10-20% rezervou',
      'Prioritizujte nejdůležitější položky',
      'Sledujte výdaje průběžně'
    ],
    order: 2
  },
  {
    id: 'foundation-003',
    title: 'Sestavit seznam hostů',
    description: 'Vytvořit předběžný seznam všech pozvaných hostů',
    category: 'foundation',
    priority: 'high',
    recommendedWeeksBefore: 48,
    isRequired: true,
    estimatedHours: 4,
    tips: [
      'Začněte s nejbližší rodinou',
      'Počítejte s 80-90% účastí',
      'Rozdělte hosty podle kategorií'
    ],
    order: 3
  },

  // VENUE - Místo konání (48-20 týdnů před)
  {
    id: 'venue-001',
    title: 'Vybrat místo obřadu',
    description: 'Najít a rezervovat místo pro svatební obřad',
    category: 'venue',
    priority: 'urgent',
    recommendedWeeksBefore: 48,
    isRequired: true,
    dependsOn: ['foundation-001'],
    estimatedHours: 8,
    tips: [
      'Navštivte místa osobně',
      'Ověřte dostupnost v váš termín',
      'Zeptejte se na omezení a pravidla'
    ],
    order: 1
  },
  {
    id: 'venue-002',
    title: 'Vybrat místo hostiny',
    description: 'Najít a rezervovat místo pro svatební hostinu',
    category: 'venue',
    priority: 'urgent',
    recommendedWeeksBefore: 48,
    isRequired: true,
    dependsOn: ['foundation-001', 'foundation-003'],
    estimatedHours: 10,
    tips: [
      'Zkontrolujte kapacitu pro vaše hosty',
      'Ověřte catering možnosti',
      'Zeptejte se na dekorační omezení'
    ],
    order: 2
  },
  {
    id: 'venue-003',
    title: 'Rezervovat ubytování pro hosty',
    description: 'Zajistit ubytování pro hosty z daleka',
    category: 'venue',
    priority: 'medium',
    recommendedWeeksBefore: 32,
    isRequired: false,
    estimatedHours: 3,
    tips: [
      'Vyjednejte skupinové slevy',
      'Vyberte místa blízko místu svatby',
      'Informujte hosty o možnostech'
    ],
    order: 3
  },

  // GUESTS - Hosté (32-8 týdnů před)
  {
    id: 'guests-001',
    title: 'Finalizovat seznam hostů',
    description: 'Dokončit konečný seznam pozvaných hostů',
    category: 'guests',
    priority: 'high',
    recommendedWeeksBefore: 32,
    isRequired: true,
    dependsOn: ['venue-002'],
    estimatedHours: 2,
    tips: [
      'Respektujte kapacitu místa',
      'Rozdělte hosty na obřad a hostinu',
      'Připravte záložní seznam'
    ],
    order: 1
  },
  {
    id: 'guests-002',
    title: 'Objednat svatební oznámení',
    description: 'Navrhnout a objednat svatební oznámení',
    category: 'guests',
    priority: 'high',
    recommendedWeeksBefore: 20,
    isRequired: true,
    dependsOn: ['guests-001'],
    estimatedHours: 4,
    tips: [
      'Nechte si udělat korekturu',
      'Objednejte o 10% více',
      'Zvolte kvalitní papír'
    ],
    order: 2
  },
  {
    id: 'guests-003',
    title: 'Rozeslat svatební oznámení',
    description: 'Rozeslat oznámení všem pozvaným hostům',
    category: 'guests',
    priority: 'high',
    recommendedWeeksBefore: 16,
    isRequired: true,
    dependsOn: ['guests-002'],
    estimatedHours: 3,
    tips: [
      'Pošlete 8-12 týdnů před svatbou',
      'Uveďte termín pro potvrzení účasti',
      'Přiložte mapu a kontakty'
    ],
    order: 3
  },

  // BUDGET - Rozpočet (průběžně)
  {
    id: 'budget-001',
    title: 'Vybrat svatební fotografa',
    description: 'Najít a rezervovat svatebního fotografa',
    category: 'budget',
    priority: 'high',
    recommendedWeeksBefore: 40,
    isRequired: true,
    estimatedHours: 6,
    tips: [
      'Prohlédněte si portfolio',
      'Ověřte dostupnost v váš termín',
      'Domluvte si osobní setkání'
    ],
    order: 1
  },
  {
    id: 'budget-002',
    title: 'Rezervovat hudbu/DJ',
    description: 'Zajistit hudební doprovod pro obřad a hostinu',
    category: 'budget',
    priority: 'high',
    recommendedWeeksBefore: 36,
    isRequired: true,
    estimatedHours: 4,
    tips: [
      'Poslechněte si ukázky',
      'Domluvte si playlist',
      'Ověřte technické vybavení'
    ],
    order: 2
  },

  // DESIGN - Design a dekorace (24-4 týdny před)
  {
    id: 'design-001',
    title: 'Vybrat svatební šaty',
    description: 'Najít a objednat svatební šaty',
    category: 'design',
    priority: 'high',
    recommendedWeeksBefore: 24,
    isRequired: true,
    applicableStyles: ['classic', 'romantic', 'vintage', 'modern'],
    estimatedHours: 8,
    tips: [
      'Počítejte s časem na úpravy',
      'Vyzkoušejte si více stylů',
      'Objednejte včas'
    ],
    order: 1
  },
  {
    id: 'design-002',
    title: 'Vybrat oblek pro ženicha',
    description: 'Najít a objednat oblek pro ženicha',
    category: 'design',
    priority: 'high',
    recommendedWeeksBefore: 20,
    isRequired: true,
    estimatedHours: 4,
    tips: [
      'Slaďte s barvou svatby',
      'Počítejte s úpravami',
      'Vyberte pohodlný střih'
    ],
    order: 2
  },
  {
    id: 'design-003',
    title: 'Naplánovat květinovou výzdobu',
    description: 'Vybrat květiny a domluvit výzdobu',
    category: 'design',
    priority: 'medium',
    recommendedWeeksBefore: 16,
    isRequired: false,
    estimatedHours: 3,
    tips: [
      'Zvolte sezónní květiny',
      'Slaďte s celkovým designem',
      'Počítejte s alergií hostů'
    ],
    order: 3
  },

  // ORGANIZATION - Organizace (12-2 týdny před)
  {
    id: 'organization-001',
    title: 'Domluvit zkoušku obřadu',
    description: 'Naplánovat a provést zkoušku svatebního obřadu',
    category: 'organization',
    priority: 'high',
    recommendedWeeksBefore: 2,
    isRequired: true,
    estimatedHours: 2,
    tips: [
      'Pozvi všechny účastníky obřadu',
      'Procvič celý průběh',
      'Připrav záložní plán'
    ],
    order: 1
  },
  {
    id: 'organization-002',
    title: 'Připravit svatební den timeline',
    description: 'Vytvořit detailní časový plán svatebního dne',
    category: 'organization',
    priority: 'high',
    recommendedWeeksBefore: 4,
    isRequired: true,
    estimatedHours: 3,
    tips: [
      'Počítejte s rezervou času',
      'Sdělte plán všem dodavatelům',
      'Určete koordinátora dne'
    ],
    order: 2
  },

  // FINAL - Finální přípravy (2-0 týdnů před)
  {
    id: 'final-001',
    title: 'Potvrdit počet hostů',
    description: 'Finální potvrzení počtu hostů s místem hostiny',
    category: 'final',
    priority: 'urgent',
    recommendedWeeksBefore: 1,
    isRequired: true,
    dependsOn: ['guests-003'],
    estimatedHours: 1,
    tips: [
      'Kontaktujte neodpovídající hosty',
      'Informujte catering o konečném počtu',
      'Připravte záložní místa'
    ],
    order: 1
  },
  {
    id: 'final-002',
    title: 'Připravit svatební kufřík',
    description: 'Sbalit všechny potřebné věci pro svatební den',
    category: 'final',
    priority: 'medium',
    recommendedWeeksBefore: 1,
    isRequired: true,
    estimatedHours: 2,
    tips: [
      'Použijte checklist',
      'Připravte záložní věci',
      'Svěřte kufřík důvěryhodné osobě'
    ],
    order: 2
  }
]

// Helper funkce pro filtrování templates
export const getTemplatesByCategory = (category: TaskCategory): TaskTemplate[] => {
  return taskTemplates.filter(template => template.category === category)
}

export const getRequiredTemplates = (): TaskTemplate[] => {
  return taskTemplates.filter(template => template.isRequired)
}

export const getTemplatesForStyle = (style: string): TaskTemplate[] => {
  return taskTemplates.filter(template => 
    !template.applicableStyles || template.applicableStyles.includes(style)
  )
}

export const getTemplatesByWeeks = (weeksBefore: number): TaskTemplate[] => {
  return taskTemplates.filter(template => 
    template.recommendedWeeksBefore <= weeksBefore
  ).sort((a, b) => b.recommendedWeeksBefore - a.recommendedWeeksBefore)
}
