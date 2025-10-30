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

      // Secondary - Purple
      secondary: '#E1D5E7',
      secondaryLight: '#f3e8ff',
      secondary200: '#e9d5ff',
      secondary300: '#d8b4fe',
      secondary400: '#c084fc',
      secondary600: '#9333ea',
      secondary700: '#7c3aed',
      secondary800: '#6b21a8',
      secondary900: '#581c87',

      // Accent - Yellow
      accent: '#F7DC6F',
      accentLight: '#fef3c7',
      accent200: '#fde68a',
      accent300: '#fcd34d',
      accent400: '#fbbf24',
      accent600: '#d97706',
      accent700: '#b45309',
      accent800: '#92400e',
      accent900: '#78350f',

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

      secondary: '#E9D5FF',
      secondaryLight: '#faf5ff',
      secondary200: '#f3e8ff',
      secondary300: '#e9d5ff',
      secondary400: '#d8b4fe',
      secondary600: '#9333ea',
      secondary700: '#7c3aed',
      secondary800: '#6b21a8',
      secondary900: '#581c87',

      accent: '#FCD6FF',
      accentLight: '#fce7f3',
      accent200: '#fbcfe8',
      accent300: '#f9a8d4',
      accent400: '#f472b6',
      accent600: '#db2777',
      accent700: '#be185d',
      accent800: '#9d174d',
      accent900: '#831843',

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

      secondary: '#DBEAFE',
      secondaryLight: '#eff6ff',
      secondary200: '#dbeafe',
      secondary300: '#bfdbfe',
      secondary400: '#93c5fd',
      secondary600: '#2563eb',
      secondary700: '#1d4ed8',
      secondary800: '#1e40af',
      secondary900: '#1e3a8a',

      accent: '#FDE68A',
      accentLight: '#fef3c7',
      accent200: '#fde68a',
      accent300: '#fcd34d',
      accent400: '#fbbf24',
      accent600: '#d97706',
      accent700: '#b45309',
      accent800: '#92400e',
      accent900: '#78350f',

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

      secondary: '#D1FAE5',
      secondaryLight: '#ecfdf5',
      secondary200: '#d1fae5',
      secondary300: '#a7f3d0',
      secondary400: '#6ee7b7',
      secondary600: '#059669',
      secondary700: '#047857',
      secondary800: '#065f46',
      secondary900: '#064e3b',

      accent: '#FDE047',
      accentLight: '#fef9c3',
      accent200: '#fef08a',
      accent300: '#fde047',
      accent400: '#facc15',
      accent600: '#ca8a04',
      accent700: '#a16207',
      accent800: '#854d0e',
      accent900: '#713f12',

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

      secondary: '#FED7AA',
      secondaryLight: '#ffedd5',
      secondary200: '#fed7aa',
      secondary300: '#fdba74',
      secondary400: '#fb923c',
      secondary600: '#ea580c',
      secondary700: '#c2410c',
      secondary800: '#9a3412',
      secondary900: '#7c2d12',

      accent: '#FDE68A',
      accentLight: '#fef3c7',
      accent200: '#fde68a',
      accent300: '#fcd34d',
      accent400: '#fbbf24',
      accent600: '#d97706',
      accent700: '#b45309',
      accent800: '#92400e',
      accent900: '#78350f',

      background: 'from-orange-50 via-amber-50 to-yellow-50',
      backgroundAlt: 'from-amber-50 to-orange-50'
    }
  }
}

