
import { Vendor } from './types';
import { 
  Camera, Music, Flower2, Home, Utensils, Car, Shirt, Gift, Video, Gem, Cake, 
  Palette, ClipboardList, Mail, Bed, LayoutGrid, Heart, PartyPopper, MoreHorizontal, 
  Printer, Scissors, User, Brush, CalendarHeart
} from 'lucide-react';

export const sampleVendor: Vendor = {
  id: "v1",
  name: "Folklore Garden",
  slug: "folklore-garden",
  category: "Místo konání",
  location: "Praha 5",
  address: "Na Zlíchově 18, Praha 5 – Hlubočepy",
  coverImage: "https://images.unsplash.com/photo-1519225421980-715cb0202128?q=80&w=1920&auto=format&fit=crop",
  logoUrl: "https://ui-avatars.com/api/?name=Folklore+Garden&background=F8BBD9&color=1c1917&size=200",
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


// ---------------------------------------------------------------------------
// MOCK DATA FOR MARKETPLACE
// ---------------------------------------------------------------------------

// Total 20 Categories EXACTLY as requested
export const CATEGORIES = [
  { name: 'Vše', icon: LayoutGrid },
  { name: 'Oblíbené', icon: Heart },
  { name: 'Fotograf', icon: Camera },
  { name: 'Kameraman', icon: Video },
  { name: 'Catering', icon: Utensils },
  { name: 'Místo konání', icon: Home },
  { name: 'Hudba/DJ', icon: Music },
  { name: 'Květiny', icon: Flower2 },
  { name: 'Dekorace', icon: Gift },
  { name: 'Doprava', icon: Car },
  { name: 'Vzhled', icon: Brush },
  { name: 'Svatební šaty', icon: Scissors }, // Scissors as "Tailoring/Dressmaking"
  { name: 'Oblek', icon: User }, // User/Groom
  { name: 'Šperky', icon: Gem },
  { name: 'Dort', icon: Cake },
  { name: 'Zábava', icon: PartyPopper },
  { name: 'Ubytování', icon: Bed },
  { name: 'Koordinátor', icon: ClipboardList },
  { name: 'Tiskoviny', icon: Mail },
  { name: 'Ostatní', icon: MoreHorizontal },
];

// Generate a few variations for the grid
export const MOCK_VENDORS: Vendor[] = [
  sampleVendor, // Our detailed one
  {
    ...sampleVendor,
    id: "v2",
    name: "Zámek Třebešice",
    category: "Místo konání",
    location: "Střední Čechy",
    rating: 4.8,
    reviewCount: 86,
    googleRating: 4.5,
    googleReviewCount: 120,
    priceRange: "45.000 - 200.000 Kč",
    coverImage: "https://images.unsplash.com/photo-1544982503-9f984c14501a?q=80&w=800&auto=format&fit=crop",
    badges: ["verified"],
    tags: ["Zámek", "Luxusní", "Ubytování"]
  },
  {
    ...sampleVendor,
    id: "v3",
    name: "Lukas Kopecky Photography",
    category: "Fotograf",
    location: "Celá ČR",
    rating: 5.0,
    reviewCount: 42,
    googleRating: 5.0,
    googleReviewCount: 89,
    priceRange: "25.000 - 45.000 Kč",
    coverImage: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=800&auto=format&fit=crop",
    badges: ["verified", "premium"],
    tags: ["Dokumentární", "Fine Art", "Portrét"]
  },
  {
    ...sampleVendor,
    id: "v4",
    name: "DJ Pavel V.",
    category: "Hudba/DJ",
    location: "Praha",
    rating: 4.6,
    reviewCount: 28,
    googleRating: 4.8,
    googleReviewCount: 12,
    priceRange: "15.000 - 25.000 Kč",
    coverImage: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=800&auto=format&fit=crop",
    badges: ["fast_response"],
    tags: ["Párty", "Moderování", "Světla"]
  },
  {
    ...sampleVendor,
    id: "v5",
    name: "Květinářství Louka",
    category: "Květiny",
    location: "Brno",
    rating: 4.9,
    reviewCount: 156,
    googleRating: 0, // Simulate no google reviews
    googleReviewCount: 0,
    priceRange: "10.000 - 50.000 Kč",
    coverImage: "https://images.unsplash.com/photo-1563241527-942bf41d1d5d?q=80&w=800&auto=format&fit=crop",
    badges: ["verified"],
    tags: ["Luční kvítí", "Vázání", "Výzdoba"]
  },
  {
    ...sampleVendor,
    id: "v6",
    name: "Svatební stodola V.",
    category: "Místo konání",
    location: "Vysočina",
    rating: 4.7,
    reviewCount: 55,
    googleRating: 4.2,
    googleReviewCount: 230,
    priceRange: "30.000 - 80.000 Kč",
    coverImage: "https://images.unsplash.com/photo-1510076857177-7470076d4098?q=80&w=800&auto=format&fit=crop",
    badges: [],
    tags: ["Stodola", "Příroda", "Soukromí"]
  }
];
