export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500 mb-4"></div>
        <p className="text-gray-600 text-lg">Načítání svatebního webu...</p>
      </div>
    </div>
  )
}

