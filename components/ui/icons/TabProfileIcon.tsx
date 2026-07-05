import Svg, { Path, Circle } from 'react-native-svg'
import type { TabIconProps } from './types'

export function TabProfileIcon({ color, size = 22 }: TabIconProps) {
  const stroke = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} {...stroke} />
      <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" {...stroke} />
    </Svg>
  )
}
