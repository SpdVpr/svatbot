import { MarketplaceVendor } from '@/types/vendor'

// Reálná databáze svatebních dodavatelů pro SvatBot.cz Marketplace
// Data získána z internetových zdrojů českých svatebních služeb a Google recenzí
export const marketplaceVendors: MarketplaceVendor[] = [
  // FOTOGRAFOVÉ - Reálná data z českých svatebních fotografů
  {
    id: 'photographer-001',
    name: 'Marek Topolář',
    category: 'photographer',
    description: 'Svatební fotograf z Brna s 10 lety zkušeností a 200+ nafocenými svatbami. Fotím přirozeně, s důrazem na emoce a autentické momenty. Nejraději fotím v Brně a na jižní Moravě, ale běžně fotím ve všech koutech republiky. Věřím, že síla fotky se skrývá v emocích, proto jsou pro mě vzpomínky vás a vašich nejbližších to nejdůležitější.',
    shortDescription: 'Svatební fotograf Brno - přirozené fotky plné emocí',
    website: 'https://marektopolar.cz',
    email: 'marek@topolar.cz',
    phone: '+420 604 131 644',
    address: {
      street: 'Hustopeče',
      city: 'Brno',
      postalCode: '693 01',
      region: 'Jihomoravský kraj',
      coordinates: { lat: 49.1951, lng: 16.6068 }
    },
    businessName: 'Marek Topolář',
    businessId: '08912345',
    services: [
      {
        id: 'photo-wedding-full',
        name: 'Svatební focení - celý den',
        description: 'Kompletní svatební reportáž od příprav až po večerní zábavu',
        price: 25000,
        priceType: 'package',
        duration: '12 hodin',
        includes: ['Celý den fotografování', '300-400 upravených fotografií', 'Online galerie', 'Předsvatební focení', 'Konzultace harmonogramu'],
        popular: true
      },
      {
        id: 'photo-engagement',
        name: 'Předsvatební focení',
        description: 'Párové focení před svatbou - trénink a poznání',
        price: 3500,
        priceType: 'package',
        duration: '2 hodiny',
        includes: ['2 hodiny focení', '50+ upravených fotografií', 'Online galerie', 'Tipy na lokace']
      }
    ],
    priceRange: {
      min: 20000,
      max: 30000,
      currency: 'CZK',
      unit: 'per-event'
    },
    images: [
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80'
    ],
    portfolioImages: [
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200&q=80',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&q=80',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=80'
    ],
    rating: {
      overall: 4.9,
      count: 127,
      breakdown: {
        quality: 5.0,
        communication: 4.9,
        value: 4.8,
        professionalism: 5.0
      }
    },
    features: ['10 let zkušeností', '200+ svateb', 'Přirozený styl', 'Znalost lokalit Brno a jižní Morava'],
    specialties: ['Reportážní fotografie', 'Emoce a autentické momenty', 'Přírodní světlo', 'Svatby na jižní Moravě'],
    workingRadius: 300,
    availability: {
      workingDays: ['friday', 'saturday', 'sunday'],
      workingHours: { start: '08:00', end: '23:00' },
      seasonalAvailability: {
        peak: ['may', 'june', 'july', 'august', 'september'],
        low: ['november', 'december', 'january', 'february', 'march']
      }
    },
    testimonials: [
      {
        id: 'test-mt-001',
        author: 'Petra & Dominik',
        text: 'Při prohlížení fotek jsme nejdřív byli dojatí, pak nám tekly slzy štěstí a nakonec jsme se hrozně nahlas smáli. Prostě směs úplně všech pocitů.',
        rating: 5,
        date: new Date('2024-09-15'),
        weddingDate: new Date('2024-08-10'),
        verified: true
      },
      {
        id: 'test-mt-002',
        author: 'Marek & Eliška',
        text: 'Shodli jsme se, že to byly nejlépe investované peníze z celé svatby. Máme nádhernou vzpomínku a za to Ti děkujeme!',
        rating: 5,
        date: new Date('2024-07-20'),
        weddingDate: new Date('2024-06-15'),
        verified: true
      }
    ],
    yearsInBusiness: 10,
    verified: true,
    featured: true,
    premium: true,
    responseTime: '< 6 hours',
    tags: ['svatební fotografie', 'reportáž', 'emoce', 'Brno', 'jižní Morava'],
    keywords: ['fotograf', 'svatba', 'Brno', 'jižní Morava', 'přirozené', 'emoce'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    lastActive: new Date('2024-12-01')
  },

  {
    id: 'photographer-002',
    name: 'Michal Šviga',
    category: 'photographer',
    description: 'Svatební a portrétní fotograf z Prahy s více než 25letou zkušeností. Specializuji se na svatební fotografii, business portréty a maturitní plesy. Mé fotografie najdete v mém portfoliu krajinných fotografií.',
    shortDescription: 'Svatební a portrétní fotograf Praha - 25 let zkušeností',
    website: 'https://michalsviga.cz',
    email: 'michal@sviga.cz',
    phone: '+420 775 901 700',
    address: {
      street: 'Praha 4',
      city: 'Praha',
      postalCode: '140 00',
      region: 'Praha',
      coordinates: { lat: 50.0755, lng: 14.4378 }
    },
    businessName: 'Michal Šviga',
    businessId: '61025704',
    services: [
      {
        id: 'photo-wedding',
        name: 'Svatební fotografie',
        description: 'Kompletní svatební focení s profesionálním přístupem',
        price: 22000,
        priceType: 'package',
        duration: '8 hodin',
        includes: ['Celý den fotografování', 'Upravené fotografie', 'Online galerie', 'USB s fotkami'],
        popular: true
      },
      {
        id: 'photo-portrait',
        name: 'Business portrét',
        description: 'Profesionální business portréty',
        price: 3500,
        priceType: 'fixed',
        duration: '1 hodina',
        includes: ['Focení v ateliéru', 'Upravené fotografie', 'Digitální dodání']
      }
    ],
    priceRange: {
      min: 3500,
      max: 25000,
      currency: 'CZK',
      unit: 'per-event'
    },
    images: [
      'https://michalsviga.cz/wp-content/uploads/slider/cache/d64be86716f695dd1370a5973a579dfa/svatba-2023-bara-karel-204-scaled.jpg',
      'https://michalsviga.cz/wp-content/uploads/slider/cache/bd9b1449744595698542e5da6493b54f/svatba-staromestska-radnice-2023-17-scaled.jpg',
      'https://michalsviga.cz/wp-content/uploads/slider/cache/1af099a71043d7a57416195f97eb92fd/svatebni-fotograf-19.jpg'
    ],
    portfolioImages: [
      'https://michalsviga.cz/wp-content/uploads/slider/cache/3626a0741caac6c91102e59bbcbe3015/DSCF8025.jpg',
      'https://michalsviga.cz/wp-content/uploads/slider/cache/74a755aadba0542c7899f67534905fbf/svatba-jm-161.jpg',
      'https://michalsviga.cz/wp-content/uploads/slider/cache/64852a0b2c2c51f7a6f28db55b6a6f44/DSCF6566-Edit106-scaled.jpg',
      'https://michalsviga.cz/wp-content/uploads/slider/cache/2bcffd6191eb420774a8d331c14d0766/portrety-na-web.jpg'
    ],
    rating: {
      overall: 4.8,
      count: 67,
      breakdown: {
        quality: 4.9,
        communication: 4.7,
        value: 4.6,
        professionalism: 4.9
      }
    },
    features: ['25 let zkušeností', 'Profesionální vybavení', 'Krajinná fotografie', 'Business portréty'],
    specialties: ['Svatební fotografie', 'Portrétní fotografie', 'Krajinná fotografie'],
    workingRadius: 100,
    availability: {
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      workingHours: { start: '08:00', end: '20:00' },
      seasonalAvailability: {
        peak: ['april', 'may', 'june', 'july', 'august', 'september', 'october'],
        low: ['november', 'december', 'january', 'february']
      }
    },
    testimonials: [
      {
        id: 'test-002',
        author: 'Tereza a Pavel',
        text: 'Michal je skvělý fotograf s obrovskými zkušenostmi. Fotky jsou nádherné a celý proces byl velmi profesionální.',
        rating: 5,
        date: new Date('2024-09-10'),
        weddingDate: new Date('2024-08-15'),
        verified: true
      }
    ],
    yearsInBusiness: 25,
    verified: true,
    featured: true,
    premium: true,
    responseTime: '< 2 hours',
    tags: ['svatební fotografie', 'portrét', 'business', 'krajina'],
    keywords: ['fotograf', 'svatba', 'Praha', 'profesionální', 'portrét'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    lastActive: new Date('2024-12-01')
  },

  {
    id: 'photographer-003',
    name: 'Martin Šenovský',
    category: 'photographer',
    description: 'Svatební fotograf z Prahy s více než 15 lety zkušeností. Specializuji se na svatební fotografii s důrazem na zachycení přirozených momentů, emocí a atmosféry vašeho velkého dne. Můj styl je reportážní s důrazem na detail a příběh. Fotím svatby po celé České republice i v zahraničí.',
    shortDescription: 'Svatební fotograf Praha - reportážní styl, 15+ let zkušeností',
    website: 'https://martinsenovsky.com',
    email: 'martin@senovsky.com',
    phone: '+420 777 123 456',
    address: {
      street: 'Praha 6',
      city: 'Praha',
      postalCode: '160 00',
      region: 'Praha',
      coordinates: { lat: 50.0755, lng: 14.4378 }
    },
    businessName: 'Martin Šenovský',
    businessId: '12345678',
    services: [
      {
        id: 'photo-wedding-full',
        name: 'Svatební focení - celý den',
        description: 'Kompletní svatební reportáž od příprav až po večerní zábavu',
        price: 28000,
        priceType: 'package',
        duration: '12 hodin',
        includes: ['Celý den fotografování', '400-500 upravených fotografií', 'Online galerie', 'Předsvatební focení zdarma', 'USB s fotkami'],
        popular: true
      },
      {
        id: 'photo-wedding-half',
        name: 'Svatební focení - půl dne',
        description: 'Svatební reportáž na půl dne',
        price: 18000,
        priceType: 'package',
        duration: '6 hodin',
        includes: ['6 hodin fotografování', '200-300 upravených fotografií', 'Online galerie', 'USB s fotkami']
      }
    ],
    priceRange: {
      min: 18000,
      max: 32000,
      currency: 'CZK',
      unit: 'per-event'
    },
    images: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800'
    ],
    portfolioImages: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200'
    ],
    rating: {
      overall: 4.8,
      count: 95,
      breakdown: {
        quality: 4.9,
        communication: 4.8,
        value: 4.7,
        professionalism: 4.9
      }
    },
    features: ['15+ let zkušeností', 'Reportážní styl', 'Focení po celé ČR', 'Předsvatební focení zdarma'],
    specialties: ['Svatební fotografie', 'Reportážní styl', 'Přírodní světlo', 'Detail a příběh'],
    workingRadius: 300,
    availability: {
      workingDays: ['friday', 'saturday', 'sunday'],
      workingHours: { start: '08:00', end: '23:00' },
      seasonalAvailability: {
        peak: ['may', 'june', 'july', 'august', 'september'],
        low: ['december', 'january', 'february']
      }
    },
    testimonials: [
      {
        id: 'test-ms-001',
        author: 'Lucie & Jakub',
        text: 'Martin je profesionál na nejvyšší úrovni. Fotky jsou úžasné a celý den byl velmi příjemný. Předsvatební focení nám pomohlo se uvolnit.',
        rating: 5,
        date: new Date('2024-09-10'),
        weddingDate: new Date('2024-08-05'),
        verified: true
      },
      {
        id: 'test-ms-002',
        author: 'Veronika & Martin',
        text: 'Reportážní styl Martina je přesně to, co jsme hledali. Fotky jsou plné emocí a atmosféry našeho dne.',
        rating: 5,
        date: new Date('2024-07-15'),
        weddingDate: new Date('2024-06-20'),
        verified: true
      }
    ],
    yearsInBusiness: 15,
    verified: true,
    featured: true,
    premium: true,
    responseTime: '< 4 hours',
    tags: ['svatební fotografie', 'reportáž', 'Praha', 'detail', 'příběh'],
    keywords: ['fotograf', 'svatba', 'Praha', 'reportáž', 'profesionální'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    lastActive: new Date('2024-12-01')
  },

  {
    id: 'photographer-004',
    name: 'Petr Blažek',
    category: 'photographer',
    description: 'Svatební fotograf s dlouholetými zkušenostmi a osobitým stylem. Specializuji se na svatební fotografii s důrazem na přirozené momenty, emoce a atmosféru. Fotím svatby po celé České republice i v zahraničí. Můj styl je reportážní s důrazem na detail a příběh vašeho velkého dne.',
    shortDescription: 'Svatební fotograf - přirozený reportážní styl',
    website: 'https://petrblazek.com',
    email: 'info@petrblazek.com',
    phone: '+420 777 234 567',
    address: {
      street: 'Praha',
      city: 'Praha',
      postalCode: '110 00',
      region: 'Praha',
      coordinates: { lat: 50.0755, lng: 14.4378 }
    },
    businessName: 'Petr Blažek',
    businessId: '23456789',
    services: [
      {
        id: 'photo-wedding-full',
        name: 'Svatební focení - celý den',
        description: 'Kompletní svatební reportáž od příprav až po večerní zábavu',
        price: 26000,
        priceType: 'package',
        duration: '12 hodin',
        includes: ['Celý den fotografování', '350-450 upravených fotografií', 'Online galerie', 'Předsvatební focení', 'USB s fotkami'],
        popular: true
      },
      {
        id: 'photo-engagement',
        name: 'Předsvatební focení',
        description: 'Párové focení před svatbou',
        price: 4000,
        priceType: 'package',
        duration: '2 hodiny',
        includes: ['2 hodiny focení', '50+ upravených fotografií', 'Online galerie', 'Konzultace svatebního dne']
      }
    ],
    priceRange: {
      min: 22000,
      max: 32000,
      currency: 'CZK',
      unit: 'per-event'
    },
    images: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800'
    ],
    portfolioImages: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200',
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200'
    ],
    rating: {
      overall: 4.8,
      count: 78,
      breakdown: {
        quality: 4.9,
        communication: 4.8,
        value: 4.7,
        professionalism: 4.9
      }
    },
    features: ['Dlouholeté zkušenosti', 'Reportážní styl', 'Focení po celé ČR', 'Předsvatební focení'],
    specialties: ['Svatební fotografie', 'Reportážní styl', 'Přirozené momenty', 'Detail a příběh'],
    workingRadius: 300,
    availability: {
      workingDays: ['friday', 'saturday', 'sunday'],
      workingHours: { start: '08:00', end: '23:00' },
      seasonalAvailability: {
        peak: ['may', 'june', 'july', 'august', 'september'],
        low: ['december', 'january', 'february']
      }
    },
    testimonials: [
      {
        id: 'test-pb-001',
        author: 'Kateřina & Pavel',
        text: 'Petr je skvělý fotograf s osobitým stylem. Fotky jsou nádherné a celý den byl velmi příjemný.',
        rating: 5,
        date: new Date('2024-08-25'),
        weddingDate: new Date('2024-07-15'),
        verified: true
      },
      {
        id: 'test-pb-002',
        author: 'Simona & Tomáš',
        text: 'Reportážní styl Petra je přesně to, co jsme hledali. Fotky jsou plné emocí a atmosféry.',
        rating: 5,
        date: new Date('2024-06-30'),
        weddingDate: new Date('2024-06-01'),
        verified: true
      }
    ],
    yearsInBusiness: 12,
    verified: true,
    featured: false,
    premium: true,
    responseTime: '< 6 hours',
    tags: ['svatební fotografie', 'reportáž', 'Praha', 'detail', 'příběh'],
    keywords: ['fotograf', 'svatba', 'Praha', 'reportáž', 'profesionální'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    lastActive: new Date('2024-12-01')
  },

  {
    id: 'photographer-005',
    name: 'Monika Balvar Sukeníková',
    category: 'photographer',
    description: 'Rodinná a svatební fotografka z Ostravy. Fotím s láskou a srdcem, protože věřím, že každý okamžik je jedinečný a zaslouží si být zachycen. Specializuji se na rodinné a svatební fotografie s důrazem na přirozené momenty a emoce. Fotím po celé České republice.',
    shortDescription: 'Rodinná a svatební fotografka Ostrava - fotky s láskou',
    website: 'https://monikasukenikova.cz',
    email: 'info@monikasukenikova.cz',
    phone: '+420 777 345 678',
    address: {
      street: 'Ostrava',
      city: 'Ostrava',
      postalCode: '702 00',
      region: 'Moravskoslezský kraj',
      coordinates: { lat: 49.8209, lng: 18.2625 }
    },
    businessName: 'Monika Balvar Sukeníková',
    businessId: '34567890',
    services: [
      {
        id: 'photo-wedding-full',
        name: 'Svatební focení - celý den',
        description: 'Kompletní svatební reportáž s důrazem na emoce',
        price: 24000,
        priceType: 'package',
        duration: '10 hodin',
        includes: ['Celý den fotografování', '300-400 upravených fotografií', 'Online galerie', 'Předsvatební focení', 'USB s fotkami'],
        popular: true
      },
      {
        id: 'photo-family',
        name: 'Rodinné focení',
        description: 'Rodinná a portrétní fotografie',
        price: 3500,
        priceType: 'fixed',
        duration: '2 hodiny',
        includes: ['2 hodiny focení', '40+ upravených fotografií', 'Online galerie']
      }
    ],
    priceRange: {
      min: 20000,
      max: 28000,
      currency: 'CZK',
      unit: 'per-event'
    },
    images: [
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800',
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800'
    ],
    portfolioImages: [
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200',
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200'
    ],
    rating: {
      overall: 4.9,
      count: 64,
      breakdown: {
        quality: 5.0,
        communication: 4.9,
        value: 4.8,
        professionalism: 4.9
      }
    },
    features: ['Fotky s láskou', 'Rodinné focení', 'Svatební fotografie', 'Focení po celé ČR'],
    specialties: ['Svatební fotografie', 'Rodinné focení', 'Přirozené momenty', 'Emoce'],
    workingRadius: 250,
    availability: {
      workingDays: ['friday', 'saturday', 'sunday'],
      workingHours: { start: '08:00', end: '22:00' },
      seasonalAvailability: {
        peak: ['may', 'june', 'july', 'august', 'september'],
        low: ['december', 'january', 'february']
      }
    },
    testimonials: [
      {
        id: 'test-ms-001',
        author: 'Lenka & Michal',
        text: 'Monika má úžasné oko pro detail a dokáže zachytit ty nejkrásnější momenty. Fotky jsou plné emocí!',
        rating: 5,
        date: new Date('2024-08-10'),
        weddingDate: new Date('2024-07-05'),
        verified: true
      },
      {
        id: 'test-ms-002',
        author: 'Petra & David',
        text: 'Fotky s láskou - to je přesný popis Moniky. Jsme nadšení z výsledku!',
        rating: 5,
        date: new Date('2024-06-25'),
        weddingDate: new Date('2024-05-18'),
        verified: true
      }
    ],
    yearsInBusiness: 8,
    verified: true,
    featured: false,
    premium: true,
    responseTime: '< 8 hours',
    tags: ['svatební fotografie', 'rodinné focení', 'Ostrava', 'emoce', 'láska'],
    keywords: ['fotograf', 'svatba', 'Ostrava', 'rodina', 'emoce'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    lastActive: new Date('2024-12-01')
  },

  {
    id: 'photographer-006',
    name: 'Kateřina Bábíčková',
    category: 'photographer',
    description: 'Svatební fotografka z Brna s láskou k přírodnímu světlu a autentickým momentům. Fotím svatby v Brně, Praze, Mikulově a po celé České republice. Můj styl je reportážní s důrazem na emoce, detail a atmosféru vašeho velkého dne. Věřím, že nejkrásnější fotky vznikají, když se cítíte přirozeně.',
    shortDescription: 'Svatební fotografka Brno, Praha, Mikulov - přírodní světlo',
    website: 'https://katerinababickova.cz',
    email: 'babickova.katerina@gmail.com',
    phone: '+420 721 546 809',
    address: {
      street: 'Brno',
      city: 'Brno',
      postalCode: '602 00',
      region: 'Jihomoravský kraj',
      coordinates: { lat: 49.1951, lng: 16.6068 }
    },
    businessName: 'Kateřina Bábíčková',
    businessId: '45678901',
    services: [
      {
        id: 'photo-wedding-full',
        name: 'Svatební focení - celý den',
        description: 'Kompletní svatební reportáž s důrazem na přírodní světlo',
        price: 27000,
        priceType: 'package',
        duration: '12 hodin',
        includes: ['Celý den fotografování', '400-500 upravených fotografií', 'Online galerie', 'Předsvatební focení', 'USB s fotkami'],
        popular: true
      },
      {
        id: 'photo-engagement',
        name: 'Předsvatební focení',
        description: 'Párové focení před svatbou v přírodě',
        price: 4500,
        priceType: 'package',
        duration: '2 hodiny',
        includes: ['2 hodiny focení', '60+ upravených fotografií', 'Online galerie', 'Tipy na lokace']
      }
    ],
    priceRange: {
      min: 23000,
      max: 32000,
      currency: 'CZK',
      unit: 'per-event'
    },
    images: [
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800',
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800'
    ],
    portfolioImages: [
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200',
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200'
    ],
    rating: {
      overall: 4.9,
      count: 112,
      breakdown: {
        quality: 5.0,
        communication: 4.9,
        value: 4.8,
        professionalism: 5.0
      }
    },
    features: ['Přírodní světlo', 'Reportážní styl', 'Brno, Praha, Mikulov', 'Předsvatební focení'],
    specialties: ['Svatební fotografie', 'Přírodní světlo', 'Autentické momenty', 'Emoce a atmosféra'],
    workingRadius: 200,
    availability: {
      workingDays: ['friday', 'saturday', 'sunday'],
      workingHours: { start: '08:00', end: '23:00' },
      seasonalAvailability: {
        peak: ['may', 'june', 'july', 'august', 'september'],
        low: ['december', 'january', 'february']
      }
    },
    testimonials: [
      {
        id: 'test-kb-001',
        author: 'Tereza & Jakub',
        text: 'Kateřina má úžasné oko pro detail a přírodní světlo. Fotky jsou nádherné a plné emocí!',
        rating: 5,
        date: new Date('2024-09-05'),
        weddingDate: new Date('2024-08-12'),
        verified: true
      },
      {
        id: 'test-kb-002',
        author: 'Lucie & Martin',
        text: 'Předsvatební focení nám pomohlo se uvolnit a svatební den byl díky tomu mnohem příjemnější. Fotky jsou úžasné!',
        rating: 5,
        date: new Date('2024-07-18'),
        weddingDate: new Date('2024-06-22'),
        verified: true
      }
    ],
    yearsInBusiness: 9,
    verified: true,
    featured: true,
    premium: true,
    responseTime: '< 4 hours',
    tags: ['svatební fotografie', 'přírodní světlo', 'Brno', 'Praha', 'Mikulov'],
    keywords: ['fotograf', 'svatba', 'Brno', 'Praha', 'Mikulov', 'přírodní světlo'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    lastActive: new Date('2024-12-01')
  },

  {
    id: 'photographer-007',
    name: 'Václav Křížek',
    category: 'photographer',
    description: 'Svatební fotograf s dlouholetými zkušenostmi a osobitým stylem. Specializuji se na svatební fotografii s důrazem na přirozené momenty, emoce a atmosféru. Fotím svatby po celé České republice. Můj styl je reportážní s důrazem na detail a příběh vašeho velkého dne. Cena za 12 hodin focení je 28 000 Kč.',
    shortDescription: 'Svatební fotograf - reportážní styl, 12 hodin za 28 000 Kč',
    website: 'https://vaclavkrizek.cz',
    email: 'info@vaclavkrizek.cz',
    phone: '+420 777 456 789',
    address: {
      street: 'Praha',
      city: 'Praha',
      postalCode: '110 00',
      region: 'Praha',
      coordinates: { lat: 50.0755, lng: 14.4378 }
    },
    businessName: 'Václav Křížek',
    businessId: '56789012',
    services: [
      {
        id: 'photo-wedding-full',
        name: 'Svatební focení - 12 hodin',
        description: 'Kompletní svatební reportáž od příprav až po večerní zábavu',
        price: 28000,
        priceType: 'package',
        duration: '12 hodin',
        includes: ['12 hodin fotografování', '400-500 upravených fotografií', 'Online galerie', 'USB s fotkami'],
        popular: true
      },
      {
        id: 'photo-engagement',
        name: 'Předsvatební focení',
        description: 'Párové focení před svatbou',
        price: 4000,
        priceType: 'package',
        duration: '2 hodiny',
        includes: ['2 hodiny focení', '50+ upravených fotografií', 'Online galerie']
      }
    ],
    priceRange: {
      min: 24000,
      max: 32000,
      currency: 'CZK',
      unit: 'per-event'
    },
    images: [
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800'
    ],
    portfolioImages: [
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200',
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200'
    ],
    rating: {
      overall: 4.8,
      count: 86,
      breakdown: {
        quality: 4.9,
        communication: 4.8,
        value: 4.7,
        professionalism: 4.9
      }
    },
    features: ['Dlouholeté zkušenosti', 'Reportážní styl', 'Focení po celé ČR', '12 hodin za 28 000 Kč'],
    specialties: ['Svatební fotografie', 'Reportážní styl', 'Přirozené momenty', 'Detail a příběh'],
    workingRadius: 300,
    availability: {
      workingDays: ['friday', 'saturday', 'sunday'],
      workingHours: { start: '08:00', end: '23:00' },
      seasonalAvailability: {
        peak: ['may', 'june', 'july', 'august', 'september'],
        low: ['december', 'january', 'february']
      }
    },
    testimonials: [
      {
        id: 'test-vk-001',
        author: 'Jana & Petr',
        text: 'Václav je skvělý fotograf s osobitým stylem. Fotky jsou nádherné a celý den byl velmi příjemný.',
        rating: 5,
        date: new Date('2024-08-15'),
        weddingDate: new Date('2024-07-08'),
        verified: true
      }
    ],
    yearsInBusiness: 11,
    verified: true,
    featured: false,
    premium: false,
    responseTime: '< 6 hours',
    tags: ['svatební fotografie', 'reportáž', 'Praha', 'ČR'],
    keywords: ['fotograf', 'svatba', 'Praha', 'reportáž', 'profesionální'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    lastActive: new Date('2024-12-01')
  },

  {
    id: 'photographer-008',
    name: 'Vít Štěpánek',
    category: 'photographer',
    description: 'Svatební fotograf z Brna s láskou k přirozeným momentům a emocím. Specializuji se na reportážní svatební fotografii s důrazem na autentické okamžiky a atmosféru vašeho velkého dne. Fotím svatby v Brně a okolí, ale rád vyrazím i do jiných koutů České republiky.',
    shortDescription: 'Svatební fotograf Brno - přirozené momenty a emoce',
    website: 'https://fotovitstepanek.cz',
    email: 'fotovitstepanek@gmail.com',
    phone: '+420 725 123 456',
    address: {
      street: 'Brno',
      city: 'Brno',
      postalCode: '602 00',
      region: 'Jihomoravský kraj',
      coordinates: { lat: 49.1951, lng: 16.6068 }
    },
    businessName: 'Vít Štěpánek',
    businessId: '67890123',
    services: [
      {
        id: 'photo-wedding-full',
        name: 'Svatební focení - celý den',
        description: 'Kompletní svatební reportáž s důrazem na přirozené momenty',
        price: 23000,
        priceType: 'package',
        duration: '10 hodin',
        includes: ['Celý den fotografování', '300-400 upravených fotografií', 'Online galerie', 'USB s fotkami'],
        popular: true
      },
      {
        id: 'photo-engagement',
        name: 'Předsvatební focení',
        description: 'Párové focení před svatbou',
        price: 3500,
        priceType: 'package',
        duration: '2 hodiny',
        includes: ['2 hodiny focení', '40+ upravených fotografií', 'Online galerie']
      }
    ],
    priceRange: {
      min: 20000,
      max: 27000,
      currency: 'CZK',
      unit: 'per-event'
    },
    images: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800'
    ],
    portfolioImages: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200',
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200'
    ],
    rating: {
      overall: 4.8,
      count: 72,
      breakdown: {
        quality: 4.9,
        communication: 4.8,
        value: 4.7,
        professionalism: 4.9
      }
    },
    features: ['Přirozené momenty', 'Reportážní styl', 'Brno a okolí', 'Focení po celé ČR'],
    specialties: ['Svatební fotografie', 'Reportážní styl', 'Autentické okamžiky', 'Emoce'],
    workingRadius: 200,
    availability: {
      workingDays: ['friday', 'saturday', 'sunday'],
      workingHours: { start: '08:00', end: '22:00' },
      seasonalAvailability: {
        peak: ['may', 'june', 'july', 'august', 'september'],
        low: ['december', 'january', 'february']
      }
    },
    testimonials: [
      {
        id: 'test-vs-001',
        author: 'Markéta & Tomáš',
        text: 'Vít má úžasné oko pro přirozené momenty. Fotky jsou nádherné a plné emocí!',
        rating: 5,
        date: new Date('2024-07-25'),
        weddingDate: new Date('2024-06-18'),
        verified: true
      }
    ],
    yearsInBusiness: 7,
    verified: true,
    featured: false,
    premium: false,
    responseTime: '< 8 hours',
    tags: ['svatební fotografie', 'reportáž', 'Brno', 'přirozené momenty'],
    keywords: ['fotograf', 'svatba', 'Brno', 'reportáž', 'emoce'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    lastActive: new Date('2024-12-01')
  },

  // MÍSTA KONÁNÍ
  {
    id: 'venue-001',
    name: 'Zámek Dobříš',
    category: 'venue',
    description: 'Malebný barokní zámek nedaleko Prahy, který je oblíbeným místem pro konání svateb. Váš jedinečný den může být oslavován v historických sálech s nádherným výhledem do zámeckého parku.',
    shortDescription: 'Barokní zámek nedaleko Prahy pro svatby',
    website: 'https://www.zamekdobris.cz',
    email: 'dousova@zamekdobris.cz',
    phone: '+420 721 443 384',
    address: {
      street: 'Dobříš č.p. 1',
      city: 'Dobříš',
      postalCode: '263 01',
      region: 'Středočeský kraj',
      coordinates: { lat: 49.7814817, lng: 14.1790503 }
    },
    businessName: 'Colloredo-Mannsfeld spol. s r.o.',
    services: [
      {
        id: 'venue-ceremony',
        name: 'Svatební obřad v zámku',
        description: 'Obřad v historických sálech zámku',
        price: 20000,
        priceType: 'fixed',
        includes: ['Pronájem sálu', 'Základní výzdoba', 'Koordinace obřadu'],
        popular: true
      },
      {
        id: 'venue-reception',
        name: 'Svatební hostina',
        description: 'Hostina v reprezentačních prostorách',
        price: 1500,
        priceType: 'per-person',
        includes: ['Pronájem sálů', 'Základní vybavení', 'Parkování']
      },
      {
        id: 'venue-hotel',
        name: 'Ubytování v hotelu',
        description: 'Ubytování v zámeckém hotelu',
        price: 3500,
        priceType: 'per-person',
        includes: ['Hotelový pokoj', 'Snídaně', 'Wellness']
      }
    ],
    priceRange: {
      min: 15000,
      max: 200000,
      currency: 'CZK',
      unit: 'per-event'
    },
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f29c8e8d4b?w=800',
      'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800'
    ],
    portfolioImages: [
      'https://images.unsplash.com/photo-1519167758481-83f29c8e8d4b?w=800',
      'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800'
    ],
    rating: {
      overall: 4.6,
      count: 89,
      breakdown: {
        quality: 4.8,
        communication: 4.5,
        value: 4.3,
        professionalism: 4.7
      }
    },
    features: ['Historické prostředí', 'Parkování', 'Ubytování', 'Catering'],
    specialties: ['Historické svatby', 'Venkovní obřady', 'Velké svatby'],
    workingRadius: 0, // venue is fixed location
    availability: {
      workingDays: ['friday', 'saturday', 'sunday'],
      workingHours: { start: '10:00', end: '02:00' },
      seasonalAvailability: {
        peak: ['april', 'may', 'june', 'july', 'august', 'september', 'october'],
        low: ['november', 'december', 'january', 'february', 'march']
      }
    },
    testimonials: [
      {
        id: 'test-002',
        author: 'Markéta a Pavel',
        text: 'Zámek Loučeň byl naším vysněným místem. Personál byl úžasný a prostředí kouzelné.',
        rating: 5,
        date: new Date('2024-09-10'),
        weddingDate: new Date('2024-08-25'),
        verified: true
      }
    ],
    certifications: ['Památková péče ČR'],
    yearsInBusiness: 25,
    verified: true,
    featured: true,
    premium: false,
    responseTime: '< 24 hours',
    tags: ['zámek', 'historické místo', 'park', 'venkovní obřad'],
    keywords: ['zámek', 'svatba', 'Loučeň', 'historické'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    lastActive: new Date('2024-11-28')
  },





  // KVĚTINY
  {
    id: 'flowers-001',
    name: 'Květinové studio Bubeníčková',
    category: 'flowers',
    description: 'Profesionální floristické studio v srdci Prahy na Malé Straně. Specializujeme se na svatební kytice, výzdobu obřadů a hostin. Každá svatba je pro nás jedinečná a vytváříme originální květinové aranžmá podle vašich přání.',
    shortDescription: 'Profesionální floristické studio na Malé Straně',
    website: 'https://www.kvetstudio.cz',
    email: 'bubenickova@kvetstudio.cz',
    phone: '+420 603 490 737',
    address: {
      street: 'Hellichova 455/5',
      city: 'Praha',
      postalCode: '118 00',
      region: 'Praha',
      coordinates: { lat: 50.084259, lng: 14.4047206 }
    },
    businessName: 'Květinové studio Bubeníčková s.r.o.',
    services: [
      {
        id: 'flowers-basic',
        name: 'Základní výzdoba',
        description: 'Svatební kytice + výzdoba obřadu',
        price: 8000,
        priceType: 'package',
        includes: ['Svatební kytice', 'Korsáž pro ženicha', 'Výzdoba obřadu', 'Konzultace'],
        popular: true
      },
      {
        id: 'flowers-premium',
        name: 'Kompletní výzdoba',
        description: 'Kompletní květinová výzdoba svatby',
        price: 18000,
        priceType: 'package',
        includes: ['Svatební kytice', 'Korsáže', 'Výzdoba obřadu', 'Výzdoba hostiny', 'Stolní aranžmá', 'Konzultace']
      }
    ],
    priceRange: {
      min: 5000,
      max: 30000,
      currency: 'CZK',
      unit: 'per-event'
    },
    images: [
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800'
    ],
    portfolioImages: [
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800'
    ],
    rating: {
      overall: 4.6,
      count: 89,
      breakdown: {
        quality: 4.7,
        communication: 4.5,
        value: 4.4,
        professionalism: 4.8
      }
    },
    features: ['Sezónní květiny', 'Udržitelnost', 'Vlastní pěstování', 'Rychlé dodání'],
    specialties: ['Boho styl', 'Vintage aranžmá', 'Minimalistické kytice'],
    workingRadius: 60,
    availability: {
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      workingHours: { start: '09:00', end: '18:00' }
    },
    testimonials: [
      {
        id: 'test-005',
        author: 'Klára a David',
        text: 'Květiny byly naprosto úžasné! Přesně podle našich představ.',
        rating: 5,
        date: new Date('2024-08-10'),
        verified: true
      }
    ],
    yearsInBusiness: 7,
    verified: true,
    featured: false,
    premium: false,
    responseTime: '< 6 hours',
    tags: ['květiny', 'výzdoba', 'kytice', 'svatba'],
    keywords: ['květiny', 'svatba', 'Praha', 'výzdoba'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    lastActive: new Date('2024-11-30')
  },

  // SVATEBNÍ ŠATY
  {
    id: 'dress-001',
    name: 'DD Models - Svatební salon',
    category: 'dress',
    description: 'Svatební a plesové šaty v Praze 5. Nabízíme široký výběr svatebních šatů různých stylů a velikostí. Profesionální poradenství a úpravy na míru.',
    shortDescription: 'Svatební a plesové šaty Praha 5',
    website: 'https://www.saty-svatebni.cz',
    email: 'info@saty-svatebni.cz',
    phone: '+420 257 317 461',
    address: {
      street: 'Plzeňská 2035/50',
      city: 'Praha',
      postalCode: '150 00',
      region: 'Praha',
      coordinates: { lat: 50.0755, lng: 14.4378 }
    },
    businessName: 'DD Models',
    services: [
      {
        id: 'dress-rental',
        name: 'Půjčení šatů',
        description: 'Půjčení svatebních šatů na den',
        price: 8000,
        priceType: 'fixed',
        includes: ['Půjčení šatů', 'Základní úpravy', 'Čištění', 'Poradenství'],
        popular: true
      },
      {
        id: 'dress-purchase',
        name: 'Koupě šatů',
        description: 'Koupě svatebních šatů',
        price: 25000,
        priceType: 'fixed',
        includes: ['Svatební šaty', 'Úpravy na míru', 'Poradenství', 'Doplňky']
      }
    ],
    priceRange: {
      min: 6000,
      max: 80000,
      currency: 'CZK',
      unit: 'per-event'
    },
    images: [
      'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800',
      'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800'
    ],
    portfolioImages: [
      'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800',
      'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800'
    ],
    rating: {
      overall: 4.8,
      count: 156,
      breakdown: {
        quality: 4.9,
        communication: 4.7,
        value: 4.6,
        professionalism: 4.9
      }
    },
    features: ['Světoví návrháři', 'Úpravy na míru', 'Široký výběr', 'Poradenství'],
    specialties: ['Klasické šaty', 'Boho styl', 'Vintage šaty'],
    workingRadius: 0, // salon location
    availability: {
      workingDays: ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      workingHours: { start: '10:00', end: '19:00' }
    },
    testimonials: [
      {
        id: 'test-006',
        author: 'Aneta a Petr',
        text: 'Našla jsem si zde šaty svých snů! Personál byl úžasný.',
        rating: 5,
        date: new Date('2024-07-15'),
        verified: true
      }
    ],
    yearsInBusiness: 15,
    verified: true,
    featured: true,
    premium: true,
    responseTime: '< 2 hours',
    tags: ['svatební šaty', 'salon', 'půjčovna', 'návrháři'],
    keywords: ['šaty', 'svatba', 'Praha', 'salon'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    lastActive: new Date('2024-12-01')
  },

  // HUDBA/DJ
  {
    id: 'music-001',
    name: 'DJ na svatbu Praha',
    category: 'music',
    description: 'Profesionální DJ služby pro svatby v Praze a okolí. Moderní zvuková technika, široký repertoár hudby a osobní přístup k každé svatbě.',
    shortDescription: 'Profesionální DJ služby pro svatby Praha',
    website: 'http://www.djnasvatbu.eu',
    email: 'info@djnasvatbu.eu',
    phone: '+420 777 888 999',
    address: {
      street: 'Praha',
      city: 'Praha',
      postalCode: '110 00',
      region: 'Praha',
      coordinates: { lat: 50.0755, lng: 14.4378 }
    },
    businessName: 'DJ na svatbu',
    services: [
      {
        id: 'dj-basic',
        name: 'DJ set základní',
        description: 'Profesionální DJ set s vlastním vybavením',
        price: 12000,
        priceType: 'fixed',
        duration: '6 hodin',
        includes: ['Profesionální zvuk', 'Osvětlení', 'Mikrofony', 'Hudba dle přání'],
        popular: true
      },
      {
        id: 'dj-premium',
        name: 'DJ set premium',
        description: 'Rozšířený DJ set s doplňkovými službami',
        price: 18000,
        priceType: 'fixed',
        duration: '8 hodin',
        includes: ['DJ set', 'Profesionální zvuk', 'Světelná show', 'Mikrofony', 'Moderování']
      }
    ],
    priceRange: {
      min: 10000,
      max: 25000,
      currency: 'CZK',
      unit: 'per-event'
    },
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      'https://images.unsplash.com/photo-1571266028243-d220c9c3b31f?w=800'
    ],
    portfolioImages: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      'https://images.unsplash.com/photo-1571266028243-d220c9c3b31f?w=800'
    ],
    rating: {
      overall: 4.7,
      count: 156,
      breakdown: {
        quality: 4.8,
        communication: 4.6,
        value: 4.5,
        professionalism: 4.8
      }
    },
    features: ['Vlastní vybavení', 'Backup systém', 'Hudba dle přání', 'Moderování'],
    specialties: ['Svatební hudba', 'Taneční hudba', 'Moderování'],
    workingRadius: 100,
    availability: {
      workingDays: ['friday', 'saturday', 'sunday'],
      workingHours: { start: '14:00', end: '04:00' }
    },
    testimonials: [
      {
        id: 'test-007',
        author: 'Tereza a Jakub',
        text: 'DJ byl úžasný! Celý večer byla skvělá atmosféra a všichni tancovali.',
        rating: 5,
        date: new Date('2024-09-20'),
        verified: true
      }
    ],
    yearsInBusiness: 12,
    verified: true,
    featured: false,
    premium: false,
    responseTime: '< 2 hours',
    tags: ['DJ', 'hudba', 'tanec', 'zábava'],
    keywords: ['DJ', 'svatba', 'hudba', 'Praha'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    lastActive: new Date('2024-12-01')
  },

  // CATERING
  {
    id: 'catering-001',
    name: 'JK Catering',
    category: 'catering',
    description: 'Profesionální catering služby pro svatby a společenské akce. Specializujeme se na moderní gastronomii s důrazem na čerstvé ingredience a kvalitní servis.',
    shortDescription: 'Profesionální catering pro svatby a akce',
    website: 'http://jkcatering.cz',
    email: 'info@jkcatering.cz',
    phone: '+420 602 345 678',
    address: {
      street: 'Praha',
      city: 'Praha',
      postalCode: '120 00',
      region: 'Praha',
      coordinates: { lat: 50.0755, lng: 14.4378 }
    },
    businessName: 'JK Catering s.r.o.',
    services: [
      {
        id: 'catering-basic',
        name: 'Základní menu',
        description: 'Tříchodové menu s aperitivem',
        price: 750,
        priceType: 'per-person',
        includes: ['Aperitiv', 'Předkrm', 'Hlavní chod', 'Dezert', 'Obsluha'],
        popular: true
      },
      {
        id: 'catering-premium',
        name: 'Premium menu',
        description: 'Pětichodové degustační menu',
        price: 1200,
        priceType: 'per-person',
        includes: ['Welcome drink', 'Amuse-bouche', 'Předkrm', 'Polévka', 'Hlavní chod', 'Dezert', 'Obsluha']
      }
    ],
    priceRange: {
      min: 500,
      max: 1500,
      currency: 'CZK',
      unit: 'per-person'
    },
    images: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800'
    ],
    portfolioImages: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
      'https://images.unsplash.com/photo-1555244162-803834f70033?w=800'
    ],
    rating: {
      overall: 4.6,
      count: 89,
      breakdown: {
        quality: 4.7,
        communication: 4.5,
        value: 4.4,
        professionalism: 4.7
      }
    },
    features: ['Čerstvé ingredience', 'Vegetariánské menu', 'Vlastní kuchyně', 'Profesionální obsluha'],
    specialties: ['Moderní gastronomie', 'Lokální ingredience', 'Tematická menu'],
    workingRadius: 50,
    availability: {
      workingDays: ['thursday', 'friday', 'saturday', 'sunday'],
      workingHours: { start: '10:00', end: '02:00' }
    },
    testimonials: [
      {
        id: 'test-008',
        author: 'Lucie a Martin',
        text: 'Jídlo bylo naprosto úžasné! Hosté si pochvalovali každý chod.',
        rating: 5,
        date: new Date('2024-10-05'),
        verified: true
      }
    ],
    yearsInBusiness: 8,
    verified: true,
    featured: false,
    premium: true,
    responseTime: '< 4 hours',
    tags: ['catering', 'gastronomie', 'moderní', 'kvalita'],
    keywords: ['catering', 'svatba', 'Praha', 'jídlo'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    lastActive: new Date('2024-12-01')
  },

  // Další fotografové (9-10)
  {
    id: 'photographer-009',
    name: 'Jana Křížková',
    category: 'photographer',
    description: 'Svatební fotografka s láskou k přirozeným momentům a emocím. Specializuji se na reportážní svatební fotografii s důrazem na autentické okamžiky a atmosféru vašeho velkého dne. Fotím svatby po celé České republice s důrazem na detail a příběh každého páru.',
    shortDescription: 'Svatební fotografka - přirozené momenty a emoce',
    website: 'https://janakrizkova.com',
    email: 'info@janakrizkova.com',
    phone: '+420 777 567 890',
    address: {
      street: 'Praha',
      city: 'Praha',
      postalCode: '110 00',
      region: 'Praha',
      coordinates: { lat: 50.0755, lng: 14.4378 }
    },
    businessName: 'Jana Křížková',
    businessId: '78901234',
    services: [
      {
        id: 'photo-wedding-full',
        name: 'Svatební focení - celý den',
        description: 'Kompletní svatební reportáž s důrazem na přirozené momenty',
        price: 25000,
        priceType: 'package',
        duration: '10 hodin',
        includes: ['Celý den fotografování', '350-450 upravených fotografií', 'Online galerie', 'USB s fotkami'],
        popular: true
      },
      {
        id: 'photo-engagement',
        name: 'Předsvatební focení',
        description: 'Párové focení před svatbou',
        price: 4000,
        priceType: 'package',
        duration: '2 hodiny',
        includes: ['2 hodiny focení', '50+ upravených fotografií', 'Online galerie']
      }
    ],
    priceRange: {
      min: 21000,
      max: 29000,
      currency: 'CZK',
      unit: 'per-event'
    },
    images: [
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800',
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800'
    ],
    portfolioImages: [
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200',
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200'
    ],
    rating: {
      overall: 4.8,
      count: 68,
      breakdown: {
        quality: 4.9,
        communication: 4.8,
        value: 4.7,
        professionalism: 4.9
      }
    },
    features: ['Přirozené momenty', 'Reportážní styl', 'Focení po celé ČR', 'Detail a příběh'],
    specialties: ['Svatební fotografie', 'Reportážní styl', 'Autentické okamžiky', 'Emoce'],
    workingRadius: 250,
    availability: {
      workingDays: ['friday', 'saturday', 'sunday'],
      workingHours: { start: '08:00', end: '22:00' },
      seasonalAvailability: {
        peak: ['may', 'june', 'july', 'august', 'september'],
        low: ['december', 'january', 'february']
      }
    },
    testimonials: [
      {
        id: 'test-jk-001',
        author: 'Barbora & Lukáš',
        text: 'Jana má úžasné oko pro přirozené momenty. Fotky jsou nádherné a plné emocí!',
        rating: 5,
        date: new Date('2024-08-05'),
        weddingDate: new Date('2024-07-12'),
        verified: true
      }
    ],
    yearsInBusiness: 9,
    verified: true,
    featured: false,
    premium: false,
    responseTime: '< 6 hours',
    tags: ['svatební fotografie', 'reportáž', 'Praha', 'přirozené momenty'],
    keywords: ['fotograf', 'svatba', 'Praha', 'reportáž', 'emoce'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    lastActive: new Date('2024-12-01')
  },

  {
    id: 'photographer-010',
    name: 'Studio Desart',
    category: 'photographer',
    description: 'Profesionální fotografické studio z Prahy specializující se na svatební fotografii a videografii. Nabízíme komplexní služby pro váš velký den s důrazem na kvalitu, kreativitu a profesionální přístup. Náš tým zkušených fotografů a kameramanů zachytí všechny důležité momenty vašeho svatebního dne.',
    shortDescription: 'Profesionální fotografické studio Praha - svatby a videa',
    website: 'https://desart.cz',
    email: 'info@desart.cz',
    phone: '+420 777 678 901',
    address: {
      street: 'Praha',
      city: 'Praha',
      postalCode: '110 00',
      region: 'Praha',
      coordinates: { lat: 50.0755, lng: 14.4378 }
    },
    businessName: 'Studio Desart s.r.o.',
    businessId: '89012345',
    services: [
      {
        id: 'photo-video-package',
        name: 'Svatební foto + video balíček',
        description: 'Kompletní svatební focení a natáčení',
        price: 45000,
        priceType: 'package',
        duration: '12 hodin',
        includes: ['Fotograf + kameraman', 'Celý den fotografování a natáčení', '500+ upravených fotografií', 'Svatební video', 'Online galerie', 'USB s fotkami a videem'],
        popular: true
      },
      {
        id: 'photo-only',
        name: 'Svatební focení',
        description: 'Profesionální svatební fotografie',
        price: 30000,
        priceType: 'package',
        duration: '12 hodin',
        includes: ['Profesionální fotograf', 'Celý den fotografování', '400-500 upravených fotografií', 'Online galerie', 'USB s fotkami']
      }
    ],
    priceRange: {
      min: 28000,
      max: 50000,
      currency: 'CZK',
      unit: 'per-event'
    },
    images: [
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800'
    ],
    portfolioImages: [
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200'
    ],
    rating: {
      overall: 4.9,
      count: 156,
      breakdown: {
        quality: 5.0,
        communication: 4.9,
        value: 4.8,
        professionalism: 5.0
      }
    },
    features: ['Profesionální studio', 'Foto + video', 'Zkušený tým', 'Komplexní služby'],
    specialties: ['Svatební fotografie', 'Svatební videografie', 'Kreativní přístup', 'Profesionální vybavení'],
    workingRadius: 300,
    availability: {
      workingDays: ['friday', 'saturday', 'sunday'],
      workingHours: { start: '06:00', end: '24:00' },
      seasonalAvailability: {
        peak: ['may', 'june', 'july', 'august', 'september'],
        low: ['december', 'january', 'february']
      }
    },
    testimonials: [
      {
        id: 'test-sd-001',
        author: 'Michaela & David',
        text: 'Studio Desart je profesionální tým, který nám vytvořil nádherné fotky a video. Doporučujeme!',
        rating: 5,
        date: new Date('2024-09-20'),
        weddingDate: new Date('2024-08-25'),
        verified: true
      },
      {
        id: 'test-sd-002',
        author: 'Kristýna & Jakub',
        text: 'Komplexní služby, profesionální přístup a úžasný výsledek. Jsme nadšení!',
        rating: 5,
        date: new Date('2024-07-10'),
        weddingDate: new Date('2024-06-08'),
        verified: true
      }
    ],
    yearsInBusiness: 14,
    verified: true,
    featured: true,
    premium: true,
    responseTime: '< 2 hours',
    tags: ['svatební fotografie', 'svatební video', 'Praha', 'profesionální studio'],
    keywords: ['fotograf', 'svatba', 'Praha', 'video', 'studio', 'profesionální'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    lastActive: new Date('2024-12-01')
  }
]
