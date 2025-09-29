'use client'

import { useState } from 'react'
import { Search, ExternalLink, Plus, Heart } from 'lucide-react'
import Image from 'next/image'

interface PinterestImportProps {
  onImport: (imageData: {
    url: string
    thumbnailUrl?: string
    title?: string
    description?: string
    sourceUrl?: string
    tags?: string[]
  }) => Promise<any>
  isLoading: boolean
}

// Mock Pinterest data for demonstration
const mockPinterestResults = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400',
    title: 'Elegant Wedding Bouquet',
    description: 'Beautiful white and pink roses with eucalyptus',
    sourceUrl: 'https://pinterest.com/pin/example1',
    tags: ['bouquet', 'roses', 'wedding', 'flowers']
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=400',
    title: 'Rustic Wedding Decoration',
    description: 'Wooden signs and mason jars for rustic wedding theme',
    sourceUrl: 'https://pinterest.com/pin/example2',
    tags: ['rustic', 'decoration', 'mason jars', 'wooden']
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400',
    title: 'Wedding Cake Design',
    description: 'Three-tier white wedding cake with floral decorations',
    sourceUrl: 'https://pinterest.com/pin/example3',
    tags: ['cake', 'wedding cake', 'floral', 'white']
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400',
    title: 'Bridal Dress Inspiration',
    description: 'Elegant A-line wedding dress with lace details',
    sourceUrl: 'https://pinterest.com/pin/example4',
    tags: ['dress', 'bridal', 'lace', 'a-line']
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400',
    title: 'Wedding Table Setting',
    description: 'Romantic table setting with candles and flowers',
    sourceUrl: 'https://pinterest.com/pin/example5',
    tags: ['table setting', 'candles', 'romantic', 'flowers']
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400',
    title: 'Wedding Venue Decoration',
    description: 'Outdoor wedding ceremony with floral arch',
    sourceUrl: 'https://pinterest.com/pin/example6',
    tags: ['venue', 'outdoor', 'ceremony', 'arch']
  }
]

export default function PinterestImport({ onImport, isLoading }: PinterestImportProps) {
  const [boardUrl, setBoardUrl] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(mockPinterestResults)
  const [importingIds, setImportingIds] = useState<Set<string>>(new Set())
  const [isLoadingBoard, setIsLoadingBoard] = useState(false)
  const [importMode, setImportMode] = useState<'board' | 'search'>('board')
  const [isBulkImporting, setIsBulkImporting] = useState(false)

  const extractBoardFromUrl = (url: string) => {
    // Extract Pinterest board info from URL
    // Examples:
    // https://pinterest.com/username/board-name/
    // https://www.pinterest.com/username/board-name/
    // https://cz.pinterest.com/username/board-name/
    const match = url.match(/pinterest\.com\/([^\/]+)\/([^\/]+)\/?/)
    if (match) {
      return {
        username: match[1],
        boardName: match[2]
      }
    }
    return null
  }

  const loadPinterestBoard = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!boardUrl.trim()) {
      alert('Prosím zadejte URL Pinterest boardu')
      return
    }

    const boardInfo = extractBoardFromUrl(boardUrl)
    if (!boardInfo) {
      alert('Neplatná URL Pinterest boardu. Použijte formát: https://pinterest.com/username/board-name/')
      return
    }

    setIsLoadingBoard(true)

    try {
      // Call our API endpoint to fetch Pinterest board
      const response = await fetch('/api/pinterest/board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: boardInfo.username,
          boardName: boardInfo.boardName,
          url: boardUrl
        })
      })

      if (!response.ok) {
        throw new Error('Nepodařilo se načíst Pinterest board')
      }

      const data = await response.json()

      if (data.pins && data.pins.length > 0) {
        setSearchResults(data.pins)
        alert(`Úspěšně načteno ${data.pins.length} obrázků z Pinterest boardu!`)
      } else {
        // Fallback to demo data if Pinterest fails
        setSearchResults(mockPinterestResults)
        alert('Pinterest board se nepodařilo načíst. Zobrazuji demo obrázky.')
      }
    } catch (error) {
      console.error('Error loading Pinterest board:', error)
      // Fallback to demo data
      setSearchResults(mockPinterestResults)
      alert('Pinterest board se nepodařilo načíst. Zobrazuji demo obrázky pro ukázku funkcionality.')
    } finally {
      setIsLoadingBoard(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    // In a real implementation, this would call Pinterest API
    // For now, we'll filter mock results
    if (searchQuery.trim()) {
      const filtered = mockPinterestResults.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setSearchResults(filtered)
    } else {
      setSearchResults(mockPinterestResults)
    }
  }

  const handleImport = async (item: typeof mockPinterestResults[0]) => {
    try {
      setImportingIds(prev => new Set(prev).add(item.id))

      await onImport({
        url: item.url,
        thumbnailUrl: item.thumbnailUrl,
        title: item.title,
        description: item.description,
        sourceUrl: item.sourceUrl,
        tags: item.tags
      })

      // Remove from results after successful import
      setSearchResults(prev => prev.filter(result => result.id !== item.id))
    } catch (err) {
      alert('Nepodařilo se importovat obrázek')
    } finally {
      setImportingIds(prev => {
        const updated = new Set(prev)
        updated.delete(item.id)
        return updated
      })
    }
  }

  const handleBulkImport = async () => {
    if (searchResults.length === 0) return

    const confirmed = confirm(`Chcete importovat všech ${searchResults.length} obrázků najednou?`)
    if (!confirmed) return

    setIsBulkImporting(true)
    let successCount = 0
    let errorCount = 0

    for (const item of searchResults) {
      try {
        await onImport({
          url: item.url,
          thumbnailUrl: item.thumbnailUrl,
          title: item.title,
          description: item.description,
          sourceUrl: item.sourceUrl,
          tags: item.tags
        })
        successCount++
      } catch (err) {
        errorCount++
        console.error('Failed to import:', item.title, err)
      }

      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsBulkImporting(false)
    setSearchResults([]) // Clear results after bulk import

    if (errorCount === 0) {
      alert(`Úspěšně importováno všech ${successCount} obrázků!`)
    } else {
      alert(`Importováno ${successCount} obrázků, ${errorCount} se nepodařilo importovat.`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setImportMode('board')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            importMode === 'board'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Import celého boardu
        </button>
        <button
          onClick={() => setImportMode('search')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            importMode === 'search'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Vyhledávání
        </button>
      </div>

      {importMode === 'board' ? (
        /* Board Import */
        <div className="space-y-4">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Import Pinterest Boardu</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Vložte URL vašeho Pinterest boardu a importujte všechny obrázky najednou.
                  Board musí být veřejný.
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Příklad: https://pinterest.com/username/wedding-inspiration/
                </p>
              </div>
            </div>
          </div>

          {/* Board URL Input */}
          <form onSubmit={loadPinterestBoard} className="flex space-x-4">
            <div className="flex-1">
              <input
                type="url"
                placeholder="https://pinterest.com/username/board-name/"
                value={boardUrl}
                onChange={(e) => setBoardUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                disabled={isLoadingBoard}
              />
            </div>
            <button
              type="submit"
              disabled={isLoadingBoard || !boardUrl.trim()}
              className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoadingBoard ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Načíst board'
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Search Mode */
        <div className="space-y-4">
          {/* Info Banner */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Search className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-900">Vyhledávání (Demo)</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Tato funkce je momentálně v demo režimu s ukázkovými obrázky.
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Hledat svatební inspirace na Pinterestu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* Bulk Import Button */}
      {searchResults.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Nalezeno {searchResults.length} obrázků
          </p>
          <button
            onClick={handleBulkImport}
            disabled={isBulkImporting || isLoading}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isBulkImporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
                Importuji všechny...
              </>
            ) : (
              `Importovat všech ${searchResults.length}`
            )}
          </button>
        </div>
      )}

      {/* Results */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {searchResults.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Image */}
            <div className="aspect-square relative">
              <Image
                src={item.thumbnailUrl}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
              
              {/* Import Button */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleImport(item)}
                  disabled={importingIds.has(item.id) || isLoading}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {importingIds.has(item.id) ? (
                    <div className="w-4 h-4 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>

              {/* Pinterest indicator */}
              <div className="absolute bottom-2 left-2">
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                  Pinterest
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-3">
              <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                {item.title}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                {item.description}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {item.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {item.tags.length > 3 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{item.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleImport(item)}
                  disabled={importingIds.has(item.id) || isLoading}
                  className="flex-1 px-3 py-2 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {importingIds.has(item.id) ? 'Importuji...' : 'Přidat'}
                </button>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-gray-600" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {searchResults.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Žádné výsledky
          </h3>
          <p className="text-gray-600">
            Zkuste jiné klíčové slovo nebo frázi
          </p>
        </div>
      )}
    </div>
  )
}
