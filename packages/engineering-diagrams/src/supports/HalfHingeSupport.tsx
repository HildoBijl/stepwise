import type { SVGProps } from 'react'

import { PositionedSvgSymbol } from '../PositionedSvgSymbol.tsx'
import { GroundShape, SupportTriangleShape } from '../shapes/index.ts'
import type { HingeSupportProps } from './HingeSupport.tsx'

export interface HalfHingeSupportProps extends Omit<HingeSupportProps, 'hingeProps'> {
	hingeProps?: SVGProps<SVGPathElement>
}

export function HalfHingeSupport(props: HalfHingeSupportProps) {
	const { angle = Math.PI / 2, groundProps, height = 20, hingeProps, ref, thickness = 2, triangleProps, width = 32, ...symbolProps } = props
	const shift = 3
	return <PositionedSvgSymbol {...symbolProps} angle={angle - Math.PI / 2} className={symbolProps.className ?? 'halfHingeSupport'} ref={ref}>
		<g transform={`translate(0 ${shift})`}>
			<SupportTriangleShape {...triangleProps} height={height} thickness={thickness} width={width} />
		</g>
		<g transform={`translate(0 ${height + shift})`}>
			<GroundShape {...groundProps} thickness={thickness} />
		</g>
		<g transform={`translate(0 ${shift})`}>
			<path {...hingeProps} d="M-6 0 A6 6 0 0 0 6 0 L-6 0" fill={hingeProps?.fill ?? 'white'} stroke={hingeProps?.stroke ?? 'currentColor'} strokeWidth={hingeProps?.strokeWidth ?? thickness} />
		</g>
	</PositionedSvgSymbol>
}
