'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MarketplaceVendorForm, { MarketplaceVendorFormData } from '@/components/marketplace/MarketplaceVendorForm'
import { ArrowLeft, CheckCircle, Store, Users, TrendingUp, Shield } from 'lucide-react'
import { db } from '@/config/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default function MarketplaceRegisterPage() {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (data: MarketplaceVendorFormData) => {
    setSubmitting(true)
    try {
      // Remove undefined values from data (Firestore doesn't accept undefined)
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
      ) as MarketplaceVendorFormData

      // Prepare data for Firestore
      const vendorData = {
        ...cleanData,
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
        tags: [data.category, data.address.city.toLowerCase()],
        keywords: [data.category, data.name.toLowerCase(), data.address.city.toLowerCase()],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActive: serverTimestamp(),
        status: 'pending' // Waiting for admin approval
      }

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'marketplaceVendors'), vendorData)

      console.log('✅ Vendor registration submitted:', docRef.id)

      setSubmitted(true)
      setShowForm(false)

      // Redirect to marketplace after 5 seconds
      setTimeout(() => {
        router.push('/marketplace')
      }, 5000)
    } catch (error) {
      console.error('Error submitting vendor registration:', error)
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Děkujeme za registraci!</h2>
          <p className="text-gray-600 mb-4">
            Váš inzerát byl úspěšně odeslán. Náš tým ho zkontroluje a zveřejní do 24-48 hodin.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            O schválení vás budeme informovat emailem.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              Budete automaticky přesměrováni na marketplace za 5 sekund...
            </p>
          </div>
          <Link href="/marketplace" className="btn-primary inline-flex items-center">
            Zpět na marketplace
          </Link>
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
          <Link
            href="/marketplace"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Zpět na marketplace
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Staňte se součástí SvatBot Marketplace
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Oslovte stovky párů, které plánují svatbu. Prezentujte své služby a získejte nové zákazníky.
          </p>
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
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Store className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Profesionální profil
            </h3>
            <p className="text-gray-600 text-sm">
              Vytvořte si atraktivní profil s portfoliem, cenami a recenzemi.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Růst podnikání
            </h3>
            <p className="text-gray-600 text-sm">
              Získejte více poptávek a rozšiřte své podnikání v svatebním průmyslu.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
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
          <button
            onClick={() => setShowForm(true)}
            className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors shadow-lg"
          >
            Zaregistrovat se nyní
          </button>
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

