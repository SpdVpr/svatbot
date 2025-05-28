'use client'

import { useState } from 'react'
import { TimelineTemplate, TIMELINE_TEMPLATES, MILESTONE_TYPES } from '@/types/timeline'
import { useWedding } from '@/hooks/useWedding'
import {
  X,
  Calendar,
  Check,
  AlertCircle,
  Users,
  MapPin,
  Star,
  Heart,
  Clock
} from 'lucide-react'

interface TimelineTemplatesProps {
  onSelectTemplate: (template: TimelineTemplate, weddingDate: Date) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: string
}

export default function TimelineTemplates({
  onSelectTemplate,
  onCancel,
  loading = false,
  error
}: TimelineTemplatesProps) {
  const { wedding } = useWedding()
  const [selectedTemplate, setSelectedTemplate] = useState<TimelineTemplate | null>(null)

  // Safe date initialization
  const getDefaultWeddingDate = (): Date => {
    if (wedding?.weddingDate) {
      const weddingDate = new Date(wedding.weddingDate)
      if (!isNaN(weddingDate.getTime())) {
        return weddingDate
      }
    }
    // Default to 1 year from now
    return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  }

  const [customWeddingDate, setCustomWeddingDate] = useState<Date>(getDefaultWeddingDate())
  const [step, setStep] = useState<'select' | 'configure'>('select')

  // Handle template selection
  const handleTemplateSelect = (template: TimelineTemplate) => {
    setSelectedTemplate(template)
    setStep('configure')
  }

  // Handle template application
  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return

    try {
      await onSelectTemplate(selectedTemplate, customWeddingDate)
    } catch (error) {
      console.error('Error applying timeline template:', error)
    }
  }

  // Get template icon
  const getTemplateIcon = (weddingType: string) => {
    switch (weddingType) {
      case 'small':
        return <Users className="w-8 h-8 text-blue-600" />
      case 'medium':
        return <MapPin className="w-8 h-8 text-green-600" />
      case 'large':
        return <Star className="w-8 h-8 text-purple-600" />
      case 'destination':
        return <Heart className="w-8 h-8 text-pink-600" />
      case 'elopement':
        return <Heart className="w-8 h-8 text-red-600" />
      default:
        return <Calendar className="w-8 h-8 text-gray-600" />
    }
  }

  // Calculate milestone dates based on wedding date
  const calculateMilestoneDates = (template: TimelineTemplate, weddingDate: Date) => {
    // Validate wedding date
    if (!weddingDate || isNaN(weddingDate.getTime())) {
      return []
    }

    return template.milestones.map(milestone => {
      let targetDate = new Date(weddingDate.getTime()) // Create new date from timestamp

      if (milestone.monthsBefore) {
        targetDate.setMonth(targetDate.getMonth() - milestone.monthsBefore)
      }
      if (milestone.weeksBefore) {
        targetDate.setDate(targetDate.getDate() - (milestone.weeksBefore * 7))
      }
      if (milestone.daysBefore) {
        targetDate.setDate(targetDate.getDate() - milestone.daysBefore)
      }

      return {
        ...milestone,
        targetDate
      }
    }).sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime())
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 'select' ? 'Vyberte šablonu timeline' : 'Nastavte datum svatby'}
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
                  Vyberte šablonu timeline, která nejlépe odpovídá vaší svatbě.
                  Můžete ji později upravit podle svých potřeb.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TIMELINE_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="text-center mb-4">
                      {getTemplateIcon(template.weddingType)}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                      {template.name}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 text-center">
                      {template.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Milníků:</span>
                        <span className="font-medium">{template.milestones.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Typ svatby:</span>
                        <span className="font-medium capitalize">{template.weddingType}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Kritických:</span>
                        <span className="font-medium text-red-600">
                          {template.milestones.filter(m => m.priority === 'critical').length}
                        </span>
                      </div>
                    </div>

                    {/* Top milestones preview */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-700 mb-2">Klíčové milníky:</p>
                      {template.milestones
                        .filter(m => m.priority === 'critical' || m.priority === 'high')
                        .slice(0, 3)
                        .map((milestone, index) => {
                          const milestoneType = MILESTONE_TYPES[milestone.type as keyof typeof MILESTONE_TYPES]
                          return (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600 flex items-center space-x-1">
                                <span>{milestoneType?.icon}</span>
                                <span>{milestone.title}</span>
                              </span>
                              <span className="font-medium">
                                {milestone.monthsBefore ? `${milestone.monthsBefore}m` :
                                 milestone.weeksBefore ? `${milestone.weeksBefore}w` :
                                 milestone.daysBefore ? `${milestone.daysBefore}d` : 'Den D'}
                              </span>
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

              {/* Custom template option */}
              <div className="text-center pt-6 border-t border-gray-200">
                <p className="text-gray-600 mb-4">
                  Nebo si vytvořte vlastní timeline od začátku
                </p>
                <button
                  onClick={onCancel}
                  className="btn-outline"
                >
                  Vytvořit vlastní timeline
                </button>
              </div>
            </div>
          ) : (
            /* Template configuration */
            selectedTemplate && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mb-4">
                    {getTemplateIcon(selectedTemplate.weddingType)}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-gray-600">
                    {selectedTemplate.description}
                  </p>
                </div>

                {/* Wedding date input */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Datum svatby
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={customWeddingDate && !isNaN(customWeddingDate.getTime())
                        ? customWeddingDate.toISOString().split('T')[0]
                        : ''
                      }
                      onChange={(e) => {
                        const newDate = new Date(e.target.value)
                        if (!isNaN(newDate.getTime())) {
                          setCustomWeddingDate(newDate)
                        }
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Všechny milníky budou vypočítány na základě tohoto data
                  </p>
                </div>

                {/* Timeline preview */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Náhled timeline
                  </h4>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {customWeddingDate && !isNaN(customWeddingDate.getTime()) &&
                     calculateMilestoneDates(selectedTemplate, customWeddingDate).map((milestone, index) => {
                      const milestoneType = MILESTONE_TYPES[milestone.type as keyof typeof MILESTONE_TYPES]
                      const isOverdue = milestone.targetDate < new Date()
                      const daysFromNow = Math.ceil((milestone.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{milestoneType?.icon || '📋'}</span>
                            <div>
                              <p className="font-medium text-gray-900">{milestone.title}</p>
                              <p className="text-sm text-gray-600">
                                {milestone.targetDate.toLocaleDateString('cs-CZ')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${
                              milestone.priority === 'critical' ? 'text-red-600' :
                              milestone.priority === 'high' ? 'text-orange-600' :
                              milestone.priority === 'medium' ? 'text-blue-600' :
                              'text-gray-600'
                            }`}>
                              {milestone.priority === 'critical' ? 'Kritický' :
                               milestone.priority === 'high' ? 'Vysoký' :
                               milestone.priority === 'medium' ? 'Střední' : 'Nízký'}
                            </p>
                            <p className={`text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                              {isOverdue ?
                                `${Math.abs(daysFromNow)} dní zpět` :
                                daysFromNow === 0 ? 'Dnes' :
                                daysFromNow === 1 ? 'Zítra' :
                                `Za ${daysFromNow} dní`
                              }
                            </p>
                          </div>
                        </div>
                      )
                    })}

                    {(!customWeddingDate || isNaN(customWeddingDate.getTime())) && (
                      <div className="text-center py-8 text-gray-500">
                        <p>Vyberte platné datum svatby pro zobrazení náhledu</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-blue-900 mb-1">Shrnutí</h5>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• {selectedTemplate.milestones.length} milníků bude vytvořeno</li>
                        <li>• {selectedTemplate.milestones.filter(m => m.priority === 'critical').length} kritických milníků</li>
                        <li>• Timeline začíná {Math.max(...selectedTemplate.milestones.map(m => m.monthsBefore || 0))} měsíců před svatbou</li>
                        <li>• Automatické připomínky budou nastaveny</li>
                      </ul>
                    </div>
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
                    disabled={loading || !customWeddingDate || isNaN(customWeddingDate.getTime())}
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
