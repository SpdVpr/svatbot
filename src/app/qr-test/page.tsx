'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function QRTestContent() {
  const searchParams = useSearchParams()
  const [params, setParams] = useState<Record<string, string>>({})

  useEffect(() => {
    const paramsObj: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      paramsObj[key] = value
    })
    setParams(paramsObj)
    console.log('🔍 QR Test Page - URL Parameters:', paramsObj)
  }, [searchParams])

  const hasQRParams = params.utm_source === 'qr_code'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            QR Kód Test Stránka
          </h1>

          {/* Status */}
          <div className={`p-4 rounded-lg mb-6 ${hasQRParams ? 'bg-green-100 border-2 border-green-500' : 'bg-yellow-100 border-2 border-yellow-500'}`}>
            <div className="flex items-center gap-3">
              <div className="text-3xl">
                {hasQRParams ? '✅' : '⚠️'}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {hasQRParams ? 'QR Parametry Detekovány!' : 'QR Parametry Nenalezeny'}
                </h2>
                <p className="text-sm text-gray-600">
                  {hasQRParams 
                    ? 'Tracking by měl být aktivní. Zkontrolujte konzoli prohlížeče (F12).' 
                    : 'Použijte správný QR tracking link níže.'}
                </p>
              </div>
            </div>
          </div>

          {/* URL Parameters */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Aktuální URL Parametry:
            </h3>
            {Object.keys(params).length === 0 ? (
              <p className="text-gray-500 italic">Žádné parametry</p>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {Object.entries(params).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                      {key}
                    </span>
                    <span className="text-gray-600">=</span>
                    <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Test Links */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Test Linky:
            </h3>
            <div className="space-y-3">
              <Link
                href="/qr-test?utm_source=qr_code&utm_medium=offline&utm_campaign=print_materials"
                className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border-2 border-blue-300 transition-colors"
              >
                <div className="font-semibold text-blue-900">
                  ✅ Správný QR Link (s parametry)
                </div>
                <div className="text-sm text-blue-700 font-mono mt-1">
                  /qr-test?utm_source=qr_code&utm_medium=offline&utm_campaign=print_materials
                </div>
              </Link>

              <Link
                href="/qr-test"
                className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border-2 border-gray-300 transition-colors"
              >
                <div className="font-semibold text-gray-900">
                  ❌ Bez parametrů
                </div>
                <div className="text-sm text-gray-700 font-mono mt-1">
                  /qr-test
                </div>
              </Link>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">
              📋 Jak testovat:
            </h3>
            <ol className="space-y-2 text-purple-800">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>Klikněte na "Správný QR Link" výše</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>Otevřete konzoli prohlížeče (F12)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>Hledejte zprávy začínající "🔍 QR Tracking" nebo "✅ QR code visit tracked"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">4.</span>
                <span>Jděte do Admin Dashboard → Marketing a zkontrolujte statistiky</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">5.</span>
                <span>Pro nový test smažte localStorage: <code className="bg-purple-200 px-1 rounded">localStorage.clear()</code></span>
              </li>
            </ol>
          </div>

          {/* Admin Link */}
          <div className="mt-6 text-center">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <span>📊</span>
              <span>Zobrazit Admin Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function QRTestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítání...</p>
        </div>
      </div>
    }>
      <QRTestContent />
    </Suspense>
  )
}

