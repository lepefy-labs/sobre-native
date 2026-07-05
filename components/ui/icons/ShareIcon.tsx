import Svg, { Circle, Line } from 'react-native-svg'
import type { IconProps } from './types'

export function ShareIcon({ color, size = 18 }: IconProps) {
  const stroke = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={18} cy={5} r={3} {...stroke} />
      <Circle cx={6} cy={12} r={3} {...stroke} />
      <Circle cx={18} cy={19} r={3} {...stroke} />
      <Line x1={8.59} y1={13.51} x2={15.42} y2={17.49} {...stroke} />
      <Line x1={15.41} y1={6.51} x2={8.59} y2={10.49} {...stroke} />
    </Svg>
  )
}
