'use client'

import { useState } from 'react'
import { useMarketplace } from '@/hooks/useMarketplace'
import { VendorCategory, VENDOR_CATEGORIES } from '@/types/vendor'
import { Search, MapPin, SlidersHorizontal, ArrowRight, ShieldCheck, Users, LayoutGrid, Heart, TrendingUp, Mail, Phone, Lock, Shield } from 'lucide-react'
import Link from 'next/link'
import { useFavoriteVendors } from '@/hooks/useFavoriteVendors'
import { useRouter } from 'next/navigation'
import VendorCard from '@/components/marketplace/VendorCard'
import InteractiveLogoCanvas from '@/components/marketplace/InteractiveLogoCanvas'
import { useMarketplaceSettings } from '@/hooks/useMarketplaceSettings'

export default function MarketplacePage() {
  const {
    filteredVendors,
    loading,
    error,
    stats,
    filters,
    setFilters
  } = useMarketplace()

  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [locationTerm, setLocationTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState<VendorCategory | 'all' | 'favorites'>('all')

  const { favorites, isFavorite, toggleFavorite } = useFavoriteVendors()
  const { settings: marketplaceSettings } = useMarketplaceSettings()

  // All categories including "Vše" and "Oblíbené"
  const allCategories = [
    { key: 'all' as const, name: 'Vše', icon: '🏠' },
    { key: 'favorites' as const, name: 'Oblíbené', icon: '❤️' },
    ...Object.entries(VENDOR_CATEGORIES).map(([key, config]) => ({
      key: key as VendorCategory,
      name: config.name,
      icon: config.icon
    }))
  ]

  // Filter vendors based on search, location, category, and favorites
  const displayVendors = filteredVendors.filter(vendor => {
    // Search filter
    if (searchTerm && !vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !vendor.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Location filter
    if (locationTerm && !vendor.address.city.toLowerCase().includes(locationTerm.toLowerCase()) &&
        !vendor.address.region.toLowerCase().includes(locationTerm.toLowerCase())) {
      return false
    }

    // Category filter
    if (activeCategory !== 'all' && activeCategory !== 'favorites' && vendor.category !== activeCategory) {
      return false
    }

    // Favorites filter
    if (activeCategory === 'favorites' && !favorites.includes(vendor.id)) {
      return false
    }

    return true
  })

  // Handle search
  const handleSearch = () => {
    // Search is already applied through displayVendors filter
    console.log('Searching for:', searchTerm, 'in', locationTerm)
  }

  // Handle category click
  const handleCategoryClick = (categoryKey: VendorCategory | 'all' | 'favorites') => {
    setActiveCategory(categoryKey)
    if (categoryKey !== 'all' && categoryKey !== 'favorites') {
      setFilters({ ...filters, category: [categoryKey as VendorCategory] })
    } else {
      setFilters({ ...filters, category: undefined })
    }
  }

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortBy = e.target.value as 'newest' | 'rating' | 'price-low' | 'price-high' | 'reviews'
    setFilters({ ...filters, sortBy })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">

      {/* 1. NAVBAR - Same as main page */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-stone-100 sticky top-0 z-50 h-16">
        <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 md:space-x-3">
            <img src="/logo-svatbot.svg" alt="SvatBot.cz logo" className="h-8 w-8 md:h-10 md:w-10" />
            <span className="font-display text-xl md:text-2xl font-bold text-gray-900">SvatBot.cz</span>
          </Link>
          <div className="flex gap-4 md:gap-6 items-center">
            <Link href="/marketplace" className="text-sm font-medium text-gray-600 hover:text-rose-500 hidden md:block transition-colors">
              Marketplace
            </Link>
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-rose-500 hidden md:block transition-colors">
              Dashboard
            </Link>
            <Link
              href="/marketplace/register"
              className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 md:px-5 py-2 rounded-full transition-colors"
            >
              Přidat inzerát
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <div className="relative bg-stone-900 text-white overflow-hidden min-h-[500px] md:h-[600px] flex items-center justify-center">
        {/* Background - Conditional: Physics Animation or Static Image */}
        {marketplaceSettings?.enablePhysicsAnimation ? (
          <div className="absolute inset-0 pointer-events-auto">
            <InteractiveLogoCanvas
              vendors={filteredVendors}
              maxLogos={50}
              height={600}
            />
          </div>
        ) : (
          <>
            {/* Static Background Image */}
            <div className="absolute inset-0 opacity-40 pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2000&auto=format&fit=crop"
                alt="Wedding Background"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-stone-900/80 via-stone-900/40 to-stone-900/90 pointer-events-none" />
          </>
        )}

        {/* Dark overlay for better text readability - lighter when physics is enabled */}
        {marketplaceSettings?.enablePhysicsAnimation && (
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/40 via-transparent to-stone-900/50 pointer-events-none" />
        )}

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl px-4 w-full pointer-events-none">
          <span className="inline-block py-1 px-3 rounded-full bg-pink-400/20 backdrop-blur-md border border-pink-400/40 text-pink-100 text-xs font-bold tracking-wider uppercase mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Svatbot Marketplace
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Najděte ty nejlepší profesionály <br className="hidden md:block"/> pro vaši svatbu snů.
          </h1>
          <p className="text-lg text-stone-200 mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Od kouzelných míst až po talentované fotografy. Vše na jednom místě, ověřené a s garancí kvality.
          </p>
        </div>
      </div>

      {/* 3. SEARCH BAR & CATEGORIES */}
      <div className="py-12 px-4 md:px-6 lg:px-8 max-w-[1800px] mx-auto w-full">
        {/* Search Bar */}
        <div className="bg-white p-2 rounded-full max-w-3xl mx-auto flex flex-col md:flex-row gap-2 shadow-2xl mb-12 -mt-20 relative z-20">
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
                value={locationTerm}
                onChange={(e) => setLocationTerm(e.target.value)}
              />
           </div>
           <button
             onClick={handleSearch}
             className="bg-pink-400 text-stone-900 px-8 py-3 md:py-4 rounded-full font-bold hover:bg-pink-500 transition-all hover:shadow-lg hover:shadow-pink-400/30"
           >
             Hledat
           </button>
        </div>
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-serif font-bold text-stone-900">Kategorie</h2>
          <div className="text-stone-500 font-bold text-xs uppercase tracking-wide flex items-center gap-1">
            <TrendingUp size={14} />
            {stats.totalVendors} dodavatelů
          </div>
        </div>

        {/* Responsive Grid: 2 cols mobile, 4 cols tablet, 5 cols small laptop, 10 cols large desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
          {allCategories.map((cat, idx) => {
            const isSelected = activeCategory === cat.key
            return (
              <button
                key={idx}
                onClick={() => handleCategoryClick(cat.key)}
                className={`
                  flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 group h-[110px] relative overflow-hidden
                  ${isSelected
                    ? 'bg-pink-400 text-stone-900 border-pink-400 shadow-lg shadow-pink-400/20'
                    : 'bg-white border-stone-100 hover:border-pink-200 hover:shadow-md text-stone-600 hover:bg-pink-50'
                  }
                `}
              >
                <div className={`
                  mb-2 text-2xl transition-transform group-hover:scale-110
                `}>
                  {typeof cat.icon === 'string' ? cat.icon : '📦'}
                </div>
                <span className="font-bold text-xs text-center leading-tight">{cat.name}</span>
              </button>
            )
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
               <select
                 className="bg-transparent font-bold text-stone-900 outline-none cursor-pointer hover:text-pink-600"
                 value={filters.sortBy || 'newest'}
                 onChange={handleSortChange}
               >
                 <option value="newest">Doporučené</option>
                 <option value="rating">Nejvyšší hodnocení</option>
                 <option value="price-low">Nejnižší cena</option>
                 <option value="price-high">Nejvyšší cena</option>
                 <option value="reviews">Nejvíce recenzí</option>
               </select>
             </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden animate-pulse">
                  <div className="h-56 bg-stone-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-stone-200 rounded w-3/4" />
                    <div className="h-6 bg-stone-200 rounded w-full" />
                    <div className="h-4 bg-stone-200 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : displayVendors.length > 0 ? (
              displayVendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  isFavorite={isFavorite}
                  toggleFavorite={toggleFavorite}
                />
              ))
            ) : null}
          </div>

          {/* Empty State */}
          {!loading && displayVendors.length === 0 && (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">Žádné výsledky</h3>
              <p className="text-stone-500">Zkuste upravit filtry nebo hledaný výraz.</p>
            </div>
          )}

          {/* Load More */}
          {!loading && displayVendors.length > 0 && (
            <div className="mt-12 text-center">
              <button className="px-8 py-3 border border-stone-200 bg-white rounded-full font-bold text-stone-600 hover:bg-pink-400 hover:border-pink-400 hover:text-stone-900 transition-all shadow-sm hover:shadow-md">
                Načíst další
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. CTA FOR VENDORS - Light Theme to contrast with Dark Footer */}
      <div className="relative py-24 px-4 overflow-hidden bg-gradient-to-br from-pink-50 via-white to-purple-50 border-t border-pink-100">
         <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
               <span className="inline-block py-1 px-3 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold tracking-wider uppercase mb-4">
                 Pro profesionály
               </span>
               <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">
                 Jste svatební profesionál?
               </h2>
               <p className="text-stone-600 text-lg mb-8 leading-relaxed">
                 Přidejte se k největší komunitě svatebních dodavatelů v Česku. Získejte více poptávek a budujte svou značku s námi.
               </p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                 <Link
                   href="/marketplace/register"
                   className="bg-pink-400 text-stone-900 px-8 py-4 rounded-xl font-bold hover:bg-pink-500 transition-all shadow-xl shadow-pink-400/20"
                 >
                   Chci se registrovat
                 </Link>
                 <button className="bg-white border border-stone-200 text-stone-600 px-8 py-4 rounded-xl font-bold hover:bg-stone-50 hover:text-stone-900 transition-all shadow-sm">
                   Jak to funguje?
                 </button>
               </div>
            </div>

            {/* Feature Cards - Light Theme */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
               <div className="bg-white p-6 rounded-2xl shadow-md border border-pink-100">
                  <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center mb-4 text-pink-500">
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

      {/* 6. FOOTER - Same as main page */}
      <footer className="bg-gray-900 text-white py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img src="/logo-mensi.jpg" alt="SvatBot.cz logo" className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover" />
                <span className="font-display text-3xl font-bold text-white">SvatBot.cz</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                Český svatební plánovač s AI asistentem. Vše na jednom místě – od hostů po rozpočet, od úkolů po svatební web.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
                <Link href="/" className="px-7 py-3 bg-rose-500 text-white rounded-full font-semibold hover:bg-rose-600 transition-colors text-center">
                  Začít zdarma
                </Link>
              </div>

              {/* Kontaktní info v patičce */}
              <div className="space-y-2 text-gray-400 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:info@svatbot.cz" className="hover:text-rose-300 transition-colors">info@svatbot.cz</a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <a href="tel:+420732264276" className="hover:text-rose-300 transition-colors">+420 732 264 276</a>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-5 text-white">Kategorie</h3>
              <ul className="space-y-3 text-gray-300">
                <li><button onClick={() => handleCategoryClick('photographer')} className="hover:text-rose-300 transition-colors text-left">Fotografové</button></li>
                <li><button onClick={() => handleCategoryClick('videographer')} className="hover:text-rose-300 transition-colors text-left">Kameramani</button></li>
                <li><button onClick={() => handleCategoryClick('venue')} className="hover:text-rose-300 transition-colors text-left">Místa konání</button></li>
                <li><button onClick={() => handleCategoryClick('catering')} className="hover:text-rose-300 transition-colors text-left">Catering</button></li>
                <li><button onClick={() => handleCategoryClick('flowers')} className="hover:text-rose-300 transition-colors text-left">Květiny</button></li>
                <li><button onClick={() => handleCategoryClick('music')} className="hover:text-rose-300 transition-colors text-left">Hudba/DJ</button></li>
                <li><Link href="/marketplace" className="hover:text-rose-300 transition-colors">Všechny kategorie</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-5 text-white">Pro dodavatele</h3>
              <ul className="space-y-3 text-gray-300">
                <li><Link href="/marketplace/register" className="hover:text-rose-300 transition-colors">Registrace dodavatele</Link></li>
                <li><Link href="/" className="hover:text-rose-300 transition-colors">Dashboard</Link></li>
                <li><Link href="/affiliate" className="hover:text-rose-300 transition-colors">Affiliate program</Link></li>
                <li><Link href="/ochrana-soukromi" className="hover:text-rose-300 transition-colors">Ochrana soukromí</Link></li>
                <li><Link href="/obchodni-podminky" className="hover:text-rose-300 transition-colors">Obchodní podmínky</Link></li>
                <li><Link href="/gdpr" className="hover:text-rose-300 transition-colors">GDPR</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 mt-12 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-6 mb-6 md:mb-0">
              <p className="flex items-center">© 2025 SvatBot.cz - Vytvořeno s <Heart className="w-4 h-4 inline-block text-rose-400 fill-current mx-1" /> pro české páry.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/ochrana-soukromi" className="hover:text-rose-300 transition-colors">Ochrana soukromí</Link>
                <Link href="/obchodni-podminky" className="hover:text-rose-300 transition-colors">Obchodní podmínky</Link>
                <Link href="/podminky-sluzby" className="hover:text-rose-300 transition-colors">Podmínky služby</Link>
                <Link href="/gdpr" className="hover:text-rose-300 transition-colors">GDPR</Link>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-gray-500" />
                <span>SSL Zabezpečeno</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-gray-500" />
                <span>GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
