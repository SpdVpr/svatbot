'use client'

interface SectionTitleProps {
  title: string
  subtitle?: string
}

export default function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="text-center mb-12">
      <div className="inline-block relative">
        {/* Flower icon above title */}
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-[80px] h-[60px]"
          style={{
            backgroundImage: 'url(/templates/pretty/images/sec-title-flower.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        />
        <h2 
          className="text-5xl md:text-6xl mb-4 text-gray-800"
          style={{ fontFamily: 'Great Vibes, cursive' }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

