'use client'

import { useState } from 'react'
import { db } from '@/config/firebase'
import { collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore'
import { TestTube, Trash2, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'

export default function TestAccountCleanup() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<{
    total: number
    testAccounts: number
    productionAccounts: number
  } | null>(null)

  const analyzeAccounts = async () => {
    setLoading(true)
    try {
      const analyticsSnapshot = await getDocs(collection(db, 'userAnalytics'))
      
      let total = 0
      let testAccounts = 0
      let productionAccounts = 0

      analyticsSnapshot.forEach(doc => {
        const data = doc.data()
        total++
        if (data.isTestAccount) {
          testAccounts++
        } else {
          productionAccounts++
        }
      })

      setStats({ total, testAccounts, productionAccounts })
    } catch (error) {
      console.error('Error analyzing accounts:', error)
      alert('Chyba při analýze účtů')
    } finally {
      setLoading(false)
    }
  }

  const markAllAsTest = async () => {
    if (!confirm('Opravdu chcete označit VŠECHNY účty jako testovací? Toto nelze snadno vrátit zpět!')) {
      return
    }

    setLoading(true)
    try {
      const analyticsSnapshot = await getDocs(collection(db, 'userAnalytics'))
      const batch = writeBatch(db)
      
      analyticsSnapshot.forEach(doc => {
        batch.update(doc.ref, { isTestAccount: true })
      })

      await batch.commit()
      alert(`Označeno ${analyticsSnapshot.size} účtů jako testovací`)
      await analyzeAccounts()
    } catch (error) {
      console.error('Error marking accounts:', error)
      alert('Chyba při označování účtů')
    } finally {
      setLoading(false)
    }
  }

  const markAllAsProduction = async () => {
    if (!confirm('Opravdu chcete označit VŠECHNY účty jako produkční?')) {
      return
    }

    setLoading(true)
    try {
      const analyticsSnapshot = await getDocs(collection(db, 'userAnalytics'))
      const batch = writeBatch(db)
      
      analyticsSnapshot.forEach(doc => {
        batch.update(doc.ref, { isTestAccount: false })
      })

      await batch.commit()
      alert(`Označeno ${analyticsSnapshot.size} účtů jako produkční`)
      await analyzeAccounts()
    } catch (error) {
      console.error('Error marking accounts:', error)
      alert('Chyba při označování účtů')
    } finally {
      setLoading(false)
    }
  }

  const deleteTestAccounts = async () => {
    if (!confirm('⚠️ VAROVÁNÍ: Opravdu chcete SMAZAT všechny testovací účty? Toto NELZE vrátit zpět!')) {
      return
    }

    if (!confirm('Jste si OPRAVDU jisti? Toto smaže všechna data testovacích účtů!')) {
      return
    }

    setLoading(true)
    try {
      const analyticsSnapshot = await getDocs(collection(db, 'userAnalytics'))
      const batch = writeBatch(db)
      let deleteCount = 0

      analyticsSnapshot.forEach(doc => {
        const data = doc.data()
        if (data.isTestAccount) {
          batch.delete(doc.ref)
          deleteCount++
        }
      })

      await batch.commit()
      alert(`Smazáno ${deleteCount} testovacích účtů`)
      await analyzeAccounts()
    } catch (error) {
      console.error('Error deleting accounts:', error)
      alert('Chyba při mazání účtů')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
          <TestTube className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Správa testovacích účtů</h3>
          <p className="text-sm text-gray-600">Nástroj pro přípravu na ostrý start produkce</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-800">Celkem účtů</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{stats.productionAccounts}</div>
            <div className="text-sm text-green-800">Produkční</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-amber-600">{stats.testAccounts}</div>
            <div className="text-sm text-amber-800">Testovací</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-4">
        <button
          onClick={analyzeAccounts}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzuji...' : 'Analyzovat účty'}
        </button>

        {stats && (
          <>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Hromadné akce</h4>

              <div className="space-y-2">
                <button
                  onClick={markAllAsTest}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <TestTube className="w-4 h-4" />
                  Označit všechny jako testovací
                </button>

                <button
                  onClick={markAllAsProduction}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Označit všechny jako produkční
                </button>

                <button
                  onClick={deleteTestAccounts}
                  disabled={loading || stats.testAccounts === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Smazat testovací účty ({stats.testAccounts})
                </button>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Doporučený postup pro ostrý start:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Analyzujte účty pomocí tlačítka výše</li>
                    <li>Označte všechny současné účty jako testovací</li>
                    <li>Statistiky v dashboardu se automaticky přepočítají</li>
                    <li>Po ostrém startu budou nové účty automaticky produkční</li>
                    <li>Později můžete testovací účty smazat</li>
                  </ol>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

