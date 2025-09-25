'use client'

import { useState } from 'react'
import { useAI } from '@/hooks/useAI'
import {
  Clock,
  Sparkles,
  Calendar,
  Users,
  Camera,
  Music,
  Utensils,
  Heart,
  Loader2,
  Download,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface TimelineItem {
  time: string
  activity: string
  duration: string
  notes?: string
}

interface AITimelineGeneratorProps {
  onTimelineSave?: (timeline: TimelineItem[]) => void
  className?: string
}

const getActivityIcon = (activity: string) => {
  const activityLower = activity.toLowerCase()
  if (activityLower.includes('foto') || activityLower.includes('focení')) return Camera
  if (activityLower.includes('hudba') || activityLower.includes('tanec')) return Music
  if (activityLower.includes('jídlo') || activityLower.includes('hostina')) return Utensils
  if (activityLower.includes('obřad') || activityLower.includes('ceremonie')) return Heart
  if (activityLower.includes('host') || activityLower.includes('příchod')) return Users
  return Clock
}

export default function AITimelineGenerator({ 
  onTimelineSave,
  className = '' 
}: AITimelineGeneratorProps) {
  const { generateTimeline, loading, error, clearError } = useAI()
  
  const [generatedData, setGeneratedData] = useState<{
    timeline: TimelineItem[]
    tips: string[]
  } | null>(null)
  const [hasGenerated, setHasGenerated] = useState(false)

  const handleGenerateTimeline = async () => {
    clearError()
    try {
      const result = await generateTimeline()
      setGeneratedData(result)
      setHasGenerated(true)
    } catch (err) {
      console.error('Failed to generate timeline:', err)
    }
  }

  const handleRefresh = () => {
    setGeneratedData(null)
    setHasGenerated(false)
    handleGenerateTimeline()
  }

  const handleSaveTimeline = () => {
    if (generatedData?.timeline) {
      onTimelineSave?.(generatedData.timeline)
    }
  }

  const handleDownloadTimeline = () => {
    if (!generatedData?.timeline) return

    const content = [
      'SVATEBNÍ TIMELINE - Generováno AI',
      '=' .repeat(40),
      '',
      ...generatedData.timeline.map(item => 
        `${item.time} - ${item.activity} (${item.duration})${item.notes ? `\n   Poznámka: ${item.notes}` : ''}`
      ),
      '',
      'TIPY A DOPORUČENÍ:',
      '-'.repeat(20),
      ...generatedData.tips.map((tip, index) => `${index + 1}. ${tip}`)
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'svatebni-timeline.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Timeline Generator</h3>
            <p className="text-sm text-gray-500">Automatické plánování svatebního dne</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          {hasGenerated && (
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Vygenerovat nový timeline"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!hasGenerated ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
          <h4 className="font-medium text-gray-900 mb-2">
            Vytvořte perfektní timeline
          </h4>
          <p className="text-sm text-gray-500 mb-6">
            AI vytvoří detailní časový plán vašeho svatebního dne na základě vašich preferencí a počtu hostů
          </p>
          <button
            onClick={handleGenerateTimeline}
            disabled={loading}
            className="btn-primary flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generuji timeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Vygenerovat timeline</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-3" />
              <span className="text-gray-600">Generuji nový timeline...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {generatedData && !loading && (
            <>
              {/* Timeline */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                  <Clock className="w-4 h-4 text-blue-500 mr-2" />
                  Svatební timeline
                </h4>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {generatedData.timeline.map((item, index) => {
                    const IconComponent = getActivityIcon(item.activity)
                    return (
                      <div
                        key={index}
                        className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-medium text-gray-900">{item.activity}</h5>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{item.time}</span>
                              <span>•</span>
                              <span>{item.duration}</span>
                            </div>
                          </div>
                          {item.notes && (
                            <p className="text-sm text-gray-600">{item.notes}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Tips */}
              {generatedData.tips.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Tipy a doporučení
                  </h4>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {generatedData.tips.map((tip, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm text-green-700">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="btn-outline flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Nový timeline</span>
                  </button>
                  
                  <button
                    onClick={handleDownloadTimeline}
                    className="btn-outline flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Stáhnout</span>
                  </button>
                </div>
                
                <button
                  onClick={handleSaveTimeline}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Uložit timeline</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
