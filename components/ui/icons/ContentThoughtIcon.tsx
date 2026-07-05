import Svg, { Path, Circle } from 'react-native-svg'
import type { IconProps } from './types'

export function ContentThoughtIcon({ color, size = 18 }: IconProps) {
  const stroke = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 14c-2.8 0-5-2-5-4.5S4.2 5 7 5h6c2.8 0 5 2 5 4.5S15.8 14 13 14H9l-3 3v-3z" {...stroke} />
      <Circle cx={9.5} cy={9.5} r={0.6} fill={color} stroke="none" />
      <Circle cx={12.5} cy={9.5} r={0.6} fill={color} stroke="none" />
    </Svg>
  )
}
