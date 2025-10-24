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
  const { vendors } = useVendor()

  // Calculate stats from vendors
  const stats = {
    total: vendors.length,
    confirmed: vendors.filter(v => v.status === 'contracted' || v.status === 'confirmed').length,
    booked: vendors.filter(v => v.status === 'booked').length,
    researching: vendors.filter(v => v.status === 'potential').length
  }

  // Calculate additional stats
  const categoryStats = Object.entries(VENDOR_CATEGORIES).map(([key, category]) => {
    const categoryVendors = vendors.filter(vendor => vendor.category === key)
    const bookedCount = categoryVendors.filter(v => v.status === 'booked').length
    const confirmedCount = categoryVendors.filter(v => v.status === 'contracted').length

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

      {/* Category breakdown - Compact version */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <PieChart className="w-5 h-5" />
          <span>Dodavatelé podle kategorií</span>
        </h3>

        {/* Category Grid - Compact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {categoryStats.map((stat) => (
            <div
              key={stat.key}
              className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-base">{stat.category.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{stat.category.name}</span>
                </div>
                <span className="text-xs text-text-muted">{stat.total}×</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-text-muted">Stav:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stat.confirmed + stat.booked} / {stat.total}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="flex h-1.5 rounded-full overflow-hidden">
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

                <div className="flex justify-between text-xs">
                  <span className="text-green-600">✓ {stat.confirmed}</span>
                  <span className="text-yellow-600">⏳ {stat.booked}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vendor List */}
      {showVendorList && (
        <div className="mt-8">
          <VendorList
            vendors={vendors}
            onAddVendor={onAddVendor || (() => {})}
            onEditVendor={onEditVendor || (() => {})}
            onDeleteVendor={onDeleteVendor || (() => {})}
            onViewVendor={onViewVendor || (() => {})}
            loading={false}
          />
        </div>
      )}
    </div>
  )
}
