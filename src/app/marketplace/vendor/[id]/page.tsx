'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useMarketplace } from '@/hooks/useMarketplace'
import { VENDOR_CATEGORIES } from '@/types/vendor'
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  CheckCircle,
  Heart,
  Share2,
  Calendar,
  MessageCircle,
  Verified,
  Crown,
  Award,
  Users,
  DollarSign,
  Plus,
  Check,
  Edit3,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  BadgeCheck,
  LayoutGrid,
  Image as ImageIcon,
  PlayCircle,
  Tag,
  CreditCard,
  ArrowRight,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
  Store
} from 'lucide-react'
import { useVendor } from '@/hooks/useVendor'
import { useAuth } from '@/hooks/useAuth'
import { useFavoriteVendors } from '@/hooks/useFavoriteVendors'
import { useVendorReviews } from '@/hooks/useVendorReviews'
import ReviewForm from '@/components/marketplace/ReviewForm'
import GoogleReviewCard from '@/components/marketplace/GoogleReviewCard'
import ModuleHeader from '@/components/common/ModuleHeader'
import Link from 'next/link'
import { useState, useEffect } from 'react'

type TabType = 'overview' | 'video' | 'gallery' | 'reviews' | 'contact'

// Helper function to convert YouTube/Vimeo URLs to embed format
function getEmbedUrl(url: string): string {
  if (!url) {
    console.log('🎥 getEmbedUrl: No URL provided')
    return ''
  }

  console.log('🎥 getEmbedUrl input:', url)

  // YouTube formats
  // https://www.youtube.com/watch?v=VIDEO_ID
  // https://youtu.be/VIDEO_ID
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
  const youtubeMatch = url.match(youtubeRegex)
  if (youtubeMatch) {
    const embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`
    console.log('🎥 YouTube embed URL:', embedUrl)
    return embedUrl
  }

  // Vimeo formats
  // https://vimeo.com/VIDEO_ID
  const vimeoRegex = /vimeo\.com\/(\d+)/
  const vimeoMatch = url.match(vimeoRegex)
  if (vimeoMatch) {
    const embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`
    console.log('🎥 Vimeo embed URL:', embedUrl)
    return embedUrl
  }

  // If already an embed URL or unknown format, return as is
  console.log('🎥 Using URL as is (unknown format or already embed):', url)
  return url
}

export default function VendorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getVendorById } = useMarketplace()
  const { user } = useAuth()
  const { vendors, createVendor } = useVendor()
  const { isFavorite, toggleFavorite } = useFavoriteVendors()

  const [showContactForm, setShowContactForm] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [isSendingContact, setIsSendingContact] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [showMobileContact, setShowMobileContact] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [reviewSource, setReviewSource] = useState<'svatbot' | 'google'>('svatbot')

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    weddingDate: '',
    message: ''
  })

  const vendorId = params.id as string
  const vendor = getVendorById(vendorId)

  // Debug: Log vendor data
  useEffect(() => {
    if (vendor) {
      console.log('🏪 Vendor loaded:', vendor.name)
      console.log('🎥 Vendor videoUrl:', vendor.videoUrl)
      console.log('📱 Vendor socialMedia:', vendor.socialMedia)
    }
  }, [vendor])

  // Load reviews for this vendor
  const { reviews, stats, hasUserReviewed, createReview, loading: reviewsLoading } = useVendorReviews(vendorId)

  // Check if vendor is already in user's list
  const isVendorInList = vendor ? vendors.some(v =>
    v.name.toLowerCase() === vendor.name.toLowerCase() &&
    v.category === vendor.category
  ) : false

  // Handle adding vendor to user's list
  const handleAddToMyVendors = async () => {
    if (!user || !vendor || isAdding || isVendorInList) return

    setIsAdding(true)
    try {
      await createVendor({
        name: vendor.name,
        category: vendor.category,
        description: vendor.shortDescription,
        website: vendor.website,
        contactName: vendor.businessName || vendor.name,
        contactEmail: vendor.email || '',
        contactPhone: vendor.phone || '',
        address: {
          street: vendor.address.street,
          city: vendor.address.city,
          postalCode: vendor.address.postalCode,
          region: vendor.address.region
        },
        businessName: vendor.businessName || vendor.name,
        services: vendor.services.map(s => ({
          name: s.name,
          description: s.description,
          price: s.price,
          priceType: s.priceType
        })),
        status: 'potential',
        priority: 'medium',
        notes: `Přidáno z marketplace. Hodnocení: ${vendor.rating.overall}/5 (${vendor.rating.count} recenzí). ${vendor.description}`,
        tags: vendor.features || []
      })
      setIsAdded(true)
      setTimeout(() => setIsAdded(false), 3000) // Reset after 3 seconds
    } catch (error) {
      console.error('Error adding vendor to list:', error)
    } finally {
      setIsAdding(false)
    }
  }

  // Check if contact form should be opened automatically
  useEffect(() => {
    if (searchParams.get('contact') === 'true') {
      setShowContactForm(true)
    }
  }, [searchParams])

  // Handle scroll to section
  const scrollToSection = (id: TabType) => {
    const element = document.getElementById(id)
    if (element) {
      const headerOffset = 180
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      setActiveTab(id)
    }
  }

  // Gallery functions
  const openLightbox = (index: number) => setSelectedImageIndex(index)
  const closeLightbox = () => setSelectedImageIndex(null)

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedImageIndex !== null && vendor) {
      setSelectedImageIndex((selectedImageIndex + 1) % vendor.portfolioImages.length)
    }
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedImageIndex !== null && vendor) {
      setSelectedImageIndex((selectedImageIndex - 1 + vendor.portfolioImages.length) % vendor.portfolioImages.length)
    }
  }

  // Handle contact form submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!vendor) return

    setIsSendingContact(true)

    try {
      const response = await fetch('/api/marketplace/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId: vendor.id,
          vendorName: vendor.name,
          vendorEmail: vendor.email,
          customerName: contactForm.name,
          customerEmail: contactForm.email,
          customerPhone: contactForm.phone,
          weddingDate: contactForm.weddingDate,
          message: contactForm.message
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send contact request')
      }

      // Success!
      setContactSuccess(true)
      setContactForm({
        name: '',
        email: '',
        phone: '',
        weddingDate: '',
        message: ''
      })

      // Close form after 2 seconds
      setTimeout(() => {
        setShowContactForm(false)
        setContactSuccess(false)
      }, 2000)

    } catch (error) {
      console.error('Error sending contact request:', error)
      alert('Nepodařilo se odeslat poptávku. Zkuste to prosím znovu.')
    } finally {
      setIsSendingContact(false)
    }
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dodavatel nenalezen</h1>
          <p className="text-gray-600 mb-6">Požadovaný dodavatel neexistuje nebo byl odstraněn.</p>
          <Link href="/marketplace" className="btn-primary">
            Zpět na marketplace
          </Link>
        </div>
      </div>
    )
  }

  const categoryConfig = VENDOR_CATEGORIES[vendor.category]

  // Format price range
  const formatPriceRange = () => {
    const { min, max, currency, unit } = vendor.priceRange
    const formatPrice = (price: number) => {
      return price.toLocaleString()
    }

    const unitText = {
      'per-hour': '/hod',
      'per-day': '/den',
      'per-event': '/akce',
      'per-person': '/osoba'
    }[unit] || ''

    return `${formatPrice(min)} - ${formatPrice(max)} ${currency}${unitText}`
  }

  // Format address
  const formatAddress = () => {
    const { street, city, postalCode, region } = vendor.address
    return `${street}, ${postalCode} ${city}`
  }

  // Get Google reviews
  const googleReviews = vendor.google?.reviews || []
  const svatbotReviews = reviews.slice(0, 5)

  return (
    <div className="min-h-screen">
      {/* Module Header */}
      <ModuleHeader
        icon={Store}
        title={vendor?.name || 'Detail dodavatele'}
        subtitle={categoryConfig?.name || 'Marketplace'}
        fullWidth={true}
        maxWidth="max-w-[1600px]"
        actions={
          <Link
            href="/marketplace"
            className="btn-outline flex items-center space-x-2 whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Zpět na marketplace</span>
            <span className="sm:hidden">Zpět</span>
          </Link>
        }
      />

      <main className="pb-24 pt-6 px-4 md:px-6 lg:px-8" style={{ background: 'linear-gradient(to bottom, #fef5f9 0%, #fce7f3 50%, #fbcfe8 100%)' }}>
        <div className="max-w-[1600px] mx-auto">

          {/* Modern Split Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 min-h-[500px] md:min-h-[580px]">

            {/* LEFT: Info Card */}
            <div className="md:col-span-6 lg:col-span-5 flex flex-col bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-stone-200 relative overflow-hidden group">
              {/* Decoration bg */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-50"></div>

              <div className="flex-1 flex flex-col items-start z-10">
                {/* Header badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs uppercase tracking-wider font-bold text-stone-600">
                    {categoryConfig?.name}
                  </span>
                  {vendor.premium && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-xs uppercase tracking-wider font-bold flex items-center gap-1">
                      <Award size={12} /> Premium
                    </span>
                  )}
                </div>

                {/* Logo & Name Block */}
                <div className="flex items-center gap-4 mb-6">
                  {vendor.mainImage && (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border border-stone-100 shadow-sm shrink-0">
                      <img src={vendor.mainImage} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 leading-tight">
                      {vendor.name}
                    </h1>
                    {vendor.verified && (
                      <div className="flex items-center gap-1 mt-1 text-blue-600 text-xs font-bold uppercase tracking-wide">
                        <BadgeCheck size={14} fill="currentColor" className="text-blue-100" />
                        <span>Ověřeno</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Info Block */}
                <div className="flex flex-col gap-3 mb-6 w-full">
                  {/* Address */}
                  <div className="flex items-start gap-3 text-stone-600 group/item">
                    <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center shrink-0 group-hover/item:bg-primary-50 group-hover/item:text-primary-600 transition-colors">
                      <MapPin size={16} />
                    </div>
                    <span className="text-sm font-medium pt-1.5 leading-tight">{formatAddress()}</span>
                  </div>

                  {/* Phone */}
                  {vendor.phone && (
                    <div className="flex items-center gap-3 text-stone-600 group/item">
                      <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center shrink-0 group-hover/item:bg-primary-50 group-hover/item:text-primary-600 transition-colors">
                        <Phone size={16} />
                      </div>
                      <a href={`tel:${vendor.phone}`} className="text-sm font-medium hover:text-primary-600 transition-colors">{vendor.phone}</a>
                    </div>
                  )}

                  {/* Email */}
                  {vendor.email && (
                    <div className="flex items-center gap-3 text-stone-600 group/item">
                      <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center shrink-0 group-hover/item:bg-primary-50 group-hover/item:text-primary-600 transition-colors">
                        <Mail size={16} />
                      </div>
                      <a href={`mailto:${vendor.email}`} className="text-sm font-medium hover:text-primary-600 transition-colors truncate max-w-[200px]">{vendor.email}</a>
                    </div>
                  )}

                  {/* Website */}
                  {vendor.website && (
                    <div className="flex items-center gap-3 text-stone-600 group/item">
                      <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center shrink-0 group-hover/item:bg-primary-50 group-hover/item:text-primary-600 transition-colors">
                        <Globe size={16} />
                      </div>
                      <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-primary-600 transition-colors">
                        Webové stránky
                      </a>
                    </div>
                  )}
                </div>

                {/* Social Media Links */}
                {vendor.socialMedia && (vendor.socialMedia.instagram || vendor.socialMedia.facebook || vendor.socialMedia.youtube || vendor.socialMedia.tiktok || vendor.socialMedia.linkedin) && (
                  <div className="flex items-center gap-3 pt-3 border-t border-stone-100">
                    <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">Sociální sítě:</span>
                    <div className="flex items-center gap-2">
                      {vendor.socialMedia.instagram && (
                        <a
                          href={vendor.socialMedia.instagram.startsWith('http') ? vendor.socialMedia.instagram : `https://${vendor.socialMedia.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white hover:scale-110 transition-transform"
                          title="Instagram"
                        >
                          <Instagram size={16} />
                        </a>
                      )}
                      {vendor.socialMedia.facebook && (
                        <a
                          href={vendor.socialMedia.facebook.startsWith('http') ? vendor.socialMedia.facebook : `https://${vendor.socialMedia.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white hover:scale-110 transition-transform"
                          title="Facebook"
                        >
                          <Facebook size={16} />
                        </a>
                      )}
                      {vendor.socialMedia.youtube && (
                        <a
                          href={vendor.socialMedia.youtube.startsWith('http') ? vendor.socialMedia.youtube : `https://${vendor.socialMedia.youtube}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white hover:scale-110 transition-transform"
                          title="YouTube"
                        >
                          <Youtube size={16} />
                        </a>
                      )}
                      {vendor.socialMedia.tiktok && (
                        <a
                          href={vendor.socialMedia.tiktok.startsWith('http') ? vendor.socialMedia.tiktok : `https://${vendor.socialMedia.tiktok}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white hover:scale-110 transition-transform"
                          title="TikTok"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                          </svg>
                        </a>
                      )}
                      {vendor.socialMedia.linkedin && (
                        <a
                          href={vendor.socialMedia.linkedin.startsWith('http') ? vendor.socialMedia.linkedin : `https://${vendor.socialMedia.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white hover:scale-110 transition-transform"
                          title="LinkedIn"
                        >
                          <Linkedin size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats/Details (Rating) - Both Svatbot and Google */}
                <div className="mt-auto w-full pt-4 border-t border-stone-100">
                  <div className="flex flex-col gap-3">
                    {/* Svatbot Rating */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Svatbot</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-stone-900 text-lg flex items-center gap-1">
                          {stats.averageRating.toFixed(1)} <Star size={16} className="text-amber-400 fill-amber-400" />
                        </span>
                        <span className="text-stone-400 text-xs">
                          ({stats.totalReviews} {stats.totalReviews === 1 ? 'hodnocení' : 'hodnocení'})
                        </span>
                      </div>
                    </div>

                    {/* Google Rating - if available */}
                    {vendor.google?.rating && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Google</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-bold text-stone-900 text-lg flex items-center gap-1">
                            {vendor.google.rating.toFixed(1)} <Star size={16} className="text-amber-400 fill-amber-400" />
                          </span>
                          <span className="text-stone-400 text-xs">
                            ({vendor.google.reviewCount} {vendor.google.reviewCount === 1 ? 'hodnocení' : 'hodnocení'})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Row */}
              <div className="mt-6 flex gap-3 z-10">
                <button
                  onClick={() => setShowMobileContact(true)}
                  className="flex-1 py-3 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-colors shadow-lg shadow-stone-200"
                >
                  Kontaktovat
                </button>
                <button
                  onClick={() => toggleFavorite(vendorId)}
                  className={`p-3 border rounded-xl transition-all ${
                    isFavorite(vendorId)
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'bg-white border-stone-200 text-stone-500 hover:border-primary-200 hover:text-primary-600'
                  }`}
                >
                  <Heart size={20} className={isFavorite(vendorId) ? 'fill-current' : ''} />
                </button>
                <button className="p-3 bg-white border border-stone-200 rounded-xl text-stone-500 hover:border-stone-300 hover:text-stone-900 transition-all">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* RIGHT: Visual / Cover Image or Video */}
            <div className="md:col-span-6 lg:col-span-7 h-64 md:h-auto relative rounded-2xl overflow-hidden group shadow-sm">
              {vendor.mainVideoUrl ? (
                // Show main video if available
                <div className="w-full h-full">
                  <iframe
                    src={getEmbedUrl(vendor.mainVideoUrl) + '?autoplay=1&mute=1&loop=1&controls=0'}
                    title="Main Video"
                    className="w-full h-full"
                    style={{ border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                // Show main image if no video
                <>
                  <img
                    src={vendor.mainImage || vendor.images[0] || vendor.portfolioImages[0] || '/placeholder-vendor.jpg'}
                    alt="Cover"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />

                  <div className="absolute bottom-6 left-6 right-6 text-white/90 text-sm font-medium hidden md:block backdrop-blur-md bg-white/10 p-4 rounded-xl border border-white/20 inline-block max-w-md">
                    <p>"{vendor.shortDescription}"</p>
                  </div>
                </>
              )}
            </div>

          </div>

          <div className="flex flex-col xl:flex-row gap-8 mt-8 relative">

            {/* Main Content Column */}
            <div className="flex-1 min-w-0">

              {/* Sticky Tabs */}
              <div className="sticky top-[4.5rem] z-30 bg-[#F5F5F4]/95 backdrop-blur-md py-2 transition-all">
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-stone-200 inline-flex max-w-full overflow-x-auto no-scrollbar">
                  {[
                    { id: 'overview' as TabType, label: 'Přehled', icon: LayoutGrid },
                    ...(vendor.videoUrl ? [{ id: 'video' as TabType, label: 'Video', icon: PlayCircle }] : []),
                    { id: 'gallery' as TabType, label: 'Galerie', icon: ImageIcon },
                    { id: 'reviews' as TabType, label: 'Recenze', icon: Star },
                    { id: 'contact' as TabType, label: 'Kontakt', icon: MessageCircle }
                  ].map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        onClick={() => scrollToSection(tab.id)}
                        className={`
                          flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300
                          ${isActive
                            ? 'bg-stone-900 text-white shadow-md'
                            : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                          }
                        `}
                      >
                        <Icon size={16} className={isActive ? 'text-primary-300' : 'text-stone-400'} />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* One Page Content Flow */}
              <div className="flex flex-col gap-12 md:gap-16 mt-8">

                {/* Overview Section */}
                <section id="overview" className="scroll-mt-32">
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Elevator Pitch / Intro */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-stone-100">
                      <h2 className="text-2xl font-serif font-bold mb-4 text-stone-900">O nás</h2>
                      <p className="text-lg leading-relaxed text-stone-600 font-light mb-6 border-l-4 border-primary-300 pl-4 italic">
                        "{vendor.shortDescription}"
                      </p>
                      <div className="prose prose-stone prose-p:text-stone-600 max-w-none">
                        {vendor.description.split('\n').map((paragraph, idx) => (
                          <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
                        ))}
                      </div>

                      {/* Tags */}
                      {vendor.features.length > 0 && (
                        <div className="mt-8 flex flex-wrap gap-2">
                          {vendor.features.map((tag, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-600">
                              <Tag size={14} /> {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Specialties and Features Section */}
                    {((vendor.specialties && vendor.specialties.length > 0) || (vendor.features && vendor.features.length > 0)) && (
                      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                        {/* Specialties */}
                        {vendor.specialties && vendor.specialties.length > 0 && (
                          <div className="mb-6">
                            <h3 className="font-serif font-bold text-xl text-stone-900 mb-4">Naše specializace</h3>
                            <div className="flex flex-wrap gap-2">
                              {vendor.specialties.map((specialty, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-4 py-2 bg-primary-50 border border-primary-200 rounded-full text-sm text-primary-700 font-medium">
                                  {specialty}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Features */}
                        {vendor.features && vendor.features.length > 0 && (
                          <div>
                            <h3 className="font-serif font-bold text-xl text-stone-900 mb-4">Vlastnosti</h3>
                            <div className="flex flex-wrap gap-2">
                              {vendor.features.map((feature, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-4 py-2 bg-stone-100 border border-stone-200 rounded-full text-sm text-stone-700 font-medium">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </section>

                {/* Video Section */}
                {vendor.videoUrl && (
                  <section id="video" className="scroll-mt-32 mb-12">
                    <h2 className="text-2xl font-serif font-bold mb-6 text-stone-900">Video ukázka</h2>
                    <div className="w-full" style={{ paddingBottom: '56.25%', position: 'relative' }}>
                      <iframe
                        src={getEmbedUrl(vendor.videoUrl)}
                        title="Wedding Video"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          borderRadius: '1rem'
                        }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </section>
                )}

                {/* Gallery Section */}
                <section id="gallery" className="scroll-mt-32">
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-serif font-bold mb-6 text-stone-900 px-2">Portfolio</h2>

                    {/* Pinterest Style Masonry Layout using CSS Columns */}
                    <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
                      {vendor.portfolioImages.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => openLightbox(idx)}
                          className="break-inside-avoid mb-4 relative group cursor-pointer rounded-2xl overflow-hidden bg-stone-100"
                        >
                          <img
                            src={img}
                            alt={`Portfolio ${idx + 1}`}
                            className="w-full h-auto block transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />

                          {/* Dark overlay on hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                          {/* Zoom Icon top right */}
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
                            <ZoomIn size={18} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Reviews Section */}
                <section id="reviews" className="scroll-mt-32">
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-serif font-bold mb-6 text-stone-900 px-2">Hodnocení</h2>

                    {/* Dual Dashboard Header */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

                      {/* Svatbot Card */}
                      <div
                        onClick={() => setReviewSource('svatbot')}
                        className={`
                          cursor-pointer relative overflow-hidden rounded-2xl p-6 border transition-all duration-300
                          ${reviewSource === 'svatbot'
                            ? 'bg-stone-900 text-white shadow-lg scale-[1.02] border-stone-900'
                            : 'bg-white text-stone-900 border-stone-200 hover:border-stone-300 grayscale opacity-70 hover:grayscale-0 hover:opacity-100'
                          }
                        `}
                      >
                        <div className="relative z-10 flex flex-col h-full justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-serif font-bold text-lg">Svatbot</h3>
                              <p className={`text-xs mt-1 ${reviewSource === 'svatbot' ? 'text-stone-400' : 'text-stone-500'}`}>Ověřené recenze klientů</p>
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold text-xs ${reviewSource === 'svatbot' ? 'bg-primary-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
                              S.
                            </div>
                          </div>

                          <div className="mt-6 flex items-end gap-3">
                            <span className="text-5xl font-serif font-bold">{vendor.rating.overall.toFixed(1)}</span>
                            <div className="mb-1.5">
                              <div className="flex gap-0.5 text-amber-400 mb-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} size={16} fill="currentColor" />
                                ))}
                              </div>
                              <p className={`text-xs ${reviewSource === 'svatbot' ? 'text-stone-400' : 'text-stone-500'}`}>
                                {vendor.rating.count} hodnocení
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Google Card */}
                      {vendor.google?.rating && vendor.google.reviewCount && vendor.google.reviewCount > 0 && (
                        <div
                          onClick={() => setReviewSource('google')}
                          className={`
                            cursor-pointer relative overflow-hidden rounded-2xl p-6 border transition-all duration-300
                            ${reviewSource === 'google'
                              ? 'bg-white ring-1 ring-blue-100 shadow-lg scale-[1.02] border-blue-200'
                              : 'bg-white text-stone-900 border-stone-200 hover:border-stone-300 grayscale opacity-70 hover:grayscale-0 hover:opacity-100'
                            }
                          `}
                        >
                          <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-serif font-bold text-lg text-stone-900">Google</h3>
                                <p className="text-xs mt-1 text-stone-500">Recenze z Google Maps</p>
                              </div>
                              {/* Google G Logo SVG */}
                              <div className="w-8 h-8 bg-white rounded-full shadow-sm border border-stone-100 flex items-center justify-center p-1.5">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                              </div>
                            </div>

                            <div className="mt-6 flex items-end gap-3">
                              <span className="text-5xl font-serif font-bold text-stone-900">{vendor.google.rating.toFixed(1)}</span>
                              <div className="mb-1.5">
                                <div className="flex gap-0.5 text-amber-400 mb-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} size={16} fill="currentColor" />
                                  ))}
                                </div>
                                <p className="text-xs text-stone-500">
                                  {vendor.google.reviewCount} hodnocení
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Toggle Switcher */}
                    <div className="flex justify-center mb-8">
                      <div className="bg-stone-100 p-1 rounded-xl inline-flex">
                        <button
                          onClick={() => setReviewSource('svatbot')}
                          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${reviewSource === 'svatbot' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}
                        >
                          Svatbot ({svatbotReviews.length})
                        </button>
                        <button
                          onClick={() => setReviewSource('google')}
                          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${reviewSource === 'google' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}
                        >
                          Google ({googleReviews.length})
                        </button>
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {reviewSource === 'svatbot' ? (
                        reviewsLoading ? (
                          <div className="text-center py-8">
                            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-stone-500 mt-4">Načítání recenzí...</p>
                          </div>
                        ) : svatbotReviews.length > 0 ? (
                          svatbotReviews.map((review) => (
                            <div key={review.id} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-stone-100 text-stone-500">
                                    {review.userName.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-stone-900 text-sm">{review.userName}</h4>
                                    <span className="text-xs text-stone-400">{new Date(review.createdAt).toLocaleDateString('cs-CZ')}</span>
                                  </div>
                                </div>
                                <div className="flex gap-0.5 text-amber-400">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} size={14} fill="currentColor" />
                                  ))}
                                </div>
                              </div>

                              <p className="text-stone-600 text-sm leading-relaxed">"{review.text}"</p>

                              {review.weddingDate && (
                                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-50 rounded-md text-[10px] text-stone-500 font-medium uppercase tracking-wide">
                                  <CheckCircle size={12} className="text-green-500" />
                                  Svatba: {new Date(review.weddingDate).toLocaleDateString('cs-CZ')}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-stone-500">
                            Zatím žádné recenze
                          </div>
                        )
                      ) : (
                        googleReviews.length > 0 ? (
                          googleReviews.map((review, index) => (
                            <GoogleReviewCard key={index} review={review} />
                          ))
                        ) : (
                          <div className="text-center py-8 text-stone-500">
                            Zatím žádné Google recenze
                          </div>
                        )
                      )}
                    </div>

                    {user && !hasUserReviewed(vendorId) && reviewSource === 'svatbot' && (
                      <div className="mt-6 text-center">
                        <button
                          onClick={() => setShowReviewForm(true)}
                          className="text-sm font-bold text-stone-500 hover:text-stone-900 transition-colors"
                        >
                          Napsat recenzi
                        </button>
                      </div>
                    )}

                  </div>
                </section>

                {/* Mobile only contact section at bottom of content */}
                <section id="contact" className="xl:hidden scroll-mt-32 bg-white p-6 rounded-2xl border border-stone-100">
                  <h2 className="text-2xl font-serif font-bold mb-6 text-stone-900">Kontakt</h2>
                  <div className="space-y-4">
                    <p className="text-sm text-stone-600">
                      Máte zájem o naše služby? Kontaktujte nás a domluvíme si schůzku.
                    </p>
                    <button
                      onClick={() => setShowMobileContact(true)}
                      className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-colors shadow-lg shadow-stone-200"
                    >
                      Kontaktovat
                    </button>
                  </div>
                </section>
              </div>
            </div>

            {/* Sidebar - Sticky on Desktop (Right Side) */}
            <div className="hidden xl:block w-[400px] flex-shrink-0">
              <div className="sticky top-24">
                <div className="space-y-6">

                  {/* 1. Services & Packages */}
                  {vendor.services.length > 0 && (
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg shadow-stone-200/50 border border-stone-100 ring-1 ring-black/5">

                      {/* Pricing Header */}
                      <div className="p-6 bg-stone-900 text-white">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-serif font-bold text-lg">Ceník služeb</h4>
                          <CreditCard size={18} className="text-stone-400"/>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-stone-400 text-sm">již od</span>
                          <span className="font-bold text-2xl tracking-tight">{formatPriceRange().split('-')[0]}</span>
                        </div>
                      </div>

                      {/* Services List */}
                      <div className="divide-y divide-stone-100">
                        {vendor.services.slice(0, 3).map((service) => (
                          <div key={service.id} className="p-5 hover:bg-stone-50 transition-colors group cursor-pointer relative">
                            {service.popular && (
                              <div className="absolute top-0 right-0 bg-primary-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                                DOPORUČUJEME
                              </div>
                            )}
                            <div className="flex justify-between items-start mb-1 pr-4">
                              <h5 className="font-bold text-stone-900 flex items-center gap-2 text-sm">
                                {service.name}
                              </h5>
                            </div>
                            <div className="text-primary-600 font-bold text-base mb-2">
                              {service.price ? `${service.price.toLocaleString()} Kč` : 'Na dotaz'}
                            </div>

                            <p className="text-xs text-stone-500 leading-relaxed mb-3">
                              {service.description}
                            </p>

                            {/* Features mini list */}
                            {service.includes && service.includes.length > 0 && (
                              <ul className="space-y-1 mb-3">
                                {service.includes.slice(0, 2).map((feature, idx) => (
                                  <li key={idx} className="flex items-center gap-2 text-xs text-stone-600">
                                    <div className="w-1 h-1 rounded-full bg-primary-500"></div>
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>

                      {vendor.services.length > 3 && (
                        <div className="p-4 bg-stone-50 text-center border-t border-stone-100">
                          <button className="text-xs font-bold text-stone-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-1 mx-auto">
                            Zobrazit všechny služby <ArrowRight size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. Contact Form */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                    <h3 className="font-serif text-lg font-bold mb-2 text-stone-900">Ověřit termín</h3>
                    <p className="text-xs text-stone-500 mb-4">Líbí se vám naše práce? Napište nám nezávaznou poptávku.</p>
                    <button
                      onClick={() => setShowMobileContact(true)}
                      className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-colors shadow-lg shadow-stone-200"
                    >
                      Kontaktovat
                    </button>

                    {/* Add to my vendors button */}
                    {user && (
                      <button
                        onClick={handleAddToMyVendors}
                        disabled={isAdding || isVendorInList || isAdded}
                        className={`w-full mt-3 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                          isVendorInList
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : isAdded
                              ? 'bg-green-100 text-green-700'
                              : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                        }`}
                      >
                        {isAdding ? (
                          <>
                            <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                            <span>Přidávám...</span>
                          </>
                        ) : isVendorInList ? (
                          <>
                            <Check className="w-5 h-5" />
                            <span>V mém seznamu</span>
                          </>
                        ) : isAdded ? (
                          <>
                            <Check className="w-5 h-5" />
                            <span>Přidáno!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-5 h-5" />
                            <span>Přidat do seznamu</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* 3. Quick Facts */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                    <h4 className="font-serif font-bold mb-4 text-sm uppercase tracking-wider text-stone-400">Informace</h4>
                    <ul className="space-y-4 text-sm text-stone-600">
                      <li className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                          <Check size={16} />
                        </div>
                        <span>{vendor.yearsInBusiness} let v oboru</span>
                      </li>
                      {vendor.address.region && (
                        <li className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                            <MapPin size={16} />
                          </div>
                          <span>{vendor.address.region}</span>
                        </li>
                      )}
                    </ul>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-stone-200 xl:hidden z-40 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col">
          <span className="text-xs text-stone-500">Cena od</span>
          <span className="font-bold font-serif text-lg">{formatPriceRange().split('-')[0]}</span>
        </div>
        <button
          onClick={() => setShowMobileContact(true)}
          className="bg-primary-600 text-white px-6 py-3 rounded-full font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
        >
          Ověřit termín
        </button>
      </div>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && vendor.portfolioImages.length > 0 && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button className="absolute top-4 right-4 text-white/50 hover:text-white p-2 transition-colors z-50">
            <X size={32} />
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 md:p-8 transition-colors hidden sm:block z-50"
            onClick={prevImage}
          >
            <ChevronLeft size={48} />
          </button>

          <img
            src={vendor.portfolioImages[selectedImageIndex]}
            alt="Gallery"
            className="max-h-[85vh] max-w-[90vw] object-contain shadow-2xl rounded-md"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 md:p-8 transition-colors hidden sm:block z-50"
            onClick={nextImage}
          >
            <ChevronRight size={48} />
          </button>

          <div className="absolute bottom-6 left-0 right-0 text-center text-white/70 text-sm">
            {selectedImageIndex + 1} / {vendor.portfolioImages.length}
          </div>
        </div>
      )}

      {/* Mobile Contact Modal */}
      {showMobileContact && (
        <div className="fixed inset-0 z-[60] bg-stone-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-stone-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="font-serif text-xl font-bold">Kontaktovat</h3>
              <button onClick={() => setShowMobileContact(false)} className="p-2 hover:bg-stone-100 rounded-full">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleContactSubmit} className="space-y-4">
                {contactSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Poptávka odeslána!</h3>
                    <p className="text-gray-600">Dodavatel vás bude brzy kontaktovat.</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jméno *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Vaše jméno"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="vas@email.cz"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="+420 xxx xxx xxx"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Datum svatby
                      </label>
                      <input
                        type="date"
                        value={contactForm.weddingDate}
                        onChange={(e) => setContactForm({ ...contactForm, weddingDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zpráva *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Popište vaše požadavky..."
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMobileContact(false)
                          setContactSuccess(false)
                        }}
                        className="flex-1 btn-outline"
                        disabled={isSendingContact}
                      >
                        Zrušit
                      </button>
                      <button
                        type="submit"
                        className="flex-1 btn-primary"
                        disabled={isSendingContact}
                      >
                        {isSendingContact ? 'Odesílám...' : 'Odeslat'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && vendor && (
        <ReviewForm
          vendorId={vendorId}
          vendorName={vendor.name}
          onSubmit={async (data) => {
            await createReview(data)
            setShowReviewForm(false)
            alert('Děkujeme za vaši recenzi! Bude zveřejněna po schválení administrátorem.')
          }}
          onCancel={() => setShowReviewForm(false)}
        />
      )}
    </div>
  )
}
