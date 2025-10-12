'use client'

import React, { memo } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { PaymentsTabSkeleton } from './TabSkeleton'
import {
  CreditCard,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  FileText,
  AlertCircle
} from 'lucide-react'

function PaymentsTab() {
  const { payments, loading } = useSubscription()

  // Show skeleton only on initial load
  if (loading && !payments) {
    return <PaymentsTabSkeleton />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'pending':
      case 'processing':
        return <Clock className="w-5 h-5 text-amber-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'Zaplaceno'
      case 'failed':
        return 'Selhalo'
      case 'pending':
        return 'Čeká'
      case 'processing':
        return 'Zpracovává se'
      case 'refunded':
        return 'Vráceno'
      case 'canceled':
        return 'Zrušeno'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'text-green-600 bg-green-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      case 'pending':
      case 'processing':
        return 'text-amber-600 bg-amber-50'
      case 'refunded':
        return 'text-blue-600 bg-blue-50'
      case 'canceled':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 loading-spinner" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Payment Method */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-4">
          <CreditCard className="w-5 h-5 text-primary-600" />
          <span>Platební metoda</span>
        </h3>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Kreditní karta</p>
              <p className="text-sm text-gray-600">Bude nastaveno při první platbě</p>
            </div>
          </div>
          <button className="btn-outline" disabled>
            Změnit
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Platby jsou zpracovávány bezpečně přes Stripe. Vaše platební údaje nejsou ukládány na našich serverech.
        </p>
      </div>

      {/* Payment History */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-4">
          <FileText className="w-5 h-5 text-primary-600" />
          <span>Historie plateb</span>
        </h3>

        {payments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-2">Zatím žádné platby</p>
            <p className="text-sm text-gray-500">
              Historie vašich plateb se zobrazí zde
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(payment.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">
                        {payment.amount} {payment.currency}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {payment.createdAt.toLocaleDateString('cs-CZ', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {payment.invoiceNumber && (
                        <>
                          <span className="text-gray-400">•</span>
                          <p className="text-sm text-gray-600">
                            Faktura #{payment.invoiceNumber}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {payment.invoiceUrl && (
                  <a
                    href={payment.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Stáhnout</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Billing Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Fakturační údaje
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jméno / Název firmy
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Vaše jméno nebo název firmy"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IČO (volitelné)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="12345678"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresa
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ulice a číslo popisné"
              disabled
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PSČ
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="12000"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Město
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Praha"
                disabled
              />
            </div>
          </div>

          <button className="btn-outline w-full" disabled>
            Uložit fakturační údaje
          </button>

          <p className="text-sm text-gray-500">
            Fakturační údaje budou dostupné po aktivaci placeného tarifu
          </p>
        </div>
      </div>
    </div>
  )
}

// Memoize to prevent unnecessary re-renders
export default memo(PaymentsTab)
