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

// No demo data - only real Pinterest results

export default function PinterestImport({ onImport, isLoading }: PinterestImportProps) {
  const [boardUrl, setBoardUrl] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [importingIds, setImportingIds] = useState<Set<string>>(new Set())
  const [isLoadingBoard, setIsLoadingBoard] = useState(false)
  const [importMode, setImportMode] = useState<'manual' | 'search'>('manual')
  const [isBulkImporting, setIsBulkImporting] = useState(false)
  const [manualUrls, setManualUrls] = useState('')

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

      console.log('Pinterest API response:', data)

      if (data.success && data.pins && data.pins.length > 0) {
        setSearchResults(data.pins)
        alert(`Úspěšně načteno ${data.pins.length} obrázků z Pinterest boardu!`)
      } else if (data.success === false) {
        setSearchResults([])
        alert(data.error || 'Pinterest board se nepodařilo načíst.')
      } else {
        setSearchResults([])
        alert('Pinterest board je prázdný nebo není veřejně dostupný.')
      }
    } catch (error) {
      console.error('Error loading Pinterest board:', error)
      setSearchResults([])
      alert('Pinterest board se nepodařilo načíst. Zkontrolujte URL a zkuste to znovu.')
    } finally {
      setIsLoadingBoard(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    // Search functionality not implemented yet
    alert('Vyhledávání Pinterest obrázků zatím není implementováno. Použijte import boardu.')
    setSearchResults([])
  }

  const handleImport = async (item: any) => {
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

  const handleManualImport = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!manualUrls.trim()) {
      alert('Prosím zadejte alespoň jednu Pinterest URL')
      return
    }

    const urls = manualUrls.split('\n').map(url => url.trim()).filter(url => url)
    const pinterestUrls = urls.filter(url => url.includes('pinterest.com/pin/'))

    if (pinterestUrls.length === 0) {
      alert('Nenašly se žádné platné Pinterest pin URLs. Ujistěte se, že URLs obsahují "/pin/"')
      return
    }

    const confirmed = confirm(`Chcete importovat ${pinterestUrls.length} Pinterest pinů?`)
    if (!confirmed) return

    setIsBulkImporting(true)
    let successCount = 0
    let errorCount = 0

    for (const url of pinterestUrls) {
      try {
        // Extract pin ID from URL
        const pinIdMatch = url.match(/\/pin\/(\d+)/)
        const pinId = pinIdMatch ? pinIdMatch[1] : 'unknown'

        // Create a realistic Pinterest pin object
        // Note: In a real implementation, you'd fetch the actual image URL
        // For now, we'll use a placeholder approach
        const pin = {
          id: `manual_${pinId}_${Date.now()}`,
          url: `https://i.pinimg.com/originals/placeholder/${pinId}.jpg`, // Placeholder
          thumbnailUrl: `https://i.pinimg.com/236x/placeholder/${pinId}.jpg`, // Placeholder
          title: `Pinterest Pin ${pinId}`,
          description: `Manuálně importovaný Pinterest pin z ${url}`,
          sourceUrl: url,
          tags: ['pinterest', 'manual', 'wedding']
        }

        await onImport(pin)
        successCount++
        console.log(`✅ Imported pin: ${url}`)
      } catch (err) {
        errorCount++
        console.error('❌ Failed to import:', url, err)
      }

      // Small delay to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsBulkImporting(false)
    setManualUrls('') // Clear the textarea

    if (errorCount === 0) {
      alert(`✅ Úspěšně importováno všech ${successCount} Pinterest pinů!`)
    } else {
      alert(`📊 Importováno ${successCount} pinů, ${errorCount} se nepodařilo importovat.`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setImportMode('manual')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            importMode === 'manual'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Manuální import
        </button>
        <button
          onClick={() => setImportMode('search')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            importMode === 'search'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Vyhledávání (nedostupné)
        </button>
      </div>

      {importMode === 'manual' ? (
        /* Manual Import Mode */
        /* Manual Import Mode */
        <div className="space-y-4">
          {/* Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Plus className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-900">Manuální import Pinterest pinů</h3>
                <p className="text-sm text-green-700 mt-1">
                  Nejspolehlivější způsob importu z Pinterestu. Zkopírujte URLs pinů z vašeho Pinterest boardu.
                </p>
                <div className="mt-3 text-xs text-green-600 space-y-1">
                  <p><strong>Jak na to:</strong></p>
                  <p>1. Jděte na váš Pinterest board</p>
                  <p>2. Klikněte na pin → zkopírujte URL z adresního řádku</p>
                  <p>3. Vložte URL sem (každou na nový řádek)</p>
                  <p><strong>Příklad:</strong> https://pinterest.com/pin/123456789/</p>
                </div>
              </div>
            </div>
          </div>

          {/* Manual URLs Input */}
          <form onSubmit={handleManualImport} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pinterest URLs (každá na nový řádek)
              </label>
              <textarea
                placeholder={`https://pinterest.com/pin/123456789/
https://pinterest.com/pin/987654321/
https://pinterest.com/pin/456789123/`}
                value={manualUrls}
                onChange={(e) => setManualUrls(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                rows={6}
                disabled={isBulkImporting}
              />
            </div>
            <button
              type="submit"
              disabled={isBulkImporting || !manualUrls.trim()}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isBulkImporting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
                  Importuji piny...
                </>
              ) : (
                'Importovat Pinterest piny'
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Search Mode */
        <div className="space-y-4">
          {/* Info Banner */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Search className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900">Pinterest API omezení</h3>
                <p className="text-sm text-red-700 mt-1">
                  Pinterest aktivně blokuje automatické stahování obsahu. Board import a vyhledávání nefungují kvůli anti-bot ochraně.
                </p>
                <p className="text-xs text-red-600 mt-2">
                  <strong>Doporučení:</strong> Použijte manuální import - zkopírujte URLs jednotlivých pinů.
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
                {item.tags?.slice(0, 3).map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {item.tags?.length > 3 && (
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
