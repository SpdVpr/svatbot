'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import { useBudget } from '@/hooks/useBudget'
import BudgetList from '@/components/budget/BudgetList'
import BudgetStats from '@/components/budget/BudgetStats'
import BudgetForm from '@/components/budget/BudgetForm'
import BudgetTemplates from '@/components/budget/BudgetTemplates'
import SimpleCalculator from '@/components/budget/SimpleCalculator'
import ModuleHeader from '@/components/common/ModuleHeader'
import Link from 'next/link'
import { BudgetFormData, BudgetItem, BudgetTemplate } from '@/types/budget'
import {
  Plus,
  Download,
  DollarSign,
  Calculator,
  FileText,
  Target,
  Home,
  BarChart3
} from 'lucide-react'

export default function BudgetPage() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const { budgetItems, loading, createBudgetItem, updateBudgetItem, error, stats } = useBudget()
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
        paymentPeriod: data.paymentPeriod,
        dueDate: data.dueDate,
        paidDate: data.paidDate,
        priority: data.priority,
        notes: data.notes,
        tags: data.tags,
        isEstimate: data.isEstimate,
        payments: data.payments,
        subItems: data.subItems,
        documents: data.documents
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
    <div className="min-h-screen">
      {/* Header */}
      <ModuleHeader
        icon={DollarSign}
        title="Rozpočet"
        subtitle={`${Math.round(stats.totalBudget / 1000)}k Kč rozpočet • ${stats.budgetUsed}% využito`}
        iconGradient="from-primary-500 to-accent-500"
        actions={
          <div className="flex items-center space-x-2">
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
        }
      />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 !p-4">
        {/* Stats view - most informative display */}
        <div className="space-y-6">
          <BudgetStats
            onCreateItem={() => setShowBudgetForm(true)}
            onEditItem={handleEditBudgetItem}
          />
        </div>

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
                  <div className="w-12 h-12 mx-auto mb-3 bg-primary-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Správa rozpočtu</h3>
                  <p className="text-sm text-text-muted">
                    Sledujte plánované vs skutečné náklady podle kategorií
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-accent-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-accent-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Analýzy a reporty</h3>
                  <p className="text-sm text-text-muted">
                    Detailní přehledy výdajů a využití rozpočtu
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-gray-600" />
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
            paymentPeriod: editingItem.paymentPeriod,
            dueDate: editingItem.dueDate,
            paidDate: editingItem.paidDate,
            priority: editingItem.priority,
            notes: editingItem.notes,
            tags: editingItem.tags,
            isEstimate: editingItem.isEstimate,
            payments: editingItem.payments,
            subItems: editingItem.subItems,
            documents: editingItem.documents
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

      {/* Simple Calculator Modal */}
      {showCalculator && (
        <SimpleCalculator onClose={() => setShowCalculator(false)} />
      )}
    </div>
  )
}
