'use client'

import { MarketplaceVendor } from '@/types/vendor'
import VendorCard from './VendorCard'
import {
  Crown,
  Star,
  TrendingUp,
  Award
} from 'lucide-react'

interface FeaturedVendorsProps {
  vendors: MarketplaceVendor[]
}

export default function FeaturedVendors({ vendors }: FeaturedVendorsProps) {
  // Group vendors by category for better organization
  const vendorsByCategory = vendors.reduce((acc, vendor) => {
    if (!acc[vendor.category]) {
      acc[vendor.category] = []
    }
    acc[vendor.category].push(vendor)
    return acc
  }, {} as Record<string, MarketplaceVendor[]>)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Crown className="w-6 h-6 text-orange-500" />
          <h2 className="heading-2">Doporučení dodavatelé</h2>
        </div>
        <p className="body-large text-text-muted max-w-2xl mx-auto">
          Naši nejlépe hodnocení a ověření dodavatelé s výjimečnými recenzemi
        </p>
      </div>

      {/* Featured stats */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-900">
                {(vendors.reduce((sum, v) => sum + v.rating.overall, 0) / vendors.length).toFixed(1)}
              </span>
            </div>
            <p className="text-sm text-gray-600">Průměrné hodnocení</p>
          </div>
          
          <div>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Award className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold text-gray-900">
                {vendors.reduce((sum, v) => sum + v.yearsInBusiness, 0) / vendors.length}
              </span>
            </div>
            <p className="text-sm text-gray-600">Průměrné zkušenosti (roky)</p>
          </div>
          
          <div>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">
                {vendors.reduce((sum, v) => sum + v.rating.count, 0)}
              </span>
            </div>
            <p className="text-sm text-gray-600">Celkem recenzí</p>
          </div>
        </div>
      </div>

      {/* Top featured vendor */}
      {vendors.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Crown className="w-5 h-5 text-orange-500" />
            <h3 className="text-xl font-semibold text-gray-900">Nejlépe hodnocený</h3>
          </div>
          
          <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl p-1">
            <div className="bg-white rounded-lg">
              <VendorCard vendor={vendors[0]} />
            </div>
          </div>
        </div>
      )}

      {/* All featured vendors */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Všichni doporučení dodavatelé ({vendors.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </div>

      {/* Why featured section */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Proč jsou tito dodavatelé doporučení?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Vysoké hodnocení</h4>
            <p className="text-sm text-gray-600">
              Minimálně 4.5 hvězdiček od skutečných klientů
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Ověřená kvalita</h4>
            <p className="text-sm text-gray-600">
              Prověřené reference a portfolio prací
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Spolehlivost</h4>
            <p className="text-sm text-gray-600">
              Rychlá komunikace a dodržování termínů
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-orange-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Zkušenosti</h4>
            <p className="text-sm text-gray-600">
              Minimálně 5 let zkušeností ve svatebním oboru
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
