import React from 'react';
import { Navigation } from './components/sections/Navigation';
import { HeroSection } from './components/sections/HeroSection';
import { StorySection } from './components/sections/StorySection';
import { LocationSection } from './components/sections/LocationSection';
import { DressCodeSection } from './components/sections/DressCodeSection';
import { ScheduleSection } from './components/sections/ScheduleSection';
import { RSVPSection } from './components/sections/RSVPSection';
import { AccommodationSection } from './components/sections/AccommodationSection';
import { GiftSection } from './components/sections/GiftSection';
import { GallerySection } from './components/sections/GallerySection';
import { MenuSection } from './components/sections/MenuSection';
import { ContactSection } from './components/sections/ContactSection';
import { FAQSection } from './components/sections/FAQSection';
import { Footer } from './components/sections/Footer';
import { Marquee } from './components/ui/Marquee';
import { COUPLE } from './constants';

function App() {
  return (
    <main className="min-h-screen selection:bg-black selection:text-cream">
      <Navigation />
      <HeroSection />
      <Marquee text={`${COUPLE.tagline} • ${COUPLE.date} • ${COUPLE.hashtag}`} />
      <StorySection />
      <LocationSection />
      <ScheduleSection />
      <DressCodeSection />
      <MenuSection />
      <AccommodationSection />
      <GiftSection />
      <GallerySection />
      <ContactSection />
      <FAQSection />
      <RSVPSection />
      <Footer />
    </main>
  );
}

export default App;