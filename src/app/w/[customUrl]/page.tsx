import { redirect } from 'next/navigation'

interface PageProps {
  params: {
    customUrl: string
  }
}

// Fallback route pro development
// V production se používá subdoména, ale pro development můžeme použít /w/[customUrl]
export default function WeddingWebsiteFallback({ params }: PageProps) {
  const { customUrl } = params
  
  // Redirect na hlavní wedding route
  redirect(`/wedding/${customUrl}`)
}

