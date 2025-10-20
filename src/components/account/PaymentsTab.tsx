'use client'

import React, { memo } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { PaymentsTabSkeleton } from './TabSkeleton'
import {
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  FileText,
  AlertCircle
} from 'lucide-react'

interface PaymentsTabProps {
  subscriptionData: ReturnType<typeof useSubscription>
}

function PaymentsTab({ subscriptionData }: PaymentsTabProps) {
  const { payments, loading } = subscriptionData

  // Don't show skeleton - just show empty state or payments immediately
  // This prevents flickering when switching tabs

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

  return (
    <div className="space-y-6">
      {/* Payment History */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-4">
          <FileText className="w-5 h-5 text-primary-600" />
          <span>Historie plateb</span>
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          Všechny platby jsou zpracovávány bezpečně přes Stripe. Platební metodu a fakturační údaje zadáváte přímo v Stripe při platbě.
        </p>

        {!payments || payments.length === 0 ? (
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
    </div>
  )
}

// Memoize to prevent unnecessary re-renders
export default memo(PaymentsTab)
