import Svg, { Path } from 'react-native-svg'
import type { IconProps } from './types'

export function MoodReflectiveIcon({ color, size = 24 }: IconProps) {
  const stroke = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 13c2-5 4-5 6 0s4 5 6 0 4-5 6 0" {...stroke} />
    </Svg>
  )
}
