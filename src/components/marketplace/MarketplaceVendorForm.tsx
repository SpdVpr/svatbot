'use client'

import { useState, useRef } from 'react'
import {
  X,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  DollarSign,
  Upload,
  CheckCircle
} from 'lucide-react'
import { VendorCategory, VENDOR_CATEGORIES } from '@/types/vendor'
import ImageUploadSection from './ImageUploadSection'
import { ensureUrlProtocol } from '@/utils/url'
import PlaceIdFinder from './PlaceIdFinder'

export interface MarketplaceVendorFormData {
  // Basic info
  name: string
  category: VendorCategory
  description: string
  shortDescription: string

  // Contact
  email: string
  phone: string
  website?: string

  // Google integration
  google?: {
    placeId?: string
    mapsUrl?: string
  }

  // Address
  address: {
    street: string
    city: string
    postalCode: string
    region: string
  }

  // Business
  businessName?: string
  businessId?: string // IČO
  vatNumber?: string // DIČ

  // Services
  services: {
    name: string
    description: string
    price?: number
    priceType: 'fixed' | 'hourly' | 'per-person' | 'package' | 'negotiable'
    duration?: string
    includes: string[]
  }[]

  // Pricing
  priceRange: {
    min: number
    max: number
    currency: string
    unit: string
  }

  // Features
  features: string[]
  specialties: string[]
  workingRadius: number
  yearsInBusiness: number

  // Availability
  availability: {
    workingDays: string[]
    workingHours: {
      start: string
      end: string
    }
  }

  // Images (URLs for now, later can be file uploads)
  images: string[]
  portfolioImages: string[]
  videoUrl?: string

  // Response time
  responseTime: string

  // SEO and discovery
  tags: string[]
  keywords: string[]
}

interface MarketplaceVendorFormProps {
  onSubmit: (data: MarketplaceVendorFormData) => Promise<void>
  onCancel: () => void
  initialData?: Partial<MarketplaceVendorFormData>
  submitButtonText?: string
}

export default function MarketplaceVendorForm({ onSubmit, onCancel, initialData, submitButtonText = 'Odeslat registraci' }: MarketplaceVendorFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const justMovedToStep5Ref = useRef(false)

  const [formData, setFormData] = useState<MarketplaceVendorFormData>({
    name: initialData?.name || '',
    category: initialData?.category || 'photographer',
    description: initialData?.description || '',
    shortDescription: initialData?.shortDescription || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    website: initialData?.website || '',
    google: initialData?.google || {
      placeId: '',
      mapsUrl: ''
    },
    address: initialData?.address || {
      street: '',
      city: '',
      postalCode: '',
      region: 'Praha'
    },
    businessName: initialData?.businessName || '',
    businessId: initialData?.businessId || '',
    vatNumber: initialData?.vatNumber || '',
    services: initialData?.services || [{
      name: '',
      description: '',
      price: undefined,
      priceType: 'package',
      duration: '',
      includes: ['']
    }],
    priceRange: initialData?.priceRange || {
      min: 0,
      max: 0,
      currency: 'CZK',
      unit: 'per-event'
    },
    features: initialData?.features || [],
    specialties: initialData?.specialties || [],
    workingRadius: initialData?.workingRadius || 50,
    yearsInBusiness: initialData?.yearsInBusiness || 0,
    availability: initialData?.availability || {
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      workingHours: {
        start: '09:00',
        end: '18:00'
      }
    },
    images: initialData?.images || [],
    portfolioImages: initialData?.portfolioImages || [],
    videoUrl: initialData?.videoUrl || '',
    responseTime: initialData?.responseTime || '< 24 hours',
    tags: initialData?.tags || [],
    keywords: initialData?.keywords || []
  })

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof MarketplaceVendorFormData] as any),
        [field]: value
      }
    }))
  }

  const handlePlaceSelected = (placeId: string, mapsUrl: string, placeName: string) => {
    console.log('✅ Place selected in form:', { placeId, mapsUrl, placeName })
    setFormData(prev => ({
      ...prev,
      google: {
        placeId,
        mapsUrl
      }
    }))
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Název je povinný'
      if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Krátký popis je povinný'
      if (!formData.description.trim()) newErrors.description = 'Popis je povinný'
    }

    if (step === 2) {
      if (!formData.email.trim()) newErrors.email = 'Email je povinný'
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Neplatný formát emailu'
      }
      if (!formData.phone.trim()) newErrors.phone = 'Telefon je povinný'
      if (!formData.address.city.trim()) newErrors.city = 'Město je povinné'
    }

    if (step === 3) {
      if (formData.services.length === 0) {
        newErrors.services = 'Přidejte alespoň jednu službu'
      }
      formData.services.forEach((service, index) => {
        if (!service.name.trim()) {
          newErrors[`service_${index}_name`] = 'Název služby je povinný'
        }
      })
    }

    if (step === 4) {
      // Portfolio and availability - optional, no blocking validation
      // Users can proceed to summary even without images
    }

    // Step 5 is summary - no validation needed

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    console.log('🔵 handleNext called, currentStep:', currentStep)
    if (validateStep(currentStep)) {
      const nextStep = Math.min(currentStep + 1, 5)
      console.log('✅ Validation passed, moving to step:', nextStep)

      // If moving to step 5, set flag to prevent immediate submit
      if (nextStep === 5) {
        justMovedToStep5Ref.current = true
        console.log('🛡️ Set justMovedToStep5 flag to prevent immediate submit')
        // Clear flag after a short delay
        setTimeout(() => {
          justMovedToStep5Ref.current = false
          console.log('✅ Cleared justMovedToStep5 flag')
        }, 100)
      }

      setCurrentStep(nextStep)
    } else {
      console.log('❌ Validation failed for step:', currentStep)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔴 handleSubmit called, currentStep:', currentStep, 'justMovedToStep5:', justMovedToStep5Ref.current)

    // Prevent submit if we just moved to step 5
    if (justMovedToStep5Ref.current) {
      console.log('🛡️ Just moved to step 5, preventing immediate submit')
      return
    }

    // Only submit on step 5 (summary)
    if (currentStep !== 5) {
      console.log('⚠️ Not on step 5, ignoring submit')
      return
    }

    console.log('✅ On step 5, proceeding with submit')
    try {
      setSaving(true)
      // Ensure URLs have protocol before submitting
      const dataToSubmit = {
        ...formData,
        website: formData.website ? ensureUrlProtocol(formData.website) : undefined,
        videoUrl: formData.videoUrl ? ensureUrlProtocol(formData.videoUrl) : undefined
      }
      await onSubmit(dataToSubmit)
    } catch (error) {
      console.error('Error saving vendor:', error)
      setErrors({ general: 'Chyba při ukládání inzerátu' })
    } finally {
      setSaving(false)
    }
  }

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, {
        name: '',
        description: '',
        price: undefined,
        priceType: 'package',
        duration: '',
        includes: ['']
      }]
    }))
  }

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }))
  }

  const updateService = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) =>
        i === index ? { ...service, [field]: value } : service
      )
    }))
  }

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }))
  }

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }))
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  // Specialties management
  const addSpecialty = () => {
    setFormData(prev => ({
      ...prev,
      specialties: [...prev.specialties, '']
    }))
  }

  const updateSpecialty = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.map((s, i) => i === index ? value : s)
    }))
  }

  const removeSpecialty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }))
  }

  // Tags management
  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }))
  }

  const updateTag = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((t, i) => i === index ? value : t)
    }))
  }

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  // Keywords management
  const addKeyword = () => {
    setFormData(prev => ({
      ...prev,
      keywords: [...prev.keywords, '']
    }))
  }

  const updateKeyword = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.map((k, i) => i === index ? value : k)
    }))
  }

  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }))
  }

  const steps = [
    { number: 1, title: 'Základní informace', icon: Building },
    { number: 2, title: 'Kontakt a adresa', icon: MapPin },
    { number: 3, title: 'Služby a ceny', icon: DollarSign },
    { number: 4, title: 'Portfolio a dostupnost', icon: Upload },
    { number: 5, title: 'Souhrn a odeslání', icon: CheckCircle }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Registrace dodavatele</h2>
            <p className="text-sm text-gray-600 mt-1">Přidejte svůj inzerát do marketplace</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.number
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 text-center ${
                    currentStep >= step.number ? 'text-primary-600 font-medium' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 ${
                    currentStep > step.number ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            // Prevent Enter key from submitting form on steps 1-4
            if (e.key === 'Enter' && currentStep < 5) {
              e.preventDefault()
              console.log('⚠️ Enter key pressed on step', currentStep, '- prevented default submit')
            }
          }}
        >
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {errors.general && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategorie *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value as VendorCategory)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {Object.entries(VENDOR_CATEGORIES).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.icon} {value.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Název firmy / služby *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="např. Studio Foto Praha"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Krátký popis (1 věta) *
                  </label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) => handleChange('shortDescription', e.target.value)}
                    placeholder="Stručně popište vaši službu v jedné větě"
                    maxLength={150}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.shortDescription ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.shortDescription && <p className="mt-1 text-sm text-red-600">{errors.shortDescription}</p>}
                  <p className="mt-1 text-xs text-gray-500">{formData.shortDescription.length}/150 znaků</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailní popis *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Podrobně popište vaše služby, zkušenosti a co vás odlišuje od konkurence..."
                    rows={6}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roky v oboru
                    </label>
                    <input
                      type="number"
                      value={formData.yearsInBusiness}
                      onChange={(e) => handleChange('yearsInBusiness', parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Hide working radius for categories where it doesn't make sense */}
                  {!['venue', 'accommodation', 'printing', 'other'].includes(formData.category) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pracovní rádius (km)
                      </label>
                      <input
                        type="number"
                        value={formData.workingRadius || ''}
                        onChange={(e) => handleChange('workingRadius', e.target.value === '' ? 0 : parseInt(e.target.value))}
                        min="0"
                        placeholder="např. 50"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Contact & Address */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="vas@email.cz"
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+420 123 456 789"
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webové stránky
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="www.vase-stranky.cz"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Google Integration */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="w-8 h-8" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-blue-900 mb-1">
                          🌟 Google hodnocení (volitelné, ale doporučené)
                        </h4>
                        <p className="text-sm text-blue-800">
                          Propojte svůj Google Business profil a automaticky zobrazujte své Google recenze a hodnocení na marketplace.
                        </p>
                      </div>
                    </div>
                  </div>

                  <PlaceIdFinder
                    onPlaceSelected={handlePlaceSelected}
                    initialValue={formData.name}
                  />

                  {/* Display selected values */}
                  {formData.google?.placeId && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h5 className="text-sm font-semibold text-gray-900 mb-2">
                        📍 Vybrané místo:
                      </h5>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-gray-600">Place ID:</span>
                          <code className="ml-2 px-2 py-1 bg-white rounded border border-gray-200 font-mono">
                            {formData.google.placeId}
                          </code>
                        </div>
                        {formData.google.mapsUrl && (
                          <div>
                            <span className="text-gray-600">Google Maps URL:</span>
                            <a
                              href={formData.google.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-blue-600 hover:underline break-all"
                            >
                              {formData.google.mapsUrl}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Adresa</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ulice a číslo popisné
                      </label>
                      <input
                        type="text"
                        value={formData.address.street}
                        onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
                        placeholder="např. Hlavní 123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Město *
                        </label>
                        <input
                          type="text"
                          value={formData.address.city}
                          onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                          placeholder="Praha"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            errors.city ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          PSČ
                        </label>
                        <input
                          type="text"
                          value={formData.address.postalCode}
                          onChange={(e) => handleNestedChange('address', 'postalCode', e.target.value)}
                          placeholder="110 00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kraj
                      </label>
                      <select
                        value={formData.address.region}
                        onChange={(e) => handleNestedChange('address', 'region', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="Praha">Praha</option>
                        <option value="Středočeský kraj">Středočeský kraj</option>
                        <option value="Jihočeský kraj">Jihočeský kraj</option>
                        <option value="Plzeňský kraj">Plzeňský kraj</option>
                        <option value="Karlovarský kraj">Karlovarský kraj</option>
                        <option value="Ústecký kraj">Ústecký kraj</option>
                        <option value="Liberecký kraj">Liberecký kraj</option>
                        <option value="Královéhradecký kraj">Královéhradecký kraj</option>
                        <option value="Pardubický kraj">Pardubický kraj</option>
                        <option value="Vysočina">Vysočina</option>
                        <option value="Jihomoravský kraj">Jihomoravský kraj</option>
                        <option value="Olomoucký kraj">Olomoucký kraj</option>
                        <option value="Zlínský kraj">Zlínský kraj</option>
                        <option value="Moravskoslezský kraj">Moravskoslezský kraj</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Firemní údaje (volitelné)</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Název firmy
                      </label>
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => handleChange('businessName', e.target.value)}
                        placeholder="např. Studio Foto s.r.o."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          IČO
                        </label>
                        <input
                          type="text"
                          value={formData.businessId}
                          onChange={(e) => handleChange('businessId', e.target.value)}
                          placeholder="12345678"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          DIČ
                        </label>
                        <input
                          type="text"
                          value={formData.vatNumber}
                          onChange={(e) => handleChange('vatNumber', e.target.value)}
                          placeholder="CZ12345678"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Services & Pricing */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Vaše služby</h3>
                  <button
                    type="button"
                    onClick={addService}
                    className="btn-ghost text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Přidat službu
                  </button>
                </div>

                {errors.services && (
                  <p className="text-sm text-red-600 mb-4">{errors.services}</p>
                )}

                {formData.services.map((service, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Služba {index + 1}</h4>
                      {formData.services.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Název služby *
                      </label>
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => updateService(index, 'name', e.target.value)}
                        placeholder="např. Svatební focení - celý den"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors[`service_${index}_name`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors[`service_${index}_name`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`service_${index}_name`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Popis služby
                      </label>
                      <textarea
                        value={service.description}
                        onChange={(e) => updateService(index, 'description', e.target.value)}
                        placeholder="Popište co služba obsahuje..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cena (Kč)
                        </label>
                        <input
                          type="number"
                          value={service.price || ''}
                          onChange={(e) => updateService(index, 'price', parseFloat(e.target.value) || undefined)}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Typ ceny
                        </label>
                        <select
                          value={service.priceType}
                          onChange={(e) => updateService(index, 'priceType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="fixed">Pevná cena</option>
                          <option value="hourly">Za hodinu</option>
                          <option value="per-person">Za osobu</option>
                          <option value="package">Balíček</option>
                          <option value="negotiable">Dohodou</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Doba trvání
                        </label>
                        <input
                          type="text"
                          value={service.duration || ''}
                          onChange={(e) => updateService(index, 'duration', e.target.value)}
                          placeholder="např. 8 hodin"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-t border-gray-200 pt-4 mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Cenové rozpětí</h3>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimální cena (Kč)
                      </label>
                      <input
                        type="number"
                        value={formData.priceRange.min}
                        onChange={(e) => handleNestedChange('priceRange', 'min', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximální cena (Kč)
                      </label>
                      <input
                        type="number"
                        value={formData.priceRange.max}
                        onChange={(e) => handleNestedChange('priceRange', 'max', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jednotka
                      </label>
                      <select
                        value={formData.priceRange.unit}
                        onChange={(e) => handleNestedChange('priceRange', 'unit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="per-event">Za akci</option>
                        <option value="per-hour">Za hodinu</option>
                        <option value="per-day">Za den</option>
                        <option value="per-person">Za osobu</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Portfolio & Availability */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Vlastnosti a specializace</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Klíčové vlastnosti
                      </label>
                      <div className="space-y-2">
                        {formData.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={feature}
                              onChange={(e) => updateFeature(index, e.target.value)}
                              placeholder="např. Profesionální vybavení"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addFeature}
                          className="btn-ghost text-sm w-full"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Přidat vlastnost
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specializace
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        V čem se specializujete? (např. Vintage svatby, Venkovní focení, Moderní design)
                      </p>
                      <div className="space-y-2">
                        {formData.specialties.map((specialty, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={specialty}
                              onChange={(e) => updateSpecialty(index, e.target.value)}
                              placeholder="např. Vintage svatby"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => removeSpecialty(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addSpecialty}
                          className="btn-ghost text-sm w-full"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Přidat specializaci
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tagy
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Klíčová slova pro vyhledávání (např. luxusní, dostupné, kreativní)
                      </p>
                      <div className="space-y-2">
                        {formData.tags.map((tag, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={tag}
                              onChange={(e) => updateTag(index, e.target.value)}
                              placeholder="např. luxusní"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => removeTag(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addTag}
                          className="btn-ghost text-sm w-full"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Přidat tag
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Klíčová slova (SEO)
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Slova pro vyhledávače (např. svatební fotograf Praha, levné svatby)
                      </p>
                      <div className="space-y-2">
                        {formData.keywords.map((keyword, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={keyword}
                              onChange={(e) => updateKeyword(index, e.target.value)}
                              placeholder="např. svatební fotograf Praha"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => removeKeyword(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addKeyword}
                          className="btn-ghost text-sm w-full"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Přidat klíčové slovo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Dostupnost</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pracovní dny
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: 'monday', label: 'Po' },
                          { value: 'tuesday', label: 'Út' },
                          { value: 'wednesday', label: 'St' },
                          { value: 'thursday', label: 'Čt' },
                          { value: 'friday', label: 'Pá' },
                          { value: 'saturday', label: 'So' },
                          { value: 'sunday', label: 'Ne' }
                        ].map(day => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => {
                              const days = formData.availability.workingDays
                              const newDays = days.includes(day.value)
                                ? days.filter(d => d !== day.value)
                                : [...days, day.value]
                              handleNestedChange('availability', 'workingDays', newDays)
                            }}
                            className={`px-4 py-2 rounded-lg border transition-colors ${
                              formData.availability.workingDays.includes(day.value)
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-primary-600'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pracovní doba od
                        </label>
                        <input
                          type="time"
                          value={formData.availability.workingHours.start}
                          onChange={(e) => {
                            const newHours = { ...formData.availability.workingHours, start: e.target.value }
                            handleNestedChange('availability', 'workingHours', newHours)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pracovní doba do
                        </label>
                        <input
                          type="time"
                          value={formData.availability.workingHours.end}
                          onChange={(e) => {
                            const newHours = { ...formData.availability.workingHours, end: e.target.value }
                            handleNestedChange('availability', 'workingHours', newHours)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Doba odezvy
                      </label>
                      <select
                        value={formData.responseTime}
                        onChange={(e) => handleChange('responseTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="< 1 hour">Do 1 hodiny</option>
                        <option value="< 4 hours">Do 4 hodin</option>
                        <option value="< 24 hours">Do 24 hodin</option>
                        <option value="< 48 hours">Do 48 hodin</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <ImageUploadSection
                    images={formData.images}
                    onImagesChange={(images) => handleChange('images', images)}
                    maxImages={5}
                    title="Hlavní obrázky"
                    description="Nahrájte hlavní fotografie vaší firmy, vybavení nebo prostoru (max 5 obrázků)"
                    type="main"
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <ImageUploadSection
                    images={formData.portfolioImages}
                    onImagesChange={(images) => handleChange('portfolioImages', images)}
                    maxImages={15}
                    title="Portfolio"
                    description="Ukažte svou práci! Nahrájte fotografie z vašich svateb nebo projektů (max 15 obrázků)"
                    type="portfolio"
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Video URL (volitelné)
                    </label>
                    <p className="text-sm text-gray-600 mb-3">
                      Odkaz na YouTube nebo Vimeo video prezentující vaši práci
                    </p>
                    <input
                      type="text"
                      value={formData.videoUrl}
                      onChange={(e) => handleChange('videoUrl', e.target.value)}
                      placeholder="www.youtube.com/watch?v=..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* Step 5: Summary */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-1">Téměř hotovo!</p>
                      <p>Zkontrolujte prosím všechny údaje před odesláním inzerátu.</p>
                    </div>
                  </div>
                </div>

                {/* Basic Information Summary */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Building className="w-5 h-5 mr-2 text-primary-600" />
                    Základní informace
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kategorie:</span>
                      <span className="font-medium">{VENDOR_CATEGORIES[formData.category].name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Název:</span>
                      <span className="font-medium">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Roky v oboru:</span>
                      <span className="font-medium">{formData.yearsInBusiness}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pracovní rádius:</span>
                      <span className="font-medium">{formData.workingRadius} km</span>
                    </div>
                  </div>
                </div>

                {/* Contact Summary */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                    Kontakt a adresa
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Telefon:</span>
                      <span className="font-medium">{formData.phone}</span>
                    </div>
                    {formData.website && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Web:</span>
                        <span className="font-medium">{formData.website}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Město:</span>
                      <span className="font-medium">{formData.address.city}, {formData.address.region}</span>
                    </div>
                  </div>
                </div>

                {/* Services Summary */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-primary-600" />
                    Služby a ceny
                  </h3>
                  <div className="space-y-3">
                    {formData.services.map((service, index) => (
                      <div key={index} className="bg-gray-50 rounded p-3">
                        <div className="font-medium text-gray-900">{service.name}</div>
                        {service.price && (
                          <div className="text-sm text-gray-600 mt-1">
                            {service.price} Kč ({service.priceType})
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cenové rozpětí:</span>
                      <span className="font-medium">
                        {formData.priceRange.min} - {formData.priceRange.max} {formData.priceRange.currency}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Portfolio Summary */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Upload className="w-5 h-5 mr-2 text-primary-600" />
                    Portfolio a dostupnost
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hlavní obrázky:</span>
                      <span className="font-medium">{formData.images.length} obrázků</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Portfolio:</span>
                      <span className="font-medium">{formData.portfolioImages.length} obrázků</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Doba odezvy:</span>
                      <span className="font-medium">{formData.responseTime}</span>
                    </div>
                    {formData.features.length > 0 && (
                      <div>
                        <span className="text-gray-600">Klíčové vlastnosti:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {formData.features.filter(f => f.trim()).map((feature, index) => (
                            <span key={index} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {formData.specialties.length > 0 && (
                      <div>
                        <span className="text-gray-600">Specializace:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {formData.specialties.filter(s => s.trim()).map((specialty, index) => (
                            <span key={index} className="inline-block bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {formData.tags.length > 0 && (
                      <div>
                        <span className="text-gray-600">Tagy:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {formData.tags.filter(t => t.trim()).map((tag, index) => (
                            <span key={index} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {formData.keywords.length > 0 && (
                      <div>
                        <span className="text-gray-600">Klíčová slova (SEO):</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {formData.keywords.filter(k => k.trim()).map((keyword, index) => (
                            <span key={index} className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Final Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Váš inzerát bude zkontrolován</p>
                      <p>Po odeslání formuláře náš tým zkontroluje vaše údaje. Inzerát bude zveřejněn do 24-48 hodin. O schválení vás budeme informovat emailem.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={currentStep === 1 ? onCancel : handleBack}
              className="btn-outline"
              disabled={saving}
            >
              {currentStep === 1 ? 'Zrušit' : 'Zpět'}
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary"
                disabled={saving}
              >
                Pokračovat
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 loading-spinner" />
                    <span>Ukládání...</span>
                  </div>
                ) : (
                  submitButtonText
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
