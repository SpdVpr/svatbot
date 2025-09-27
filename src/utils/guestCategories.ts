// Guest category utilities for consistent display across the app

export const GUEST_CATEGORY_LABELS = {
  'family-bride': 'Rodina nevěsty',
  'family-groom': 'Rodina ženicha',
  'friends-bride': 'Přátelé nevěsty',
  'friends-groom': 'Přátelé ženicha',
  'colleagues-bride': 'Kolegové nevěsty',
  'colleagues-groom': 'Kolegové ženicha',
  'other': 'Ostatní'
} as const

export const GUEST_CATEGORY_COLORS = {
  'family-bride': 'bg-pink-100 text-pink-700',
  'family-groom': 'bg-blue-100 text-blue-700',
  'friends-bride': 'bg-purple-100 text-purple-700',
  'friends-groom': 'bg-indigo-100 text-indigo-700',
  'colleagues-bride': 'bg-green-100 text-green-700',
  'colleagues-groom': 'bg-teal-100 text-teal-700',
  'other': 'bg-gray-100 text-gray-700'
} as const

export const GUEST_CATEGORY_ICONS = {
  'family-bride': '👰',
  'family-groom': '🤵',
  'friends-bride': '👭',
  'friends-groom': '👬',
  'colleagues-bride': '💼',
  'colleagues-groom': '💼',
  'other': '👥'
} as const

/**
 * Get display label for guest category
 */
export function getGuestCategoryLabel(category: string): string {
  return GUEST_CATEGORY_LABELS[category as keyof typeof GUEST_CATEGORY_LABELS] || category
}

/**
 * Get color classes for guest category
 */
export function getGuestCategoryColor(category: string): string {
  return GUEST_CATEGORY_COLORS[category as keyof typeof GUEST_CATEGORY_COLORS] || GUEST_CATEGORY_COLORS.other
}

/**
 * Get icon for guest category
 */
export function getGuestCategoryIcon(category: string): string {
  return GUEST_CATEGORY_ICONS[category as keyof typeof GUEST_CATEGORY_ICONS] || GUEST_CATEGORY_ICONS.other
}

/**
 * Get complete category display info
 */
export function getGuestCategoryDisplay(category: string) {
  return {
    label: getGuestCategoryLabel(category),
    color: getGuestCategoryColor(category),
    icon: getGuestCategoryIcon(category)
  }
}
