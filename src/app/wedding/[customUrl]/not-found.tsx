import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="text-8xl mb-4">💔</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Svatební web nenalezen
        </h1>
        <p className="text-gray-600 mb-8">
          Omlouváme se, ale tento svatební web neexistuje nebo ještě nebyl publikován.
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-3">
            Možné důvody:
          </h2>
          <ul className="text-left text-sm text-gray-600 space-y-2">
            <li>• Web ještě nebyl vytvořen</li>
            <li>• Web není publikovaný</li>
            <li>• URL adresa je nesprávná</li>
            <li>• Web byl smazán</li>
          </ul>
        </div>
        
        <Link
          href="/"
          className="inline-block bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
        >
          Zpět na hlavní stránku
        </Link>
      </div>
    </div>
  )
}

