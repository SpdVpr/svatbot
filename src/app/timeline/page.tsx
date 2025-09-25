'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import { useTimeline } from '@/hooks/useTimeline'
import TimelineView from '@/components/timeline/TimelineView'
import TimelineStats from '@/components/timeline/TimelineStats'
import MilestoneForm from '@/components/timeline/MilestoneForm'
import TimelineTemplates from '@/components/timeline/TimelineTemplates'
import TimelineCalendar from '@/components/timeline/TimelineCalendar'
import GoogleCalendarIntegration from '@/components/timeline/GoogleCalendarIntegration'
import { MilestoneFormData, Milestone, TimelineTemplate } from '@/types/timeline'
import {
  Plus,
  Download,
  Upload,
  Settings,
  BarChart3,
  List,
  Calendar,
  Target,
  ArrowLeft,
  Home,
  Clock,
  Zap
} from 'lucide-react'
import Link from 'next/link'

export default function TimelinePage() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const { milestones, loading, createMilestone, updateMilestone, applyTimelineTemplate, error } = useTimeline()
  // Removed viewMode - showing everything on one page
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [milestoneFormLoading, setMilestoneFormLoading] = useState(false)
  const [templateLoading, setTemplateLoading] = useState(false)

  // Check if user has any milestones
  const hasMilestones = milestones.length > 0

  // Handle create milestone
  const handleCreateMilestone = async (data: MilestoneFormData) => {
    console.log('🚀 Starting milestone creation with data:', data)
    try {
      setMilestoneFormLoading(true)
      console.log('📝 Calling createMilestone...')
      const result = await createMilestone(data)
      console.log('✅ Milestone created successfully:', result)
      setShowMilestoneForm(false)
      console.log('🔄 Modal closed, milestone should appear in list')
    } catch (error) {
      console.error('❌ Error creating milestone:', error)
      throw error // Re-throw to show error in form
    } finally {
      setMilestoneFormLoading(false)
      console.log('🏁 Milestone creation process finished')
    }
  }

  // Handle edit milestone
  const handleEditMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone)
    setShowMilestoneForm(true)
  }

  // Handle update milestone
  const handleUpdateMilestone = async (data: MilestoneFormData) => {
    if (!editingMilestone) return

    try {
      setMilestoneFormLoading(true)
      await updateMilestone(editingMilestone.id, data)
      setShowMilestoneForm(false)
      setEditingMilestone(null)
    } catch (error) {
      console.error('Error updating milestone:', error)
      throw error // Re-throw to show error in form
    } finally {
      setMilestoneFormLoading(false)
    }
  }

  // Handle form submit (create or update)
  const handleFormSubmit = async (data: MilestoneFormData) => {
    if (editingMilestone) {
      await handleUpdateMilestone(data)
    } else {
      await handleCreateMilestone(data)
    }
  }

  // Handle form cancel
  const handleFormCancel = () => {
    setShowMilestoneForm(false)
    setEditingMilestone(null)
  }

  // Handle template application
  const handleApplyTemplate = async (template: TimelineTemplate, weddingDate: Date) => {
    try {
      setTemplateLoading(true)
      await applyTimelineTemplate(template, weddingDate)
      setShowTemplates(false)
    } catch (error) {
      console.error('Error applying timeline template:', error)
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
            Pro přístup k timeline se musíte přihlásit.
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
            <span className="text-gray-900 font-medium">Timeline</span>
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
                <h1 className="text-lg font-bold text-gray-900">Timeline</h1>
              </div>
            </div>

            {/* Main action button - prominent placement */}
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowMilestoneForm(true)}
                className="btn-primary flex items-center space-x-2 px-6 py-3 text-base font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Přidat milník</span>
              </button>

              <button
                onClick={() => setShowTemplates(true)}
                className="btn-outline flex items-center space-x-2 px-6 py-3 text-base font-medium"
              >
                <Zap className="w-5 h-5" />
                <span>Šablony</span>
              </button>
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
                <h1 className="text-2xl font-bold text-gray-900">Timeline</h1>
                <p className="text-sm text-text-muted">
                  Plánování svatby {wedding.brideName} & {wedding.groomName}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowTemplates(true)}
                className="btn-outline flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span className="hidden lg:inline">Šablony</span>
              </button>

              <button className="btn-outline flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span className="hidden lg:inline">Export</span>
              </button>

              <button
                onClick={() => setShowMilestoneForm(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Přidat milník</span>
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
              <span className="text-text-muted">Načítání timeline...</span>
            </div>
          </div>
        ) : !hasMilestones ? (
          /* Empty state */
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center">
              <Target className="w-12 h-12 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Začněte s plánováním timeline
            </h2>
            <p className="text-text-muted mb-8 max-w-md mx-auto">
              Vytvořte si timeline pro vaši svatbu, sledujte milníky a udržujte
              plánování na správné cestě.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setShowMilestoneForm(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Přidat první milník</span>
              </button>

              <button
                onClick={() => setShowTemplates(true)}
                className="btn-outline flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
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
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Milníky</h3>
                <p className="text-sm text-text-muted">
                  Sledujte klíčové momenty a termíny ve svatebním plánování
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Připomínky</h3>
                <p className="text-sm text-text-muted">
                  Automatické upozornění na blížící se termíny
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Pokrok</h3>
                <p className="text-sm text-text-muted">
                  Vizuální sledování pokroku v přípravách
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* All content on one page */
          <div className="space-y-8">
            {/* Stats Overview */}
            <TimelineStats
              onCreateMilestone={() => setShowMilestoneForm(true)}
              onEditMilestone={handleEditMilestone}
            />

            {/* Calendar and Google Integration */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Timeline Calendar */}
              <TimelineCalendar
                events={milestones.map(milestone => ({
                  id: milestone.id,
                  title: milestone.title,
                  startTime: milestone.targetDate ? new Date(milestone.targetDate).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }) : '09:00',
                  endTime: milestone.targetDate ? new Date(new Date(milestone.targetDate).getTime() + 60*60*1000).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }) : '10:00',
                  type: milestone.type,
                  location: '',
                  description: milestone.description
                }))}
                weddingDate={wedding?.weddingDate}
                onEventClick={(event) => {
                  const milestone = milestones.find(m => m.id === event.id)
                  if (milestone) {
                    handleEditMilestone(milestone)
                  }
                }}
              />

              {/* Google Calendar Integration */}
              <GoogleCalendarIntegration
                onSync={() => {
                  console.log('Calendar sync completed')
                }}
              />
            </div>


          </div>
        )}
      </div>

      {/* Milestone Form Modal */}
      {showMilestoneForm && (
        <MilestoneForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={milestoneFormLoading}
          error={error || undefined}
          initialData={editingMilestone ? {
            title: editingMilestone.title,
            description: editingMilestone.description,
            type: editingMilestone.type,
            targetDate: editingMilestone.targetDate,
            priority: editingMilestone.priority,
            isRequired: editingMilestone.isRequired,
            reminderDays: editingMilestone.reminderDays,
            notes: editingMilestone.notes,
            tags: editingMilestone.tags,
            dependsOn: editingMilestone.dependsOn
          } : undefined}
        />
      )}

      {/* Timeline Templates Modal */}
      {showTemplates && (
        <TimelineTemplates
          onSelectTemplate={handleApplyTemplate}
          onCancel={() => setShowTemplates(false)}
          loading={templateLoading}
          error={error || undefined}
        />
      )}
    </div>
  )
}
