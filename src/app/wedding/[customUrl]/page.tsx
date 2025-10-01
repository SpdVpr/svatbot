import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import WeddingWebsiteView from '@/components/wedding-website/WeddingWebsiteView'

interface PageProps {
  params: {
    customUrl: string
  }
}

// Generování metadata pro SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { customUrl } = params
  
  // TODO: Načíst data z Firestore
  // const website = await getWeddingWebsite(customUrl)
  
  return {
    title: `Svatba ${customUrl} | SvatBot`,
    description: `Svatební web pro ${customUrl}`,
    openGraph: {
      title: `Svatba ${customUrl}`,
      description: `Svatební web pro ${customUrl}`,
      type: 'website',
    },
  }
}

export default async function WeddingWebsitePage({ params }: PageProps) {
  const { customUrl } = params
  
  console.log('🌐 Loading wedding website:', customUrl)
  
  // TODO: Načíst data z Firestore
  // const website = await getWeddingWebsite(customUrl)
  
  // Pokud web neexistuje nebo není publikovaný, zobraz 404
  // if (!website || !website.isPublished) {
  //   notFound()
  // }
  
  // Pro development zobrazíme placeholder
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Svatební web
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            URL: <span className="font-mono text-pink-600">{customUrl}</span>
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="text-6xl mb-4">💒</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Vítejte na našem svatebním webu!
            </h2>
            <p className="text-gray-600 mb-6">
              Tento web je momentálně ve vývoji.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="bg-pink-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">✅ Funguje:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Subdoména routing</li>
                  <li>• Dynamic route</li>
                  <li>• Middleware</li>
                  <li>• URL validace</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">🚧 V přípravě:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Načítání z Firestore</li>
                  <li>• Šablony</li>
                  <li>• RSVP formulář</li>
                  <li>• Fotogalerie</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">🔧 Debug info:</h3>
            <div className="text-left text-sm font-mono text-gray-600 space-y-1">
              <div>Custom URL: {customUrl}</div>
              <div>Route: /wedding/[customUrl]</div>
              <div>Environment: {process.env.NODE_ENV}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

