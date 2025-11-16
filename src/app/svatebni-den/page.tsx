'use client'

import { useState, useRef } from 'react'
import { Clock, Calendar, Plus, Trash2, X, Heart, Edit2, GripVertical, Printer, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useWeddingDayTimeline } from '@/hooks/useWeddingDayTimeline'
import ModuleHeader from '@/components/common/ModuleHeader'
import { useWedding } from '@/hooks/useWedding'
import { useRobustGuests } from '@/hooks/useRobustGuests'
import { useAccommodationWithGuests } from '@/hooks/useAccommodationWithGuests'
import AITimelineDialog from '@/components/svatebni-den/AITimelineDialog'

const PREDEFINED_ACTIVITIES = [
  { name: 'Příjezd hostů', category: 'ceremony' as const, duration: '30 min', icon: '🚗' },
  { name: 'Welcome drink', category: 'reception' as const, duration: '30 min', icon: '🥂' },
  { name: 'Svatební obřad', category: 'ceremony' as const, duration: '45 min', icon: '💒' },
  { name: 'Gratulace', category: 'ceremony' as const, duration: '30 min', icon: '🎉' },
  { name: 'Špalír', category: 'ceremony' as const, duration: '15 min', icon: '✨' },
  { name: 'Skupinové focení', category: 'photography' as const, duration: '45 min', icon: '📸' },
  { name: 'Přípitek', category: 'reception' as const, duration: '15 min', icon: '🍾' },
  { name: 'Proslovy', category: 'reception' as const, duration: '30 min', icon: '🎤' },
  { name: 'Oběd', category: 'reception' as const, duration: '2 hod', icon: '🍽️' },
  { name: 'Krájení dortu', category: 'reception' as const, duration: '15 min', icon: '🎂' },
  { name: 'Focení novomanželů', category: 'photography' as const, duration: '1 hod', icon: '💑' },
  { name: 'Ubytování hostů', category: 'preparation' as const, duration: '30 min', icon: '🏨' },
  { name: 'Házení kyticí', category: 'party' as const, duration: '15 min', icon: '💐' },
  { name: 'První tanec', category: 'party' as const, duration: '15 min', icon: '💃' },
  { name: 'Tanec s rodiči', category: 'party' as const, duration: '15 min', icon: '👨‍👩‍👧' },
  { name: 'Večeře', category: 'reception' as const, duration: '1 hod', icon: '🍴' },
  { name: 'Volná zábava', category: 'party' as const, duration: '3 hod', icon: '🎊' },
  { name: 'Hry', category: 'party' as const, duration: '1 hod', icon: '🎮' },
  { name: 'Kvízy', category: 'party' as const, duration: '30 min', icon: '❓' },
  { name: 'Tradice', category: 'party' as const, duration: '30 min', icon: '🎭' }
]

export default function SvatebniDenPage() {
  const { timeline, manualTimeline, aiTimeline, loading, createTimelineItem, createBulkTimelineItems, updateTimelineItem, deleteTimelineItem, deleteAllAITimeline, reorderTimeline } = useWeddingDayTimeline()
  const { wedding } = useWedding()
  const { guests } = useRobustGuests()
  const { accommodations } = useAccommodationWithGuests()
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<typeof PREDEFINED_ACTIVITIES[0] | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [aiExplanation, setAiExplanation] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    time: '',
    activity: '',
    duration: '',
    category: 'preparation' as const,
    location: '',
    notes: ''
  })

  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const editFormRef = useRef<HTMLDivElement | null>(null)
  const addFormRef = useRef<HTMLDivElement | null>(null)
  const customFormRef = useRef<HTMLDivElement | null>(null)

  const handleSelectPredefined = (activity: typeof PREDEFINED_ACTIVITIES[0]) => {
    setEditingId(null) // Zavřít editační formulář pokud je otevřený
    setSelectedActivity(activity)
    setFormData({
      time: '',
      activity: activity.name,
      duration: activity.duration,
      category: activity.category as any,
      location: '',
      notes: ''
    })
    setTimeout(() => {
      addFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  const handleAddPredefined = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedActivity) return

    try {
      await createTimelineItem({
        time: formData.time,
        activity: formData.activity,
        duration: formData.duration,
        category: selectedActivity.category as any,
        location: formData.location,
        participants: [],
        notes: formData.notes,
        order: timeline.length,
        isCompleted: false,
        source: 'manual'
      })
      setSelectedActivity(null)
      setFormData({
        time: '',
        activity: '',
        duration: '',
        category: 'preparation',
        location: '',
        notes: ''
      })
    } catch (err) {
      console.error('Error adding activity:', err)
      alert('Chyba při přidávání aktivity')
    }
  }

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTimelineItem({
        time: formData.time,
        activity: formData.activity,
        duration: formData.duration,
        category: 'preparation' as any,
        location: formData.location,
        participants: [],
        notes: formData.notes,
        order: timeline.length,
        isCompleted: false,
        source: 'manual'
      })
      setShowCustomForm(false)
      setFormData({
        time: '',
        activity: '',
        duration: '',
        category: 'preparation',
        location: '',
        notes: ''
      })
    } catch (err) {
      console.error('Error adding custom activity:', err)
      alert('Chyba při přidávání vlastní aktivity')
    }
  }

  const handleEdit = (item: any) => {
    setSelectedActivity(null) // Zavřít formulář pro přidání pokud je otevřený
    setEditingId(item.id)
    setFormData({
      time: item.time,
      activity: item.activity,
      duration: item.duration,
      category: item.category,
      location: item.location,
      notes: item.notes
    })
    setTimeout(() => {
      editFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return

    try {
      await updateTimelineItem(editingId, {
        time: formData.time,
        activity: formData.activity,
        duration: formData.duration,
        location: formData.location,
        notes: formData.notes
      })
      setEditingId(null)
      setFormData({
        time: '',
        activity: '',
        duration: '',
        category: 'preparation',
        location: '',
        notes: ''
      })
    } catch (err) {
      console.error('Error updating activity:', err)
      alert('Chyba při aktualizaci aktivity')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Opravdu chcete smazat tuto aktivitu?')) {
      try {
        await deleteTimelineItem(id)
      } catch (err) {
        console.error('Error deleting activity:', err)
        alert('Chyba při mazání aktivity')
      }
    }
  }

  const handleGenerateAITimeline = async (selectedActivities: any[], generalNotes: string) => {
    setIsGeneratingAI(true)
    try {
      // Prepare context
      const context = {
        weddingDate: wedding?.weddingDate,
        estimatedGuestCount: wedding?.estimatedGuestCount,
        budget: wedding?.budget,
        style: wedding?.style,
        region: wedding?.region,
        venue: wedding?.venue,
        brideName: wedding?.brideName,
        groomName: wedding?.groomName,
        accommodationCount: accommodations.length,
        hasAccommodation: accommodations.length > 0
      }

      // Call AI API
      const response = await fetch('/api/ai/timeline-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activities: selectedActivities,
          context,
          generalNotes
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate timeline')
      }

      const data = await response.json()

      // Delete existing AI timeline
      if (aiTimeline.length > 0) {
        await deleteAllAITimeline()
      }

      // Create new AI timeline items
      const aiItems = data.timeline.map((item: any, index: number) => ({
        time: item.time,
        activity: item.activity,
        duration: item.duration,
        category: item.category,
        location: item.location || '',
        participants: [],
        notes: item.notes || '',
        order: manualTimeline.length + index,
        isCompleted: false,
        source: 'ai' as const
      }))

      await createBulkTimelineItems(aiItems)

      // Store AI explanation
      setAiExplanation(data.explanation || null)

      alert('✨ AI harmonogram byl úspěšně vygenerován!')
    } catch (error) {
      console.error('Error generating AI timeline:', error)
      alert('Chyba při generování AI harmonogramu. Zkuste to prosím znovu.')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleDragStart = (e: React.DragEvent, itemId: string, index: number) => {
    setDraggedItem(itemId)
    setIsDragging(true)
    setDragOverIndex(null)

    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', itemId)

    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    dragTimeoutRef.current = setTimeout(() => {
      setDraggedItem(null)
      setDragOverIndex(null)
      setIsDragging(false)
    }, 50)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()

    if (!draggedItem || !isDragging) return

    e.dataTransfer.dropEffect = 'move'

    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    e.stopPropagation()

    if (!draggedItem || !isDragging) return

    const sortedTimeline = [...timeline].sort((a, b) => a.order - b.order)
    const draggedIndex = sortedTimeline.findIndex(item => item.id === draggedItem)

    if (draggedIndex === -1 || draggedIndex === dropIndex) {
      setDraggedItem(null)
      setDragOverIndex(null)
      setIsDragging(false)
      return
    }

    const newTimeline = [...sortedTimeline]
    const [removed] = newTimeline.splice(draggedIndex, 1)
    newTimeline.splice(dropIndex, 0, removed)

    try {
      await reorderTimeline(newTimeline)
    } catch (err) {
      console.error('Error reordering timeline:', err)
      alert('Chyba při změně pořadí')
    }

    setDraggedItem(null)
    setDragOverIndex(null)
    setIsDragging(false)

    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
  }

  const handlePrint = (timelineType: 'manual' | 'ai' | 'both') => {
    let sortedTimeline: typeof timeline = []
    let title = 'Harmonogram svatebního dne'

    if (timelineType === 'manual') {
      sortedTimeline = [...manualTimeline].sort((a, b) => a.order - b.order)
      title = 'Manuální harmonogram svatebního dne'
    } else if (timelineType === 'ai') {
      sortedTimeline = [...aiTimeline].sort((a, b) => a.order - b.order)
      title = 'AI Harmonogram svatebního dne'
    } else {
      sortedTimeline = [...timeline].sort((a, b) => a.order - b.order)
      title = 'Kompletní harmonogram svatebního dne'
    }

    // Create print window
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Prosím povolte vyskakovací okna pro tisk')
      return
    }

    const weddingDateStr = wedding?.weddingDate
      ? new Date(wedding.weddingDate).toLocaleDateString('cs-CZ', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      : ''

    // Get current theme color from CSS variables
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary-600').trim() || '#db2777'
    const primaryLight = getComputedStyle(document.documentElement).getPropertyValue('--color-primary-100').trim() || '#fce7f3'

    // Generate HTML for print
    const printContent = `
      <!DOCTYPE html>
      <html lang="cs">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Harmonogram svatebního dne</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Georgia', 'Times New Roman', serif;
            padding: 40px;
            color: #333;
            background: white;
          }

          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px double ${primaryColor};
            padding-bottom: 30px;
          }

          .header h1 {
            font-size: 36px;
            color: ${primaryColor};
            margin-bottom: 10px;
            font-weight: normal;
            letter-spacing: 2px;
          }

          .header .date {
            font-size: 18px;
            color: #666;
            font-style: italic;
            margin-top: 10px;
          }

          .header .decorative {
            font-size: 24px;
            color: ${primaryColor};
            margin: 15px 0;
          }

          .timeline {
            max-width: 800px;
            margin: 0 auto;
          }

          .timeline-item {
            display: flex;
            margin-bottom: 30px;
            page-break-inside: avoid;
          }

          .time-column {
            width: 120px;
            flex-shrink: 0;
            padding-right: 20px;
            text-align: right;
          }

          .time {
            font-size: 24px;
            font-weight: bold;
            color: ${primaryColor};
            font-family: 'Arial', sans-serif;
          }

          .duration {
            font-size: 12px;
            color: #999;
            margin-top: 4px;
          }

          .dot-column {
            width: 20px;
            flex-shrink: 0;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: ${primaryColor};
            border: 3px solid ${primaryLight};
            box-shadow: 0 0 0 2px ${primaryColor};
            z-index: 1;
            margin-top: 8px;
          }

          .line {
            width: 2px;
            flex: 1;
            background: linear-gradient(to bottom, ${primaryColor} 0%, ${primaryLight} 100%);
            position: absolute;
            top: 20px;
            bottom: -30px;
          }

          .timeline-item:last-child .line {
            display: none;
          }

          .content-column {
            flex: 1;
            padding-left: 20px;
          }

          .activity-name {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
          }

          .details {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
          }

          .detail-item {
            margin-bottom: 4px;
          }

          .detail-label {
            font-weight: bold;
            color: #999;
            margin-right: 8px;
          }

          .footer {
            margin-top: 60px;
            text-align: center;
            padding-top: 30px;
            border-top: 3px double ${primaryColor};
            color: #999;
            font-size: 12px;
          }

          @media print {
            body {
              padding: 20px;
            }

            .header h1 {
              font-size: 32px;
            }

            @page {
              margin: 1.5cm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="decorative">❤️</div>
          <h1>${title}</h1>
          ${weddingDateStr ? `<div class="date">${weddingDateStr}</div>` : ''}
          <div class="decorative">✨</div>
        </div>

        <div class="timeline">
          ${sortedTimeline.map((item, index) => `
            <div class="timeline-item">
              <div class="time-column">
                <div class="time">${item.time}</div>
                ${item.duration ? `<div class="duration">${item.duration}</div>` : ''}
              </div>

              <div class="dot-column">
                <div class="dot"></div>
                ${index < sortedTimeline.length - 1 ? '<div class="line"></div>' : ''}
              </div>

              <div class="content-column">
                <div class="activity-name">${item.activity}</div>
                <div class="details">
                  ${item.location ? `
                    <div class="detail-item">
                      <span class="detail-label">📍 Místo:</span>
                      <span>${item.location}</span>
                    </div>
                  ` : ''}
                  ${item.notes ? `
                    <div class="detail-item">
                      <span class="detail-label">💭 Poznámka:</span>
                      <span>${item.notes}</span>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="footer">
          Vytištěno ${new Date().toLocaleDateString('cs-CZ')} | svatbot.cz
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 250);
          };
        </script>
      </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <ModuleHeader
        icon={Calendar}
        title="Harmonogram svatebního dne"
        subtitle={`${timeline.length} aktivit naplánováno`}
        iconGradient="from-purple-500 to-pink-500"
        actions={
          timeline.length > 0 ? (
            <button
              onClick={() => {
                // If only one type exists, print it directly
                if (manualTimeline.length > 0 && aiTimeline.length === 0) {
                  handlePrint('manual')
                } else if (aiTimeline.length > 0 && manualTimeline.length === 0) {
                  handlePrint('ai')
                } else {
                  // Both exist, show dialog
                  setShowPrintDialog(true)
                }
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-button font-medium rounded-lg transition-all duration-200 shadow-soft hover:shadow-wedding text-sm"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Vytisknout</span>
            </button>
          ) : null
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Elegant Header with decorative elements */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center space-x-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary-300"></div>
            <Heart className="w-6 h-6 text-primary-500" fill="currentColor" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary-300"></div>
          </div>
          <h1 className="font-display text-4xl font-bold text-text-primary mb-3">Harmonogram svatebního dne</h1>
          <p className="text-text-secondary text-lg">Naplánujte si každý okamžik vašeho velkého dne</p>
        </div>

        {/* Predefined Activities - Elegant Grid */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h2 className="font-display text-2xl font-semibold text-text-primary text-center sm:text-left">
              Vyberte si z připravených aktivit
            </h2>
            <button
              onClick={() => setShowAIDialog(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-button font-medium rounded-lg transition-all duration-200 shadow-soft hover:shadow-wedding"
            >
              <Sparkles className="w-5 h-5" />
              <span>Vytvořit pomocí AI</span>
            </button>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {PREDEFINED_ACTIVITIES.map((activity, index) => (
              <button
                key={index}
                onClick={() => handleSelectPredefined(activity)}
                className="group relative bg-white border-2 border-primary-100 rounded-xl p-3 hover:border-primary-400 hover:shadow-wedding transition-all duration-300 text-left"
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{activity.icon}</span>
                  <div className="w-full">
                    <div className="font-display text-xs font-semibold text-text-primary group-hover:text-primary-600 transition-colors leading-tight">
                      {activity.name}
                    </div>
                    <div className="text-[10px] text-text-muted mt-1">{activity.duration}</div>
                  </div>
                </div>
                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-4 h-4 text-primary-500" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Predefined Activity Form */}
        {selectedActivity && (
          <div ref={addFormRef} className="wedding-card mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl">{selectedActivity.icon}</span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-semibold text-text-primary">{selectedActivity.name}</h3>
                  <p className="text-sm text-text-muted">Doplňte detaily aktivity</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="p-2 text-text-muted hover:text-text-primary hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddPredefined} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Čas začátku *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="input-field text-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Délka trvání
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input-field"
                    placeholder="např. 1 hod"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Místo
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field"
                    placeholder="např. Zahrada"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Poznámky
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-field"
                    placeholder="Volitelné poznámky"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Přidat do harmonogramu
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedActivity(null)}
                  className="btn-outline flex-1"
                >
                  Zrušit
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Activity Form */}
        {editingId && (
          <div ref={editFormRef} className="wedding-card mb-8 animate-fade-in">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-semibold text-text-primary">Upravit aktivitu</h3>
                <p className="text-sm text-text-muted">Změňte detaily aktivity</p>
              </div>
            </div>
            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Název aktivity *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.activity}
                    onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                    className="input-field"
                    placeholder="např. Příjezd fotografa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Čas začátku *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="input-field text-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Délka trvání
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input-field"
                    placeholder="např. 1 hod"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Místo
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field"
                    placeholder="např. Zahrada"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Poznámky
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-field"
                    placeholder="Volitelné poznámky"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Uložit změny
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setFormData({
                      time: '',
                      activity: '',
                      duration: '',
                      category: 'preparation',
                      location: '',
                      notes: ''
                    })
                  }}
                  className="btn-outline flex-1"
                >
                  Zrušit
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Custom Activity Button */}
        {!editingId && (
          <div className="text-center mb-8">
            <button
              onClick={() => {
                setShowCustomForm(!showCustomForm)
                if (!showCustomForm) {
                  setTimeout(() => {
                    customFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }, 100)
                }
              }}
              className="inline-flex items-center space-x-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-button font-medium rounded-xl transition-all duration-200 shadow-soft hover:shadow-wedding"
            >
              <Plus className="w-5 h-5" />
              <span>Přidat vlastní aktivitu</span>
            </button>
          </div>
        )}

        {showCustomForm && (
          <div ref={customFormRef} className="wedding-card mb-8 animate-fade-in">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-semibold text-text-primary">Vlastní aktivita</h3>
                <p className="text-sm text-text-muted">Vytvořte si aktivitu na míru</p>
              </div>
            </div>
            <form onSubmit={handleAddCustom} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Název aktivity *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.activity}
                    onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                    className="input-field"
                    placeholder="např. Příjezd fotografa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Čas začátku *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="input-field text-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Délka trvání
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input-field"
                    placeholder="např. 1 hod"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Místo
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field"
                    placeholder="např. Zahrada"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Poznámky
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-field"
                    placeholder="Volitelné poznámky"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Přidat aktivitu
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomForm(false)}
                  className="btn-outline flex-1"
                >
                  Zrušit
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Manual Timeline */}
        {manualTimeline.length > 0 && (
          <div className="wedding-card mb-8">
            {/* Header with decorative line */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center space-x-3 mb-4">
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-primary-300 to-primary-300"></div>
                <Calendar className="w-6 h-6 text-primary-500" />
                <div className="h-px w-16 bg-gradient-to-l from-primary-300 via-primary-300 to-transparent"></div>
              </div>
              <h2 className="font-display text-3xl font-bold text-text-primary mb-2">Váš manuální harmonogram</h2>
              <p className="text-text-muted">{manualTimeline.length} {manualTimeline.length === 1 ? 'aktivita' : manualTimeline.length < 5 ? 'aktivity' : 'aktivit'}</p>
            </div>

            {/* Timeline */}
            <div className="space-y-0">
              {[...manualTimeline].sort((a, b) => a.order - b.order).map((item, index, sortedArray) => {
                const isLast = index === sortedArray.length - 1

                return (
                  <div 
                    key={item.id} 
                    className={`group relative cursor-grab active:cursor-grabbing ${draggedItem === item.id ? 'opacity-50' : ''} ${dragOverIndex === index ? 'ring-2 ring-primary-400' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    {/* Timeline row - Responsive layout */}
                    <div className="flex items-start">
                      {/* Drag handle */}
                      <div className="flex-shrink-0 pt-4 sm:pt-6 pr-2">
                        <GripVertical className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-primary-500 transition-colors" />
                      </div>

                      {/* Time column - Smaller on mobile */}
                      <div className="w-16 sm:w-32 flex-shrink-0 pt-4 sm:pt-6">
                        <div className="text-right pr-2 sm:pr-8">
                          <div className="font-display text-base sm:text-2xl font-bold text-primary-600">{item.time}</div>
                          {item.duration && (
                            <div className="text-xs text-text-muted mt-1 hidden sm:block">{item.duration}</div>
                          )}
                        </div>
                      </div>

                      {/* Timeline dot and line */}
                      <div className="relative flex flex-col items-center flex-shrink-0">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-primary-500 ring-2 sm:ring-4 ring-primary-100 z-10 mt-5 sm:mt-7"></div>
                        {!isLast && (
                          <div className="w-0.5 h-full bg-gradient-to-b from-primary-200 to-primary-100 absolute top-8 sm:top-11"></div>
                        )}
                      </div>

                      {/* Content column - Reduced padding on mobile */}
                      <div className="flex-1 pl-3 sm:pl-8 pb-8 sm:pb-12">
                        <div className="bg-neutral-50 border border-primary-100 rounded-xl p-3 sm:p-6 hover:shadow-soft hover:border-primary-300 transition-all duration-300 group-hover:bg-white">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-display text-base sm:text-xl font-semibold text-text-primary mb-2 sm:mb-3">
                                {item.activity}
                              </h3>

                              {/* Duration on mobile (hidden on desktop) */}
                              {item.duration && (
                                <div className="text-xs text-text-muted mb-2 sm:hidden">{item.duration}</div>
                              )}

                              {(item.location || item.notes) && (
                                <div className="space-y-1 sm:space-y-2">
                                  {item.location && (
                                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-text-secondary">
                                      <span className="text-primary-500 flex-shrink-0">📍</span>
                                      <span className="truncate">{item.location}</span>
                                    </div>
                                  )}
                                  {item.notes && (
                                    <div className="flex items-start space-x-2 text-xs sm:text-sm text-text-muted">
                                      <span className="text-accent-500 mt-0.5 flex-shrink-0">💭</span>
                                      <span className="flex-1 italic line-clamp-2 sm:line-clamp-none">{item.notes}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Edit and Delete buttons - Always visible on mobile, hover on desktop */}
                            <div className="ml-2 flex items-center space-x-1 sm:space-x-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1.5 sm:p-2 text-text-muted hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                                title="Upravit"
                              >
                                <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 sm:p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                title="Smazat"
                              >
                                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* AI Timeline */}
        {aiTimeline.length > 0 && (
          <div className="wedding-card mb-8">
            {/* Header with decorative line and AI badge */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center space-x-3 mb-4">
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-purple-300 to-purple-300"></div>
                <Sparkles className="w-6 h-6 text-purple-500" />
                <div className="h-px w-16 bg-gradient-to-l from-purple-300 via-purple-300 to-transparent"></div>
              </div>
              <div className="flex items-center justify-center space-x-3 mb-2">
                <h2 className="font-display text-3xl font-bold text-text-primary">AI Harmonogram</h2>
                <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-semibold rounded-full">
                  Vygenerováno AI
                </span>
              </div>
              <p className="text-text-muted mb-4">{aiTimeline.length} {aiTimeline.length === 1 ? 'aktivita' : aiTimeline.length < 5 ? 'aktivity' : 'aktivit'}</p>
              <button
                onClick={async () => {
                  if (confirm('Opravdu chcete smazat celý AI harmonogram?')) {
                    await deleteAllAITimeline()
                    setAiExplanation(null)
                  }
                }}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Smazat AI harmonogram
              </button>
            </div>

            {/* AI Explanation */}
            {aiExplanation && (
              <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
                <div className="flex items-start space-x-3 mb-4">
                  <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-display text-xl font-semibold text-text-primary mb-3">
                      Vysvětlení harmonogramu
                    </h3>
                    <div className="text-text-secondary leading-relaxed whitespace-pre-line">
                      {aiExplanation}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-0">
              {[...aiTimeline].sort((a, b) => a.order - b.order).map((item, index, sortedArray) => {
                const isLast = index === sortedArray.length - 1

                return (
                  <div
                    key={item.id}
                    className="group relative"
                  >
                    {/* Timeline row - Responsive layout */}
                    <div className="flex items-start">
                      {/* AI Badge */}
                      <div className="flex-shrink-0 pt-4 sm:pt-6 pr-2">
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                      </div>

                      {/* Time column - Smaller on mobile */}
                      <div className="w-16 sm:w-32 flex-shrink-0 pt-4 sm:pt-6">
                        <div className="text-right pr-2 sm:pr-8">
                          <div className="font-display text-base sm:text-2xl font-bold text-purple-600">{item.time}</div>
                          {item.duration && (
                            <div className="text-xs text-text-muted mt-1 hidden sm:block">{item.duration}</div>
                          )}
                        </div>
                      </div>

                      {/* Timeline dot and line */}
                      <div className="relative flex flex-col items-center flex-shrink-0">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-purple-500 ring-2 sm:ring-4 ring-purple-100 z-10 mt-5 sm:mt-7"></div>
                        {!isLast && (
                          <div className="w-0.5 h-full bg-gradient-to-b from-purple-200 to-purple-100 absolute top-8 sm:top-11"></div>
                        )}
                      </div>

                      {/* Content column - Reduced padding on mobile */}
                      <div className="flex-1 pl-3 sm:pl-8 pb-8 sm:pb-12">
                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 sm:p-6 hover:shadow-soft hover:border-purple-300 transition-all duration-300 group-hover:bg-white">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-display text-base sm:text-xl font-semibold text-text-primary mb-2 sm:mb-3">
                                {item.activity}
                              </h3>

                              {/* Duration on mobile (hidden on desktop) */}
                              {item.duration && (
                                <div className="text-xs text-text-muted mb-2 sm:hidden">{item.duration}</div>
                              )}

                              {(item.location || item.notes) && (
                                <div className="space-y-1 sm:space-y-2">
                                  {item.location && (
                                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-text-secondary">
                                      <span className="text-purple-500 flex-shrink-0">📍</span>
                                      <span className="truncate">{item.location}</span>
                                    </div>
                                  )}
                                  {item.notes && (
                                    <div className="flex items-start space-x-2 text-xs sm:text-sm text-text-muted">
                                      <span className="text-purple-500 flex-shrink-0 mt-0.5">💭</span>
                                      <span className="flex-1">{item.notes}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Edit and Delete buttons - Always visible on mobile, hover on desktop */}
                            <div className="ml-2 flex items-center space-x-1 sm:space-x-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1.5 sm:p-2 text-text-muted hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                                title="Upravit"
                              >
                                <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 sm:p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                title="Smazat"
                              >
                                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {timeline.length === 0 && (
          <div className="wedding-card text-center py-16">
            <div className="w-32 h-32 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-16 h-16 text-primary-400" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-text-primary mb-3">
              Začněte plánovat váš velký den
            </h3>
            <p className="text-text-secondary text-lg mb-8 max-w-md mx-auto">
              Vyberte si z připravených aktivit výše nebo vytvořte vlastní harmonogram na míru
            </p>
            <div className="inline-flex items-center space-x-3">
              <div className="h-px w-8 bg-primary-200"></div>
              <Heart className="w-5 h-5 text-primary-500" fill="currentColor" />
              <div className="h-px w-8 bg-primary-200"></div>
            </div>
          </div>
        )}
      </div>

      {/* AI Timeline Dialog */}
      <AITimelineDialog
        isOpen={showAIDialog}
        onClose={() => setShowAIDialog(false)}
        activities={PREDEFINED_ACTIVITIES}
        onGenerate={handleGenerateAITimeline}
      />

      {/* Print Selection Dialog */}
      {showPrintDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-primary">Vyberte harmonogram k tisku</h3>
              <button
                onClick={() => setShowPrintDialog(false)}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {manualTimeline.length > 0 && (
                <button
                  onClick={() => {
                    handlePrint('manual')
                    setShowPrintDialog(false)
                  }}
                  className="w-full p-4 text-left border-2 border-primary-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-text-primary group-hover:text-primary-600">
                        Manuální harmonogram
                      </div>
                      <div className="text-sm text-text-muted mt-1">
                        {manualTimeline.length} {manualTimeline.length === 1 ? 'aktivita' : manualTimeline.length < 5 ? 'aktivity' : 'aktivit'}
                      </div>
                    </div>
                    <Calendar className="w-6 h-6 text-primary-500" />
                  </div>
                </button>
              )}

              {aiTimeline.length > 0 && (
                <button
                  onClick={() => {
                    handlePrint('ai')
                    setShowPrintDialog(false)
                  }}
                  className="w-full p-4 text-left border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-text-primary group-hover:text-purple-600 flex items-center space-x-2">
                        <span>AI Harmonogram</span>
                        <span className="px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-semibold rounded-full">
                          AI
                        </span>
                      </div>
                      <div className="text-sm text-text-muted mt-1">
                        {aiTimeline.length} {aiTimeline.length === 1 ? 'aktivita' : aiTimeline.length < 5 ? 'aktivity' : 'aktivit'}
                      </div>
                    </div>
                    <Sparkles className="w-6 h-6 text-purple-500" />
                  </div>
                </button>
              )}

              {manualTimeline.length > 0 && aiTimeline.length > 0 && (
                <button
                  onClick={() => {
                    handlePrint('both')
                    setShowPrintDialog(false)
                  }}
                  className="w-full p-4 text-left border-2 border-accent-200 rounded-lg hover:border-accent-400 hover:bg-accent-50 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-text-primary group-hover:text-accent-600">
                        Oba harmonogramy
                      </div>
                      <div className="text-sm text-text-muted mt-1">
                        {timeline.length} {timeline.length === 1 ? 'aktivita' : timeline.length < 5 ? 'aktivity' : 'aktivit'} celkem
                      </div>
                    </div>
                    <Heart className="w-6 h-6 text-accent-500" fill="currentColor" />
                  </div>
                </button>
              )}
            </div>

            <button
              onClick={() => setShowPrintDialog(false)}
              className="w-full mt-4 px-4 py-2 text-text-muted hover:text-text-primary border border-gray-300 rounded-lg transition-colors"
            >
              Zrušit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

