'use client'

import Link from 'next/link'
import { Briefcase, Users, CheckCircle, Clock, ArrowRight } from 'lucide-react'

export default function VendorManagementModule() {
  // Mock data - replace with real vendor hook when implemented
  const vendorStats = {
    total: 0,
    confirmed: 0,
    pending: 0,
    contacted: 0
  }

  return (
    <div className="wedding-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Briefcase className="w-5 h-5 text-orange-600" />
          <span>Dodavatelé</span>
        </h3>
        <Link href="/vendors" className="text-sm text-primary-600 hover:underline">
          Otevřít
        </Link>
      </div>

      <div className="space-y-4">
        {/* Vendor Count */}
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600 mb-1">{vendorStats.total}</div>
          <div className="text-sm text-orange-700">Celkem dodavatelů</div>
        </div>

        {/* Vendor Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-sm font-bold text-gray-900">{vendorStats.confirmed}</div>
            <div className="text-xs text-gray-500">Potvrzeno</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg mx-auto mb-1">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="text-sm font-bold text-gray-900">{vendorStats.pending}</div>
            <div className="text-xs text-gray-500">Čeká</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-1">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-sm font-bold text-gray-900">{vendorStats.contacted}</div>
            <div className="text-xs text-gray-500">Kontaktováno</div>
          </div>
        </div>

        {/* Categories Needed */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-900 mb-2">Potřebné kategorie</div>
          <div className="flex flex-wrap gap-1">
            {['Fotograf', 'Místo konání', 'Catering', 'Hudba'].map((category, index) => (
              <span 
                key={index}
                className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-full text-gray-600"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="text-center">
          <div className={`text-sm px-3 py-1 rounded-full inline-block ${
            vendorStats.total === 0
              ? 'bg-gray-100 text-gray-600'
              : vendorStats.confirmed < 3
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-green-100 text-green-700'
          }`}>
            {vendorStats.total === 0
              ? 'Žádní dodavatelé'
              : vendorStats.confirmed < 3
                ? 'Hledáme dodavatele'
                : 'Máme dodavatele'
            }
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
