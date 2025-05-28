'use client'

import { useState } from 'react'
import {
  X,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  Building,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Tag,
  DollarSign
} from 'lucide-react'
import { VendorFormData, VendorCategory, VendorStatus, VENDOR_CATEGORIES, VENDOR_STATUSES } from '@/types/vendor'

interface VendorFormProps {
  onSubmit: (data: VendorFormData) => Promise<void>
  onCancel: () => void
  initialData?: Partial<VendorFormData>
  isEditing?: boolean
}

export default function VendorForm({ onSubmit, onCancel, initialData, isEditing = false }: VendorFormProps) {
  const [formData, setFormData] = useState<VendorFormData>({
    name: initialData?.name || '',
    category: initialData?.category || 'photographer',
    description: initialData?.description || '',
    website: initialData?.website || '',
    contactName: initialData?.contactName || '',
    contactEmail: initialData?.contactEmail || '',
    contactPhone: initialData?.contactPhone || '',
    address: initialData?.address || {
      street: '',
      city: '',
      postalCode: '',
      region: 'Praha'
    },
    businessName: initialData?.businessName || '',
    services: initialData?.services || [{
      name: '',
      description: '',
      price: undefined,
      priceType: 'fixed'
    }],
    status: initialData?.status || 'potential',
    priority: initialData?.priority || 'medium',
    notes: initialData?.notes || '',
    tags: initialData?.tags || []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [newTag, setNewTag] = useState('')

  // Czech regions
  const regions = [
    'Praha', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'Olomouc',
    'České Budějovice', 'Hradec Králové', 'Ústí nad Labem', 'Pardubice', 'Jiné'
  ]

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Název dodavatele je povinný'
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Jméno kontaktní osoby je povinné'
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Neplatný formát emailu'
    }

    if (formData.contactPhone && !/^(\+420)?[0-9]{9}$/.test(formData.contactPhone.replace(/\s/g, ''))) {
      newErrors.contactPhone = 'Neplatný formát telefonu'
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Webová stránka musí začínat http:// nebo https://'
    }

    // Validate services
    formData.services.forEach((service, index) => {
      if (!service.name.trim()) {
        newErrors[`service_${index}_name`] = 'Název služby je povinný'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)
      await onSubmit(formData)
    } catch (error) {
      console.error('Error saving vendor:', error)
      setErrors({ general: 'Chyba při ukládání dodavatele' })
    } finally {
      setSaving(false)
    }
  }

  // Handle input changes
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Handle nested field changes
  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof VendorFormData] as any,
        [field]: value
      }
    }))
  }

  // Handle service changes
  const handleServiceChange = (index: number, field: string, value: any) => {
    const updatedServices = [...formData.services]
    updatedServices[index] = { ...updatedServices[index], [field]: value }
    setFormData(prev => ({ ...prev, services: updatedServices }))

    // Clear service-specific errors
    if (errors[`service_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`service_${index}_${field}`]: '' }))
    }
  }

  // Add new service
  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, {
        name: '',
        description: '',
        price: undefined,
        priceType: 'fixed'
      }]
    }))
  }

  // Remove service
  const removeService = (index: number) => {
    if (formData.services.length > 1) {
      setFormData(prev => ({
        ...prev,
        services: prev.services.filter((_, i) => i !== index)
      }))
    }
  }

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Building className="w-5 h-5 text-primary-600" />
            <span>{isEditing ? 'Upravit dodavatele' : 'Přidat dodavatele'}</span>
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Error message */}
        {errors.general && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700">{errors.general}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span>Základní informace</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vendor Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Název dodavatele *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="např. Studio Foto Praha"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={saving}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategorie *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value as VendorCategory)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={saving}
                >
                  {Object.entries(VENDOR_CATEGORIES).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Obchodní název
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  placeholder="např. Studio Foto Praha s.r.o."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={saving}
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webová stránka
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://www.example.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.website ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={saving}
                />
                {errors.website && (
                  <p className="mt-1 text-sm text-red-600">{errors.website}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Popis
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Krátký popis dodavatele a jeho služeb..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={saving}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Kontaktní informace</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Contact Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jméno kontaktní osoby *
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => handleChange('contactName', e.target.value)}
                  placeholder="např. Jan Novák"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.contactName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={saving}
                />
                {errors.contactName && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactName}</p>
                )}
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  placeholder="jan@example.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.contactEmail ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={saving}
                />
                {errors.contactEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>
                )}
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                  placeholder="+420 123 456 789"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.contactPhone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={saving}
                />
                {errors.contactPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactPhone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Adresa</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ulice a číslo
                </label>
                <input
                  type="text"
                  value={formData.address?.street || ''}
                  onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
                  placeholder="např. Václavské náměstí 1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Město
                </label>
                <input
                  type="text"
                  value={formData.address?.city || ''}
                  onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                  placeholder="Praha"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PSČ
                </label>
                <input
                  type="text"
                  value={formData.address?.postalCode || ''}
                  onChange={(e) => handleNestedChange('address', 'postalCode', e.target.value)}
                  placeholder="110 00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <select
                value={formData.address?.region || 'Praha'}
                onChange={(e) => handleNestedChange('address', 'region', e.target.value)}
                className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={saving}
              >
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Služby</span>
            </h3>

            <div className="space-y-4">
              {formData.services.map((service, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Služba {index + 1}</h4>
                    {formData.services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        disabled={saving}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Service Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Název služby *
                      </label>
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                        placeholder="např. Svatební fotografie"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors[`service_${index}_name`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        disabled={saving}
                      />
                      {errors[`service_${index}_name`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`service_${index}_name`]}</p>
                      )}
                    </div>

                    {/* Price Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Typ ceny
                      </label>
                      <select
                        value={service.priceType}
                        onChange={(e) => handleServiceChange(index, 'priceType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        disabled={saving}
                      >
                        <option value="fixed">Pevná cena</option>
                        <option value="hourly">Za hodinu</option>
                        <option value="per-person">Za osobu</option>
                        <option value="package">Balíček</option>
                        <option value="negotiable">Dohodou</option>
                      </select>
                    </div>

                    {/* Price */}
                    {service.priceType !== 'negotiable' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cena (Kč)
                        </label>
                        <input
                          type="number"
                          value={service.price || ''}
                          onChange={(e) => handleServiceChange(index, 'price', parseInt(e.target.value) || undefined)}
                          placeholder="např. 15000"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          disabled={saving}
                        />
                      </div>
                    )}

                    {/* Description */}
                    <div className={service.priceType === 'negotiable' ? 'md:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Popis služby
                      </label>
                      <textarea
                        value={service.description}
                        onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                        placeholder="Detailní popis služby..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addService}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-300 hover:text-primary-600 transition-colors flex items-center justify-center space-x-2"
                disabled={saving}
              >
                <Plus className="w-4 h-4" />
                <span>Přidat další službu</span>
              </button>
            </div>
          </div>

          {/* Status and Priority */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Tag className="w-5 h-5" />
              <span>Status a priorita</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as VendorStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={saving}
                >
                  {Object.entries(VENDOR_STATUSES).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priorita
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={saving}
                >
                  <option value="low">Nízká</option>
                  <option value="medium">Střední</option>
                  <option value="high">Vysoká</option>
                  <option value="critical">Kritická</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Tag className="w-5 h-5" />
              <span>Štítky</span>
            </h3>

            <div className="space-y-3">
              {/* Existing tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-primary-500 hover:text-primary-700"
                        disabled={saving}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add new tag */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Přidat štítek..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  disabled={saving || !newTag.trim()}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poznámky
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Dodatečné poznámky o dodavateli..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={saving}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 btn-outline"
              disabled={saving}
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={saving}
            >
              {saving ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 loading-spinner" />
                  <span>Ukládání...</span>
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Uložit změny' : 'Přidat dodavatele'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
