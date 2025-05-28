'use client'

import { useState, useEffect } from 'react'
import { MarketplaceVendor, VendorCategory } from '@/types/vendor'
import { VendorEditForm, ImageUpload } from '@/types/admin'
import { vendorStore } from '@/store/vendorStore'

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
    setLoading(true)
    try {
      // Load from vendor store
      const foundVendor = vendorStore.getVendorById(id)
      if (foundVendor) {
        setVendor(foundVendor)
        setFormData(vendorToForm(foundVendor))
      } else {
        setError('Dodavatel nenalezen')
      }
    } catch (err) {
      setError('Chyba při načítání dodavatele')
    } finally {
      setLoading(false)
    }
  }

  const saveVendor = async (data: VendorEditForm): Promise<boolean> => {
    setSaving(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log('Saving vendor:', data)

      // Update vendor store (this will automatically update all components)
      if (vendor) {
        // Update existing vendor
        const updatedVendor = formToVendor(data, vendor.id)
        vendorStore.updateVendor(vendor.id, updatedVendor)
      } else {
        // Add new vendor
        const newVendor = formToVendor(data, `vendor-${Date.now()}`)
        vendorStore.addVendor(newVendor)
      }

      setSaving(false)
      return true
    } catch (err) {
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

function getEmptyForm(): VendorEditForm {
  return {
    name: '',
    category: 'photographer',
    description: '',
    shortDescription: '',
    website: '',
    email: '',
    phone: '',
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
    images: [],
    portfolioImages: [],
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
    address: vendor.address,
    businessName: vendor.businessName || '',
    businessId: vendor.businessId || '',
    services: vendor.services.map(service => ({
      id: service.id || `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: service.name,
      description: service.description,
      price: service.price || 0,
      priceType: service.priceType as 'fixed' | 'per-person' | 'package' | 'per-hour',
      duration: service.duration,
      includes: service.includes || [],
      popular: service.popular
    })),
    priceRange: vendor.priceRange,
    images: vendor.images,
    portfolioImages: vendor.portfolioImages,
    features: vendor.features,
    specialties: vendor.specialties,
    workingRadius: vendor.workingRadius,
    availability: vendor.availability,
    verified: vendor.verified,
    featured: vendor.featured,
    premium: vendor.premium || false,
    isActive: true,
    tags: vendor.tags,
    keywords: vendor.keywords
  }
}

function formToVendor(form: VendorEditForm, id: string): MarketplaceVendor {
  const existingVendor = vendorStore.getVendorById(id)

  return {
    id,
    name: form.name,
    category: form.category as VendorCategory,
    description: form.description,
    shortDescription: form.shortDescription,
    website: form.website,
    email: form.email,
    phone: form.phone,
    address: form.address,
    businessName: form.businessName,
    businessId: form.businessId,
    services: form.services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      priceType: service.priceType === 'per-hour' ? 'hourly' : service.priceType as 'fixed' | 'hourly' | 'per-person' | 'package' | 'negotiable',
      duration: service.duration,
      includes: service.includes,
      popular: service.popular
    })),
    priceRange: form.priceRange,
    images: form.images,
    portfolioImages: form.portfolioImages,
    rating: existingVendor?.rating || { overall: 4.5, count: 0, breakdown: { quality: 4.5, communication: 4.5, value: 4.5, professionalism: 4.5 } },
    features: form.features,
    specialties: form.specialties,
    workingRadius: form.workingRadius,
    availability: form.availability,
    testimonials: existingVendor?.testimonials || [],
    yearsInBusiness: existingVendor?.yearsInBusiness || 1,
    verified: form.verified,
    featured: form.featured,
    premium: form.premium,
    responseTime: existingVendor?.responseTime || '< 24 hours',
    tags: form.tags,
    keywords: form.keywords,
    createdAt: existingVendor?.createdAt || new Date(),
    updatedAt: new Date(),
    lastActive: new Date()
  }
}
