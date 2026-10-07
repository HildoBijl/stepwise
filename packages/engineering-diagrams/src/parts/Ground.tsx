import { type Position } from '@step-wise/drawing'

import { PositionedSvgSymbol } from '../PositionedSvgSymbol.tsx'
import { type GroundShapeProps, GroundShape } from '../shapes/index.ts'

export interface GroundProps extends GroundShapeProps {
	position?: Position
	color?: string
}

export function Ground(props: GroundProps) {
	const { className = 'ground', color = 'currentColor', position, ref, style, ...shapeProps } = props
	return <PositionedSvgSymbol className={className} color={color} position={position} ref={ref} style={style}>
		<GroundShape {...shapeProps} />
	</PositionedSvgSymbol>
}
