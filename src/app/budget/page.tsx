'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import { useBudget } from '@/hooks/useBudget'
import BudgetList from '@/components/budget/BudgetList'
import BudgetStats from '@/components/budget/BudgetStats'
import BudgetForm from '@/components/budget/BudgetForm'
import BudgetTemplates from '@/components/budget/BudgetTemplates'
import { BudgetFormData, BudgetItem, BudgetTemplate } from '@/types/budget'
import {
  Plus,
  Download,
  Upload,
  Settings,
  BarChart3,
  List,
  Grid3X3,
  DollarSign,
  ArrowLeft,
  Home,
  Calculator,
  FileText,
  Target
} from 'lucide-react'
import Link from 'next/link'

export default function BudgetPage() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const { budgetItems, loading, createBudgetItem, updateBudgetItem, error } = useBudget()
  // Removed viewMode - using stats view as default (most informative)
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null)
  const [budgetFormLoading, setBudgetFormLoading] = useState(false)
  const [templateLoading, setTemplateLoading] = useState(false)

  // Check if user has any budget items
  const hasBudgetItems = budgetItems.length > 0

  // Handle create budget item
  const handleCreateBudgetItem = async (data: BudgetFormData) => {
    try {
      setBudgetFormLoading(true)
      await createBudgetItem(data)
      setShowBudgetForm(false)
    } catch (error) {
      console.error('Error creating budget item:', error)
      throw error // Re-throw to show error in form
    } finally {
      setBudgetFormLoading(false)
    }
  }

  // Handle edit budget item
  const handleEditBudgetItem = (item: BudgetItem) => {
    setEditingItem(item)
    setShowBudgetForm(true)
  }

  // Handle update budget item
  const handleUpdateBudgetItem = async (data: BudgetFormData) => {
    if (!editingItem) return

    try {
      setBudgetFormLoading(true)

      // Map BudgetFormData to Partial<BudgetItem>
      const updateData: Partial<BudgetItem> = {
        name: data.name,
        description: data.description,
        category: data.category,
        budgetedAmount: data.budgetedAmount,
        actualAmount: data.actualAmount,
        paidAmount: data.paidAmount,
        currency: data.currency,
        vendorName: data.vendorName,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        dueDate: data.dueDate,
        paidDate: data.paidDate,
        priority: data.priority,
        notes: data.notes,
        tags: data.tags,
        isEstimate: data.isEstimate,
        payments: data.payments
      }

      await updateBudgetItem(editingItem.id, updateData)
      setShowBudgetForm(false)
      setEditingItem(null)
    } catch (error) {
      console.error('Error updating budget item:', error)
      throw error // Re-throw to show error in form
    } finally {
      setBudgetFormLoading(false)
    }
  }

  // Handle form submit (create or update)
  const handleFormSubmit = async (data: BudgetFormData) => {
    if (editingItem) {
      await handleUpdateBudgetItem(data)
    } else {
      await handleCreateBudgetItem(data)
    }
  }

  // Handle form cancel
  const handleFormCancel = () => {
    setShowBudgetForm(false)
    setEditingItem(null)
  }

  // Handle template application
  const handleApplyTemplate = async (template: BudgetTemplate, totalBudget: number) => {
    try {
      setTemplateLoading(true)
      // TODO: Implement template application
      console.log('Applying template:', template.name, 'with budget:', totalBudget)
      setShowTemplates(false)
    } catch (error) {
      console.error('Error applying template:', error)
      throw error // Re-throw to show error in templates modal
    } finally {
      setTemplateLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Přihlášení vyžadováno
          </h1>
          <p className="text-text-muted">
            Pro přístup ke správě rozpočtu se musíte přihlásit.
          </p>
        </div>
      </div>
    )
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Žádná svatba
          </h1>
          <p className="text-text-muted mb-4">
            Nejdříve si vytvořte svatbu v onboarding procesu.
          </p>
          <Link href="/" className="btn-primary">
            Zpět na dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        {/* Breadcrumb - Hidden on mobile */}
        <div className="hidden sm:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Rozpočet</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile header */}
          <div className="sm:hidden space-y-4 py-4">
            {/* Top row - Back button and title */}
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Rozpočet</h1>
              </div>
            </div>

            {/* Main action button - prominent placement */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowBudgetForm(true)}
                className="btn-primary flex items-center space-x-2 px-6 py-3 text-base font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Přidat položku</span>
              </button>
            </div>

            {/* Stats view indicator */}
            <div className="flex items-center justify-center">
              <div className="flex items-center bg-primary-100 rounded-lg px-3 py-2">
                <BarChart3 className="w-4 h-4 text-primary-600 mr-2" />
                <span className="text-sm font-medium text-primary-700">Statistiky a přehled</span>
              </div>
            </div>
          </div>

          {/* Desktop header */}
          <div className="hidden sm:flex items-center justify-between h-16">
            {/* Back button and Title */}
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Zpět na dashboard</span>
              </Link>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-2xl font-bold text-gray-900">Rozpočet</h1>
                <p className="text-sm text-text-muted">
                  Finanční plánování svatby {wedding.brideName} & {wedding.groomName}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">


              {/* Action buttons */}
              <button
                onClick={() => setShowCalculator(true)}
                className="btn-outline flex items-center space-x-2"
              >
                <Calculator className="w-4 h-4" />
                <span className="hidden lg:inline">Kalkulačka</span>
              </button>

              <button
                onClick={() => setShowBudgetForm(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Přidat položku</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 loading-spinner" />
              <span className="text-text-muted">Načítání rozpočtu...</span>
            </div>
          </div>
        ) : (
          /* Stats view - most informative display */
          <div className="space-y-6">
            <BudgetStats
              onCreateItem={() => setShowBudgetForm(true)}
              onEditItem={handleEditBudgetItem}
            />
          </div>
        )}

        {/* Empty state when no budget items */}
        {!loading && !hasBudgetItems && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-12 h-12 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Začněte s plánováním rozpočtu
              </h2>
              <p className="text-text-muted mb-8 max-w-md mx-auto">
                Vytvořte si rozpočet pro vaši svatbu, sledujte výdaje a udržujte
                finanční plánování pod kontrolou.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => setShowBudgetForm(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Přidat první položku</span>
                </button>

                <button
                  onClick={() => setShowTemplates(true)}
                  className="btn-outline flex items-center space-x-2"
                >
                  <Target className="w-4 h-4" />
                  <span>Použít šablonu</span>
                </button>
              </div>

              {/* Quick navigation */}
              <div className="mt-8 text-center">
                <Link
                  href="/"
                  className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>Zpět na hlavní obrazovku</span>
                </Link>
              </div>

              {/* Features preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Správa rozpočtu</h3>
                  <p className="text-sm text-text-muted">
                    Sledujte plánované vs skutečné náklady podle kategorií
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Analýzy a reporty</h3>
                  <p className="text-sm text-text-muted">
                    Detailní přehledy výdajů a využití rozpočtu
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Export a sdílení</h3>
                  <p className="text-sm text-text-muted">
                    Exportujte rozpočet do PDF nebo sdílejte s partnery
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}


      </div>

      {/* Budget Form Modal */}
      {showBudgetForm && (
        <BudgetForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={budgetFormLoading}
          error={error || undefined}
          initialData={editingItem ? {
            name: editingItem.name,
            description: editingItem.description,
            category: editingItem.category,
            budgetedAmount: editingItem.budgetedAmount,
            actualAmount: editingItem.actualAmount,
            paidAmount: editingItem.paidAmount,
            currency: editingItem.currency,
            vendorName: editingItem.vendorName,
            paymentStatus: editingItem.paymentStatus,
            paymentMethod: editingItem.paymentMethod,
            dueDate: editingItem.dueDate,
            paidDate: editingItem.paidDate,
            priority: editingItem.priority,
            notes: editingItem.notes,
            tags: editingItem.tags,
            isEstimate: editingItem.isEstimate,
            payments: editingItem.payments
          } : undefined}
        />
      )}

      {/* Budget Templates Modal */}
      {showTemplates && (
        <BudgetTemplates
          onSelectTemplate={handleApplyTemplate}
          onCancel={() => setShowTemplates(false)}
          loading={templateLoading}
          error={error || undefined}
        />
      )}

      {/* Budget Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Rozpočtová kalkulačka</h2>
                <button
                  onClick={() => setShowCalculator(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600">
                  Rychlá kalkulačka pro výpočet rozpočtu na svatbu.
                </p>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 Tip: Průměrná svatba v ČR stojí 300 000 - 600 000 Kč
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Počet hostů</span>
                    <input
                      type="number"
                      placeholder="80"
                      className="w-24 px-3 py-1 border border-gray-300 rounded text-right"
                    />
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Cena na hosta</span>
                    <input
                      type="number"
                      placeholder="2000"
                      className="w-24 px-3 py-1 border border-gray-300 rounded text-right"
                    />
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                      <span className="font-semibold text-gray-900">Odhadovaný rozpočet</span>
                      <span className="font-bold text-primary-600 text-lg">0 Kč</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowCalculator(false)}
                  className="w-full btn-primary mt-6"
                >
                  Zavřít
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
