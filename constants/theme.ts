export const lightColors = {
  bg: '#fafaf9',
  surface: '#ffffff',
  surfaceMuted: '#f5f5f4',
  borderSubtle: '#f5f5f4',
  border: '#e7e5e4',
  textFaint: '#a8a29e',
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
