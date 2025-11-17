import type { GiftContent } from '@/types/wedding-website'
import { useColorTheme } from '../ColorThemeContext'

interface GiftSectionProps {
  content: GiftContent
}

export default function GiftSection({ content }: GiftSectionProps) {
  const { theme, themeName } = useColorTheme()

  if (!content.enabled) return null

  return (
    <section className="py-20" style={{ backgroundColor: themeName === 'default' ? '#ffffff' : theme.bgGradientFrom }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
            Svatební dary
          </h2>
          <div className="w-24 h-1 mx-auto" style={{ backgroundColor: theme.primary }}></div>
        </div>

        <div className="text-center">
          <div className="text-6xl mb-4">🎁</div>
          <p className="text-gray-600">
            Informace o darech budou brzy k dispozici.
          </p>
        </div>
      </div>
    </section>
  )
}

