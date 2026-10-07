import { type Position } from '@step-wise/drawing'

import { type PositionedSvgSymbolProps, PositionedSvgSymbol } from '../../PositionedSvgSymbol.tsx'

import { SupportTriangleShape, type SupportTriangleShapeProps } from './shapes/index.ts'

export interface SupportTriangleProps extends Omit<SupportTriangleShapeProps, 'ref'> {
	position?: Position
	color?: string
	ref?: PositionedSvgSymbolProps['ref']
}

export function SupportTriangle(props: SupportTriangleProps) {
	const { className = 'supportTriangle', color = 'currentColor', position, ref, style, ...shapeProps } = props
	return <PositionedSvgSymbol className={className} color={color} position={position} ref={ref} style={style}>
		<SupportTriangleShape {...shapeProps} />
	</PositionedSvgSymbol>
}
