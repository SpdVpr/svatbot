import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{
    customUrl: string
  }>
}

// Fallback route pro development
// V production se používá subdoména, ale pro development můžeme použít /w/[customUrl]
export default async function WeddingWebsiteFallback({ params }: PageProps) {
  const { customUrl } = await params

  // Redirect na hlavní wedding route
  redirect(`/wedding/${customUrl}`)
}

