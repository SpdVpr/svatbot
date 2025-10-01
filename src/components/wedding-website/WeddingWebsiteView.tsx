'use client'

import { WeddingWebsite } from '@/types/wedding-website'

interface WeddingWebsiteViewProps {
  website: WeddingWebsite
}

export default function WeddingWebsiteView({ website }: WeddingWebsiteViewProps) {
  // TODO: Implementovat rendering podle šablony
  
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          {website.content.hero.bride} & {website.content.hero.groom}
        </h1>
        
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <p className="text-center text-gray-600 mb-4">
            Šablona: {website.template}
          </p>
          <p className="text-center text-gray-600">
            Status: {website.isPublished ? 'Publikováno' : 'Koncept'}
          </p>
        </div>
      </div>
    </div>
  )
}

