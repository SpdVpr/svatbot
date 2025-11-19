'use client'

interface SectionTitleProps {
  title: string
}

export default function SectionTitle({ title }: SectionTitleProps) {
  return (
    <div className="text-center mb-16">
      <div className="inline-block relative pt-20">
        {/* Flower icon above title */}
        <div
          className="absolute -top-0 left-1/2 -translate-x-1/2 w-[100px] h-[80px]"
          style={{
            backgroundImage: 'url(/templates/twain-love/section-title.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        />
        <h2 className="text-5xl md:text-6xl text-gray-800 mb-4" style={{ fontFamily: 'Great Vibes, cursive' }}>
          {title}
        </h2>
      </div>
    </div>
  )
}

