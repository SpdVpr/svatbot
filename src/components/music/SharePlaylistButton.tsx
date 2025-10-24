'use client'

import { useState } from 'react'
import { Share2, Copy, Check, ExternalLink, Loader2, X } from 'lucide-react'
import { useMusic } from '@/hooks/useMusic'

interface SharePlaylistButtonProps {
  totalSongs: number
}

export default function SharePlaylistButton({ totalSongs }: SharePlaylistButtonProps) {
  const { createShareLink } = useMusic()
  const [showModal, setShowModal] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expiresInDays, setExpiresInDays] = useState(30)

  const handleCreateLink = async () => {
    try {
      setLoading(true)
      const url = await createShareLink(expiresInDays)
      setShareUrl(url)
    } catch (err) {
      console.error('Error creating share link:', err)
      alert('Chyba při vytváření odkazu')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleOpenLink = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank')
    }
  }

  const handleClose = () => {
    setShowModal(false)
    setShareUrl(null)
    setCopied(false)
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={totalSongs === 0}
        className={`w-full flex items-center justify-center space-x-2 ${
          totalSongs === 0
            ? 'btn-outline opacity-50 cursor-not-allowed'
            : 'btn-outline'
        }`}
        title={totalSongs === 0 ? 'Přidejte nejprve nějaké písně' : 'Sdílet playlist s DJ'}
      >
        <Share2 className="w-4 h-4" />
        <span>Sdílet playlist</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Sdílet playlist</h2>
                  <p className="text-sm text-gray-600">{totalSongs} písní</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {!shareUrl ? (
              <>
                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    Vytvořte veřejný odkaz na váš playlist, který můžete sdílet s DJ nebo hudebníky.
                    Odkaz bude obsahovat všechny vaše písně včetně odkazů na Spotify.
                  </p>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-purple-900 mb-2">Co bude sdíleno:</h3>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li>✓ Všechny kategorie s písněmi</li>
                      <li>✓ Názvy písní a interpreti</li>
                      <li>✓ Odkazy na Spotify</li>
                      <li>✓ Kontakty na dodavatele hudby</li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platnost odkazu
                    </label>
                    <select
                      value={expiresInDays}
                      onChange={(e) => setExpiresInDays(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value={7}>7 dní</option>
                      <option value={14}>14 dní</option>
                      <option value={30}>30 dní</option>
                      <option value={60}>60 dní</option>
                      <option value={90}>90 dní</option>
                      <option value={365}>1 rok</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 btn-outline"
                  >
                    Zrušit
                  </button>
                  <button
                    onClick={handleCreateLink}
                    disabled={loading}
                    className="flex-1 btn-primary flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Vytvářím...</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        <span>Vytvořit odkaz</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 text-green-800 mb-2">
                      <Check className="w-5 h-5" />
                      <span className="font-semibold">Odkaz vytvořen!</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Platnost odkazu vyprší za {expiresInDays} dní
                    </p>
                  </div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sdílený odkaz
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono text-gray-700"
                    />
                    <button
                      onClick={handleCopy}
                      className={`p-2 rounded-lg transition-colors ${
                        copied
                          ? 'bg-green-500 text-white'
                          : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                      }`}
                      title="Kopírovat odkaz"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={handleOpenLink}
                      className="p-2 bg-purple-100 text-purple-600 hover:bg-purple-200 rounded-lg transition-colors"
                      title="Otevřít odkaz"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">💡 Tip:</h3>
                    <p className="text-sm text-blue-800">
                      Pošlete tento odkaz vašemu DJ nebo hudebníkům. Budou moci vidět celý playlist
                      včetně odkazů na Spotify a stáhnout si ho jako PDF.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full btn-primary"
                >
                  Hotovo
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

