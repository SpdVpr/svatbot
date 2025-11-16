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
      {/* Main stats grid - Mobile optimized (similar style as tasks) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
        {/* Total vendors */}
        <div className="bg-white p-3 md:p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm font-medium text-text-muted">Celkem dodavatelů</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 md:mt-1">{stats.total}</p>
            </div>
            <div className="hidden md:block p-3 bg-primary-100 rounded-full">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-2 md:mt-4 flex items-center text-xs md:text-sm">
            <span className="text-text-muted">
              {categoryStats.length} kategorií
            </span>
          </div>
        </div>

        {/* Confirmed vendors */}
        <div className="bg-white p-3 md:p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm font-medium text-text-muted">Potvrzeno</p>
              <p className="text-2xl md:text-3xl font-bold text-primary-600 mt-0.5 md:mt-1">{stats.confirmed}</p>
            </div>
            <div className="hidden md:block p-3 bg-primary-100 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-2 md:mt-4 flex items-center text-xs md:text-sm">
            <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-primary-600 mr-1" />
            <span className="text-primary-600">
              {completionRate}% zajištěno
            </span>
          </div>
        </div>

        {/* Booked vendors */}
        <div className="bg-white p-3 md:p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm font-medium text-text-muted">Rezervováno</p>
              <p className="text-2xl md:text-3xl font-bold text-primary-600 mt-0.5 md:mt-1">{stats.booked}</p>
            </div>
            <div className="hidden md:block p-3 bg-primary-100 rounded-full">
              <Clock className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-2 md:mt-4 flex items-center text-xs md:text-sm">
            <span className="text-text-muted">
              Čeká na potvrzení
            </span>
          </div>
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
