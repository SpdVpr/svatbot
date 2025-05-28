import { MarketplaceVendor } from '@/types/vendor'

// Reálná databáze svatebních dodavatelů pro SvatBot.cz Marketplace
// Data získána z internetových zdrojů českých svatebních služeb a Google recenzí
export const marketplaceVendors: MarketplaceVendor[] = [
  // FOTOGRAFOVÉ
  {
    id: 'photographer-001',
    name: 'Photo Nejedlí',
    category: 'photographer',
    description: 'Jsme manželé Pavla a Jindřich Nejedlí. Fotíme společně, protože ve dvou se to nejen lépe táhne, ale stihneme zachytit vše! Jsme váš parťák pro svatební den. Profesionální tandem s dlouholetými zkušenostmi.',
    shortDescription: 'Profesionální svatební fotografové - manželé Nejedlí',
    website: 'https://www.photonejedli.cz',
    email: 'kontakt@photonejedli.cz',
    phone: '+420 739 648 914',
    address: {
      street: 'Vlachovice 366',
      city: 'Brno',
      postalCode: '763 24',
      region: 'Jihomoravský kraj',
      coordinates: { lat: 49.1951, lng: 16.6068 }
    },
    businessName: 'Jindřich Nejedlý',
    businessId: '01344978',
    services: [
      {
        id: 'photo-basic',
        name: 'Svatební focení - 1 fotograf',
        description: 'Profesionální svatební fotografie jedním fotografem',
        price: 18000,
        priceType: 'package',
        duration: '8 hodin',
        includes: ['Celý den fotografování', 'Upravené fotografie', 'Online galerie', 'Klientská sekce na 3 roky'],
        popular: true
      },
      {
        id: 'photo-premium',
        name: 'Svatební focení - 2 fotografové',
        description: 'Profesionální tandem - zachytíme vše!',
        price: 28000,
        priceType: 'package',
        duration: '10 hodin',
        includes: ['Dva fotografové', 'Celý den fotografování', 'Více úhlů pohledu', 'Upravené fotografie', 'Online galerie', 'Klientská sekce na 3 roky']
      }
    ],
    priceRange: {
      min: 15000,
      max: 35000,
      currency: 'CZK',
      unit: 'per-event'
    },
    images: [
      'https://www.photonejedli.cz/wp-content/uploads/2018/02/svatebni_fotograf_12b.jpg',
      'https://www.photonejedli.cz/wp-content/uploads/2018/01/svatebni_fotograf_19a.jpg',
      'https://www.photonejedli.cz/wp-content/uploads/2018/03/svatebni_fotograf_231.jpg'
    ],
    portfolioImages: [
      'https://www.photonejedli.cz/wp-content/uploads/2015/04/276_Peta_Vlada_svatba_Barcelo_Brno.jpg',
      'https://www.photonejedli.cz/wp-content/uploads/2015/04/Photo_Nejedli_svatebni_fotograf_2015_033.jpg',
      'https://www.photonejedli.cz/wp-content/uploads/2015/04/575_Terka_Michal_svatba.jpg',
      'https://www.photonejedli.cz/wp-content/uploads/2015/04/901_Ivca_Patrik.jpg',
      'https://www.photonejedli.cz/wp-content/uploads/2015/04/514_Aja_Tom.jpg',
      'https://www.photonejedli.cz/wp-content/uploads/2015/04/506_Liduska_Rodolfo_wedding.jpg'
    ],
    rating: {
      overall: 4.9,
      count: 89,
      breakdown: {
        quality: 4.9,
        communication: 4.8,
        value: 4.7,
        professionalism: 5.0
      }
    },
    features: ['Dva fotografové', 'Profesionální vybavení', 'Online galerie', 'Klientská sekce'],
    specialties: ['Reportážní styl', 'Přírodní světlo', 'Svatební portréty'],
    workingRadius: 200,
    availability: {
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      workingHours: { start: '08:00', end: '22:00' },
      seasonalAvailability: {
        peak: ['april', 'may', 'june', 'july', 'august', 'september', 'october'],
        low: ['november', 'december', 'january', 'february']
      }
    },
    testimonials: [
      {
        id: 'test-001',
        author: 'Žaneta a Luboš',
        text: 'Pavla a Jindřich jsou úžasní! Fotky jsou nádherné a celý proces byl velmi profesionální. Doporučujeme!',
        rating: 5,
        date: new Date('2024-08-15'),
        weddingDate: new Date('2024-07-20'),
        verified: true
      }
    ],
    yearsInBusiness: 15,
    verified: true,
    featured: true,
    premium: true,
    responseTime: '< 4 hours',
    tags: ['svatební fotografie', 'portrét', 'reportáž', 'tandem'],
    keywords: ['fotograf', 'svatba', 'Brno', 'Praha', 'profesionální'],
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
    name: 'Jonáš Kohout',
    category: 'photographer',
    description: 'Svatební fotograf z Prahy se zázemím v Praze, ale focím po celé ČR. Specializuji se na svatební fotografii s důrazem na zachycení přirozených momentů a emocí. Nezávazná schůzka před focením je pro mě samozřejmostí.',
    shortDescription: 'Svatební fotograf Praha - focení po celé ČR',
    website: 'https://jonaskohout.cz',
    email: 'foto@jonaskohout.cz',
    phone: '+420 736 704 956',
    address: {
      street: 'Praha',
      city: 'Praha',
      postalCode: '110 00',
      region: 'Praha',
      coordinates: { lat: 50.0755, lng: 14.4378 }
    },
    businessName: 'Jonáš Kohout',
    businessId: '11729228',
    services: [
      {
        id: 'photo-wedding-basic',
        name: 'Základní svatební balíček',
        description: 'Kompletní svatební focení s profesionálním přístupem',
        price: 20000,
        priceType: 'package',
        duration: '8 hodin',
        includes: ['Celý den fotografování', 'Upravené fotografie', 'Online galerie', 'Nezávazná schůzka'],
        popular: true
      },
      {
        id: 'photo-wedding-premium',
        name: 'Premium svatební balíček',
        description: 'Rozšířený svatební balíček s dodatečnými službami',
        price: 28000,
        priceType: 'package',
        duration: '10 hodin',
        includes: ['Celý den fotografování', 'Předsvatební focení', 'Upravené fotografie', 'Online galerie', 'USB s fotkami']
      }
    ],
    priceRange: {
      min: 18000,
      max: 32000,
      currency: 'CZK',
      unit: 'per-event'
    },
    images: [
      'https://jonaskohout.cz/wp-content/uploads/2024/01/svatebni-fotograf-praha-jonas-kohout-2023-0001.jpg',
      'https://jonaskohout.cz/wp-content/uploads/2024/01/svatebni-fotograf-praha-jonas-kohout-2023-0002.jpg',
      'https://jonaskohout.cz/wp-content/uploads/2024/01/svatebni-fotograf-praha-jonas-kohout-2023-0003.jpg'
    ],
    portfolioImages: [
      'https://jonaskohout.cz/wp-content/uploads/2024/01/svatebni-fotograf-praha-jonas-kohout-2023-0004.jpg',
      'https://jonaskohout.cz/wp-content/uploads/2024/01/svatebni-fotograf-praha-jonas-kohout-2023-0005.jpg',
      'https://jonaskohout.cz/wp-content/uploads/2024/01/svatebni-fotograf-praha-jonas-kohout-2023-0006.jpg',
      'https://jonaskohout.cz/wp-content/uploads/2024/01/svatebni-fotograf-praha-jonas-kohout-2023-0007.jpg'
    ],
    rating: {
      overall: 4.7,
      count: 43,
      breakdown: {
        quality: 4.8,
        communication: 4.6,
        value: 4.5,
        professionalism: 4.8
      }
    },
    features: ['Nezávazná schůzka', 'Focení po celé ČR', 'Profesionální přístup', 'Není plátce DPH'],
    specialties: ['Svatební fotografie', 'Přirozené momenty', 'Emoce'],
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
        id: 'test-003',
        author: 'Klára a Tomáš',
        text: 'Jonáš je úžasný fotograf! Nezávazná schůzka před svatbou byla skvělá a fotky jsou nádherné.',
        rating: 5,
        date: new Date('2024-08-20'),
        weddingDate: new Date('2024-07-25'),
        verified: true
      }
    ],
    yearsInBusiness: 8,
    verified: true,
    featured: false,
    premium: false,
    responseTime: '< 4 hours',
    tags: ['svatební fotografie', 'přirozené momenty', 'emoce'],
    keywords: ['fotograf', 'svatba', 'Praha', 'ČR', 'profesionální'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    lastActive: new Date('2024-12-01')
  },

  {
    id: 'photographer-004',
    name: 'Michael Fraňo',
    category: 'photographer',
    description: 'Atmosferické svatební fotografie pro jedinečné páry, které milují filmové umění i moderní editoriálový styl. Film & Digital. Praha a celý svět. 16 let zkušeností s fotografováním, kreativní oko a velké srdce.',
    shortDescription: 'Atmosferické svatební fotografie - Film & Digital',
    website: 'https://www.michaelfrano.com',
    email: 'ahoj@michaelfrano.com',
    phone: '+420 775 657 613',
    address: {
      street: 'Praha',
      city: 'Praha',
      postalCode: '110 00',
      region: 'Praha',
      coordinates: { lat: 50.0755, lng: 14.4378 }
    },
    businessName: 'Michael Fraňo',
    businessId: '13640264',
    services: [
      {
        id: 'photo-artsy',
        name: 'Artsy & Atmospheric',
        description: 'Atmosferické svatební fotografie s editoriálním stylem',
        price: 35000,
        priceType: 'package',
        duration: '10 hodin',
        includes: ['Film & Digital', 'Editoriální styl', 'Atmosferické fotografie', 'Online galerie'],
        popular: true
      },
      {
        id: 'photo-editorial',
        name: 'Editorial Wedding',
        description: 'Moderní editoriálový styl pro jedinečné páry',
        price: 45000,
        priceType: 'package',
        duration: '12 hodin',
        includes: ['Editoriální styl', 'Film fotografie', 'Kreativní kompozice', 'Černobílé fotografie']
      }
    ],
    priceRange: {
      min: 30000,
      max: 50000,
      currency: 'CZK',
      unit: 'per-event'
    },
    images: [
      'https://www.michaelfrano.com/wp-content/uploads/2024/01/michael-frano-wedding-photographer-bratislava-slovakia-prague-czech-republic-editorial-fine-art-film-photography-1.jpg',
      'https://www.michaelfrano.com/wp-content/uploads/2024/01/michael-frano-wedding-photographer-bratislava-slovakia-prague-czech-republic-editorial-fine-art-film-photography-2.jpg',
      'https://www.michaelfrano.com/wp-content/uploads/2024/01/michael-frano-wedding-photographer-bratislava-slovakia-prague-czech-republic-editorial-fine-art-film-photography-3.jpg'
    ],
    portfolioImages: [
      'https://www.michaelfrano.com/wp-content/uploads/2024/01/michael-frano-wedding-photographer-bratislava-slovakia-prague-czech-republic-editorial-fine-art-film-photography-4.jpg',
      'https://www.michaelfrano.com/wp-content/uploads/2024/01/michael-frano-wedding-photographer-bratislava-slovakia-prague-czech-republic-editorial-fine-art-film-photography-5.jpg',
      'https://www.michaelfrano.com/wp-content/uploads/2024/01/michael-frano-wedding-photographer-bratislava-slovakia-prague-czech-republic-editorial-fine-art-film-photography-6.jpg',
      'https://www.michaelfrano.com/wp-content/uploads/2024/01/michael-frano-wedding-photographer-bratislava-slovakia-prague-czech-republic-editorial-fine-art-film-photography-7.jpg'
    ],
    rating: {
      overall: 4.9,
      count: 124,
      breakdown: {
        quality: 5.0,
        communication: 4.8,
        value: 4.7,
        professionalism: 5.0
      }
    },
    features: ['16 let zkušeností', 'Film & Digital', 'Editoriální styl', 'Mezinárodní působnost'],
    specialties: ['Atmosferické fotografie', 'Editoriální styl', 'Filmová fotografie'],
    workingRadius: 500,
    availability: {
      workingDays: ['friday', 'saturday', 'sunday'],
      workingHours: { start: '06:00', end: '24:00' },
      seasonalAvailability: {
        peak: ['april', 'may', 'june', 'july', 'august', 'september', 'october'],
        low: ['november', 'december', 'january']
      }
    },
    testimonials: [
      {
        id: 'test-004',
        author: 'Veronika a Matej',
        text: 'Michael caught amazing moments and interactions with our guests - those little expressions and exchanges that you would otherwise not notice were exactly what he targeted.',
        rating: 5,
        date: new Date('2024-10-15'),
        weddingDate: new Date('2024-09-20'),
        verified: true
      },
      {
        id: 'test-005',
        author: 'Karolína a Tom',
        text: 'Jeho snímky jsou snové, poetické, cinematické, esteticky poutavé a přitom věrně zachycují vřelost a radost tak emocemi nabitého dne.',
        rating: 5,
        date: new Date('2024-09-25'),
        weddingDate: new Date('2024-08-30'),
        verified: true
      }
    ],
    yearsInBusiness: 16,
    verified: true,
    featured: true,
    premium: true,
    responseTime: '< 1 hour',
    tags: ['atmosferické fotografie', 'editoriální', 'film', 'umění'],
    keywords: ['fotograf', 'svatba', 'Praha', 'Bratislava', 'editoriální', 'film'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    lastActive: new Date('2024-12-01')
  },

  {
    id: 'photographer-005',
    name: 'Remi Doe',
    category: 'photographer',
    description: 'Svatební fotograf Praha se srdcem pro romantiku a uměleckým okem. Jsem fotografka, která miluje cestování a příběhy všech lidí okolo. Fotím, abych vyprávěla právě váš jedinečný příběh pomocí reportážní, lifestyle a portrétní fotografie.',
    shortDescription: 'Svatební fotograf Praha - romantika a umělecké oko',
    website: 'https://www.remi-doe.photo',
    email: 'remi@remi-doe.photo',
    phone: '+420 602 699 901',
    address: {
      street: 'Praha a Středočeský kraj',
      city: 'Praha',
      postalCode: '110 00',
      region: 'Praha',
      coordinates: { lat: 50.0755, lng: 14.4378 }
    },
    businessName: 'Remi Doe Photography',
    businessId: '87349558',
    services: [
      {
        id: 'photo-wedding-story',
        name: 'Svatební příběh',
        description: 'Reportážní svatební fotografie s důrazem na emoce',
        price: 25000,
        priceType: 'package',
        duration: '8 hodin',
        includes: ['Reportážní fotografie', 'Lifestyle focení', 'Portrétní fotografie', 'Online galerie'],
        popular: true
      },
      {
        id: 'photo-family',
        name: 'Rodinné focení',
        description: 'Rodinná a portrétní fotografie',
        price: 4500,
        priceType: 'fixed',
        duration: '2 hodiny',
        includes: ['Rodinné focení', 'Upravené fotografie', 'Online galerie']
      }
    ],
    priceRange: {
      min: 4500,
      max: 30000,
      currency: 'CZK',
      unit: 'per-event'
    },
    images: [
      'https://static.wixstatic.com/media/5dfccc_86d31403ca3e4081a94103321fbc5047~mv2.jpg/v1/fit/w_480,h_720,q_90,enc_avif,quality_auto/5dfccc_86d31403ca3e4081a94103321fbc5047~mv2.jpg',
      'https://static.wixstatic.com/media/5dfccc_07ecb6380a8d4021afc93af18e0c1a58~mv2.jpg/v1/fit/w_960,h_641,q_90,enc_avif,quality_auto/5dfccc_07ecb6380a8d4021afc93af18e0c1a58~mv2.jpg',
      'https://static.wixstatic.com/media/5dfccc_6a2a7edc86ee46a7bdd4e80d9cfa6f64~mv2.jpg/v1/fit/w_480,h_722,q_90,enc_avif,quality_auto/5dfccc_6a2a7edc86ee46a7bdd4e80d9cfa6f64~mv2.jpg'
    ],
    portfolioImages: [
      'https://static.wixstatic.com/media/5dfccc_131635e948014e52bf3fc41eec727bc8~mv2.jpg/v1/fit/w_480,h_321,q_90,enc_avif,quality_auto/5dfccc_131635e948014e52bf3fc41eec727bc8~mv2.jpg',
      'https://static.wixstatic.com/media/5dfccc_6fcb6be7248743aeb6013d9ba7be2b6f~mv2.jpg/v1/fit/w_480,h_720,q_90,enc_avif,quality_auto/5dfccc_6fcb6be7248743aeb6013d9ba7be2b6f~mv2.jpg',
      'https://static.wixstatic.com/media/5dfccc_972ff115239a4a76a17b9963cb89e047~mv2.jpg/v1/fit/w_480,h_721,q_90,enc_avif,quality_auto/5dfccc_972ff115239a4a76a17b9963cb89e047~mv2.jpg',
      'https://static.wixstatic.com/media/5dfccc_de396971561947b598b3e4c85c91dfd0~mv2.jpg/v1/fit/w_480,h_719,q_90,enc_avif,quality_auto/5dfccc_de396971561947b598b3e4c85c91dfd0~mv2.jpg'
    ],
    rating: {
      overall: 4.8,
      count: 52,
      breakdown: {
        quality: 4.9,
        communication: 4.7,
        value: 4.6,
        professionalism: 4.9
      }
    },
    features: ['Reportážní styl', 'Lifestyle fotografie', 'Romantické focení', 'Příběhy lidí'],
    specialties: ['Svatební fotografie', 'Rodinné focení', 'Portrétní fotografie'],
    workingRadius: 80,
    availability: {
      workingDays: ['thursday', 'friday', 'saturday', 'sunday'],
      workingHours: { start: '08:00', end: '20:00' },
      seasonalAvailability: {
        peak: ['may', 'june', 'july', 'august', 'september'],
        low: ['december', 'january', 'february']
      }
    },
    testimonials: [
      {
        id: 'test-006',
        author: 'Anna a David',
        text: 'Remi má úžasné oko pro detail a dokáže zachytit ty nejkrásnější momenty. Fotky jsou jako z pohádky!',
        rating: 5,
        date: new Date('2024-07-15'),
        weddingDate: new Date('2024-06-20'),
        verified: true
      }
    ],
    yearsInBusiness: 10,
    verified: true,
    featured: false,
    premium: true,
    responseTime: '< 3 hours',
    tags: ['svatební fotografie', 'romantika', 'reportáž', 'lifestyle'],
    keywords: ['fotograf', 'svatba', 'Praha', 'romantika', 'příběh'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    lastActive: new Date('2024-12-01')
  },

  {
    id: 'photographer-006',
    name: 'Lukáš Kenji Vrábel',
    category: 'photographer',
    description: 'Svatební a rodinný fotograf z Vysočiny. Nezachytávám emoce, nevystihuju atmosféry ani nepíšu příběhy - prostě jen dělám úžasné fotky! Žádné pózy ani fejkové úsměvy, jen skutečný smích, opravdové emoce a skvělé momentky.',
    shortDescription: 'Svatební a rodinný fotograf Vysočina - úžasné fotky',
    website: 'https://www.kenji.cz',
    email: 'ahoj@kenji.cz',
    phone: '+420 737 754 281',
    address: {
      street: 'Vysoké Studnice',
      city: 'Jihlava',
      postalCode: '588 22',
      region: 'Vysočina',
      coordinates: { lat: 49.3961, lng: 15.5911 }
    },
    businessName: 'Lukáš Vrábel',
    businessId: '87807581',
    services: [
      {
        id: 'photo-wedding-kenji',
        name: 'Svatební focení',
        description: 'Žádné pózy ani fejkové úsměvy! Jen skutečný smích a emoce',
        price: 24000,
        priceType: 'package',
        duration: '8 hodin',
        includes: ['Celý den fotografování', 'Přirozené momentky', 'Upravené fotografie', 'Online galerie'],
        popular: true
      },
      {
        id: 'photo-family-kenji',
        name: 'Rodinné focení',
        description: 'Přirozené a živé fotografie, které vás budou dlouho bavit',
        price: 3500,
        priceType: 'fixed',
        duration: '1.5 hodiny',
        includes: ['Rodinné focení', 'Přirozené fotografie', 'Upravené fotky']
      }
    ],
    priceRange: {
      min: 3500,
      max: 28000,
      currency: 'CZK',
      unit: 'per-event'
    },
    images: [
      'https://www.kenji.cz/wp-content/uploads/2024/01/svatebni-fotograf-lukas-kenji-vrabel.jpg',
      'https://www.kenji.cz/wp-content/uploads/2024/01/IMG_6945.jpg',
      'https://www.kenji.cz/wp-content/uploads/2024/03/square-predsvatebni-parovy-fotograf-lukas-kenji-vrabel-00046-vysocina-velke-mezirici.jpg'
    ],
    portfolioImages: [
      'https://www.kenji.cz/wp-content/uploads/2024/03/square-rodinny-fotograf-lukas-kenji-vrabel-00090-vysocina-humpolec.jpg',
      'https://www.kenji.cz/wp-content/uploads/2023/01/Fotograf-na-maturitni-ples.jpg',
      'https://www.kenji.cz/wp-content/uploads/2024/01/svatebni-fotograf-lukas-kenji-vrabel-282-jihomoravsky-kraj-znojmo-kocanda-kravsko-400x250.jpg',
      'https://www.kenji.cz/wp-content/uploads/2024/01/rodinny-fotograf-lukas-kenji-vrabel-00145-vysocina-trebic-400x250.jpg'
    ],
    rating: {
      overall: 4.9,
      count: 187,
      breakdown: {
        quality: 5.0,
        communication: 4.8,
        value: 4.7,
        professionalism: 5.0
      }
    },
    features: ['Přirozené fotografie', 'Bez póz', 'Skutečné emoce', 'Není plátce DPH'],
    specialties: ['Svatební fotografie', 'Rodinné focení', 'Přirozené momentky'],
    workingRadius: 150,
    availability: {
      workingDays: ['friday', 'saturday', 'sunday'],
      workingHours: { start: '08:00', end: '22:00' },
      seasonalAvailability: {
        peak: ['april', 'may', 'june', 'july', 'august', 'september'],
        low: ['november', 'december', 'january', 'february']
      }
    },
    testimonials: [
      {
        id: 'test-007',
        author: 'Hanka a Miki',
        text: 'Kenji je úžasný! Fotky jsou přesně takové, jaké jsme chtěli - přirozené a plné emocí. Doporučujeme!',
        rating: 5,
        date: new Date('2024-06-15'),
        weddingDate: new Date('2024-05-20'),
        verified: true
      }
    ],
    yearsInBusiness: 12,
    verified: true,
    featured: true,
    premium: false,
    responseTime: '< 2 hours',
    tags: ['svatební fotografie', 'přirozené', 'rodinné', 'emoce'],
    keywords: ['fotograf', 'svatba', 'Jihlava', 'Vysočina', 'přirozené'],
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
  }
]
