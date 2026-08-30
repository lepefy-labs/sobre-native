export const lightColors = {
  bg: '#f7f4ee',
  surface: '#fffdf9',
  surfaceMuted: '#f1ece4',
  borderSubtle: '#ebe4da',
  border: '#ddd4c7',
  textFaint: '#9b9185',
  textFootnote: '#c6bcae',
  textMuted: '#756d64',
  textSecondary: '#4b4540',
  text: '#28231f',
  onPrimary: '#fffdf9',
  primaryBg: '#28231f',
  accent: '#c87419',
  accentSoft: '#f3c276',
  danger: '#c94a4a',
  moodVeryLow: '#78879a',
  moodLow: '#719182',
  moodNeutral: '#9b9185',
  moodGood: '#849b61',
  moodGreat: '#c87419',
} as const

export const darkColors = {
  bg: '#191714',
  surface: '#211e1a',
  surfaceMuted: '#29251f',
  borderSubtle: '#302b24',
  border: '#40392f',
  textFaint: '#8e8579',
  textFootnote: '#5c554c',
  textMuted: '#b5aa9c',
  textSecondary: '#d8cfc2',
  text: '#f7f1e8',
  onPrimary: '#191714',
  primaryBg: '#f7f1e8',
  accent: '#e0a251',
  accentSoft: '#e9b86f',
  danger: '#ef7d75',
  moodVeryLow: '#93a3b8',
  moodLow: '#84a696',
  moodNeutral: '#b0a89a',
  moodGood: '#9bb377',
  moodGreat: '#e0a251',
} as const

export type ThemeColors = { [K in keyof typeof lightColors]: string }

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const

export const radius = { sm: 10, md: 16, lg: 24, xl: 32, full: 999 } as const

export const fontSize = { xs: 11, sm: 13, base: 15, lg: 17, xl: 20, xxl: 28, xxxl: 36 } as const

export const fontWeight = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
} as const

export const typography = {
  display: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.light,
    lineHeight: 42,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.medium,
    lineHeight: 34,
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

export const fonts = {
  serif: {
    light: 'Fraunces_300Light',
    regular: 'Fraunces_400Regular',
  },
} as const

export const gradient = {
  light: {
    morning: ['#fff7e6', '#f7f4ee'] as const,
    evening: ['#f0ebe5', '#f7f4ee'] as const,
    byContentType: {
      thought: ['#fffdf9', '#f5efe7'] as const,
      story: ['#fff9ed', '#f4eee6'] as const,
      tip: ['#fff8ea', '#fffdf9'] as const,
    },
  },
  dark: {
    morning: ['#29231d', '#191714'] as const,
    evening: ['#201d19', '#161411'] as const,
    byContentType: {
      thought: ['#24201b', '#1d1a17'] as const,
      story: ['#29241d', '#211e1a'] as const,
      tip: ['#2a241c', '#1f1c18'] as const,
    },
  },
} as const
