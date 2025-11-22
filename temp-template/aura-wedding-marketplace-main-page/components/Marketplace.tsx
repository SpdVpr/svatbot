
import React, { useState } from 'react';
import { Search, MapPin, SlidersHorizontal, ArrowRight, ShieldCheck, Users } from 'lucide-react';
import { CATEGORIES, MOCK_VENDORS } from '../constants';
import { VendorCard } from './VendorCard';

interface MarketplaceProps {
  onVendorClick: (id: string) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ onVendorClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Simple mock filtering
  const filteredVendors = MOCK_VENDORS.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || v.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* 1. NAVBAR (Simplified for Marketplace) */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-stone-100 sticky top-0 z-50 px-6 h-16 flex items-center justify-between">
        <div className="text-xl font-serif font-extrabold tracking-tight text-stone-900">
          Svatbot<span className="text-primary-300">.</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-bold text-stone-600">
          <a href="#" className="hover:text-primary-500 transition-colors">Marketplace</a>
          <a href="#" className="hover:text-primary-500 transition-colors">Inspirace</a>
          <a href="#" className="hover:text-primary-500 transition-colors">Pro dodavatele</a>
        </div>
        <div className="flex gap-3">
          <button className="text-sm font-bold text-stone-600 px-4 py-2 hover:bg-stone-50 rounded-full transition-colors">
            Přihlásit
          </button>
          <button className="bg-stone-900 text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-stone-800 transition-colors shadow-lg shadow-stone-200">
            Registrovat
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <div className="relative bg-stone-900 text-white overflow-hidden min-h-[500px] md:h-[600px] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2000&auto=format&fit=crop" 
            alt="Wedding Background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/80 via-stone-900/40 to-stone-900/90" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl px-4 w-full">
          <span className="inline-block py-1 px-3 rounded-full bg-primary-300/20 backdrop-blur-md border border-primary-300/40 text-primary-100 text-xs font-bold tracking-wider uppercase mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Svatbot Marketplace
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Najděte ty nejlepší profesionály <br className="hidden md:block"/> pro vaši svatbu snů.
          </h1>
          <p className="text-lg text-stone-200 mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Od kouzelných míst až po talentované fotografy. Vše na jednom místě, ověřené a s garancí kvality.
          </p>

          {/* Search Bar */}
          <div className="bg-white p-2 rounded-full max-w-3xl mx-auto flex flex-col md:flex-row gap-2 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
             <div className="flex-1 flex items-center px-4 md:border-r border-stone-100 py-3 md:py-0">
                <Search className="text-stone-400 mr-3" size={20} />
                <input 
                  type="text" 
                  placeholder="Co hledáte? (např. Fotograf, Zámek...)" 
                  className="w-full outline-none text-stone-800 placeholder:text-stone-400 font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="flex-1 flex items-center px-4 py-3 md:py-0">
                <MapPin className="text-stone-400 mr-3" size={20} />
                <input 
                  type="text" 
                  placeholder="Kde? (Praha, Brno...)" 
                  className="w-full outline-none text-stone-800 placeholder:text-stone-400 font-medium"
                />
             </div>
             <button className="bg-primary-300 text-stone-900 px-8 py-3 md:py-4 rounded-full font-bold hover:bg-primary-400 transition-all hover:shadow-lg hover:shadow-primary-300/30">
               Hledat
             </button>
          </div>
        </div>
      </div>

      {/* 3. CATEGORIES GRID */}
      <div className="py-12 px-4 md:px-6 lg:px-8 max-w-[1800px] mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-serif font-bold text-stone-900">Kategorie</h2>
          <a href="#" className="text-stone-500 font-bold text-xs uppercase tracking-wide hover:text-primary-500 flex items-center gap-1">
            Všechny kategorie <ArrowRight size={14} />
          </a>
        </div>
        
        {/* Responsive Grid: 2 cols mobile, 4 cols tablet, 5 cols small laptop, 10 cols large desktop */}
        {/* Since we have exactly 20 items, lg:grid-cols-10 creates exactly 2 rows. */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.name || (activeCategory === 'all' && cat.name === 'Vše');
            return (
              <button 
                key={idx}
                onClick={() => setActiveCategory(cat.name === 'Vše' ? 'all' : cat.name)}
                className={`
                  flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 group h-[110px] relative overflow-hidden
                  ${isSelected
                    ? 'bg-primary-300 text-stone-900 border-primary-300 shadow-lg shadow-primary-300/20'
                    : 'bg-white border-stone-100 hover:border-primary-200 hover:shadow-md text-stone-600 hover:bg-primary-50'
                  }
                `}
              >
                <div className={`
                  mb-2 p-2.5 rounded-full transition-colors border
                  ${isSelected
                    ? 'bg-white/30 text-stone-900 border-transparent'
                    : 'bg-white text-primary-500 border-primary-100 group-hover:bg-white group-hover:text-primary-600 group-hover:border-primary-200'
                  }
                `}>
                  <Icon size={20} />
                </div>
                <span className="font-bold text-xs text-center leading-tight">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. FILTERING & LISTING */}
      <div className="bg-stone-50 py-12 px-4 md:px-8 flex-grow border-t border-stone-100">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Filter Toolbar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
             <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                <button className="flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-lg text-sm font-bold text-stone-700 hover:bg-stone-200 transition-colors whitespace-nowrap">
                  <SlidersHorizontal size={16} /> Filtry
                </button>
                <button className="px-4 py-2 border border-stone-200 rounded-lg text-sm font-medium text-stone-600 hover:border-stone-300 whitespace-nowrap hover:bg-stone-50">
                  Cena
                </button>
                <button className="px-4 py-2 border border-stone-200 rounded-lg text-sm font-medium text-stone-600 hover:border-stone-300 whitespace-nowrap hover:bg-stone-50">
                  Lokalita
                </button>
                <button className="px-4 py-2 border border-stone-200 rounded-lg text-sm font-medium text-stone-600 hover:border-stone-300 whitespace-nowrap hover:bg-stone-50">
                  Dostupnost
                </button>
             </div>
             <div className="flex items-center gap-2 text-sm text-stone-500">
               <span>Seřadit podle:</span>
               <select className="bg-transparent font-bold text-stone-900 outline-none cursor-pointer hover:text-primary-600">
                 <option>Doporučené</option>
                 <option>Nejvyšší hodnocení</option>
                 <option>Nejnižší cena</option>
               </select>
             </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} onClick={onVendorClick} />
            ))}
          </div>
          
          {/* Empty State */}
          {filteredVendors.length === 0 && (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">Žádné výsledky</h3>
              <p className="text-stone-500">Zkuste upravit filtry nebo hledaný výraz.</p>
            </div>
          )}

          {/* Load More */}
          {filteredVendors.length > 0 && (
            <div className="mt-12 text-center">
              <button className="px-8 py-3 border border-stone-200 bg-white rounded-full font-bold text-stone-600 hover:bg-primary-300 hover:border-primary-300 hover:text-stone-900 transition-all shadow-sm hover:shadow-md">
                Načíst další
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. CTA FOR VENDORS - Light Theme to contrast with Dark Footer */}
      <div className="relative py-24 px-4 overflow-hidden bg-gradient-to-br from-primary-50 via-white to-purple-50 border-t border-primary-100">
         <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
               <span className="inline-block py-1 px-3 rounded-full bg-primary-100 text-primary-700 text-[10px] font-bold tracking-wider uppercase mb-4">
                 Pro profesionály
               </span>
               <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">
                 Jste svatební profesionál?
               </h2>
               <p className="text-stone-600 text-lg mb-8 leading-relaxed">
                 Přidejte se k největší komunitě svatebních dodavatelů v Česku. Získejte více poptávek a budujte svou značku s námi.
               </p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                 <button className="bg-primary-300 text-stone-900 px-8 py-4 rounded-xl font-bold hover:bg-primary-400 transition-all shadow-xl shadow-primary-300/20">
                   Chci se registrovat
                 </button>
                 <button className="bg-white border border-stone-200 text-stone-600 px-8 py-4 rounded-xl font-bold hover:bg-stone-50 hover:text-stone-900 transition-all shadow-sm">
                   Jak to funguje?
                 </button>
               </div>
            </div>
            
            {/* Feature Cards - Light Theme */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
               <div className="bg-white p-6 rounded-2xl shadow-md border border-primary-100">
                  <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mb-4 text-primary-500">
                     <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-stone-900 font-bold mb-2">Ověřené recenze</h3>
                  <p className="text-stone-500 text-sm">Sbírejte hodnocení od skutečných klientů a budujte důvěru.</p>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
                     <Users size={24} />
                  </div>
                  <h3 className="text-stone-900 font-bold mb-2">Větší dosah</h3>
                  <p className="text-stone-500 text-sm">Oslovte tisíce párů, které aktivně plánují svatbu.</p>
               </div>
            </div>
         </div>
      </div>

      {/* 6. FOOTER (Dark mode enabled) */}
      <footer className="bg-stone-900 text-white border-t border-stone-800 pt-16 pb-8 px-4 md:px-8">
         <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
               <div className="text-xl font-serif font-extrabold tracking-tight text-white mb-6">
                 Svatbot<span className="text-primary-300">.</span>
               </div>
               <p className="text-stone-400 text-sm leading-relaxed">
                 Moderní tržiště pro plánování vaší vysněné svatby. Spojujeme páry s těmi nejlepšími dodavateli na trhu.
               </p>
            </div>
            
            <div>
               <h4 className="font-bold text-white mb-4">Kategorie</h4>
               <ul className="space-y-2 text-sm text-stone-400">
                 <li><a href="#" className="hover:text-primary-300 transition-colors">Místa na svatbu</a></li>
                 <li><a href="#" className="hover:text-primary-300 transition-colors">Fotografové</a></li>
                 <li><a href="#" className="hover:text-primary-300 transition-colors">Catering</a></li>
                 <li><a href="#" className="hover:text-primary-300 transition-colors">Svatební šaty</a></li>
               </ul>
            </div>

            <div>
               <h4 className="font-bold text-white mb-4">Společnost</h4>
               <ul className="space-y-2 text-sm text-stone-400">
                 <li><a href="#" className="hover:text-primary-300 transition-colors">O nás</a></li>
                 <li><a href="#" className="hover:text-primary-300 transition-colors">Kariéra</a></li>
                 <li><a href="#" className="hover:text-primary-300 transition-colors">Blog</a></li>
                 <li><a href="#" className="hover:text-primary-300 transition-colors">Kontakt</a></li>
               </ul>
            </div>

            <div>
               <h4 className="font-bold text-white mb-4">Kontakt</h4>
               <ul className="space-y-2 text-sm text-stone-400">
                 <li>info@svatbot.cz</li>
                 <li>+420 123 456 789</li>
                 <li>Praha, Česká republika</li>
               </ul>
               <div className="flex gap-4 mt-6">
                  {/* Social Icons Placeholder */}
                  <div className="w-8 h-8 bg-stone-800 rounded-full hover:bg-primary-300 hover:text-stone-900 transition-colors flex items-center justify-center cursor-pointer">FB</div>
                  <div className="w-8 h-8 bg-stone-800 rounded-full hover:bg-primary-300 hover:text-stone-900 transition-colors flex items-center justify-center cursor-pointer">IG</div>
               </div>
            </div>
         </div>
         
         <div className="max-w-[1600px] mx-auto border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-stone-500">© 2023 Svatbot. Všechna práva vyhrazena.</p>
            <div className="flex gap-6 text-xs text-stone-500">
               <a href="#" className="hover:text-white transition-colors">Obchodní podmínky</a>
               <a href="#" className="hover:text-white transition-colors">Ochrana soukromí</a>
            </div>
         </div>
      </footer>
    </div>
  );
};
