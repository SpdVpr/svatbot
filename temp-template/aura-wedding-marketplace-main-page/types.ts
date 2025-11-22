
export type ReviewSource = 'svatbot' | 'google';

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  content: string;
  weddingDate?: string;
  avatarUrl?: string;
  source: ReviewSource;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  features: string[];
  isPopular?: boolean;
}

export interface GalleryImage {
  id: string;
  url: string;
  category: string;
  width?: number;
  height?: number;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  website?: string;
}

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  category: string;
  location: string;
  address: string; // New specific address field
  coverImage: string;
  logoUrl: string;
  rating: number; // Svatbot rating
  reviewCount: number; // Svatbot count
  googleRating: number; // Google rating
  googleReviewCount: number; // Google count
  priceRange: string; // e.g. "25.000 - 45.000 Kč"
  description: string;
  shortDescription: string;
  tags: string[];
  foundedYear: number;
  completedWeddings: number;
  languages: string[];
  badges: ('verified' | 'premium' | 'fast_response')[];
  gallery: GalleryImage[];
  services: Service[];
  reviews: Review[];
  socials: SocialLinks;
  phone: string;
  email: string;
  coordinates: { lat: number; lng: number };
  videoUrl?: string;
}

export type TabType = 'overview' | 'video' | 'gallery' | 'reviews' | 'contact';
