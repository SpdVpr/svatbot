'use client'

interface FooterProps {
  bride: string
  groom: string
  weddingDate?: Date
}

export default function Footer({ bride, groom, weddingDate }: FooterProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6">
          {/* Initials */}
          <div className="text-5xl font-light text-[#b2c9d3]">
            {bride.charAt(0)}{groom.charAt(0)}
          </div>

          {/* Names */}
          <h3 className="text-3xl font-light">
            {bride} & {groom}
          </h3>

          {/* Date */}
          {weddingDate && (
            <p className="text-gray-400">
              {formatDate(weddingDate)}
            </p>
          )}

          {/* Divider */}
          <div className="flex items-center justify-center gap-2 py-4">
            <div className="w-12 h-[1px] bg-gray-700" />
            <div className="w-2 h-2 rounded-full bg-gray-700" />
            <div className="w-12 h-[1px] bg-gray-700" />
          </div>

          {/* Credit */}
          <p className="text-gray-500 text-sm">
            Vytvořeno s ❤️ pomocí SvatBot.cz
          </p>
        </div>
      </div>
    </footer>
  )
}

