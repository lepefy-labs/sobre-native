import Svg, { Path } from 'react-native-svg'
import type { IconProps } from './types'

export function ContentTipIcon({ color, size = 18 }: IconProps) {
  const stroke = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21h6" {...stroke} />
      <Path d="M10 18h4" {...stroke} />
      <Path
        d="M12 3a6 6 0 0 0-3.5 10.9c.6.45 1 1.15 1 1.95V16h5v-.15c0-.8.4-1.5 1-1.95A6 6 0 0 0 12 3z"
        {...stroke}
      />
    </Svg>
  )
}
