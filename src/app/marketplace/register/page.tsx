'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MarketplaceVendorForm, { MarketplaceVendorFormData } from '@/components/marketplace/MarketplaceVendorForm'
import { ArrowLeft, CheckCircle, Store, Users, TrendingUp, Shield, Copy, Check } from 'lucide-react'
import { db } from '@/config/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

// Generate a unique edit token
function generateEditToken(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Recursively remove undefined values from objects (Firestore doesn't accept undefined)
function cleanForFirestore(obj: any): any {
  if (obj === null || obj === undefined) {
    return null
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cleanForFirestore(item)).filter(item => item !== null && item !== undefined)
  }

  if (typeof obj === 'object') {
    const cleaned: any = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        const cleanedValue = cleanForFirestore(value)
        if (cleanedValue !== null && cleanedValue !== undefined) {
          cleaned[key] = cleanedValue
        }
      }
    }
    return cleaned
  }

  return obj
}

export default function MarketplaceRegisterPage() {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editToken, setEditToken] = useState<string>('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (data: MarketplaceVendorFormData) => {
    setSubmitting(true)
    try {
      // Generate unique edit token
      const token = generateEditToken()

      // Remove undefined values from data (Firestore doesn't accept undefined)
      const cleanData = cleanForFirestore(data) as MarketplaceVendorFormData

      // Prepare data for Firestore
      const vendorData = {
        ...cleanData,
        // Edit token for future edits
        editToken: token,
        // Default values for new registrations
        verified: false,
        featured: false,
        premium: false,
        rating: {
          overall: 0,
          count: 0,
          breakdown: {
            quality: 0,
            communication: 0,
            value: 0,
            professionalism: 0
          }
        },
        testimonials: [],
        awards: [],
        certifications: [],
        // Merge user-provided tags/keywords with auto-generated ones
        tags: [
          ...new Set([
            ...(data.tags || []).filter(t => t.trim()),
            data.category,
            data.address.city.toLowerCase()
          ])
        ],
        keywords: [
          ...new Set([
            ...(data.keywords || []).filter(k => k.trim()),
            data.category,
            data.name.toLowerCase(),
            data.address.city.toLowerCase()
          ])
        ],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActive: serverTimestamp(),
        status: 'pending' // Waiting for admin approval
      }

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'marketplaceVendors'), vendorData)

      console.log('✅ Vendor registration submitted:', docRef.id)

      // Store edit token for success page
      setEditToken(token)
      setSubmitted(true)
      setShowForm(false)

      // TODO: Send email with edit link
      // sendVendorRegistrationEmail(data.email, token)

      // Redirect to marketplace after 30 seconds (longer to allow copying edit link)
      setTimeout(() => {
        router.push('/marketplace')
      }, 30000)
    } catch (error) {
      console.error('Error submitting vendor registration:', error)
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  const copyEditLink = () => {
    const editUrl = `${window.location.origin}/marketplace/edit/${editToken}`
    navigator.clipboard.writeText(editUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (submitted) {
    const editUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/marketplace/edit/${editToken}`

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-10 h-10 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Děkujeme za registraci!</h2>
            <p className="text-gray-600 mb-2">
              Váš inzerát byl úspěšně odeslán. Náš tým ho zkontroluje a zveřejní do 24-48 hodin.
            </p>
            <p className="text-sm text-gray-500">
              O schválení vás budeme informovat emailem.
            </p>
          </div>

          {/* Edit Link Section */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-amber-900 mb-2 flex items-center justify-center">
              <Shield className="w-5 h-5 mr-2" />
              Důležité: Uložte si tento odkaz!
            </h3>
            <p className="text-sm text-amber-800 mb-4 text-center">
              Pomocí tohoto odkazu budete moci kdykoliv upravit svůj inzerát. Uložte si ho do záložek nebo poznámek.
            </p>

            <div className="bg-white rounded-lg p-4 mb-3">
              <p className="text-xs text-gray-500 mb-2 font-medium">Váš editační odkaz:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm font-mono text-gray-700"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={copyEditLink}
                  className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Zkopírováno
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Kopírovat
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="text-xs text-amber-700 space-y-1">
              <p>✓ Tento odkaz vám umožní upravit název, popis, ceny, fotografie a další údaje</p>
              <p>✓ Odkaz je trvalý a můžete ho použít kdykoliv v budoucnu</p>
              <p>✓ Odkaz také obdržíte emailem po schválení inzerátu</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-blue-800">
              Budete automaticky přesměrováni na marketplace za 30 sekund...
            </p>
          </div>

          <div className="flex justify-center">
            <Link href="/marketplace" className="btn-primary inline-flex items-center">
              Zpět na marketplace
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (showForm) {
    return (
      <MarketplaceVendorForm
        onSubmit={handleSubmit}
        onCancel={() => setShowForm(false)}
      />
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link
              href="/marketplace"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Zpět na marketplace
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors font-medium"
            >
              <Store className="w-5 h-5 mr-2" />
              Prohlédnout marketplace
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Staňte se součástí SvatBot Marketplace
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Oslovte stovky párů, které plánují svatbu. Prezentujte své služby a získejte nové zákazníky.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors shadow-lg inline-flex items-center"
            >
              Zaregistrovat se nyní
            </button>
            <Link
              href="/marketplace"
              className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors inline-flex items-center"
            >
              <Store className="w-5 h-5 mr-2" />
              Prohlédnout marketplace
            </Link>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Stovky zákazníků
            </h3>
            <p className="text-gray-600 text-sm">
              Oslovte páry, které aktivně hledají svatební služby ve vašem regionu.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <Store className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Profesionální profil
            </h3>
            <p className="text-gray-600 text-sm">
              Vytvořte si atraktivní profil s portfoliem, cenami a recenzemi.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Růst podnikání
            </h3>
            <p className="text-gray-600 text-sm">
              Získejte více poptávek a rozšiřte své podnikání v svatebním průmyslu.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ověřený dodavatel
            </h3>
            <p className="text-gray-600 text-sm">
              Získejte ověřený status a zvyšte důvěryhodnost u zákazníků.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Jak to funguje?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Vyplňte formulář
              </h3>
              <p className="text-gray-600">
                Zadejte informace o vaší firmě, službách a cenách. Trvá to jen 5-10 minut.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Kontrola a schválení
              </h3>
              <p className="text-gray-600">
                Náš tým zkontroluje vaše údaje a schválí profil do 24-48 hodin.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Získávejte zákazníky
              </h3>
              <p className="text-gray-600">
                Váš profil bude viditelný pro stovky párů a začnete dostávat poptávky.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Připraveni začít?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Registrace je zdarma. Vytvořte si profil a začněte získávat nové zákazníky ještě dnes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => setShowForm(true)}
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors shadow-lg"
            >
              Zaregistrovat se nyní
            </button>
            <Link
              href="/marketplace"
              className="bg-primary-800 text-white border-2 border-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-900 transition-colors inline-flex items-center"
            >
              <Store className="w-5 h-5 mr-2" />
              Prohlédnout marketplace
            </Link>
          </div>
          <p className="text-sm text-primary-100 mt-4">
            Registrace trvá 5-10 minut
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Často kladené otázky
          </h2>
          
          <div className="space-y-4">
            <details className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Je registrace zdarma?
              </summary>
              <p className="mt-3 text-gray-600">
                Ano, základní registrace a profil jsou zcela zdarma. V budoucnu plánujeme prémiové funkce pro větší viditelnost.
              </p>
            </details>

            <details className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Jak dlouho trvá schválení?
              </summary>
              <p className="mt-3 text-gray-600">
                Váš profil zkontrolujeme a schválíme do 24-48 hodin. O schválení vás budeme informovat emailem.
              </p>
            </details>

            <details className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Mohu upravit svůj profil později?
              </summary>
              <p className="mt-3 text-gray-600">
                Ano, po schválení budete moci kdykoliv upravovat své informace, ceny, fotografie a další údaje.
              </p>
            </details>

            <details className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Jaké kategorie dodavatelů přijímáte?
              </summary>
              <p className="mt-3 text-gray-600">
                Přijímáme všechny svatební služby: fotografy, kameramany, catering, místa konání, hudbu, květiny, dekorace, dopravu, beauty služby, šaty, obleky, dorty a další.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}

