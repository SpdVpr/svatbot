'use client'

import Link from 'next/link'
import { Briefcase, Users, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { useVendor } from '@/hooks/useVendor'
import NumberCounter from '@/components/animations/NumberCounter'

export default function VendorManagementModule() {
  const { stats, vendors } = useVendor()

  const vendorStats = {
    total: stats.totalVendors,
    confirmed: stats.byStatus.contracted || 0,
    pending: stats.byStatus.contacted || 0,
    contacted: stats.byStatus.potential || 0
  }

  return (
    <div className="wedding-card">
      <Link href="/vendors" className="block mb-4">
        <h3 className="text-lg font-semibold flex items-center justify-center space-x-2 hover:text-primary-600 transition-colors">
          <Briefcase className="w-5 h-5 text-orange-600" />
          <span>Dodavatelé</span>
        </h3>
      </Link>

      <div className="space-y-4">
        {/* Vendor Count */}
        <div className="bg-orange-50 p-4 rounded-lg text-center glass-morphism">
          <div className="text-2xl font-bold text-orange-600 mb-1">
            <NumberCounter end={vendorStats.total} duration={1800} />
          </div>
          <div className="text-sm text-orange-700">Celkem dodavatelů</div>
        </div>

        {/* Vendor Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center hover-lift">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1 float-enhanced">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-sm font-bold text-gray-900">
              <NumberCounter end={vendorStats.confirmed} duration={1500} />
            </div>
            <div className="text-xs text-gray-500">Potvrzeno</div>
          </div>
          <div className="text-center hover-lift">
            <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg mx-auto mb-1 float-enhanced" style={{ animationDelay: '0.2s' }}>
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="text-sm font-bold text-gray-900">
              <NumberCounter end={vendorStats.pending} duration={1500} />
            </div>
            <div className="text-xs text-gray-500">Čeká</div>
          </div>
          <div className="text-center hover-lift">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-1 float-enhanced" style={{ animationDelay: '0.4s' }}>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-sm font-bold text-gray-900">
              <NumberCounter end={vendorStats.contacted} duration={1500} />
            </div>
            <div className="text-xs text-gray-500">Kontaktováno</div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link 
          href="/vendors" 
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          <Briefcase className="w-4 h-4" />
          <span>Spravovat dodavatele</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
