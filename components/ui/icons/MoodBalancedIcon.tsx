import Svg, { Path } from 'react-native-svg'
import type { IconProps } from './types'

export function MoodBalancedIcon({ color, size = 24 }: IconProps) {
  const stroke = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3v4" {...stroke} />
      <Path d="M4 7h16" {...stroke} />
      <Path d="M4 7l-2 6h6l-2-6z" {...stroke} />
      <Path d="M16 7l-2 6h6l-2-6z" {...stroke} />
      <Path d="M9 21h6" {...stroke} />
    </Svg>
  )
}
