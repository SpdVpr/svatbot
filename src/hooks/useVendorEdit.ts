'use client'

import { useState, useEffect } from 'react'
import { MarketplaceVendor, VendorCategory } from '@/types/vendor'
import { VendorEditForm, ImageUpload } from '@/types/admin'
import { db } from '@/config/firebase'
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'

export function useVendorEdit(vendorId?: string) {
  const [vendor, setVendor] = useState<MarketplaceVendor | null>(null)
  const [formData, setFormData] = useState<VendorEditForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUploads, setImageUploads] = useState<ImageUpload[]>([])
  const [portfolioUploads, setPortfolioUploads] = useState<ImageUpload[]>([])

  useEffect(() => {
    if (vendorId) {
      loadVendor(vendorId)
    } else {
      // New vendor
      setFormData(getEmptyForm())
      setLoading(false)
    }
  }, [vendorId])

  const loadVendor = async (id: string) => {
    console.log('🔄 Loading vendor:', id)
    setLoading(true)
    try {
      // Load from Firestore
      const vendorRef = doc(db, 'marketplaceVendors', id)
      const vendorSnap = await getDoc(vendorRef)

      if (vendorSnap.exists()) {
        const data = vendorSnap.data()
        console.log('📦 Raw vendor data from Firestore:', data)

        const foundVendor: MarketplaceVendor = {
          id: vendorSnap.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
          lastActive: data.lastActive instanceof Timestamp ? data.lastActive.toDate() : new Date()
        } as MarketplaceVendor

        console.log('✅ Vendor loaded:', foundVendor)
        setVendor(foundVendor)

        const form = vendorToForm(foundVendor)
        console.log('📝 Form data created:', form)
        setFormData(form)
      } else {
        console.error('❌ Vendor not found in Firestore')
        setError('Dodavatel nenalezen')
      }
    } catch (err) {
      console.error('❌ Error loading vendor:', err)
      setError('Chyba při načítání dodavatele')
    } finally {
      setLoading(false)
    }
  }

  const saveVendor = async (data: VendorEditForm): Promise<boolean> => {
    setSaving(true)
    setError(null)

    try {
      if (vendor) {
        // Update existing vendor in Firestore
        const vendorRef = doc(db, 'marketplaceVendors', vendor.id)
        const updatedData = formToVendorData(data)

        console.log('💾 Saving vendor data:', updatedData)

        // Remove any undefined values recursively
        const cleanData = removeUndefined(updatedData)
        console.log('🧹 Cleaned data:', cleanData)

        await updateDoc(vendorRef, {
          ...cleanData,
          updatedAt: Timestamp.now()
        })

        console.log('✅ Vendor updated successfully:', vendor.id)
      } else {
        setError('Vendor ID not found')
        setSaving(false)
        return false
      }

      setSaving(false)
      return true
    } catch (err) {
      console.error('Error saving vendor:', err)
      setError('Chyba při ukládání dodavatele')
      setSaving(false)
      return false
    }
  }

  const uploadImage = async (file: File, type: 'main' | 'portfolio'): Promise<string> => {
    // Simulate image upload
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        // In production, this would upload to cloud storage
        const dataUrl = reader.result as string
        setTimeout(() => resolve(dataUrl), 1000)
      }
      reader.readAsDataURL(file)
    })
  }

  const addImageUpload = (file: File, type: 'main' | 'portfolio') => {
    const upload: ImageUpload = {
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      uploaded: false
    }

    if (type === 'main') {
      setImageUploads(prev => [...prev, upload])
    } else {
      setPortfolioUploads(prev => [...prev, upload])
    }
  }

  const removeImageUpload = (index: number, type: 'main' | 'portfolio') => {
    if (type === 'main') {
      setImageUploads(prev => prev.filter((_, i) => i !== index))
    } else {
      setPortfolioUploads(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updateFormData = (updates: Partial<VendorEditForm>) => {
    setFormData(prev => prev ? { ...prev, ...updates } : null)
  }

  return {
    vendor,
    formData,
    loading,
    saving,
    error,
    imageUploads,
    portfolioUploads,
    saveVendor,
    uploadImage,
    addImageUpload,
    removeImageUpload,
    updateFormData
  }
}

// Remove undefined values from object recursively
function removeUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefined(item))
  }

  if (typeof obj === 'object') {
    const cleaned: any = {}
    for (const key in obj) {
      if (obj[key] !== undefined) {
        cleaned[key] = removeUndefined(obj[key])
      }
    }
    return cleaned
  }

  return obj
}

function getEmptyForm(): VendorEditForm {
  return {
    name: '',
    category: 'photographer',
    description: '',
    shortDescription: '',
    website: '',
    email: '',
    phone: '',
    socialMedia: {
      instagram: '',
      facebook: '',
      youtube: '',
      tiktok: '',
      linkedin: ''
    },
    address: {
      street: '',
      city: '',
      postalCode: '',
      region: ''
    },
    businessName: '',
    businessId: '',
    services: [],
    priceRange: {
      min: 0,
      max: 0,
      currency: 'CZK',
      unit: 'per-event'
    },
    logo: '',
    mainImage: '',
    mainVideoUrl: '',
    images: [],
    portfolioImages: [],
    videoUrl: '',
    features: [],
    specialties: [],
    workingRadius: 50,
    availability: {
      workingDays: [],
      workingHours: { start: '09:00', end: '17:00' }
    },
    verified: false,
    featured: false,
    premium: false,
    isActive: true,
    tags: [],
    keywords: []
  }
}

function vendorToForm(vendor: MarketplaceVendor): VendorEditForm {
  return {
    name: vendor.name,
    category: vendor.category,
    description: vendor.description,
    shortDescription: vendor.shortDescription,
    website: vendor.website || '',
    email: vendor.email || '',
    phone: vendor.phone || '',
    socialMedia: vendor.socialMedia || {
      instagram: '',
      facebook: '',
      youtube: '',
      tiktok: '',
      linkedin: ''
    },
    address: vendor.address,
    businessName: vendor.businessName || '',
    businessId: vendor.businessId || '',
    services: vendor.services?.map(service => ({
      id: service.id || `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: service.name,
      description: service.description,
      price: service.price || 0,
      priceType: service.priceType as 'fixed' | 'per-person' | 'package' | 'per-hour',
      duration: service.duration,
      includes: service.includes || [],
      popular: service.popular
    })) || [],
    priceRange: vendor.priceRange,
    logo: vendor.logo || '',
    mainImage: vendor.mainImage || vendor.images?.[0] || '',
    mainVideoUrl: vendor.mainVideoUrl || '',
    images: vendor.images || [],
    portfolioImages: vendor.portfolioImages || [],
    videoUrl: vendor.videoUrl || '',
    features: vendor.features || [],
    specialties: vendor.specialties || [],
    workingRadius: vendor.workingRadius || 50,
    availability: vendor.availability || {
      workingDays: [],
      workingHours: { start: '09:00', end: '17:00' }
    },
    verified: vendor.verified || false,
    featured: vendor.featured || false,
    premium: vendor.premium || false,
    isActive: true,
    tags: vendor.tags || [],
    keywords: vendor.keywords || [],
    google: vendor.google || undefined
  }
}

// Extract Place ID from Google Maps URL
function extractPlaceIdFromUrl(url: string): string | null {
  if (!url) return null

  console.log('🔍 Extracting Place ID from URL:', url)

  // Try to extract from various Google Maps URL formats

  // Format 1: ChIJ... directly in URL (most reliable)
  const chijMatch = url.match(/(ChIJ[A-Za-z0-9_-]+)/)
  if (chijMatch) {
    console.log('✅ Found ChIJ Place ID:', chijMatch[1])
    return chijMatch[1]
  }

  // Format 2: ?cid=123456789 (numeric CID)
  const cidMatch = url.match(/[?&]cid=(\d+)/)
  if (cidMatch) {
    console.log('✅ Found CID:', cidMatch[1])
    return cidMatch[1]
  }

  // Format 3: Feature ID in data parameter (!1s0x...:0x...)
  // This is NOT a Place ID, but we can extract it and note it needs conversion
  const featureIdMatch = url.match(/!1s(0x[a-f0-9]+:0x[a-f0-9]+)/)
  if (featureIdMatch) {
    console.log('⚠️ Found Feature ID (not Place ID):', featureIdMatch[1])
    console.log('💡 Please use Google Place ID Finder to get the correct Place ID')
    // Return null because Feature ID won't work with Places API
    return null
  }

  // Format 4: /place/Name/data=...!1s... (other formats)
  const placeIdMatch = url.match(/!1s([A-Za-z0-9_-]+)/)
  if (placeIdMatch && placeIdMatch[1].startsWith('ChIJ')) {
    console.log('✅ Found Place ID in data:', placeIdMatch[1])
    return placeIdMatch[1]
  }

  console.log('❌ Could not extract Place ID from URL')
  return null
}

// Convert form data to Firestore update object
function formToVendorData(form: VendorEditForm): any {
  const data: any = {
    name: form.name,
    category: form.category,
    description: form.description,
    shortDescription: form.shortDescription,
    website: form.website || '',
    email: form.email,
    phone: form.phone,
    address: form.address,
    businessName: form.businessName || '',
    businessId: form.businessId || '',
    services: form.services || [],
    priceRange: form.priceRange,
    logo: form.logo || '',
    mainImage: form.mainImage || '',
    mainVideoUrl: form.mainVideoUrl || '',
    images: form.images || [],
    portfolioImages: form.portfolioImages || [],
    videoUrl: form.videoUrl || '',
    features: form.features || [],
    specialties: form.specialties || [],
    workingRadius: form.workingRadius || 50,
    availability: form.availability,
    verified: form.verified,
    featured: form.featured,
    premium: form.premium,
    tags: form.tags || [],
    keywords: form.keywords || []
  }

  // Only add socialMedia if at least one field has a value
  if (form.socialMedia) {
    const socialMedia: any = {}
    if (form.socialMedia.instagram?.trim()) socialMedia.instagram = form.socialMedia.instagram.trim()
    if (form.socialMedia.facebook?.trim()) socialMedia.facebook = form.socialMedia.facebook.trim()
    if (form.socialMedia.youtube?.trim()) socialMedia.youtube = form.socialMedia.youtube.trim()
    if (form.socialMedia.tiktok?.trim()) socialMedia.tiktok = form.socialMedia.tiktok.trim()
    if (form.socialMedia.linkedin?.trim()) socialMedia.linkedin = form.socialMedia.linkedin.trim()

    // Only add socialMedia to data if at least one field exists
    if (Object.keys(socialMedia).length > 0) {
      data.socialMedia = socialMedia
    }
  }

  // Only add google field if it has data
  if (form.google && (form.google.placeId || form.google.mapsUrl)) {
    let placeId = form.google.placeId || null

    // Try to extract Place ID from Maps URL if not provided
    if (!placeId && form.google.mapsUrl) {
      placeId = extractPlaceIdFromUrl(form.google.mapsUrl)
      console.log('🔍 Extracted Place ID from URL:', placeId)
    }

    data.google = {
      placeId: placeId,
      mapsUrl: form.google.mapsUrl || null,
      rating: form.google.rating || null,
      reviewCount: form.google.reviewCount || null,
      reviews: form.google.reviews || null,
      lastUpdated: form.google.lastUpdated || null
    }
  }

  return data
}
