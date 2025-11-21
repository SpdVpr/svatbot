export interface SectionProps {
  id: string;
  className?: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface TimelineEvent {
  time: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface Profile {
  name: string;
  role: string;
  description: string;
  image: string;
  hobbies: string[];
}

export interface AccommodationItem {
  name: string;
  description: string;
  address: string;
  price?: string;
  image: string;
  url?: string;
}