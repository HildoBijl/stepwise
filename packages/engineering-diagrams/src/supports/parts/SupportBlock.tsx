import { type Position } from '@step-wise/drawing'

import { type PositionedSvgSymbolProps, PositionedSvgSymbol } from '../../PositionedSvgSymbol.tsx'

import { SupportBlockShape, type SupportBlockShapeProps } from './shapes/index.ts'

export interface SupportBlockProps extends Omit<SupportBlockShapeProps, 'ref'> {
	position?: Position
	color?: string
	ref?: PositionedSvgSymbolProps['ref']
}

export function SupportBlock(props: SupportBlockProps) {
	const { className = 'supportBlock', color = 'currentColor', position, ref, style, ...shapeProps } = props
	return <PositionedSvgSymbol className={className} color={color} position={position} ref={ref} style={style}>
		<SupportBlockShape {...shapeProps} />
	</PositionedSvgSymbol>
}
