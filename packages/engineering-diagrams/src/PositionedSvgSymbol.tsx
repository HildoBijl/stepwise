import type { ReactNode, SVGProps } from 'react'

import { SvgPortal, type Position, useDrawingCoordinateSystem, useResolvedPosition } from '@step-wise/drawing'
import { ensureNumber } from '@step-wise/js-utils'

export interface PositionedSvgSymbolProps extends Omit<SVGProps<SVGGElement>, 'color'> {
	position?: Position
	angle?: number
	color?: string
}

export function PositionedSvgSymbol(props: PositionedSvgSymbolProps & { children?: ReactNode }) {
	const { angle = 0, children, color = 'currentColor', position = [0, 0], ref, style, ...groupProps } = props
	const coordinateSystem = useDrawingCoordinateSystem()
	
	// Determine the position/rotation or abort on missing data.
	const resolvedPosition = useResolvedPosition(position)
	if (resolvedPosition === undefined) return null
	const rotation = ensureNumber(angle) * (coordinateSystem.yDirection === 'up' ? -1 : 1)

	// Render the Symbol.
	return <SvgPortal>
		<g {...groupProps} ref={ref} style={{ color, ...style }} transform={`translate(${resolvedPosition.x} ${resolvedPosition.y}) rotate(${rotation * 180 / Math.PI})`}>
			{children}
		</g>
	</SvgPortal>
}
