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
      className={`group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300 flex flex-col h-full relative ${!disableLink ? 'cursor-pointer' : ''}`}
      style={getViewTransitionName(`vendor-card-${vendor.id}`)}
    >
        {/* Image Container */}
        <div className="relative h-56 overflow-hidden bg-stone-100">
          <img
            src={vendor.mainImage || vendor.images[0] || '/placeholder-vendor.jpg'}
            alt={vendor.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {vendor.premium && (
              <span className="bg-white/90 backdrop-blur text-stone-900 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm border border-stone-100">
                Premium
              </span>
            )}
            {vendor.verified && (
              <span className="bg-pink-400 text-stone-900 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Verified size={10} /> Ověřeno
              </span>
            )}
          </div>

          {/* Like Button */}
          {isFavorite && toggleFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleFavorite(vendor.id)
              }}
              className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                isFavorite(vendor.id)
                  ? 'bg-red-500 text-white'
                  : 'bg-white/20 hover:bg-white text-white hover:text-pink-500'
              }`}
            >
              <Heart size={16} className={isFavorite(vendor.id) ? 'fill-current' : ''} />
            </button>
          )}

          {/* Price overlay */}
          <div className="absolute bottom-3 left-3 text-white font-medium text-sm backdrop-blur-md bg-black/20 px-2 py-1 rounded-lg border border-white/20">
            {formatPriceRange().split('-')[0].trim()}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wide mt-1">
              {categoryConfig?.name || 'Ostatní'}
            </div>

            {/* Ratings Stack - Both Svatbot and Google */}
            <div className="flex flex-col items-end gap-1.5">
              {/* Svatbot Rating - Using Primary Pink */}
              <div className="flex items-center gap-1 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100">
                <div className="w-3.5 h-3.5 rounded-full bg-pink-400 text-stone-900 flex items-center justify-center text-[8px] font-bold">S</div>
                <span className="text-stone-900 font-bold text-xs">{vendor.rating.overall.toFixed(1)}</span>
                <div className="flex gap-0.5">
                   <Star size={10} className="text-pink-400 fill-pink-400" />
                </div>
                <span className="text-stone-400 text-[10px]">({vendor.rating.count})</span>
              </div>

              {/* Google Rating (if exists) - Using Google Blue/Colors */}
              {vendor.google?.rating && vendor.google?.reviewCount && vendor.google.rating > 0 && (
                <div className="flex items-center gap-1 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-100">
                   <div className="w-3.5 h-3.5 flex items-center justify-center">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="G" className="w-full h-full" />
                   </div>
                   <span className="text-stone-900 font-bold text-xs">{vendor.google.rating.toFixed(1)}</span>
                   <div className="flex gap-0.5">
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                   </div>
                   <span className="text-stone-400 text-[10px]">({vendor.google.reviewCount})</span>
                </div>
              )}
            </div>
          </div>

          <h3 className="font-serif font-bold text-xl text-stone-900 mb-2 group-hover:text-pink-500 transition-colors line-clamp-1">
            {vendor.name}
          </h3>

          <div className="flex items-center gap-1 text-stone-500 text-sm mb-4">
            <MapPin size={14} />
            {vendor.address.city}, {vendor.address.region}
          </div>

          <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
             {/* Simple tags preview */}
             <div className="flex gap-2 overflow-hidden">
                {(vendor.features || []).slice(0,2).map((tag, i) => (
                  <span key={i} className="text-[10px] bg-stone-50 text-stone-500 px-2 py-1 rounded-md border border-stone-100 whitespace-nowrap">
                    {tag}
                  </span>
                ))}
             </div>

             <span className="text-stone-900 text-xs font-bold hover:underline decoration-pink-400 decoration-2 cursor-pointer whitespace-nowrap ml-2">
               Detail
             </span>
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
