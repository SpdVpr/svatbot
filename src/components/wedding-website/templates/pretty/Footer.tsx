'use client'

interface FooterProps {
  bride: string
  groom: string
  weddingDate?: Date
}

export default function Footer({ bride, groom, weddingDate }: FooterProps) {
  return (
    <footer className="py-16 bg-gradient-to-b from-pink-100 to-pink-200 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center">
          {/* Couple Names with Frame */}
          <div 
            className="relative inline-block mb-8"
            style={{
              backgroundImage: 'url(/templates/pretty/images/footer-couple-name-frame.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              padding: '60px 80px'
            }}
          >
            <h2 
              className="text-5xl md:text-6xl text-gray-800"
              style={{ fontFamily: 'Great Vibes, cursive' }}
            >
              {bride}
              <br />
              &
              <br />
              {groom}
            </h2>
          </div>

          <h3 
            className="text-2xl md:text-3xl mb-6 text-gray-700"
            style={{ fontFamily: 'Great Vibes, cursive' }}
          >
            Forever our love, Thank you
          </h3>

          <p className="text-gray-600 text-sm">
            Copyright {new Date().getFullYear()}, Made with love
          </p>
        </div>
      </div>

      {/* Decorative hearts */}
      <div className="absolute top-10 left-10 opacity-20">
        <i className="flaticon-favorite-heart-button text-6xl text-pink-600"></i>
      </div>
      <div className="absolute bottom-10 right-10 opacity-20">
        <i className="flaticon-favorite-heart-button text-6xl text-pink-600"></i>
      </div>
    </footer>
  )
}

