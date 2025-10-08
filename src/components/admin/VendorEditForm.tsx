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
  Settings
} from 'lucide-react'
import { ensureUrlProtocol } from '@/utils/url'

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
    // Ensure website has protocol before saving
    const dataToSave = {
      ...formData,
      website: formData.website ? ensureUrlProtocol(formData.website) : ''
    }
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

  return (
    <div className="space-y-8">
      {/* Main Images */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          <ImageIcon className="inline h-5 w-5 mr-2" />
          Hlavní fotografie
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Hlavní fotografie se zobrazují na kartě dodavatele v marketplace
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {formData.images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Hlavní fotografie ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(index, 'main')}
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
              <span>Nahrát fotografie</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'main')}
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
                  addImageUrl((e.target as HTMLInputElement).value, 'main')
                  ;(e.target as HTMLInputElement).value = ''
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Portfolio Images */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Portfolio fotografie
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