
import { Vendor } from './types';

export const sampleVendor: Vendor = {
  id: "v1",
  name: "Folklore Garden",
  slug: "folklore-garden",
  category: "Svatební místo",
  location: "Praha 5",
  address: "Na Zlíchově 18, Praha 5 – Hlubočepy",
  coverImage: "https://images.unsplash.com/photo-1519225421980-715cb0202128?q=80&w=1920&auto=format&fit=crop",
  logoUrl: "https://ui-avatars.com/api/?name=Folklore+Garden&background=f43f5e&color=fff&size=200",
  rating: 4.9,
  reviewCount: 128,
  googleRating: 4.7,
  googleReviewCount: 342,
  priceRange: "15.000 - 150.000 Kč",
  shortDescription: "Unikátní místo s atmosférou českého venkova přímo v Praze. Tradiční hostiny, folklorní zábava a nezapomenutelné zážitky.",
  description: `Folklore Garden je jedinečné místo v srdci Prahy, které vás přenese na malebný český venkov. Nabízíme romantické prostory pro váš svatební den s nádechem tradice a folklóru.

Náš areál zahrnuje historický sál, útulnou zahradu a stylové zázemí. Jsme specialisté na tradiční české svatby, kde nechybí poctivé jídlo, cimbálová muzika a tanec.

Ať už plánujete komorní obřad nebo velkou veselku pro 200 hostů, náš tým se postará o každý detail. Zajistíme kompletní catering, výzdobu i doprovodný program.`,
  tags: ["Rustikální", "Zahrada", "Tradiční", "Catering"],
  foundedYear: 2010,
  completedWeddings: 450,
  languages: ["Čeština", "English", "Deutsch"],
  badges: ["verified", "premium", "fast_response"],
  socials: {
    instagram: "folkloregarden",
    facebook: "folkloregardenprague",
    website: "https://www.folkloregarden.cz"
  },
  phone: "+420 724 334 340",
  email: "akce@folkloregarden.cz",
  coordinates: { lat: 50.0448, lng: 14.4063 },
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&mute=1&controls=0&showinfo=0&rel=0", // Placeholder video
  gallery: [
    { id: "1", url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80", category: "Prostory" },
    { id: "2", url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80", category: "Oslava" },
    { id: "3", url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80", category: "Detaily" },
    { id: "4", url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80", category: "Obřad" },
    { id: "5", url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80", category: "Zahrada" },
    { id: "6", url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80", category: "Catering" },
  ],
  services: [
    {
      id: "s1",
      title: "Pronájem - Obřad",
      description: "Pronájem zahrady pro svatební obřad (2h).",
      price: "15.000 Kč",
      features: ["Příprava místa", "Slavobrána", "Zvučení"],
      isPopular: false
    },
    {
      id: "s2",
      title: "Svatební hostina",
      description: "Pronájem sálu a zahrady pro hostinu vč. cateringu (cena za osobu).",
      price: "2.500 Kč / os",
      features: ["Pronájem prostor", "3-chodové menu", "Večerní raut", "Neomezené nápoje"],
      isPopular: true
    },
    {
      id: "s3",
      title: "All Inclusive Párty",
      description: "Kompletní zajištění svatby včetně programu a ubytování.",
      price: "Individuální",
      features: ["Koordinace", "Hudební produkce", "Folklorní vystoupení", "Ubytování novomanželů"],
      isPopular: false
    }
  ],
  reviews: [
    // Svatbot Reviews
    {
      id: "r1",
      author: "Martina & Petr",
      rating: 5,
      date: "15. září 2023",
      weddingDate: "2. září 2023",
      content: "Kouzelné místo! Zahrada je nádherná a jídlo bylo fantastické. Všichni hosté si pochvalovali atmosféru.",
      avatarUrl: "https://picsum.photos/id/1005/50/50",
      source: 'svatbot'
    },
    {
      id: "r2",
      author: "Jana K.",
      rating: 5,
      date: "20. srpna 2023",
      content: "Organizace na jedničku. Personál byl milý a ochotný, nic nebyl problém.",
      avatarUrl: "https://picsum.photos/id/1011/50/50",
      source: 'svatbot'
    },
    {
      id: "r3",
      author: "Tomáš Veselý",
      rating: 4,
      date: "10. července 2023",
      content: "Krásné prostředí, jen v sále bylo večer trochu teplo. Ale jinak super zážitek.",
      source: 'svatbot'
    },
    {
      id: "r4",
      author: "Veronika S.",
      rating: 5,
      date: "5. června 2023",
      content: "Tradiční česká svatba se vším všudy. Folklorní vystoupení bylo třešničkou na dortu.",
      source: 'svatbot'
    },
    {
      id: "r5",
      author: "David & Lenka",
      rating: 5,
      date: "22. května 2023",
      content: "Děkujeme za nejkrásnější den v životě!",
      source: 'svatbot'
    },
    // Google Reviews
    {
      id: "g1",
      author: "Karel Novák",
      rating: 5,
      date: "před měsícem",
      content: "Skvělé jídlo a pivo! Zábava byla perfektní, tanečníci úžasní. Doporučuji všem turistům i místním.",
      source: 'google'
    },
    {
      id: "g2",
      author: "Anna Dvořáková",
      rating: 5,
      date: "před 2 měsíci",
      content: "Měli jsme zde firemní večírek a nemělo to chybu. Krásné prostředí Hlubočep.",
      source: 'google'
    },
    {
      id: "g3",
      author: "Petr Svoboda",
      rating: 4,
      date: "před 3 měsíci",
      content: "Příjemná obsluha, hezká zahrádka. Ceny trochu vyšší, ale odpovídají kvalitě.",
      source: 'google'
    },
    {
      id: "g4",
      author: "Lucie Malá",
      rating: 5,
      date: "před 4 měsíci",
      content: "Úžasná atmosféra, člověk se cítí jako na vesnici a přitom je v Praze.",
      source: 'google'
    },
    {
      id: "g5",
      author: "Jan Procházka",
      rating: 5,
      date: "před 5 měsíci",
      content: "Navštívili jsme folklorní večer a moc jsme si to užili.",
      source: 'google'
    }
  ]
};
