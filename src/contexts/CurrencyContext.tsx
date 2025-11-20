'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Currency = 'CZK' | 'EUR'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatCurrency: (amount: number) => string
  formatCurrencyShort: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('CZK')

  // Load currency from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('svatbot_currency')
    if (saved === 'CZK' || saved === 'EUR') {
      setCurrencyState(saved)
    }
  }, [])

  // Save currency to localStorage when it changes
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    localStorage.setItem('svatbot_currency', newCurrency)
  }

  // Format currency with full formatting
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format currency in short form (k, M)
  const formatCurrencyShort = (amount: number) => {
    const symbol = currency === 'CZK' ? 'Kč' : '€'
    
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M ${symbol}`
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k ${symbol}`
    }
    return `${amount} ${symbol}`
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatCurrency,
        formatCurrencyShort,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}

