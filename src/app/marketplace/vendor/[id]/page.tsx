'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useMarketplace } from '@/hooks/useMarketplace'
import { VENDOR_CATEGORIES } from '@/types/vendor'
import ImageGallery, { SimpleImageGallery } from '@/components/ui/ImageGallery'
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
  Edit3
} from 'lucide-react'
import { useVendor } from '@/hooks/useVendor'
import { useAuth } from '@/hooks/useAuth'
import { useFavoriteVendors } from '@/hooks/useFavoriteVendors'
import { useVendorReviews } from '@/hooks/useVendorReviews'
import ReviewForm from '@/components/marketplace/ReviewForm'
import ReviewList from '@/components/marketplace/ReviewList'
import Link from 'next/link'
import { useState, useEffect } from 'react'

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

  const vendorId = params.id as string
  const vendor = getVendorById(vendorId)
  
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-desktop py-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Zpět</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => toggleFavorite(vendorId)}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite(vendorId)
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-600 text-white hover:bg-gray-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite(vendorId) ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 bg-gray-600 text-white hover:bg-gray-500 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="container-desktop py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative">
                <ImageGallery
                  images={[...vendor.images, ...vendor.portfolioImages]}
                  className="w-full"
                />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2 z-10">
                  {vendor.featured && (
                    <span className="px-3 py-1 bg-orange-500 text-white text-sm font-medium rounded-full flex items-center space-x-1">
                      <Crown className="w-4 h-4" />
                      <span>Doporučené</span>
                    </span>
                  )}
                  {vendor.verified && (
                    <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full flex items-center space-x-1">
                      <Verified className="w-4 h-4" />
                      <span>Ověřeno</span>
                    </span>
                  )}
                  {vendor.premium && (
                    <span className="px-3 py-1 bg-purple-500 text-white text-sm font-medium rounded-full">
                      Premium
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryConfig?.color || 'bg-gray-100 text-gray-700'}`}>
                    {categoryConfig?.icon} {categoryConfig?.name}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">{vendor.name}</h1>
                <p className="text-lg text-gray-600">{vendor.shortDescription}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-xl font-bold text-gray-900">
                      {vendor.rating.overall.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-gray-600">
                    ({vendor.rating.count} recenzí)
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-gray-600">
                  <Award className="w-4 h-4" />
                  <span>{vendor.yearsInBusiness} let v oboru</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    {vendor.address.street}, {vendor.address.city}, {vendor.address.region}
                  </span>
                </div>

                {vendor.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <a href={`tel:${vendor.phone}`} className="text-primary-600 hover:underline">
                      {vendor.phone}
                    </a>
                  </div>
                )}

                {vendor.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a href={`mailto:${vendor.email}`} className="text-primary-600 hover:underline">
                      {vendor.email}
                    </a>
                  </div>
                )}

                {vendor.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      Webové stránky
                    </a>
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cenové rozpětí:</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatPriceRange()}
                  </span>
                </div>
              </div>

              {/* Add to my vendors button */}
              {user && (
                <button
                  onClick={handleAddToMyVendors}
                  disabled={isAdding || isVendorInList || isAdded}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-4 ${
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
                      <span>Přidávám do seznamu...</span>
                    </>
                  ) : isVendorInList ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Již v mém seznamu dodavatelů</span>
                    </>
                  ) : isAdded ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Přidáno do seznamu!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Přidat do mých dodavatelů</span>
                    </>
                  )}
                </button>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowContactForm(true)}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Kontaktovat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-desktop py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="wedding-card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">O nás</h2>
              <p className="text-gray-700 leading-relaxed">{vendor.description}</p>
            </div>

            {/* Services */}
            <div className="wedding-card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Naše služby</h2>
              <div className="space-y-4">
                {vendor.services.map((service) => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{service.name}</h3>
                      {service.price && (
                        <span className="text-lg font-semibold text-primary-600">
                          {service.price.toLocaleString()} Kč
                        </span>
                      )}
                      {service.popular && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                          Populární
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{service.description}</p>
                    {service.includes && service.includes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Zahrnuje:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {service.includes.map((item, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Features & Specialties */}
            <div className="wedding-card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Naše speciality</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Vlastnosti</h3>
                  <div className="flex flex-wrap gap-2">
                    {vendor.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Specializace</h3>
                  <div className="flex flex-wrap gap-2">
                    {vendor.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="wedding-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recenze a hodnocení</h2>
                {user && !hasUserReviewed(vendorId) && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Napsat recenzi</span>
                  </button>
                )}
                {user && hasUserReviewed(vendorId) && (
                  <span className="flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Již jste recenzovali</span>
                  </span>
                )}
                {!user && (
                  <Link
                    href="/auth/login"
                    className="text-sm text-primary-600 hover:underline"
                  >
                    Přihlaste se pro napsání recenze
                  </Link>
                )}
              </div>

              {reviewsLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-500 mt-4">Načítání recenzí...</p>
                </div>
              ) : (
                <ReviewList reviews={reviews} stats={stats} showStats={true} />
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <div className="wedding-card">
              <h3 className="font-semibold text-gray-900 mb-4">Rychlý kontakt</h3>
              <div className="space-y-3">
                {vendor.phone && (
                  <a
                    href={`tel:${vendor.phone}`}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-primary-600" />
                    <span className="text-gray-900">{vendor.phone}</span>
                  </a>
                )}
                {vendor.email && (
                  <a
                    href={`mailto:${vendor.email}`}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Mail className="w-5 h-5 text-primary-600" />
                    <span className="text-gray-900">{vendor.email}</span>
                  </a>
                )}
                {vendor.website && (
                  <a
                    href={vendor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Globe className="w-5 h-5 text-primary-600" />
                    <span className="text-gray-900">Webové stránky</span>
                  </a>
                )}
              </div>
            </div>

            {/* Working Hours */}
            <div className="wedding-card">
              <h3 className="font-semibold text-gray-900 mb-4">Pracovní doba</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">
                    {vendor.availability.workingHours.start} - {vendor.availability.workingHours.end}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Pracovní dny: {vendor.availability.workingDays.length} dní v týdnu
                </div>
              </div>
            </div>

            {/* Awards & Certifications */}
            {(vendor.awards || vendor.certifications) && (
              <div className="wedding-card">
                <h3 className="font-semibold text-gray-900 mb-4">Ocenění & Certifikace</h3>
                <div className="space-y-3">
                  {vendor.awards?.map((award, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-700">{award}</span>
                    </div>
                  ))}
                  {vendor.certifications?.map((cert, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Kontaktovat {vendor.name}</h3>
              <button
                onClick={() => setShowContactForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vaše jméno
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Jméno a příjmení"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zpráva
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Popište vaše požadavky..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 btn-outline"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Odeslat
                </button>
              </div>
            </form>
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
