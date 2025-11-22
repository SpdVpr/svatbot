
import React, { useState, useEffect } from 'react';
import { VendorHero } from './components/VendorHero';
import { VendorTabs } from './components/VendorTabs';
import { OverviewSection } from './components/sections/OverviewSection';
import { GallerySection } from './components/sections/GallerySection';
import { VideoSection } from './components/sections/VideoSection';
import { ReviewsSection } from './components/sections/ReviewsSection';
import { StickySidebar } from './components/StickySidebar';
import { ContactForm } from './components/ContactForm';
import { Marketplace } from './components/Marketplace';
import { sampleVendor } from './constants';
import { TabType } from './types';

type ViewState = 'marketplace' | 'vendor-detail';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('marketplace');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showMobileContact, setShowMobileContact] = useState(false);

  // Reset scroll when changing views
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  // Handle scroll to section in Detail View
  const scrollToSection = (id: TabType) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 180; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveTab(id);
    }
  };

  // Navigation Handlers
  const handleVendorClick = (vendorId: string) => {
    // In a real app, we would load data based on ID. 
    // Here we just switch to the single detail view we have.
    setCurrentView('vendor-detail');
  };

  const handleGoHome = () => {
    setCurrentView('marketplace');
  };

  // --------------------------------------------------------------------------
  // RENDER: MARKETPLACE VIEW
  // --------------------------------------------------------------------------
  if (currentView === 'marketplace') {
    return <Marketplace onVendorClick={handleVendorClick} />;
  }

  // --------------------------------------------------------------------------
  // RENDER: VENDOR DETAIL VIEW
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      {/* Navigation Bar */}
      <nav className="h-16 bg-white/90 backdrop-blur-md border-b border-stone-100 sticky top-0 z-50 flex items-center justify-between px-4 md:px-8">
        <div 
          onClick={handleGoHome}
          className="text-xl font-serif font-extrabold tracking-tight text-stone-900 flex items-center cursor-pointer"
        >
          Svatbot<span className="text-primary-300">.</span>
        </div>
        <div className="flex gap-6 items-center">
           <button onClick={handleGoHome} className="text-sm font-bold text-stone-600 hover:text-primary-600 hidden md:block transition-colors">
             Zpět na výpis
           </button>
           <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs">
             JD
           </div>
        </div>
      </nav>

      <main className="flex-grow pb-24 pt-6 px-4 md:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Modern Split Hero Section */}
          <VendorHero vendor={sampleVendor} />

          <div className="flex flex-col xl:flex-row gap-8 mt-8 relative">
            
            {/* Main Content Column */}
            <div className="flex-1 min-w-0">
              
              {/* Sticky Tabs */}
              <VendorTabs activeTab={activeTab} onTabChange={scrollToSection} />
              
              {/* One Page Content Flow */}
              <div className="flex flex-col gap-12 md:gap-16 mt-8">
                <section id="overview" className="scroll-mt-32">
                  <OverviewSection vendor={sampleVendor} />
                </section>

                {sampleVendor.videoUrl && (
                  <section id="video" className="scroll-mt-32">
                    <VideoSection videoUrl={sampleVendor.videoUrl} coverImage={sampleVendor.coverImage} />
                  </section>
                )}
                
                <section id="gallery" className="scroll-mt-32">
                  <GallerySection images={sampleVendor.gallery} />
                </section>
                
                <section id="reviews" className="scroll-mt-32">
                  <ReviewsSection reviews={sampleVendor.reviews} rating={sampleVendor.rating} reviewCount={sampleVendor.reviewCount} />
                </section>

                {/* Mobile only contact section at bottom of content */}
                <section id="contact" className="xl:hidden scroll-mt-32 bg-white p-6 rounded-2xl border border-stone-100">
                  <h2 className="text-2xl font-serif font-bold mb-6 text-stone-900">Kontakt</h2>
                  <ContactForm />
                </section>
              </div>
            </div>

            {/* Sidebar - Sticky on Desktop (Right Side) */}
            <div className="hidden xl:block w-[400px] flex-shrink-0">
              <div className="sticky top-24">
                <StickySidebar vendor={sampleVendor} />
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-stone-200 xl:hidden z-40 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col">
          <span className="text-xs text-stone-500">Cena od</span>
          <span className="font-bold font-serif text-lg">{sampleVendor.priceRange.split('-')[0]}</span>
        </div>
        <button 
          onClick={() => setShowMobileContact(true)}
          className="bg-primary-300 text-stone-900 px-6 py-3 rounded-full font-bold hover:bg-primary-400 transition-colors shadow-lg shadow-primary-300/20"
        >
          Ověřit termín
        </button>
      </div>

      {/* Mobile Contact Modal */}
      {showMobileContact && (
        <div className="fixed inset-0 z-[60] bg-stone-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-stone-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="font-serif text-xl font-bold">Kontaktovat</h3>
              <button onClick={() => setShowMobileContact(false)} className="p-2 hover:bg-stone-100 rounded-full">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6">
              <ContactForm />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
