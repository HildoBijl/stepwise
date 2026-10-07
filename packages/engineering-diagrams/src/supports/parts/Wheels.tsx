import { type Position } from '@step-wise/drawing'

import { PositionedSvgSymbol } from '../../PositionedSvgSymbol.tsx'

import { WheelsShape, type WheelsShapeProps } from './shapes/index.ts'

export interface WheelsProps extends WheelsShapeProps {
	position?: Position
	color?: string
}

export function Wheels(props: WheelsProps) {
	const { className = 'wheels', color = 'currentColor', position, ref, style, ...shapeProps } = props
	return <PositionedSvgSymbol className={className} color={color} position={position} ref={ref} style={style}>
		<WheelsShape {...shapeProps} />
	</PositionedSvgSymbol>
}
