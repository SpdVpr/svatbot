import { 
    Heart, 
    Music, 
    Utensils, 
    Camera, 
    Wine, 
    MapPin, 
    Clock,
    Info
  } from 'lucide-react';
  import { 
    Profile, 
    TimelineEvent, 
    LocationDetails, 
    PaletteColor, 
    Hotel, 
    RegistryItem, 
    Charity, 
    MenuCategory, 
    ContactPerson, 
    FAQItem, 
    NavItem 
  } from './types';
  
  export const COUPLE = {
    groom: {
      name: "Petr Novák",
      description: "Architekt s láskou k minimalismu a starým autům.",
      photo: "https://picsum.photos/id/1005/600/800",
      hobbies: ["Architektura", "Veteráni", "Jazz"],
    } as Profile,
    bride: {
      name: "Jana Svobodová",
      description: "Grafická designérka, milovnice kávy a francouzských filmů.",
      photo: "https://picsum.photos/id/331/600/800",
      hobbies: ["Design", "Art", "Cestování"],
    } as Profile,
    date: "15.06.2025",
    hashtag: "#JanaPetr2025",
    tagline: "A Celebration of Love & Style",
    mainImage: "https://picsum.photos/id/338/1920/1200",
    story: {
      met: {
        title: "Jak jsme se poznali",
        text: "Bylo to v malé kavárně v Paříži. Oba jsme sáhli po posledním croissantu. Nakonec jsme se o něj rozdělili a povídali si další čtyři hodiny.",
        date: "12.05.2020",
        photo: "https://picsum.photos/id/64/800/600"
      },
      proposal: {
        title: "Žádost o ruku",
        text: "Petr mě vzal na střechu galerie, kde jsme měli první rande. Bylo to při západu slunce, jen my dva a lahev vína.",
        date: "24.12.2023",
        photo: "https://picsum.photos/id/1027/800/600"
      }
    }
  };
  
  export const LOCATIONS = {
    ceremony: {
      title: "Obřad",
      time: "13:00",
      placeName: "Zámecká Zahrada",
      address: "Zámek Červená Lhota 1, 378 21",
      mapUrl: "https://maps.google.com",
      photo: "https://picsum.photos/id/122/800/600"
    } as LocationDetails,
    reception: {
      title: "Hostina",
      time: "16:30",
      placeName: "Hlavní Sál",
      address: "Zámek Červená Lhota 1, 378 21",
      mapUrl: "https://maps.google.com",
      photo: "https://picsum.photos/id/269/800/600"
    } as LocationDetails,
    parking: "Parkování je zajištěno přímo v areálu zámku. Pro hosty je vyhrazeno parkoviště P2.",
    accessibility: "Celý areál je bezbariérový."
  };
  
  export const DRESS_CODE = {
    title: "Black Tie Optional",
    description: "Prosíme pány o tmavý oblek a dámy o dlouhé šaty nebo elegantní koktejlky. Vyhněte se prosím bílé barvě.",
    palette: [
      { name: "Noir", hex: "#1a1a1a" },
      { name: "Champagne", hex: "#f2f0ea" },
      { name: "Gold", hex: "#d4b0aa" },
      { name: "Olive", hex: "#556b2f" },
    ] as PaletteColor[],
    inspirationPhotos: [
      "https://picsum.photos/id/433/400/600",
      "https://picsum.photos/id/447/400/600",
      "https://picsum.photos/id/655/400/600"
    ]
  };
  
  export const TIMELINE: TimelineEvent[] = [
    { time: "13:00", title: "Welcome Drink", description: "Přípitek na nádvoří", location: "Nádvoří", icon: Wine },
    { time: "14:00", title: "Obřad", description: "Své ano si řekneme v zahradě", location: "Zahrada", icon: Heart },
    { time: "15:00", title: "Focení", description: "Společné focení", location: "Park", icon: Camera },
    { time: "16:30", title: "Hostina", description: "Slavnostní oběd", location: "Sál", icon: Utensils },
    { time: "19:00", title: "Party", description: "Tanec a zábava", location: "Sál & Terasa", icon: Music },
  ];
  
  export const ACCOMMODATION: Hotel[] = [
    {
      name: "Grand Hotel",
      description: "Luxusní ubytování 5 minut od zámku.",
      address: "Hlavní 1, Červená Lhota",
      contact: "+420 123 456 789",
      photo: "https://picsum.photos/id/1040/600/400",
      rooms: [
        { name: "Standard", description: "Dvoulůžkový pokoj", price: "2000 Kč", capacity: "2 os.", available: 5 },
        { name: "Suite", description: "Apartmá s výhledem", price: "4000 Kč", capacity: "2-4 os.", available: 2 }
      ]
    },
    {
      name: "Penzion U Jezera",
      description: "Útulný rodinný penzion.",
      address: "Jezerní 45, Červená Lhota",
      contact: "+420 987 654 321",
      photo: "https://picsum.photos/id/1039/600/400",
      rooms: [
        { name: "Pokoj", description: "Dvoulůžkový pokoj", price: "1200 Kč", capacity: "2 os.", available: 10 }
      ]
    }
  ];
  
  export const GIFTS = {
    message: "Největším darem je pro nás vaše přítomnost. Pokud byste nás chtěli obdarovat, budeme rádi za příspěvek na svatební cestu.",
    account: "1234567890/0100",
    registry: [
      { name: "Kávovar", url: "#", description: "Model XYZ" },
      { name: "Sada nožů", url: "#", description: "Japonská ocel" }
    ] as RegistryItem[],
    charity: {
      name: "Útulek pro psy",
      description: "Místo daru můžete přispět na pejsky.",
      url: "#"
    } as Charity
  };
  
  export const MENUS = {
    food: [
      {
        title: "Předkrmy",
        items: [
          { name: "Hovězí carpaccio", description: "S lanýžovým olejem a parmazánem", allergens: "1, 7" },
          { name: "Kozí sýr", description: "S červenou řepou a vlašskými ořechy", allergens: "7, 8" }
        ]
      },
      {
        title: "Hlavní chody",
        items: [
          { name: "Svíčková na smetaně", description: "Karlovarský knedlík, brusinky", allergens: "1, 3, 7, 9, 10" },
          { name: "Grilovaný Losos", description: "Chřestové ragú, holandská omáčka", allergens: "4, 7" }
        ]
      }
    ] as MenuCategory[],
    drinks: [
      {
        title: "Vína",
        items: [
          { name: "Chardonnay", description: "2018, Pozdní sběr" },
          { name: "Merlot", description: "2016, Barrique" }
        ]
      }
    ] as MenuCategory[]
  };
  
  export const CONTACTS: ContactPerson[] = [
    { name: "Anna Dvořáková", role: "Svědkyně", phone: "+420 777 111 222", email: "anna@example.com" },
    { name: "Karel Nový", role: "Svědek", phone: "+420 777 333 444", email: "karel@example.com" }
  ];
  
  export const FAQS: FAQItem[] = [
    { question: "Do kdy potvrdit účast?", answer: "Prosíme o potvrzení do 15.05.2025." },
    { question: "Mohu vzít děti?", answer: "Svatba je koncipována jako 'Adults Only'." },
    { question: "Bude zajištěn odvoz?", answer: "Ano, taxi služba bude k dispozici od 22:00." }
  ];
  
  export const NAV_ITEMS: NavItem[] = [
    { id: 'uvod', label: 'Úvod' },
    { id: 'pribeh', label: 'Příběh' },
    { id: 'misto', label: 'Místo' },
    { id: 'harmonogram', label: 'Program' },
    { id: 'rsvp', label: 'RSVP' },
    { id: 'ubytovani', label: 'Ubytování' },
    { id: 'menu', label: 'Menu' },
    { id: 'kontakt', label: 'Kontakt' },
  ];