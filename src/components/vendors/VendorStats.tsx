'use client'

import { useVendor } from '@/hooks/useVendor'
import { VENDOR_CATEGORIES, Vendor } from '@/types/vendor'
import VendorList from '../vendor/VendorList'
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Star,
  TrendingUp,
  PieChart,
  Building
} from 'lucide-react'

interface VendorStatsProps {
  compact?: boolean
  showProgress?: boolean
  showVendorList?: boolean
  onAddVendor?: () => void
  onEditVendor?: (vendor: Vendor) => void
  onDeleteVendor?: (vendorId: string) => void
  onViewVendor?: (vendor: Vendor) => void
}

export default function VendorStats({
  compact = false,
  showProgress = true,
  showVendorList = true,
  onAddVendor,
  onEditVendor,
  onDeleteVendor,
  onViewVendor
}: VendorStatsProps) {
  const { vendors, stats } = useVendor()

  // Calculate additional stats
  const categoryStats = Object.entries(VENDOR_CATEGORIES).map(([key, category]) => {
    const categoryVendors = vendors.filter(vendor => vendor.category === key)
    const bookedCount = categoryVendors.filter(v => v.status === 'booked').length
    const confirmedCount = categoryVendors.filter(v => v.status === 'confirmed').length
    
    return {
      key,
      category,
      total: categoryVendors.length,
      booked: bookedCount,
      confirmed: confirmedCount,
      percentage: vendors.length > 0 ? (categoryVendors.length / vendors.length) * 100 : 0
    }
  }).filter(stat => stat.total > 0)

  const completionRate = stats.total > 0 ? 
    Math.round(((stats.booked + stats.confirmed) / stats.total) * 100) : 0

  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Celkem</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Potvrzeno</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.confirmed}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600">Rezervováno</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.booked}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-gray-600">Hledání</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.researching}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total vendors */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Celkem dodavatelů</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-text-muted">
              {categoryStats.length} kategorií
            </span>
          </div>
        </div>

        {/* Confirmed vendors */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Potvrzeno</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.confirmed}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">
              {stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0}% dokončeno
            </span>
          </div>
        </div>

        {/* Booked vendors */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Rezervováno</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.booked}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-text-muted">
              Čeká na potvrzení
            </span>
          </div>
        </div>

        {/* Researching vendors */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Hledání</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.researching}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-text-muted">
              Potřebuje pozornost
            </span>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <PieChart className="w-5 h-5" />
          <span>Dodavatelé podle kategorií</span>
        </h3>

        <div className="space-y-4">
          {categoryStats.map((stat) => (
            <div key={stat.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{stat.category.icon}</span>
                  <span className="font-medium text-gray-900">{stat.category.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {stat.confirmed + stat.booked} / {stat.total}
                  </p>
                  <p className="text-sm text-text-muted">
                    {stat.percentage.toFixed(1)}% všech
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="flex h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-green-500"
                    style={{ width: `${Math.min((stat.confirmed / stat.total) * 100, 100)}%` }}
                    title={`Potvrzeno: ${stat.confirmed}`}
                  ></div>
                  <div
                    className="bg-yellow-500"
                    style={{ width: `${Math.min((stat.booked / stat.total) * 100, 100)}%` }}
                    title={`Rezervováno: ${stat.booked}`}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between text-xs text-text-muted">
                <span>Potvrzeno: {stat.confirmed}</span>
                <span>Rezervováno: {stat.booked}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall progress */}
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-2 mb-4">
            <Building className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-blue-900">Celkový pokrok</h4>
          </div>
          <p className="text-3xl font-bold text-blue-600">{completionRate}%</p>
          <p className="text-sm text-blue-700">
            {completionRate >= 80 ? 'Téměř hotovo!' :
             completionRate >= 50 ? 'Dobrý pokrok' :
             'Začínáme s výběrem'}
          </p>
        </div>

        {/* Contact info */}
        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <div className="flex items-center space-x-2 mb-4">
            <Phone className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-green-900">Kontakty</h4>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {vendors.filter(v => v.phone || v.email).length}
          </p>
          <p className="text-sm text-green-700">
            dodavatelů má kontakt
          </p>
        </div>

        {/* Action needed */}
        <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h4 className="font-medium text-orange-900">Akce</h4>
          </div>
          <p className="text-3xl font-bold text-orange-600">{stats.researching}</p>
          <p className="text-sm text-orange-700">
            {stats.researching > 0 ? 'dodavatelů hledat' : 'vše vyřešeno'}
          </p>
        </div>
      </div>

      {/* Vendor List */}
      {showVendorList && (
        <div className="mt-8">
          <VendorList
            vendors={vendors}
            onAddVendor={onAddVendor}
            onEditVendor={onEditVendor}
            onDeleteVendor={onDeleteVendor}
            onViewVendor={onViewVendor}
            loading={false}
          />
        </div>
      )}
    </div>
  )
}
