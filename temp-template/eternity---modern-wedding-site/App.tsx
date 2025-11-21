import React from 'react';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import StorySection from './components/StorySection';
import LocationSection from './components/LocationSection';
import DressCodeSection from './components/DressCodeSection';
import ScheduleSection from './components/ScheduleSection';
import RSVPSection from './components/RSVPSection';
import AccommodationSection from './components/AccommodationSection';
import GiftSection from './components/GiftSection';
import GallerySection from './components/GallerySection';
import MenuSection from './components/MenuSection';
import ContactSection from './components/ContactSection';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen font-sans text-gray-800 bg-light selection:bg-secondary selection:text-white">
      <Navigation />
      
      <main>
        <HeroSection id="hero" />
        <StorySection id="story" />
        <LocationSection id="location" />
        <DressCodeSection id="dresscode" />
        <ScheduleSection id="schedule" />
        <RSVPSection id="rsvp" />
        <AccommodationSection id="accommodation" />
        <GiftSection id="gifts" />
        <GallerySection id="gallery" />
        <MenuSection id="menu" />
        <ContactSection id="contact" />
        <FAQSection id="faq" />
      </main>

      <Footer />
    </div>
  );
};

export default App;