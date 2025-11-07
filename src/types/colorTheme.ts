export type ColorTheme =
  | 'rose'
  | 'lavender'
  | 'sky'
  | 'mint'
  | 'peach'

export interface ColorPalette {
  id: ColorTheme
  name: string
  description: string
  colors: {
    // Primary shades
    primary: string        // 500
    primaryLight: string   // 50-100
    primaryDark: string    // 600-700
    primary200: string
    primary300: string
    primary400: string
    primary600: string
    primary700: string
    primary800: string
    primary900: string

    // Secondary shades
    secondary: string      // 500
    secondaryLight: string // 50-100
    secondary200: string
    secondary300: string
    secondary400: string
    secondary600: string
    secondary700: string
    secondary800: string
    secondary900: string

    // Accent shades
    accent: string         // 500
    accentLight: string    // 50-100
    accent200: string
    accent300: string
    accent400: string
    accent600: string
    accent700: string
    accent800: string
    accent900: string

    // Background gradients
    background: string
    backgroundAlt: string
  }
}

export const COLOR_PALETTES: Record<ColorTheme, ColorPalette> = {
  rose: {
    id: 'rose',
    name: 'Růžová romance',
    description: 'Jemná růžová s fialovými odstíny',
    colors: {
      // Primary - Pink
      primary: '#F8BBD9',
      primaryLight: '#fce7f3',
      primaryDark: '#f472b6',
      primary200: '#fbcfe8',
      primary300: '#f9a8d4',
      primary400: '#f472b6',
      primary600: '#db2777',
      primary700: '#be185d',
      primary800: '#9d174d',
      primary900: '#831843',

      // Secondary - Light Pink/Rose
      secondary: '#fce7f3',
      secondaryLight: '#fdf2f8',
      secondary200: '#fce7f3',
      secondary300: '#fbcfe8',
      secondary400: '#f9a8d4',
      secondary600: '#ec4899',
      secondary700: '#db2777',
      secondary800: '#be185d',
      secondary900: '#9d174d',

      // Accent - Deeper Pink/Rose
      accent: '#f9a8d4',
      accentLight: '#fce7f3',
      accent200: '#fbcfe8',
      accent300: '#f9a8d4',
      accent400: '#f472b6',
      accent600: '#ec4899',
      accent700: '#db2777',
      accent800: '#be185d',
      accent900: '#9d174d',

      background: 'from-purple-50 via-pink-50 to-blue-50',
      backgroundAlt: 'from-pink-50 to-purple-50'
    }
  },
  lavender: {
    id: 'lavender',
    name: 'Levandulový sen',
    description: 'Uklidňující fialové tóny',
    colors: {
      primary: '#D4C5F9',
      primaryLight: '#f3e8ff',
      primaryDark: '#c084fc',
      primary200: '#e9d5ff',
      primary300: '#d8b4fe',
      primary400: '#c084fc',
      primary600: '#9333ea',
      primary700: '#7c3aed',
      primary800: '#6b21a8',
      primary900: '#581c87',

      secondary: '#f3e8ff',
      secondaryLight: '#faf5ff',
      secondary200: '#f3e8ff',
      secondary300: '#e9d5ff',
      secondary400: '#d8b4fe',
      secondary600: '#a855f7',
      secondary700: '#9333ea',
      secondary800: '#7c3aed',
      secondary900: '#6b21a8',

      accent: '#e9d5ff',
      accentLight: '#f3e8ff',
      accent200: '#e9d5ff',
      accent300: '#d8b4fe',
      accent400: '#c084fc',
      accent600: '#a855f7',
      accent700: '#9333ea',
      accent800: '#7c3aed',
      accent900: '#6b21a8',

      background: 'from-purple-50 via-violet-50 to-indigo-50',
      backgroundAlt: 'from-violet-50 to-purple-50'
    }
  },
  sky: {
    id: 'sky',
    name: 'Nebeská modř',
    description: 'Svěží modré odstíny',
    colors: {
      primary: '#BAE6FD',
      primaryLight: '#e0f2fe',
      primaryDark: '#38bdf8',
      primary200: '#bae6fd',
      primary300: '#7dd3fc',
      primary400: '#38bdf8',
      primary600: '#0284c7',
      primary700: '#0369a1',
      primary800: '#075985',
      primary900: '#0c4a6e',

      secondary: '#e0f2fe',
      secondaryLight: '#f0f9ff',
      secondary200: '#e0f2fe',
      secondary300: '#bae6fd',
      secondary400: '#7dd3fc',
      secondary600: '#0ea5e9',
      secondary700: '#0284c7',
      secondary800: '#0369a1',
      secondary900: '#075985',

      accent: '#bae6fd',
      accentLight: '#e0f2fe',
      accent200: '#bae6fd',
      accent300: '#7dd3fc',
      accent400: '#38bdf8',
      accent600: '#0ea5e9',
      accent700: '#0284c7',
      accent800: '#0369a1',
      accent900: '#075985',

      background: 'from-blue-50 via-cyan-50 to-sky-50',
      backgroundAlt: 'from-sky-50 to-blue-50'
    }
  },
  mint: {
    id: 'mint',
    name: 'Mátová svěžest',
    description: 'Osvěžující zelené tóny',
    colors: {
      primary: '#BBF7D0',
      primaryLight: '#dcfce7',
      primaryDark: '#4ade80',
      primary200: '#bbf7d0',
      primary300: '#86efac',
      primary400: '#4ade80',
      primary600: '#16a34a',
      primary700: '#15803d',
      primary800: '#166534',
      primary900: '#14532d',

      secondary: '#dcfce7',
      secondaryLight: '#f0fdf4',
      secondary200: '#dcfce7',
      secondary300: '#bbf7d0',
      secondary400: '#86efac',
      secondary600: '#22c55e',
      secondary700: '#16a34a',
      secondary800: '#15803d',
      secondary900: '#166534',

      accent: '#bbf7d0',
      accentLight: '#dcfce7',
      accent200: '#bbf7d0',
      accent300: '#86efac',
      accent400: '#4ade80',
      accent600: '#22c55e',
      accent700: '#16a34a',
      accent800: '#15803d',
      accent900: '#166534',

      background: 'from-green-50 via-emerald-50 to-teal-50',
      backgroundAlt: 'from-emerald-50 to-green-50'
    }
  },
  peach: {
    id: 'peach',
    name: 'Broskvový západ',
    description: 'Teplé broskvové odstíny',
    colors: {
      primary: '#FECACA',
      primaryLight: '#fee2e2',
      primaryDark: '#fb923c',
      primary200: '#fecaca',
      primary300: '#fca5a5',
      primary400: '#f87171',
      primary600: '#dc2626',
      primary700: '#b91c1c',
      primary800: '#991b1b',
      primary900: '#7f1d1d',

      secondary: '#fee2e2',
      secondaryLight: '#fef2f2',
      secondary200: '#fee2e2',
      secondary300: '#fecaca',
      secondary400: '#fca5a5',
      secondary600: '#ef4444',
      secondary700: '#dc2626',
      secondary800: '#b91c1c',
      secondary900: '#991b1b',

      accent: '#fecaca',
      accentLight: '#fee2e2',
      accent200: '#fecaca',
      accent300: '#fca5a5',
      accent400: '#f87171',
      accent600: '#ef4444',
      accent700: '#dc2626',
      accent800: '#b91c1c',
      accent900: '#991b1b',

      background: 'from-orange-50 via-amber-50 to-yellow-50',
      backgroundAlt: 'from-amber-50 to-orange-50'
    }
  }
}

