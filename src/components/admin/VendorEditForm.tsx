'use client'

import { useState } from 'react'
import { VendorEditForm as VendorFormData } from '@/types/admin'
import { VENDOR_CATEGORIES } from '@/types/vendor'
import {
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building,
  Clock,
  DollarSign,
  Star,
  Tag,
  Settings,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Video
} from 'lucide-react'
import { ensureUrlProtocol } from '@/utils/url'
import PlaceIdFinder from '@/components/marketplace/PlaceIdFinder'

interface VendorEditFormProps {
  formData: VendorFormData
  onUpdate: (updates: Partial<VendorFormData>) => void
  onSave: (data: VendorFormData) => Promise<boolean>
  onCancel: () => void
  saving: boolean
  isNew?: boolean
}

export default function VendorEditForm({
  formData,
  onUpdate,
  onSave,
  onCancel,
  saving,
  isNew = false
}: VendorEditFormProps) {
  const [activeTab, setActiveTab] = useState('basic')
  const [newService, setNewService] = useState<{
    name: string
    description: string
    price: number
    priceType: 'fixed' | 'per-person' | 'per-hour' | 'package'
    includes: string[]
  }>({
    name: '',
    description: '',
    price: 0,
    priceType: 'fixed',
    includes: ['']
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('📤 Form submit - current formData:', formData)

    // Ensure website has protocol before saving
    const dataToSave = {
      ...formData,
      website: formData.website ? ensureUrlProtocol(formData.website) : ''
    }

    console.log('📤 Data to save:', dataToSave)
    const success = await onSave(dataToSave)
    if (success && isNew) {
      // Redirect to vendors list or show success message
    }
  }

  const addService = () => {
    if (newService.name && newService.description) {
      const service = {
        id: `service-${Date.now()}`,
        ...newService,
        includes: newService.includes.filter(item => item.trim() !== '')
      }
      onUpdate({
        services: [...formData.services, service]
      })
      setNewService({
        name: '',
        description: '',
        price: 0,
        priceType: 'fixed',
        includes: ['']
      })
    }
  }

  const removeService = (index: number) => {
    onUpdate({
      services: formData.services.filter((_, i) => i !== index)
    })
  }

  const addIncludeItem = () => {
    setNewService(prev => ({
      ...prev,
      includes: [...prev.includes, '']
    }))
  }

  const updateIncludeItem = (index: number, value: string) => {
    setNewService(prev => ({
      ...prev,
      includes: prev.includes.map((item, i) => i === index ? value : item)
    }))
  }

  const removeIncludeItem = (index: number) => {
    setNewService(prev => ({
      ...prev,
      includes: prev.includes.filter((_, i) => i !== index)
    }))
  }

  const tabs = [
    { id: 'basic', name: 'Základní info', icon: Building },
    { id: 'contact', name: 'Kontakt', icon: Phone },
    { id: 'services', name: 'Služby', icon: DollarSign },
    { id: 'images', name: 'Fotografie', icon: ImageIcon },
    { id: 'settings', name: 'Nastavení', icon: Settings }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'Přidat dodavatele' : `Upravit: ${formData.name}`}
          </h1>
          <p className="text-gray-600">
            {isNew ? 'Vytvořte nový profil dodavatele' : 'Upravte informace o dodavateli'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-outline flex items-center space-x-2"
          >
            <X className="h-5 w-5" />
            <span>Zrušit</span>
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            <span>{saving ? 'Ukládání...' : 'Uložit'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === 'basic' && (
          <BasicInfoTab formData={formData} onUpdate={onUpdate} />
        )}
        {activeTab === 'contact' && (
          <ContactTab formData={formData} onUpdate={onUpdate} />
        )}
        {activeTab === 'services' && (
          <ServicesTab
            formData={formData}
            onUpdate={onUpdate}
            newService={newService}
            setNewService={setNewService}
            addService={addService}
            removeService={removeService}
            addIncludeItem={addIncludeItem}
            updateIncludeItem={updateIncludeItem}
            removeIncludeItem={removeIncludeItem}
          />
        )}
        {activeTab === 'images' && (
          <ImagesTab formData={formData} onUpdate={onUpdate} />
        )}
        {activeTab === 'settings' && (
          <SettingsTab formData={formData} onUpdate={onUpdate} />
        )}
      </div>
    </form>
  )
}

// Basic Info Tab Component
function BasicInfoTab({
  formData,
  onUpdate
}: {
  formData: VendorFormData
  onUpdate: (updates: Partial<VendorFormData>) => void
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Název dodavatele *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Název firmy nebo jméno"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategorie *
          </label>
          <select
            required
            value={formData.category}
            onChange={(e) => onUpdate({ category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {Object.entries(VENDOR_CATEGORIES).map(([key, config]) => (
              <option key={key} value={key}>
                {config.icon} {config.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Krátký popis *
        </label>
        <input
          type="text"
          required
          value={formData.shortDescription}
          onChange={(e) => onUpdate({ shortDescription: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Stručný popis služeb (max 100 znaků)"
          maxLength={100}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Detailní popis *
        </label>
        <textarea
          required
          rows={4}
          value={formData.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Podrobný popis služeb, zkušeností a specializace..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Obchodní název
          </label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => onUpdate({ businessName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Oficiální název firmy"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            IČO
          </label>
          <input
            type="text"
            value={formData.businessId}
            onChange={(e) => onUpdate({ businessId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="12345678"
          />
        </div>
      </div>
    </div>
  )
}

// Contact Tab Component
function ContactTab({
  formData,
  onUpdate
}: {
  formData: VendorFormData
  onUpdate: (updates: Partial<VendorFormData>) => void
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="inline h-4 w-4 mr-1" />
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => onUpdate({ email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="kontakt@firma.cz"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="inline h-4 w-4 mr-1" />
            Telefon *
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => onUpdate({ phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="+420 777 123 456"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Globe className="inline h-4 w-4 mr-1" />
          Webové stránky
        </label>
        <input
          type="text"
          value={formData.website}
          onChange={(e) => onUpdate({ website: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="www.firma.cz"
        />
      </div>

      {/* Google Places Integration */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3 mb-4">
          <div className="flex-shrink-0">
            <svg className="w-8 h-8" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-blue-900 mb-1">
              🌟 Google hodnocení
            </h3>
            <p className="text-sm text-blue-800">
              Propojte profil s Google Maps pro automatické zobrazení hodnocení a recenzí
            </p>
          </div>
        </div>

        <PlaceIdFinder
          onPlaceSelected={(placeId, mapsUrl, placeName) => {
            console.log('✅ Place selected in admin edit:', { placeId, mapsUrl, placeName })
            onUpdate({
              google: {
                ...formData.google,
                placeId,
                mapsUrl
              }
            })
          }}
          initialValue={formData.name}
        />

        {/* Display selected values */}
        {formData.google?.placeId && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <h5 className="text-sm font-semibold text-gray-900 mb-2">
              📍 Vybrané místo:
            </h5>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-600">Place ID:</span>
                <code className="ml-2 px-2 py-1 bg-gray-50 rounded border border-gray-200 font-mono">
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

        {/* Current Google Rating */}
        {formData.google?.rating && (
          <div className="mt-4 p-3 bg-white rounded border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-semibold">{formData.google.rating.toFixed(1)}</span>
                <span className="text-sm text-gray-600">
                  ({formData.google.reviewCount} recenzí)
                </span>
              </div>
              {formData.google.lastUpdated && (
                <span className="text-xs text-gray-500">
                  Aktualizováno: {new Date(formData.google.lastUpdated).toLocaleDateString('cs-CZ')}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          <MapPin className="inline h-5 w-5 mr-2" />
          Adresa
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ulice a číslo popisné
            </label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => onUpdate({
                address: { ...formData.address, street: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Václavské náměstí 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Město *
            </label>
            <input
              type="text"
              required
              value={formData.address.city}
              onChange={(e) => onUpdate({
                address: { ...formData.address, city: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Praha"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PSČ
            </label>
            <input
              type="text"
              value={formData.address.postalCode}
              onChange={(e) => onUpdate({
                address: { ...formData.address, postalCode: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="110 00"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kraj
            </label>
            <select
              value={formData.address.region}
              onChange={(e) => onUpdate({
                address: { ...formData.address, region: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Vyberte kraj</option>
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

      {/* Social Media Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Sociální sítě
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Přidejte odkazy na sociální sítě dodavatele. Budou zobrazeny v detailu inzerátu.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Instagram */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Instagram className="inline h-4 w-4 mr-1" />
              Instagram
            </label>
            <input
              type="text"
              value={formData.socialMedia?.instagram || ''}
              onChange={(e) => onUpdate({
                socialMedia: {
                  instagram: e.target.value,
                  facebook: formData.socialMedia?.facebook || '',
                  youtube: formData.socialMedia?.youtube || '',
                  tiktok: formData.socialMedia?.tiktok || '',
                  linkedin: formData.socialMedia?.linkedin || ''
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="instagram.com/firma"
            />
          </div>

          {/* Facebook */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Facebook className="inline h-4 w-4 mr-1" />
              Facebook
            </label>
            <input
              type="text"
              value={formData.socialMedia?.facebook || ''}
              onChange={(e) => onUpdate({
                socialMedia: {
                  instagram: formData.socialMedia?.instagram || '',
                  facebook: e.target.value,
                  youtube: formData.socialMedia?.youtube || '',
                  tiktok: formData.socialMedia?.tiktok || '',
                  linkedin: formData.socialMedia?.linkedin || ''
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="facebook.com/firma"
            />
          </div>

          {/* YouTube */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Youtube className="inline h-4 w-4 mr-1" />
              YouTube
            </label>
            <input
              type="text"
              value={formData.socialMedia?.youtube || ''}
              onChange={(e) => onUpdate({
                socialMedia: {
                  instagram: formData.socialMedia?.instagram || '',
                  facebook: formData.socialMedia?.facebook || '',
                  youtube: e.target.value,
                  tiktok: formData.socialMedia?.tiktok || '',
                  linkedin: formData.socialMedia?.linkedin || ''
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="youtube.com/@firma"
            />
          </div>

          {/* TikTok */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TikTok
            </label>
            <input
              type="text"
              value={formData.socialMedia?.tiktok || ''}
              onChange={(e) => onUpdate({
                socialMedia: {
                  instagram: formData.socialMedia?.instagram || '',
                  facebook: formData.socialMedia?.facebook || '',
                  youtube: formData.socialMedia?.youtube || '',
                  tiktok: e.target.value,
                  linkedin: formData.socialMedia?.linkedin || ''
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="tiktok.com/@firma"
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Linkedin className="inline h-4 w-4 mr-1" />
              LinkedIn
            </label>
            <input
              type="text"
              value={formData.socialMedia?.linkedin || ''}
              onChange={(e) => onUpdate({
                socialMedia: {
                  instagram: formData.socialMedia?.instagram || '',
                  facebook: formData.socialMedia?.facebook || '',
                  youtube: formData.socialMedia?.youtube || '',
                  tiktok: formData.socialMedia?.tiktok || '',
                  linkedin: e.target.value
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="linkedin.com/company/firma"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pracovní rádius (km)
        </label>
        <input
          type="number"
          min="0"
          max="500"
          value={formData.workingRadius}
          onChange={(e) => onUpdate({ workingRadius: parseInt(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="50"
        />
        <p className="text-sm text-gray-500 mt-1">
          Vzdálenost v kilometrech, kam jste ochotni cestovat za klienty
        </p>
      </div>
    </div>
  )
}

// Services Tab Component
function ServicesTab({
  formData,
  onUpdate,
  newService,
  setNewService,
  addService,
  removeService,
  addIncludeItem,
  updateIncludeItem,
  removeIncludeItem
}: {
  formData: VendorFormData
  onUpdate: (updates: Partial<VendorFormData>) => void
  newService: {
    name: string
    description: string
    price: number
    priceType: 'fixed' | 'per-person' | 'per-hour' | 'package'
    includes: string[]
  }
  setNewService: React.Dispatch<React.SetStateAction<{
    name: string
    description: string
    price: number
    priceType: 'fixed' | 'per-person' | 'per-hour' | 'package'
    includes: string[]
  }>>
  addService: () => void
  removeService: (index: number) => void
  addIncludeItem: () => void
  updateIncludeItem: (index: number, value: string) => void
  removeIncludeItem: (index: number) => void
}) {
  return (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          <DollarSign className="inline h-5 w-5 mr-2" />
          Cenové rozpětí
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimální cena (Kč)
            </label>
            <input
              type="number"
              min="0"
              value={formData.priceRange.min}
              onChange={(e) => onUpdate({
                priceRange: { ...formData.priceRange, min: parseInt(e.target.value) || 0 }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximální cena (Kč)
            </label>
            <input
              type="number"
              min="0"
              value={formData.priceRange.max}
              onChange={(e) => onUpdate({
                priceRange: { ...formData.priceRange, max: parseInt(e.target.value) || 0 }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jednotka
            </label>
            <select
              value={formData.priceRange.unit}
              onChange={(e) => onUpdate({
                priceRange: { ...formData.priceRange, unit: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="per-event">za akci</option>
              <option value="per-person">za osobu</option>
              <option value="per-hour">za hodinu</option>
              <option value="per-day">za den</option>
            </select>
          </div>
        </div>
      </div>

      {/* Existing Services */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Služby</h3>
        {formData.services.length > 0 ? (
          <div className="space-y-4">
            {formData.services.map((service, index) => (
              <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{service.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{service.price.toLocaleString('cs-CZ')} Kč</span>
                      <span>({service.priceType})</span>
                      {service.duration && <span>{service.duration}</span>}
                    </div>
                    {service.includes.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Zahrnuje:</p>
                        <ul className="text-xs text-gray-600 list-disc list-inside">
                          {service.includes.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Zatím nejsou přidány žádné služby</p>
        )}
      </div>

      {/* Add New Service */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Přidat novou službu</h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Název služby
              </label>
              <input
                type="text"
                value={newService.name}
                onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Základní balíček"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cena (Kč)
              </label>
              <input
                type="number"
                min="0"
                value={newService.price}
                onChange={(e) => setNewService(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Popis služby
            </label>
            <textarea
              rows={2}
              value={newService.description}
              onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Detailní popis služby..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Co je zahrnuto
            </label>
            {newService.includes.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateIncludeItem(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Položka služby..."
                />
                <button
                  type="button"
                  onClick={() => removeIncludeItem(index)}
                  className="text-red-400 hover:text-red-600 p-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addIncludeItem}
              className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Přidat položku</span>
            </button>
          </div>

          <button
            type="button"
            onClick={addService}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Přidat službu</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Images Tab Component
function ImagesTab({
  formData,
  onUpdate
}: {
  formData: VendorFormData
  onUpdate: (updates: Partial<VendorFormData>) => void
}) {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'portfolio') => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        if (type === 'main') {
          onUpdate({ images: [...formData.images, dataUrl] })
        } else {
          onUpdate({ portfolioImages: [...formData.portfolioImages, dataUrl] })
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number, type: 'main' | 'portfolio') => {
    if (type === 'main') {
      onUpdate({ images: formData.images.filter((_, i) => i !== index) })
    } else {
      onUpdate({ portfolioImages: formData.portfolioImages.filter((_, i) => i !== index) })
    }
  }

  const addImageUrl = (url: string, type: 'main' | 'portfolio') => {
    if (url.trim()) {
      if (type === 'main') {
        onUpdate({ images: [...formData.images, url.trim()] })
      } else {
        onUpdate({ portfolioImages: [...formData.portfolioImages, url.trim()] })
      }
    }
  }

  const setMainImage = (url: string) => {
    onUpdate({ mainImage: url.trim() })
  }

  return (
    <div className="space-y-8">
      {/* Main Image */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          <ImageIcon className="inline h-5 w-5 mr-2" />
          Hlavní fotka *
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Tato fotka se zobrazí v katalogu a jako hlavní v detailu (povinné)
        </p>

        {formData.mainImage && (
          <div className="mb-4">
            <div className="relative group inline-block">
              <img
                src={formData.mainImage}
                alt="Hlavní fotka"
                className="w-64 h-40 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => onUpdate({ mainImage: '' })}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="btn-outline cursor-pointer flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Nahrát hlavní fotku</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleImageUpload(e, 'main')
                    // After upload, set the first image as main
                    // This will be handled by the upload function
                  }
                }}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1">
            <input
              type="url"
              placeholder="Nebo vložte URL hlavní fotky..."
              value={formData.mainImage}
              onChange={(e) => setMainImage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Main Video */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          <Video className="inline h-5 w-5 mr-2" />
          Hlavní video (volitelné)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Pokud vyplníte, video nahradí hlavní fotku v detailu a spustí se automaticky
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video URL
          </label>
          <input
            type="text"
            value={formData.mainVideoUrl || ''}
            onChange={(e) => onUpdate({ mainVideoUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Podporované platformy: YouTube, Vimeo
          </p>
        </div>
      </div>

      {/* Portfolio Images */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Galerie / Portfolio
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Portfolio fotografie se zobrazují na detailní stránce dodavatele
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {formData.portfolioImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Portfolio fotografie ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(index, 'portfolio')}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="btn-outline cursor-pointer flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Nahrát portfolio</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'portfolio')}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1">
            <input
              type="url"
              placeholder="Nebo vložte URL fotografie..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addImageUrl((e.target as HTMLInputElement).value, 'portfolio')
                  ;(e.target as HTMLInputElement).value = ''
                }
              }}
            />
          </div>
        </div>
      </div>


    </div>
  )
}

// Settings Tab Component
function SettingsTab({
  formData,
  onUpdate
}: {
  formData: VendorFormData
  onUpdate: (updates: Partial<VendorFormData>) => void
}) {
  const addTag = (tag: string, type: 'features' | 'specialties' | 'tags' | 'keywords') => {
    if (tag.trim() && !formData[type].includes(tag.trim())) {
      onUpdate({ [type]: [...formData[type], tag.trim()] })
    }
  }

  const removeTag = (index: number, type: 'features' | 'specialties' | 'tags' | 'keywords') => {
    onUpdate({ [type]: formData[type].filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-8">
      {/* Status Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          <Settings className="inline h-5 w-5 mr-2" />
          Stav dodavatele
        </h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.verified}
              onChange={(e) => onUpdate({ verified: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Ověřený dodavatel</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => onUpdate({ featured: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Doporučený dodavatel</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.premium}
              onChange={(e) => onUpdate({ premium: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Premium účet</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => onUpdate({ isActive: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Aktivní profil</span>
          </label>
        </div>
      </div>

      {/* Features */}
      <TagSection
        title="Vlastnosti"
        items={formData.features}
        onAdd={(tag) => addTag(tag, 'features')}
        onRemove={(index) => removeTag(index, 'features')}
        placeholder="Přidat vlastnost..."
      />

      {/* Specialties */}
      <TagSection
        title="Specializace"
        items={formData.specialties}
        onAdd={(tag) => addTag(tag, 'specialties')}
        onRemove={(index) => removeTag(index, 'specialties')}
        placeholder="Přidat specializaci..."
      />

      {/* Tags */}
      <TagSection
        title="Tagy"
        items={formData.tags}
        onAdd={(tag) => addTag(tag, 'tags')}
        onRemove={(index) => removeTag(index, 'tags')}
        placeholder="Přidat tag..."
      />

      {/* Keywords */}
      <TagSection
        title="Klíčová slova (SEO)"
        items={formData.keywords}
        onAdd={(tag) => addTag(tag, 'keywords')}
        onRemove={(index) => removeTag(index, 'keywords')}
        placeholder="Přidat klíčové slovo..."
      />

      {/* Working Hours */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          <Clock className="inline h-5 w-5 mr-2" />
          Pracovní doba
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Od
            </label>
            <input
              type="time"
              value={formData.availability.workingHours.start}
              onChange={(e) => onUpdate({
                availability: {
                  ...formData.availability,
                  workingHours: { ...formData.availability.workingHours, start: e.target.value }
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Do
            </label>
            <input
              type="time"
              value={formData.availability.workingHours.end}
              onChange={(e) => onUpdate({
                availability: {
                  ...formData.availability,
                  workingHours: { ...formData.availability.workingHours, end: e.target.value }
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Tag Section Component
function TagSection({
  title,
  items,
  onAdd,
  onRemove,
  placeholder
}: {
  title: string
  items: string[]
  onAdd: (tag: string) => void
  onRemove: (index: number) => void
  placeholder: string
}) {
  return (
    <div>
      <h4 className="text-md font-medium text-gray-900 mb-3">{title}</h4>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="ml-2 text-primary-600 hover:text-primary-800"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onAdd((e.target as HTMLInputElement).value)
            ;(e.target as HTMLInputElement).value = ''
          }
        }}
      />
    </div>
  )
}