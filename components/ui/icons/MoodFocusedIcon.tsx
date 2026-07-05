import Svg, { Circle, Path } from 'react-native-svg'
import type { IconProps } from './types'

export function MoodFocusedIcon({ color, size = 24 }: IconProps) {
  const stroke = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8} {...stroke} />
      <Circle cx={12} cy={12} r={3.5} {...stroke} />
      <Path d="M12 2v3M12 19v3M2 12h3M19 12h3" {...stroke} />
    </Svg>
  )
}
