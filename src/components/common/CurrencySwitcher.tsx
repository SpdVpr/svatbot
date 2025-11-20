'use client'

import { useCurrency, Currency } from '@/contexts/CurrencyContext'
import { Coins } from 'lucide-react'

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency()

  const toggleCurrency = () => {
    setCurrency(currency === 'CZK' ? 'EUR' : 'CZK')
  }

  return (
    <button
      onClick={toggleCurrency}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/80 hover:bg-white shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200"
      title={`Přepnout na ${currency === 'CZK' ? 'EUR' : 'CZK'}`}
    >
      <Coins className="w-4 h-4 text-primary-600" />
      <span className="text-sm font-semibold text-gray-700">
        {currency}
      </span>
    </button>
  )
}

