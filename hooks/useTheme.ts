import { useColorScheme } from 'react-native'
import { lightColors, darkColors, type ThemeColors } from '@/constants/theme'

export function useTheme(): ThemeColors {
  const scheme = useColorScheme()
  return scheme === 'dark' ? darkColors : lightColors
}
