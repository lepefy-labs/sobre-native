import Svg, { Path, Rect } from 'react-native-svg'
import type { IconProps } from './types'

export function TabArchiveIcon({ color, size = 22 }: IconProps) {
  const stroke = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={4} width={20} height={5} rx={1} {...stroke} />
      <Path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" {...stroke} />
      <Path d="M10 13h4" {...stroke} />
    </Svg>
  )
}
