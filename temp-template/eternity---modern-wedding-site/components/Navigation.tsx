import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { NavItem } from '../types';

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems: NavItem[] = [
    { label: 'Náš příběh', href: '#story' },
    { label: 'Místo', href: '#location' },
    { label: 'Harmonogram', href: '#schedule' },
    { label: 'Ubytování', href: '#accommodation' },
    { label: 'Dary', href: '#gifts' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed w-full z-[60] transition-all duration-500 ${
        scrolled ? 'bg-cream/90 backdrop-blur-md border-b border-primary/5 py-4' : 'bg-transparent py-8'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <a href="#hero" className={`font-display-italic text-3xl font-bold tracking-wider transition-colors z-50 ${scrolled || isOpen ? 'text-primary' : 'text-white'}`}>
            A & J
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`text-xs uppercase tracking-[0.2em] font-medium hover:text-accent transition-colors relative group ${
                  scrolled ? 'text-primary' : 'text-white/90 hover:text-white'
                }`}
              >
                {item.label}
                <span className="absolute -bottom-2 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
            <a 
              href="#rsvp" 
              className={`px-6 py-2 border text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 ${
                scrolled 
                  ? 'border-primary text-primary hover:bg-primary hover:text-cream' 
                  : 'border-white text-white hover:bg-white hover:text-primary'
              }`}
            >
              RSVP
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden z-50 text-current focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="w-8 h-8 text-primary" />
            ) : (
              <Menu className={`w-8 h-8 ${scrolled ? 'text-primary' : 'text-white'}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-cream z-40 flex flex-col items-center justify-center transition-all duration-500 transform ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="flex flex-col items-center space-y-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-primary font-serif text-3xl italic"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a 
              href="#rsvp" 
              onClick={() => setIsOpen(false)}
              className="px-8 py-3 border border-primary text-primary uppercase tracking-widest hover:bg-primary hover:text-cream transition-colors mt-4"
            >
              Potvrdit účast
            </a>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;