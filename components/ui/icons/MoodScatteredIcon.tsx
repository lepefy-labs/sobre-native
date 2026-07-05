import Svg, { Circle } from 'react-native-svg'
import type { IconProps } from './types'

export function MoodScatteredIcon({ color, size = 24 }: IconProps) {
  const stroke = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8} strokeDasharray="4 3.2" {...stroke} />
    </Svg>
  )
}
