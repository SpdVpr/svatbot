import { LucideIcon } from 'lucide-react';

export interface Profile {
  name: string;
  description: string;
  photo: string;
  hobbies: string[];
}

export interface TimelineEvent {
  time: string;
  title: string;
  description: string;
  location?: string;
  icon?: LucideIcon;
}

export interface LocationDetails {
  title: string;
  time: string;
  placeName: string;
  address: string;
  mapUrl: string;
  photo: string;
}

export interface PaletteColor {
  hex: string;
  name: string;
}

export interface AccommodationRoom {
  name: string;
  description: string;
  price: string;
  capacity: string;
  available: number;
}

export interface Hotel {
  name: string;
  description: string;
  address: string;
  contact: string;
  photo: string;
  rooms: AccommodationRoom[];
}

export interface RegistryItem {
  name: string;
  url?: string;
  description?: string;
}

export interface Charity {
  name: string;
  description: string;
  url: string;
}

export interface MenuCourse {
  name: string;
  description: string;
  allergens?: string;
}

export interface MenuCategory {
  title: string; // "Starter", "Main", "Wine"
  description?: string;
  items: MenuCourse[];
}

export interface ContactPerson {
  name: string;
  role: string;
  phone: string;
  email: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface NavItem {
  id: string;
  label: string;
}