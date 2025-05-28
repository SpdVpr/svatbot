import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin, Heart, Verified, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useAuth } from '../src/hooks/useAuth'
import { useFavorites } from '../hooks/useFavorites'

interface VendorCardProps {
  vendor: {
    id: string
    name: string
    category: string
    shortDescription: string
    verified: boolean
    featured: boolean
    premium: boolean
    rating: {
      overall: number
      count: number
    }
    priceRange?: {
      min: number
      max: number
      currency: string
    }
    address: {
      city: string
      region: string
    }
    images: string[]
    isFavorited?: boolean
  }
  showFavorite?: boolean
  onClick?: () => void
}

export function VendorCard({ vendor, showFavorite = true, onClick }: VendorCardProps) {
  const { user } = useAuth()
  const { toggleFavorite, loading: favoriteLoading } = useFavorites()

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      // Redirect to login or show login modal
      return
    }

    await toggleFavorite(vendor.id)
  }

  const formatPrice = (priceRange: any) => {
    if (!priceRange) return 'Cena na dotaz'

    const { min, max, currency } = priceRange
    if (min === max) {
      return `${min.toLocaleString()} ${currency}`
    }
    return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`
  }

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      photographer: 'Fotograf',
      videographer: 'Kameraman',
      venue: 'Místo konání',
      catering: 'Catering',
      flowers: 'Květiny',
      music: 'Hudba',
      decoration: 'Dekorace',
      dress: 'Šaty',
      suit: 'Oblek',
      makeup: 'Make-up',
      hair: 'Kadeřnictví',
      transport: 'Doprava',
      cake: 'Dort',
      jewelry: 'Šperky',
      invitations: 'Pozvánky',
      other: 'Ostatní'
    }
    return labels[category] || category
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden">
      {vendor.featured && (
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="secondary" className="bg-yellow-500 text-white">
            <Crown className="w-3 h-3 mr-1" />
            Doporučeno
          </Badge>
        </div>
      )}

      {showFavorite && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 z-10 p-2 bg-white/80 hover:bg-white"
          onClick={handleFavoriteClick}
          disabled={favoriteLoading}
        >
          <Heart
            className={`w-4 h-4 ${vendor.isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </Button>
      )}

      <Link href={`/vendors/${vendor.id}`} onClick={onClick}>
        <div className="relative h-48 overflow-hidden">
          {vendor.images.length > 0 ? (
            <Image
              src={vendor.images[0]}
              alt={vendor.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">Bez obrázku</span>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {vendor.name}
                </h3>
                {vendor.verified && (
                  <Verified className="w-4 h-4 text-blue-500" />
                )}
                {vendor.premium && (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </div>

              <Badge variant="outline" className="mb-2">
                {getCategoryLabel(vendor.category)}
              </Badge>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {vendor.shortDescription}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{vendor.address.city}</span>
            </div>

            {vendor.rating.count > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-900">
                  {vendor.rating.overall.toFixed(1)}
                </span>
                <span>({vendor.rating.count})</span>
              </div>
            )}
          </div>

          <div className="text-sm font-medium text-primary">
            {formatPrice(vendor.priceRange)}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button className="w-full" variant="outline">
            Zobrazit detail
          </Button>
        </CardFooter>
      </Link>
    </Card>
  )
}

// Loading skeleton for vendor card
export function VendorCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-48 bg-gray-200 animate-pulse" />
      <CardContent className="p-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-20" />
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-3" />
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-3 w-32" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="h-10 bg-gray-200 rounded animate-pulse w-full" />
      </CardFooter>
    </Card>
  )
}
