'use client'

import { MarketplaceVendor, VENDOR_CATEGORIES } from '@/types/vendor'
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Verified,
  Crown,
  Heart,
  Eye,
  MessageCircle,
  Plus,
  Check
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useVendor } from '@/hooks/useVendor'
import { useAuth } from '@/hooks/useAuth'
import { getViewTransitionName } from '@/hooks/useViewTransition'

interface VendorCardProps {
  vendor: MarketplaceVendor
  compact?: boolean
  isFavorite?: (vendorId: string) => boolean
  toggleFavorite?: (vendorId: string) => Promise<boolean>
  disableLink?: boolean
}

export default function VendorCard({ vendor, compact = false, isFavorite, toggleFavorite, disableLink = false }: VendorCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  const { user } = useAuth()
  const { vendors, createVendor } = useVendor()
  const categoryConfig = VENDOR_CATEGORIES[vendor.category]

  // Check if vendor is already in user's list
  const isVendorInList = vendors.some(v =>
    v.name.toLowerCase() === vendor.name.toLowerCase() &&
    v.category === vendor.category
  )

  // Handle adding vendor to user's list
  const handleAddToMyVendors = async () => {
    if (!user || isAdding || isVendorInList) return

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

  // Format price range
  const formatPriceRange = () => {
    const { min, max, currency, unit } = vendor.priceRange
    const formatPrice = (price: number) => {
      if (price >= 1000) {
        return `${(price / 1000).toFixed(0)}k`
      }
      return price.toString()
    }

    const unitText = {
      'per-hour': '/hod',
      'per-day': '/den',
      'per-event': '/akce',
      'per-person': '/osoba'
    }[unit] || ''

    return `${formatPrice(min)} - ${formatPrice(max)} ${currency}${unitText}`
  }

  // Get popular service
  const popularService = vendor.services.find(s => s.popular) || vendor.services[0]

  const cardContent = (
    <div
      className={`wedding-card group hover:shadow-lg transition-all duration-300 overflow-hidden ${!disableLink ? 'cursor-pointer' : ''}`}
      style={getViewTransitionName(`vendor-card-${vendor.id}`)}
    >
        {/* Image */}
        <div className="relative h-48 overflow-hidden rounded-t-xl">
          <img
            src={vendor.images[0] || '/placeholder-vendor.jpg'}
            alt={vendor.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            {vendor.featured && (
              <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full flex items-center space-x-1">
                <Crown className="w-3 h-3" />
                <span>Doporučené</span>
              </span>
            )}
            {vendor.verified && (
              <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center space-x-1">
                <Verified className="w-3 h-3" />
                <span>Ověřeno</span>
              </span>
            )}
            {vendor.premium && (
              <span className="px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded-full">
                Premium
              </span>
            )}
          </div>

          {/* Actions */}
          {isFavorite && toggleFavorite && (
            <div className="absolute top-3 right-3 flex space-x-2">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  toggleFavorite(vendor.id)
                }}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                  isFavorite(vendor.id)
                    ? 'bg-red-500 text-white'
                    : 'bg-white/80 text-gray-600 hover:bg-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite(vendor.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
          )}

          {/* Category badge */}
          <div className="absolute bottom-3 left-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryConfig?.color || 'bg-gray-100 text-gray-700'}`}>
              {categoryConfig?.icon} {categoryConfig?.name}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {vendor.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {vendor.shortDescription}
              </p>
            </div>
          </div>

          {/* Rating and reviews */}
          <div className="mb-3">
            {/* SvatBot Rating */}
            <div className="flex items-center space-x-2 mb-1">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900">
                  {vendor.rating.overall.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                ({vendor.rating.count} SvatBot recenzí)
              </span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-500">
                {vendor.yearsInBusiness} let v oboru
              </span>
            </div>

            {/* Google Rating */}
            {vendor.google?.rating && vendor.google?.reviewCount && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-900">
                    {vendor.google.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  ({vendor.google.reviewCount} Google recenzí)
                </span>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center space-x-1 mb-3">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {vendor.address.city}, {vendor.address.region}
            </span>
          </div>

          {/* Popular service */}
          {popularService && (
            <div className="mb-3 p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 line-clamp-1">
                  {popularService.name}
                </span>
                {popularService.price && (
                  <span className="text-sm font-semibold text-primary-600 whitespace-nowrap ml-2">
                    {popularService.price.toLocaleString()} Kč
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {popularService.description}
              </p>
            </div>
          )}

          {/* Price range */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">Cenové rozpětí:</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatPriceRange()}
            </span>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-1 mb-4">
            {vendor.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                {feature}
              </span>
            ))}
            {vendor.features.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{vendor.features.length - 3} dalších
              </span>
            )}
          </div>

          {/* Response time */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-gray-500">Doba odezvy:</span>
            <span className="text-xs font-medium text-green-600">
              {vendor.responseTime}
            </span>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {/* Add to my vendors button */}
            {user && !disableLink && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleAddToMyVendors()
                }}
                disabled={isAdding || isVendorInList || isAdded}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isVendorInList
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : isAdded
                      ? 'bg-green-100 text-green-700'
                      : 'bg-primary-600 text-white hover:bg-primary-500'
                }`}
              >
                {isAdding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    <span>Přidávám...</span>
                  </>
                ) : isVendorInList ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Již v seznamu</span>
                  </>
                ) : isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Přidáno!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Přidat do mých dodavatelů</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
  )

  return disableLink ? cardContent : (
    <Link href={`/marketplace/vendor/${vendor.id}`} className="block">
      {cardContent}
    </Link>
  )
}
