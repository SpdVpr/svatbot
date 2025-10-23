'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import { useSeating } from '@/hooks/useSeating'
import SeatingPlanEditor from '@/components/seating/SeatingPlanEditor'
import ModuleHeader from '@/components/common/ModuleHeader'
import {
  Plus,
  Grid3X3,
  Users,
  Users2,
  BarChart3,
  Home,
  MousePointer2,
  MousePointerClick,
  Trash2,
  Info,
  Move
} from 'lucide-react'
import Link from 'next/link'

export default function SeatingPage() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const { seatingPlans, currentPlan, loading, createSeatingPlan, setCurrentPlan, deleteSeatingPlan } = useSeating()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  // Handle create seating plan
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const newPlan = await createSeatingPlan({
        name: formData.name,
        description: formData.description,
        venueLayout: {
          width: 1200,
          height: 800,
          danceFloor: {
            x: 500,
            y: 300,
            width: 200,
            height: 200
          }
        }
      })

      setShowCreateForm(false)
      setFormData({ name: '', description: '' })
    } catch (error) {
      console.error('Error creating seating plan:', error)
      alert('Chyba při vytváření plánu: ' + (error as Error).message)
    }
  }

  // Handle delete seating plan with double confirmation
  const handleDeletePlan = async () => {
    if (!currentPlan) return

    // First confirmation
    const firstConfirm = confirm(
      `Opravdu chcete smazat plán "${currentPlan.name}"?\n\n` +
      `Tento plán obsahuje:\n` +
      `• ${currentPlan.tables?.length || 0} stolů\n` +
      `• ${currentPlan.seats?.length || 0} židlí\n` +
      `• ${currentPlan.seats?.filter(s => s.guestId).length || 0} přiřazených hostů\n\n` +
      `Tato akce je nevratná!`
    )

    if (!firstConfirm) return

    // Second confirmation
    const secondConfirm = confirm(
      `⚠️ POSLEDNÍ VAROVÁNÍ ⚠️\n\n` +
      `Opravdu chcete TRVALE SMAZAT plán "${currentPlan.name}"?\n\n` +
      `Všechna data budou ztracena a nelze je obnovit!`
    )

    if (!secondConfirm) return

    try {
      await deleteSeatingPlan(currentPlan.id)
    } catch (error) {
      console.error('Error deleting seating plan:', error)
      alert('Chyba při mazání plánu: ' + (error as Error).message)
    }
  }

  // Don't show auth check - let AppTemplate handle transitions smoothly
  if (!user || !wedding) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <ModuleHeader
        icon={Users2}
        title="Zasedací pořádek"
        subtitle={`${currentPlan?.tables?.length || 0} stolů • ${(currentPlan?.seats?.filter(s => s.guestId).length || 0) + (currentPlan?.chairSeats?.filter(s => s.guestId).length || 0)} přiřazených hostů`}
        iconGradient="from-cyan-500 to-blue-500"
        actions={
          <div className="flex items-center space-x-3">
            {/* Plan selector */}
            {seatingPlans.length > 0 && (
              <select
                value={currentPlan?.id || ''}
                onChange={(e) => setCurrentPlan(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Vyberte plán</option>
                {seatingPlans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            )}

            {/* Delete plan button - only show if a plan is selected */}
            {currentPlan && (
              <button
                onClick={handleDeletePlan}
                className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-2"
                title="Smazat plán"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Smazat plán</span>
              </button>
            )}

            {/* Action buttons */}
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nový plán</span>
            </button>
          </div>
        }
      />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 loading-spinner" />
              <span className="text-text-muted">Načítání plánů rozmístění...</span>
            </div>
          </div>
        ) : seatingPlans.length === 0 ? (
          /* Empty state */
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center">
              <Grid3X3 className="w-12 h-12 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Začněte s rozmístěním hostů
            </h2>
            <p className="text-text-muted mb-8 max-w-md mx-auto">
              Vytvořte si plán rozmístění hostů pro vaši svatbu. Uspořádejte stoly a přiřaďte hosty
              podle vašich představ a požadavků.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Vytvořit první plán</span>
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
                  <Grid3X3 className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Interaktivní editor</h3>
                <p className="text-sm text-text-muted">
                  Drag & drop rozhraní pro snadné uspořádání stolů a hostů
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Auto-rozmístění</h3>
                <p className="text-sm text-text-muted">
                  Automatické přiřazení hostů podle kategorií a preferencí
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Statistiky</h3>
                <p className="text-sm text-text-muted">
                  Přehled obsazenosti stolů a rozmístění kategorií hostů
                </p>
              </div>
            </div>
          </div>
        ) : currentPlan ? (
          /* Seating plan editor */
          <>
            {/* Legend / Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-blue-900 mb-3">Ovládání editoru</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                    <div className="flex items-start space-x-2">
                      <MousePointerClick className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Dvojklik na stůl:</span> Úprava stolu (název, kapacita, tvar)
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MousePointer2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Levý klik na číslo židle:</span> Přiřazení hosta na místo
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Trash2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Pravý klik na židli:</span> Smazání židle u stolu
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Move className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Tažení stolu:</span> Přesunutí stolu na jiné místo
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <SeatingPlanEditor key={currentPlan.id} currentPlan={currentPlan} />
          </>
        ) : (
          /* Plan selection */
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Vyberte plán rozmístění
            </h2>
            <p className="text-text-muted mb-8">
              Máte {seatingPlans.length} plán{seatingPlans.length > 1 ? 'y' : ''} rozmístění. Vyberte jeden pro úpravy.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {seatingPlans.map(plan => (
                <div
                  key={plan.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setCurrentPlan(plan.id)}
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-sm text-text-muted mb-4">{plan.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-text-muted">
                    <span>{plan.tables?.length || 0} stolů</span>
                    <span>{plan.totalSeats || 0} míst</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create plan modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vytvořit nový plán rozmístění
            </h3>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Název plánu *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="např. Hlavní plán rozmístění"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Popis (volitelné)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Popis plánu rozmístění..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 btn-outline"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Vytvořit plán
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
