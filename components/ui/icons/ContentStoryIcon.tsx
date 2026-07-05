import Svg, { Path } from 'react-native-svg'
import type { IconProps } from './types'

export function ContentStoryIcon({ color, size = 18 }: IconProps) {
  const stroke = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 6.5c-1.4-1-3.4-1.5-5.5-1.5-1 0-2 .1-2.5.3v13c.5-.2 1.5-.3 2.5-.3 2.1 0 4.1.5 5.5 1.5" {...stroke} />
      <Path d="M12 6.5c1.4-1 3.4-1.5 5.5-1.5 1 0 2 .1 2.5.3v13c-.5-.2-1.5-.3-2.5-.3-2.1 0-4.1.5-5.5 1.5V6.5z" {...stroke} />
    </Svg>
  )
}
