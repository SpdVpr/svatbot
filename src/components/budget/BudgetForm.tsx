'use client'

import { useState, useEffect } from 'react'
import { BudgetFormData, BudgetCategory, PaymentStatus, PaymentMethod, PaymentPeriod, BudgetItemPayment, BudgetSubItem, BUDGET_CATEGORIES, Document } from '@/types/budget'
import { useVendor } from '@/hooks/useVendor'
import DocumentUpload, { DocumentItem } from '@/components/common/DocumentUpload'
import {
  X,
  DollarSign,
  Calendar,
  AlertCircle,
  Plus,
  Minus,
  Building,
  CreditCard,
  Edit,
  Coins,
  FileText
} from 'lucide-react'

interface BudgetFormProps {
  onSubmit: (data: BudgetFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: string
  initialData?: Partial<BudgetFormData>
}

export default function BudgetForm({
  onSubmit,
  onCancel,
  loading = false,
  error,
  initialData
}: BudgetFormProps) {
  const { vendors } = useVendor()
  const [formData, setFormData] = useState<BudgetFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || 'other',
    budgetedAmount: initialData?.budgetedAmount || 0,
    actualAmount: initialData?.actualAmount || 0,
    paidAmount: initialData?.paidAmount || 0,
    currency: initialData?.currency || 'CZK',
    vendorName: initialData?.vendorName || '',
    paymentStatus: initialData?.paymentStatus || 'pending',
    paymentMethod: initialData?.paymentMethod || undefined,
    paymentPeriod: initialData?.paymentPeriod || undefined,
    dueDate: initialData?.dueDate || undefined,
    paidDate: initialData?.paidDate || undefined,
    priority: initialData?.priority || undefined,
    notes: initialData?.notes || '',
    tags: initialData?.tags || [],
    isEstimate: initialData?.isEstimate || false,
    payments: initialData?.payments || [],
    subItems: initialData?.subItems || [],
    documents: initialData?.documents || []
  })

  const [documents, setDocuments] = useState<DocumentItem[]>(
    (initialData?.documents || []).map(doc => ({
      ...doc,
      uploadedAt: doc.uploadedAt instanceof Date ? doc.uploadedAt : new Date(doc.uploadedAt)
    }))
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [editingPayment, setEditingPayment] = useState<BudgetItemPayment | null>(null)

  // Currency options
  const currencyOptions = [
    { value: 'CZK', label: 'CZK (Koruna)', symbol: 'Kč' },
    { value: 'EUR', label: 'EUR (Euro)', symbol: '€' },
    { value: 'USD', label: 'USD (Dolar)', symbol: '$' }
  ]

  // Payment status options
  const paymentStatusOptions = [
    { value: 'pending', label: 'Čeká na platbu', color: 'text-yellow-600' },
    { value: 'partial', label: 'Částečně zaplaceno', color: 'text-blue-600' },
    { value: 'paid', label: 'Zaplaceno', color: 'text-green-600' },
    { value: 'overdue', label: 'Po splatnosti', color: 'text-red-600' },
    { value: 'cancelled', label: 'Zrušeno', color: 'text-gray-600' }
  ]

  // Payment method options (removed "Po svatbě" and "Na svatbě")
  const paymentMethodOptions = [
    { value: 'cash', label: 'Hotovost', icon: '💵' },
    { value: 'card', label: 'Karta', icon: '💳' },
    { value: 'transfer', label: 'Převod', icon: '🏦' },
    { value: 'invoice', label: 'Faktura', icon: '📝' },
    { value: 'other', label: 'Jiné', icon: '💰' }
  ]

  // Payment period options (new)
  const paymentPeriodOptions = [
    { value: 'before-wedding', label: 'Před svatbou', icon: '📅' },
    { value: 'at-wedding', label: 'Na svatbě', icon: '💐' },
    { value: 'after-wedding', label: 'Po svatbě', icon: '💒' }
  ]

  // Priority options
  const priorityOptions = [
    { value: '', label: 'Bez priority', color: 'text-gray-400' },
    { value: 'low', label: 'Nízká', color: 'text-gray-600' },
    { value: 'medium', label: 'Střední', color: 'text-blue-600' },
    { value: 'high', label: 'Vysoká', color: 'text-orange-600' },
    { value: 'critical', label: 'Kritická', color: 'text-red-600' }
  ]

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'CZK') => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Název je povinný'
    }

    if (formData.budgetedAmount <= 0) {
      newErrors.budgetedAmount = 'Předběžná částka musí být větší než 0'
    }

    if (formData.actualAmount < 0) {
      newErrors.actualAmount = 'Skutečná částka nemůže být záporná'
    }

    if (formData.paidAmount < 0) {
      newErrors.paidAmount = 'Zaplacená částka nemůže být záporná'
    }

    if (formData.paidAmount > Math.max(formData.budgetedAmount, formData.actualAmount)) {
      newErrors.paidAmount = 'Zaplacená částka nemůže být vyšší než předběžná nebo skutečná částka'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting budget form:', error)
    }
  }

  // Handle input changes
  const handleChange = (field: keyof BudgetFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Add payment
  const addPayment = () => {
    setEditingPayment(null)
    setShowPaymentModal(true)
  }

  // Edit payment
  const editPayment = (payment: BudgetItemPayment) => {
    setEditingPayment(payment)
    setShowPaymentModal(true)
  }

  // Remove payment
  const removePayment = (paymentId: string) => {
    const updatedPayments = (formData.payments || []).filter(p => p.id !== paymentId)
    handleChange('payments', updatedPayments)

    // Update paidAmount automatically
    const newPaidAmount = updatedPayments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0)
    handleChange('paidAmount', newPaidAmount)

    // Automatically update payment status based on paid amount
    const actualAmount = formData.actualAmount || 0
    if (actualAmount > 0 && newPaidAmount >= actualAmount) {
      handleChange('paymentStatus', 'paid')
    } else if (newPaidAmount > 0 && newPaidAmount < actualAmount) {
      handleChange('paymentStatus', 'partial')
    } else if (formData.dueDate && formData.dueDate < new Date() && newPaidAmount < actualAmount) {
      handleChange('paymentStatus', 'overdue')
    } else {
      handleChange('paymentStatus', 'pending')
    }
  }

  // Calculate paid amount from completed payments
  const calculatePaidAmount = () => {
    const payments = formData.payments || []
    return payments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0)
  }

  // Save payment
  const savePayment = (paymentData: Omit<BudgetItemPayment, 'id' | 'createdAt'>) => {
    const payments = formData.payments || []
    let updatedPayments: BudgetItemPayment[]

    if (editingPayment) {
      // Update existing payment
      updatedPayments = payments.map(p =>
        p.id === editingPayment.id
          ? { ...p, ...paymentData }
          : p
      )
    } else {
      // Add new payment
      const newPayment: BudgetItemPayment = {
        id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        ...paymentData
      }
      updatedPayments = [...payments, newPayment]
    }

    handleChange('payments', updatedPayments)

    // Update paidAmount automatically
    const newPaidAmount = updatedPayments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0)
    handleChange('paidAmount', newPaidAmount)

    // Automatically update payment status based on paid amount
    const actualAmount = formData.actualAmount || 0
    if (actualAmount > 0 && newPaidAmount >= actualAmount) {
      // Fully paid
      handleChange('paymentStatus', 'paid')
    } else if (newPaidAmount > 0 && newPaidAmount < actualAmount) {
      // Partially paid
      handleChange('paymentStatus', 'partial')
    } else if (formData.dueDate && formData.dueDate < new Date() && newPaidAmount < actualAmount) {
      // Overdue
      handleChange('paymentStatus', 'overdue')
    } else {
      // Pending
      handleChange('paymentStatus', 'pending')
    }

    setShowPaymentModal(false)
    setEditingPayment(null)
  }

  // Add sub-item
  const addSubItem = () => {
    const subItems = formData.subItems || []
    const newSubItem = {
      id: `subitem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      description: '',
      amount: 0,
      currency: formData.currency,
      notes: ''
    }
    handleChange('subItems', [...subItems, newSubItem])
  }

  // Update sub-item
  const updateSubItem = (id: string, field: string, value: any) => {
    const subItems = formData.subItems || []
    const updatedSubItems = subItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    )
    handleChange('subItems', updatedSubItems)

    // Update actualAmount automatically
    const totalSubItemsAmount = updatedSubItems.reduce((sum, item) => sum + item.amount, 0)
    if (totalSubItemsAmount > 0) {
      handleChange('actualAmount', totalSubItemsAmount)
    }
  }

  // Remove sub-item
  const removeSubItem = (id: string) => {
    const subItems = formData.subItems || []
    const updatedSubItems = subItems.filter(item => item.id !== id)
    handleChange('subItems', updatedSubItems)

    // Update actualAmount automatically
    const totalSubItemsAmount = updatedSubItems.reduce((sum, item) => sum + item.amount, 0)
    if (totalSubItemsAmount > 0) {
      handleChange('actualAmount', totalSubItemsAmount)
    } else if (updatedSubItems.length === 0) {
      // Reset to budgeted amount if no sub-items
      handleChange('actualAmount', formData.budgetedAmount)
    }
  }

  // Get category info
  const selectedCategory = BUDGET_CATEGORIES[formData.category as keyof typeof BUDGET_CATEGORIES]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[150] p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Upravit rozpočtovou položku' : 'Přidat rozpočtovou položku'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Coins className="w-5 h-5 text-primary-600" />
              <span>Základní informace</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Název položky *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="např. Svatební místo, Catering..."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value as BudgetCategory)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                >
                  {Object.entries(BUDGET_CATEGORIES).map(([key, category]) => (
                    <option key={key} value={key}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
                {selectedCategory && (
                  <p className="mt-1 text-xs text-gray-500">
                    Doporučeno: {selectedCategory.defaultPercentage}% z celkového rozpočtu
                  </p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priorita
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Popis
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Dodatečné informace o položce..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>

          {/* Sub-items Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Coins className="w-5 h-5" />
              <span>Rozdělení položky</span>
            </h3>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Rozdělte tuto položku na dílčí části s vlastními cenami. Celková částka bude automaticky vypočítána.
              </p>

              {formData.subItems && formData.subItems.length > 0 && (
                <div className="space-y-3">
                  {formData.subItems.map((subItem, index) => (
                    <div key={subItem.id} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Dílčí položka #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSubItem(subItem.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Odstranit dílčí položku"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Název *
                          </label>
                          <input
                            type="text"
                            value={subItem.name}
                            onChange={(e) => updateSubItem(subItem.id, 'name', e.target.value)}
                            placeholder="např. Záloha, Doplatek..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Částka *
                          </label>
                          <input
                            type="number"
                            value={subItem.amount}
                            onChange={(e) => updateSubItem(subItem.id, 'amount', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="1"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Popis
                          </label>
                          <input
                            type="text"
                            value={subItem.description || ''}
                            onChange={(e) => updateSubItem(subItem.id, 'description', e.target.value)}
                            placeholder="Dodatečné informace..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={addSubItem}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-300 hover:text-primary-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Přidat dílčí položku</span>
              </button>

              {formData.subItems && formData.subItems.length > 0 && (
                <div className="bg-primary-50 p-3 rounded-lg border border-primary-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary-900">
                      Celková částka z dílčích položek:
                    </span>
                    <span className="text-lg font-bold text-primary-600">
                      {formatCurrency(formData.subItems.reduce((sum, item) => sum + item.amount, 0))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vendor Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span>Dodavatel</span>
            </h3>

            <div className="space-y-4">
              {/* Vendor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vybrat dodavatele
                </label>
                <select
                  value={formData.vendorName || ''}
                  onChange={(e) => handleChange('vendorName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Žádný dodavatel</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.name}>
                      {vendor.name} - {BUDGET_CATEGORIES[vendor.category as keyof typeof BUDGET_CATEGORIES]?.name || vendor.category}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Vyberte dodavatele ze seznamu nebo zadejte vlastní název níže
                </p>
              </div>

              {/* Custom Vendor Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nebo zadejte vlastní název
                </label>
                <input
                  type="text"
                  value={formData.vendorName}
                  onChange={(e) => handleChange('vendorName', e.target.value)}
                  placeholder="např. Hotel Grandhotel, Květinářství Růže..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Finanční údaje</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Měna
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                >
                  {currencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budgeted Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Předběžná částka *
                </label>
                <input
                  type="number"
                  value={formData.budgetedAmount}
                  onChange={(e) => handleChange('budgetedAmount', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.budgetedAmount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.budgetedAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.budgetedAmount}</p>
                )}
              </div>

              {/* Actual Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skutečná částka
                </label>
                <input
                  type="number"
                  value={formData.actualAmount}
                  onChange={(e) => handleChange('actualAmount', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.actualAmount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.actualAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.actualAmount}</p>
                )}
              </div>

              {/* Paid Amount - Read Only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Částečně zaplaceno
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formatCurrency(calculatePaidAmount())}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-xs text-gray-500">Auto</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Automaticky počítáno z plateb
                </p>
              </div>
            </div>

            {/* Estimate checkbox */}
            <div className="mt-4 flex items-center space-x-2">
              <input
                type="checkbox"
                id="isEstimate"
                checked={formData.isEstimate}
                onChange={(e) => handleChange('isEstimate', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                disabled={loading}
              />
              <label htmlFor="isEstimate" className="text-sm text-gray-700 cursor-pointer">
                Toto je pouze odhad
              </label>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Platební údaje</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Payment Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Období platby
                </label>
                <select
                  value={formData.paymentPeriod || ''}
                  onChange={(e) => handleChange('paymentPeriod', e.target.value === '' ? undefined : e.target.value as PaymentPeriod)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Vyberte období</option>
                  {paymentPeriodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Způsob platby
                </label>
                <select
                  value={formData.paymentMethod || ''}
                  onChange={(e) => handleChange('paymentMethod', e.target.value === '' ? undefined : e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Vyberte způsob</option>
                  {paymentMethodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Datum splatnosti
                </label>
                <input
                  type="date"
                  value={formData.dueDate ? formData.dueDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleChange('dueDate', e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              {/* Paid Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Datum platby
                </label>
                <input
                  type="date"
                  value={formData.paidDate ? formData.paidDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleChange('paidDate', e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Kdy byla platba provedena
                </p>
              </div>
            </div>
          </div>

          {/* Payments */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Platby</span>
            </h3>

            {formData.payments && formData.payments.length > 0 && (
              <div className="space-y-3 mb-4">
                {formData.payments.map((payment, index) => (
                  <div key={payment.id} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          Platba #{index + 1}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          payment.status === 'completed' ? 'bg-primary-100 text-primary-700' :
                          payment.status === 'pending' ? 'bg-primary-50 text-primary-600' :
                          payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {payment.status === 'completed' ? 'Dokončeno' :
                           payment.status === 'pending' ? 'Čeká' :
                           payment.status === 'failed' ? 'Neúspěšné' : 'Zrušeno'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => editPayment(payment)}
                          className="text-primary-500 hover:text-primary-700"
                          title="Upravit platbu"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removePayment(payment.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Odstranit platbu"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Částka:</span>
                        <p className="font-medium">{formatCurrency(payment.amount, payment.currency)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Datum:</span>
                        <p className="font-medium">
                          {payment.date instanceof Date ?
                            payment.date.toLocaleDateString('cs-CZ') :
                            new Date(payment.date).toLocaleDateString('cs-CZ')
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Způsob:</span>
                        <p className="font-medium">{payment.method || 'Neurčeno'}</p>
                      </div>
                    </div>
                    {payment.description && (
                      <div className="mt-2">
                        <span className="text-gray-500 text-sm">Poznámka:</span>
                        <p className="text-sm text-gray-700">{payment.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={addPayment}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-300 hover:text-primary-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Přidat platbu</span>
            </button>
          </div>

          {/* Documents Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">Dokumenty</h3>
            </div>
            <p className="text-sm text-gray-600">
              Nahrajte faktury, dodací listy, výpisy nebo jiné dokumenty související s touto položkou
            </p>
            <DocumentUpload
              documents={documents}
              onDocumentsChange={(newDocs) => {
                setDocuments(newDocs)
                setFormData(prev => ({ ...prev, documents: newDocs }))
              }}
              folder="budget-documents"
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 btn-outline"
              disabled={loading}
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={loading || !formData.name.trim() || formData.budgetedAmount <= 0}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 loading-spinner" />
                  <span>Ukládání...</span>
                </div>
              ) : (
                initialData ? 'Uložit změny' : 'Přidat položku'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          payment={editingPayment}
          currency={formData.currency}
          onSave={savePayment}
          onCancel={() => {
            setShowPaymentModal(false)
            setEditingPayment(null)
          }}
        />
      )}
    </div>
  )
}

// Payment Modal Component
interface PaymentModalProps {
  payment?: BudgetItemPayment | null
  currency: string
  onSave: (payment: Omit<BudgetItemPayment, 'id' | 'createdAt'>) => void
  onCancel: () => void
}

function PaymentModal({ payment, currency, onSave, onCancel }: PaymentModalProps) {
  const [paymentData, setPaymentData] = useState({
    amount: payment?.amount || 0,
    currency: payment?.currency || currency,
    method: payment?.method || 'card' as PaymentMethod,
    date: payment?.date || new Date(),
    description: payment?.description || '',
    reference: payment?.reference || '',
    status: payment?.status || 'completed' as 'pending' | 'completed' | 'failed' | 'cancelled'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (paymentData.amount <= 0) return

    onSave(paymentData)
  }

  const formatDate = (date: Date | any) => {
    // Handle Firestore Timestamp
    if (date && typeof date.toDate === 'function') {
      const d = date.toDate()
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // Handle Date object
    if (date instanceof Date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // Handle string dates
    if (typeof date === 'string') {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    return ''
  }

  const parseDate = (dateString: string) => {
    // Parse date in local timezone to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[160] p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {payment ? 'Upravit platbu' : 'Přidat platbu'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Částka *
              </label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Datum platby *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={formatDate(paymentData.date)}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, date: parseDate(e.target.value) }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Způsob platby
              </label>
              <select
                value={paymentData.method}
                onChange={(e) => setPaymentData(prev => ({ ...prev, method: e.target.value as PaymentMethod }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="card">Karta</option>
                <option value="transfer">Bankovní převod</option>
                <option value="cash">Hotovost</option>
                <option value="invoice">Faktura</option>
                <option value="other">Jiné</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stav platby
              </label>
              <select
                value={paymentData.status}
                onChange={(e) => setPaymentData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="completed">Dokončeno</option>
                <option value="pending">Čeká na zpracování</option>
                <option value="failed">Neúspěšné</option>
                <option value="cancelled">Zrušeno</option>
              </select>
            </div>

            {/* Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference (číslo faktury, transakce...)
              </label>
              <input
                type="text"
                value={paymentData.reference}
                onChange={(e) => setPaymentData(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="např. FAK-2024-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poznámka
              </label>
              <textarea
                value={paymentData.description}
                onChange={(e) => setPaymentData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Dodatečné informace o platbě..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Zrušit
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors"
                disabled={paymentData.amount <= 0}
              >
                {payment ? 'Uložit změny' : 'Přidat platbu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
