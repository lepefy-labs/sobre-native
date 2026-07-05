export const lightColors = {
  bg: '#fafaf9',
  surface: '#ffffff',
  surfaceMuted: '#f5f5f4',
  borderSubtle: '#f5f5f4',
  border: '#e7e5e4',
  textFaint: '#a8a29e',
  textFootnote: '#d6d3d1',
  textMuted: '#78716c',
  textSecondary: '#44403c',
  text: '#292524',
  onPrimary: '#ffffff',
  primaryBg: '#292524',
  accent: '#d97706',
  accentSoft: '#fbbf24',
  danger: '#ef4444',
  moodVeryLow: '#7c8ba0',
  moodLow: '#6f9384',
  moodNeutral: '#a8a29e',
  moodGood: '#7f9a5c',
  moodGreat: '#d97706',
} as const

export const darkColors = {
  bg: '#1c1b19',
  surface: '#242220',
  surfaceMuted: '#2b2925',
  borderSubtle: '#2b2925',
  border: '#3a362f',
  textFaint: '#8a8377',
  textFootnote: '#57534e',
  textMuted: '#b0a89a',
  textSecondary: '#d8d2c5',
  text: '#f5f2ec',
  onPrimary: '#1c1b19',
  primaryBg: '#f5f2ec',
  accent: '#f2b155',
  accentSoft: '#f2b155',
  danger: '#f87171',
  moodVeryLow: '#93a3b8',
  moodLow: '#84a696',
  moodNeutral: '#b0a89a',
  moodGood: '#9bb377',
  moodGreat: '#f2b155',
} as const

export type ThemeColors = { [K in keyof typeof lightColors]: string }

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const

export const radius = { sm: 8, md: 16, lg: 24, full: 999 } as const

export const fontSize = { xs: 11, sm: 13, base: 15, lg: 17, xl: 20, xxl: 28, xxxl: 36 } as const

export const fontWeight = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
} as const

/** Explicit typography scale — prefer these over ad hoc fontSize/fontWeight combos. */
export const typography = {
  display: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.light,
    lineHeight: 40,
  },
  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: 24,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: 16,
  },
} as const

/** Humanist serif reserved for the greeting eyebrow and the user's name. */
export const fonts = {
  serif: {
    light: 'Fraunces_300Light',
    regular: 'Fraunces_400Regular',
  },
} as const

/**
 * Generative gradients (no image assets) derived from the stone/amber palette.
 * `morning`/`evening` drive the full-screen wash; `byContentType` gives each
 * content type a subtly different tone for its card.
 */
export const gradient = {
  light: {
    morning: ['#fef9ec', '#f5efe0'] as const,
    evening: ['#eeecea', '#ddd9d3'] as const,
    byContentType: {
      thought: ['#fdfcfb', '#f5f5f4'] as const,
      story: ['#fffbeb', '#f5f5f4'] as const,
      tip: ['#fffbeb', '#fefaf5'] as const,
    },
  },
  dark: {
    morning: ['#242220', '#1c1b19'] as const,
    evening: ['#1c1b19', '#171614'] as const,
    byContentType: {
      thought: ['#242220', '#1e1c1a'] as const,
      story: ['#2b2925', '#242220'] as const,
      tip: ['#2b2925', '#1e1c1a'] as const,
    },
  },
} as const
