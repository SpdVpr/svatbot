import React, { useState, useEffect } from 'react';
import { NAV_ITEMS, COUPLE } from '../../constants';
import { Menu, X } from 'lucide-react';

export const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-cream text-black py-4 shadow-md' : 'bg-transparent text-cream py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <div className={`font-serif text-2xl font-bold tracking-tighter cursor-pointer ${isScrolled ? 'text-black' : 'text-white mix-blend-difference'}`} onClick={() => window.scrollTo(0,0)}>
            {COUPLE.groom.name.split(' ')[0]} & {COUPLE.bride.name.split(' ')[0]}
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex space-x-8">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-sm uppercase tracking-widest hover:text-accent transition-colors ${isScrolled ? 'text-black' : 'text-white mix-blend-difference'}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <div className="lg:hidden">
            <button onClick={() => setIsMobileOpen(true)} className={`${isScrolled ? 'text-black' : 'text-white mix-blend-difference'}`}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-center animate-reveal">
          <button onClick={() => setIsMobileOpen(false)} className="absolute top-6 right-6 text-cream">
            <X size={32} />
          </button>
          <div className="flex flex-col space-y-8 text-center">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="font-serif text-4xl text-cream hover:text-accent transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};