import type { SVGProps } from 'react'

import { PositionedSvgSymbol } from '../PositionedSvgSymbol.tsx'
import { type SupportTriangleShapeProps, GroundShape, HingeShape, SupportTriangleShape } from '../shapes/index.ts'
import type { SupportProps } from './types.ts'

export interface HingeSupportProps extends SupportProps {
	hingeProps?: SVGProps<SVGCircleElement>
	triangleProps?: SupportTriangleShapeProps
}

export function HingeSupport(props: HingeSupportProps) {
	const { angle = Math.PI / 2, groundProps, height = 20, hingeProps, ref, thickness = 2, triangleProps, width = 32, ...symbolProps } = props
	return <PositionedSvgSymbol {...symbolProps} angle={angle - Math.PI / 2} className={symbolProps.className ?? 'hingeSupport'} ref={ref}>
		<SupportTriangleShape {...triangleProps} height={height} thickness={thickness} width={width} />
		<g transform={`translate(0 ${height})`}>
			<GroundShape {...groundProps} thickness={thickness} />
		</g>
		<HingeShape {...hingeProps} radius={hingeProps?.r === undefined ? 6 : Number(hingeProps.r)} thickness={thickness} />
	</PositionedSvgSymbol>
}
