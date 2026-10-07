import { PositionedSvgSymbol } from '../PositionedSvgSymbol.tsx'
import { type SupportBlockShapeProps, GroundShape, SupportBlockShape } from '../shapes/index.ts'
import type { SupportProps } from './types.ts'

export interface FixedSupportProps extends SupportProps {
	positionFactor?: number
	blockProps?: SupportBlockShapeProps
}

export function FixedSupport(props: FixedSupportProps) {
	const { angle = Math.PI / 2, blockProps, groundProps, height = 6, positionFactor = 1 / 6, ref, thickness = 2, width = 36, ...symbolProps } = props
	return <PositionedSvgSymbol {...symbolProps} angle={Math.PI / 2 - angle} className={symbolProps.className ?? 'fixedSupport'} ref={ref}>
		<g transform={`translate(0 ${height * positionFactor})`}>
			<SupportBlockShape {...blockProps} height={height} width={width} />
		</g>
		<g transform={`translate(0 ${height * (positionFactor + 1 / 2)})`}>
			<GroundShape {...groundProps} thickness={thickness} width={groundProps?.width ?? width + 14} />
		</g>
	</PositionedSvgSymbol>
}
