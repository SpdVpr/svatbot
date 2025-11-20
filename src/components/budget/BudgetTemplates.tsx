'use client'

import { useState } from 'react'
import { BudgetTemplate, BUDGET_CATEGORIES } from '@/types/budget'
import { useCurrency } from '@/contexts/CurrencyContext'
import {
  X,
  Target,
  Check,
  AlertCircle,
  DollarSign,
  Users,
  MapPin,
  Star
} from 'lucide-react'

interface BudgetTemplatesProps {
  onSelectTemplate: (template: BudgetTemplate, totalBudget: number) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: string
}

// Predefined budget templates
const BUDGET_TEMPLATES: BudgetTemplate[] = [
  {
    id: 'small-wedding',
    name: 'Malá svatba',
    description: 'Intimní svatba pro 30-50 hostů',
    categories: [
      {
        category: 'venue',
        percentage: 35,
        items: [
          { name: 'Svatební místo', percentage: 35, priority: 'critical' }
        ]
      },
      {
        category: 'catering',
        percentage: 30,
        items: [
          { name: 'Catering pro hosty', percentage: 25, priority: 'critical' },
          { name: 'Svatební dort', percentage: 5, priority: 'medium' }
        ]
      },
      {
        category: 'photography',
        percentage: 10,
        items: [
          { name: 'Svatební fotograf', percentage: 10, priority: 'high' }
        ]
      },
      {
        category: 'flowers',
        percentage: 8,
        items: [
          { name: 'Svatební kytice', percentage: 4, priority: 'medium' },
          { name: 'Květinová výzdoba', percentage: 4, priority: 'low' }
        ]
      },
      {
        category: 'dress',
        percentage: 6,
        items: [
          { name: 'Svatební šaty', percentage: 6, priority: 'high' }
        ]
      },
      {
        category: 'suit',
        percentage: 3,
        items: [
          { name: 'Svatební oblek', percentage: 3, priority: 'medium' }
        ]
      },
      {
        category: 'rings',
        percentage: 4,
        items: [
          { name: 'Snubní prsteny', percentage: 4, priority: 'high' }
        ]
      },
      {
        category: 'other',
        percentage: 4,
        items: [
          { name: 'Ostatní výdaje', percentage: 4, priority: 'low' }
        ]
      }
    ],
    totalBudgetRange: { min: 150000, max: 300000 },
    currency: 'CZK',
    region: 'CZ'
  },
  {
    id: 'medium-wedding',
    name: 'Střední svatba',
    description: 'Klasická svatba pro 50-100 hostů',
    categories: [
      {
        category: 'venue',
        percentage: 40,
        items: [
          { name: 'Svatební místo', percentage: 40, priority: 'critical' }
        ]
      },
      {
        category: 'catering',
        percentage: 25,
        items: [
          { name: 'Catering pro hosty', percentage: 20, priority: 'critical' },
          { name: 'Svatební dort', percentage: 3, priority: 'medium' },
          { name: 'Alkohol a nápoje', percentage: 2, priority: 'medium' }
        ]
      },
      {
        category: 'photography',
        percentage: 8,
        items: [
          { name: 'Svatební fotograf', percentage: 6, priority: 'high' },
          { name: 'Svatební album', percentage: 2, priority: 'medium' }
        ]
      },
      {
        category: 'videography',
        percentage: 5,
        items: [
          { name: 'Svatební kameraman', percentage: 5, priority: 'medium' }
        ]
      },
      {
        category: 'flowers',
        percentage: 4,
        items: [
          { name: 'Svatební kytice', percentage: 2, priority: 'medium' },
          { name: 'Květinová výzdoba', percentage: 2, priority: 'low' }
        ]
      },
      {
        category: 'music',
        percentage: 3,
        items: [
          { name: 'DJ nebo kapela', percentage: 3, priority: 'medium' }
        ]
      },
      {
        category: 'dress',
        percentage: 4,
        items: [
          { name: 'Svatební šaty', percentage: 4, priority: 'high' }
        ]
      },
      {
        category: 'suit',
        percentage: 2,
        items: [
          { name: 'Svatební oblek', percentage: 2, priority: 'medium' }
        ]
      },
      {
        category: 'rings',
        percentage: 2,
        items: [
          { name: 'Snubní prsteny', percentage: 2, priority: 'high' }
        ]
      },
      {
        category: 'invitations',
        percentage: 1,
        items: [
          { name: 'Svatební oznámení', percentage: 1, priority: 'medium' }
        ]
      },
      {
        category: 'decoration',
        percentage: 3,
        items: [
          { name: 'Svatební dekorace', percentage: 3, priority: 'low' }
        ]
      },
      {
        category: 'other',
        percentage: 3,
        items: [
          { name: 'Ostatní výdaje', percentage: 3, priority: 'low' }
        ]
      }
    ],
    totalBudgetRange: { min: 300000, max: 600000 },
    currency: 'CZK',
    region: 'CZ'
  },
  {
    id: 'large-wedding',
    name: 'Velká svatba',
    description: 'Luxusní svatba pro 100+ hostů',
    categories: [
      {
        category: 'venue',
        percentage: 40,
        items: [
          { name: 'Luxusní svatební místo', percentage: 40, priority: 'critical' }
        ]
      },
      {
        category: 'catering',
        percentage: 25,
        items: [
          { name: 'Prémiový catering', percentage: 18, priority: 'critical' },
          { name: 'Svatební dort', percentage: 3, priority: 'medium' },
          { name: 'Alkohol a nápoje', percentage: 4, priority: 'medium' }
        ]
      },
      {
        category: 'photography',
        percentage: 8,
        items: [
          { name: 'Profesionální fotograf', percentage: 5, priority: 'high' },
          { name: 'Svatební album', percentage: 2, priority: 'medium' },
          { name: 'Dodatečné fotografie', percentage: 1, priority: 'low' }
        ]
      },
      {
        category: 'videography',
        percentage: 5,
        items: [
          { name: 'Profesionální kameraman', percentage: 4, priority: 'high' },
          { name: 'Svatební film', percentage: 1, priority: 'medium' }
        ]
      },
      {
        category: 'flowers',
        percentage: 4,
        items: [
          { name: 'Luxusní svatební kytice', percentage: 2, priority: 'medium' },
          { name: 'Květinová výzdoba', percentage: 2, priority: 'medium' }
        ]
      },
      {
        category: 'music',
        percentage: 3,
        items: [
          { name: 'Živá kapela', percentage: 2, priority: 'medium' },
          { name: 'DJ', percentage: 1, priority: 'medium' }
        ]
      },
      {
        category: 'decoration',
        percentage: 3,
        items: [
          { name: 'Profesionální dekorace', percentage: 3, priority: 'medium' }
        ]
      },
      {
        category: 'dress',
        percentage: 3,
        items: [
          { name: 'Designérské svatební šaty', percentage: 3, priority: 'high' }
        ]
      },
      {
        category: 'suit',
        percentage: 2,
        items: [
          { name: 'Luxusní svatební oblek', percentage: 2, priority: 'medium' }
        ]
      },
      {
        category: 'rings',
        percentage: 2,
        items: [
          { name: 'Luxusní snubní prsteny', percentage: 2, priority: 'high' }
        ]
      },
      {
        category: 'invitations',
        percentage: 1,
        items: [
          { name: 'Designová oznámení', percentage: 1, priority: 'medium' }
        ]
      },
      {
        category: 'transportation',
        percentage: 1,
        items: [
          { name: 'Svatební doprava', percentage: 1, priority: 'low' }
        ]
      },
      {
        category: 'beauty',
        percentage: 1,
        items: [
          { name: 'Svatební kosmetika', percentage: 1, priority: 'medium' }
        ]
      },
      {
        category: 'other',
        percentage: 2,
        items: [
          { name: 'Ostatní výdaje', percentage: 2, priority: 'low' }
        ]
      }
    ],
    totalBudgetRange: { min: 600000, max: 1500000 },
    currency: 'CZK',
    region: 'CZ'
  }
]

export default function BudgetTemplates({ 
  onSelectTemplate, 
  onCancel, 
  loading = false, 
  error 
}: BudgetTemplatesProps) {
  const { formatCurrency: formatCurrencyFromContext } = useCurrency()
  const [selectedTemplate, setSelectedTemplate] = useState<BudgetTemplate | null>(null)
  const [customBudget, setCustomBudget] = useState<number>(0)
  const [step, setStep] = useState<'select' | 'configure'>('select')

  // Handle template selection
  const handleTemplateSelect = (template: BudgetTemplate) => {
    setSelectedTemplate(template)
    setCustomBudget(template.totalBudgetRange.min)
    setStep('configure')
  }

  // Handle template application
  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return

    try {
      await onSelectTemplate(selectedTemplate, customBudget)
    } catch (error) {
      console.error('Error applying template:', error)
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return formatCurrencyFromContext(amount)
  }

  // Get template icon
  const getTemplateIcon = (templateId: string) => {
    switch (templateId) {
      case 'small-wedding':
        return <Users className="w-8 h-8 text-blue-600" />
      case 'medium-wedding':
        return <MapPin className="w-8 h-8 text-green-600" />
      case 'large-wedding':
        return <Star className="w-8 h-8 text-purple-600" />
      default:
        return <Target className="w-8 h-8 text-gray-600" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 'select' ? 'Vyberte šablonu rozpočtu' : 'Nastavte rozpočet'}
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

        {/* Content */}
        <div className="p-6">
          {step === 'select' ? (
            /* Template selection */
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600">
                  Vyberte šablonu, která nejlépe odpovídá vaší svatbě. 
                  Můžete ji později upravit podle svých potřeb.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {BUDGET_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="text-center mb-4">
                      {getTemplateIcon(template.id)}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                      {template.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4 text-center">
                      {template.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Rozpočet:</span>
                        <span className="font-medium">
                          {formatCurrency(template.totalBudgetRange.min)} - {formatCurrency(template.totalBudgetRange.max)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Kategorií:</span>
                        <span className="font-medium">{template.categories.length}</span>
                      </div>
                    </div>

                    {/* Top categories preview */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-700 mb-2">Hlavní kategorie:</p>
                      {template.categories
                        .sort((a, b) => b.percentage - a.percentage)
                        .slice(0, 3)
                        .map((cat) => {
                          const categoryInfo = BUDGET_CATEGORIES[cat.category as keyof typeof BUDGET_CATEGORIES]
                          return (
                            <div key={cat.category} className="flex justify-between text-xs">
                              <span className="text-gray-600">
                                {categoryInfo?.icon} {categoryInfo?.name}
                              </span>
                              <span className="font-medium">{cat.percentage}%</span>
                            </div>
                          )
                        })}
                    </div>

                    <button className="w-full mt-4 btn-outline btn-sm">
                      Vybrat šablonu
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Template configuration */
            selectedTemplate && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mb-4">
                    {getTemplateIcon(selectedTemplate.id)}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-gray-600">
                    {selectedTemplate.description}
                  </p>
                </div>

                {/* Budget input */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Celkový rozpočet
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={customBudget}
                      onChange={(e) => setCustomBudget(parseFloat(e.target.value) || 0)}
                      min={selectedTemplate.totalBudgetRange.min}
                      max={selectedTemplate.totalBudgetRange.max}
                      step="10000"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-sm text-gray-500">
                    <span>Min: {formatCurrency(selectedTemplate.totalBudgetRange.min)}</span>
                    <span>Max: {formatCurrency(selectedTemplate.totalBudgetRange.max)}</span>
                  </div>
                </div>

                {/* Category breakdown preview */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Rozdělení rozpočtu podle kategorií
                  </h4>
                  
                  <div className="space-y-3">
                    {selectedTemplate.categories
                      .sort((a, b) => b.percentage - a.percentage)
                      .map((cat) => {
                        const categoryInfo = BUDGET_CATEGORIES[cat.category as keyof typeof BUDGET_CATEGORIES]
                        const amount = (customBudget * cat.percentage) / 100
                        
                        return (
                          <div key={cat.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{categoryInfo?.icon}</span>
                              <div>
                                <p className="font-medium text-gray-900">{categoryInfo?.name}</p>
                                <p className="text-sm text-gray-500">
                                  {cat.items.length} položek
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                {formatCurrency(amount)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {cat.percentage}%
                              </p>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setStep('select')}
                    className="flex-1 btn-outline"
                    disabled={loading}
                  >
                    Zpět
                  </button>
                  <button
                    onClick={handleApplyTemplate}
                    className="flex-1 btn-primary"
                    disabled={loading || customBudget <= 0}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 loading-spinner" />
                        <span>Vytváření...</span>
                      </div>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Použít šablonu
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
