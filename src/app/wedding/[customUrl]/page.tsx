import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { WeddingWebsite } from '@/types/wedding-website'
import ClassicEleganceTemplate from '@/components/wedding-website/templates/ClassicEleganceTemplate'
import ModernMinimalistTemplate from '@/components/wedding-website/templates/ModernMinimalistTemplate'
import RomanticBohoTemplate from '@/components/wedding-website/templates/RomanticBohoTemplate'

// Disable static generation and caching for this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{
    customUrl: string
  }>
}

// Generování metadata pro SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { customUrl } = await params

  try {
    // TODO: Implement proper query by customUrl
    // For now, we'll use basic metadata
    return {
      title: `Svatba ${customUrl} | SvatBot`,
      description: `Svatební web pro ${customUrl}`,
      openGraph: {
        title: `Svatba ${customUrl}`,
        description: `Svatební web pro ${customUrl}`,
        type: 'website',
      },
    }
  } catch (error) {
    return {
      title: `Svatba | SvatBot`,
      description: `Svatební web`,
    }
  }
}

async function getWeddingWebsite(customUrl: string): Promise<WeddingWebsite | null> {
  try {
    // TODO: In production, you'd want to query by customUrl field
    // For now, we'll try to get by document ID (assuming customUrl = document ID)
    const websiteRef = doc(db, 'weddingWebsites', customUrl)
    const websiteSnap = await getDoc(websiteRef)

    if (websiteSnap.exists()) {
      const websiteData = websiteSnap.data() as WeddingWebsite

      // Check if website is published
      if (!websiteData.isPublished) {
        return null
      }

      return {
        ...websiteData,
        id: websiteSnap.id
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching website:', error)
    return null
  }
}

export default async function WeddingWebsitePage({ params }: PageProps) {
  const { customUrl } = await params

  console.log('🌐 Loading wedding website:', customUrl)

  // Načíst data z Firestore
  const website = await getWeddingWebsite(customUrl)

  console.log('📄 Website data:', website ? 'found' : 'not found')
  if (website) {
    console.log('📊 Website details:', {
      id: website.id,
      customUrl: website.customUrl,
      isPublished: website.isPublished,
      template: website.template
    })
    console.log('🎨 Template being used:', website.template)
    console.log('🎨 DressCode data:', {
      enabled: website.content?.dressCode?.enabled,
      imagesCount: website.content?.dressCode?.images?.length || 0,
      images: website.content?.dressCode?.images
    })
  }

  // Pokud web neexistuje nebo není publikovaný, zobraz 404
  if (!website) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-6">💔</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Svatební web nenalezen
          </h1>
          <p className="text-gray-600 mb-6">
            Tento svatební web neexistuje nebo není dostupný.
          </p>
          <a
            href="https://svatbot.cz"
            className="inline-flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-lg hover:bg-rose-600 transition-colors"
          >
            Navštívit SvatBot.cz
          </a>
        </div>
      </div>
    )
  }

  // Render appropriate template based on website.template
  const renderTemplate = () => {
    switch (website.template) {
      case 'classic-elegance':
        return <ClassicEleganceTemplate website={website} />
      case 'modern-minimalist':
        return <ModernMinimalistTemplate website={website} />
      case 'romantic-boho':
        return <RomanticBohoTemplate website={website} />
      case 'luxury-gold':
      case 'garden-fresh':
        // Fallback to classic for templates in development
        return <ClassicEleganceTemplate website={website} />
      default:
        return <ClassicEleganceTemplate website={website} />
    }
  }

  return renderTemplate()
}

