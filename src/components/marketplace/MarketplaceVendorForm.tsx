'use client'

import { useState } from 'react'
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
}

interface MarketplaceVendorFormProps {
  onSubmit: (data: MarketplaceVendorFormData) => Promise<void>
  onCancel: () => void
  initialData?: Partial<MarketplaceVendorFormData>
}

export default function MarketplaceVendorForm({ onSubmit, onCancel, initialData }: MarketplaceVendorFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<MarketplaceVendorFormData>({
    name: initialData?.name || '',
    category: initialData?.category || 'photographer',
    description: initialData?.description || '',
    shortDescription: initialData?.shortDescription || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    website: initialData?.website || '',
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
    responseTime: initialData?.responseTime || '< 24 hours'
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
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5)) // Changed to 5 steps
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Only submit on step 5 (summary)
    if (currentStep !== 5) {
      return
    }

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

        <form onSubmit={handleSubmit}>
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
                    <span>Odesílání...</span>
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Odeslat inzerát
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
