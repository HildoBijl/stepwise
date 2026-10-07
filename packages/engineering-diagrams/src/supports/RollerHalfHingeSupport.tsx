import type { SVGProps } from 'react'

import { PositionedSvgSymbol } from '../PositionedSvgSymbol.tsx'
import { GroundShape, SupportTriangleShape, WheelsShape } from '../shapes/index.ts'
import type { RollerHingeSupportProps } from './RollerHingeSupport.tsx'

export interface RollerHalfHingeSupportProps extends Omit<RollerHingeSupportProps, 'hingeProps'> {
	hingeProps?: SVGProps<SVGPathElement>
}

export function RollerHalfHingeSupport(props: RollerHalfHingeSupportProps) {
	const { angle = Math.PI / 2, groundProps, height = 20, hingeProps, ref, thickness = 2, triangleProps, wheelRadius = 4, wheelsProps, width = 32, ...symbolProps } = props
	const shift = 3
	return <PositionedSvgSymbol {...symbolProps} angle={Math.PI / 2 - angle} className={symbolProps.className ?? 'rollerHalfHingeSupport'} ref={ref}>
		<g transform={`translate(0 ${shift})`}>
			<SupportTriangleShape {...triangleProps} height={height} thickness={thickness} width={width} />
		</g>
		<g transform={`translate(0 ${height + shift + wheelRadius + thickness / 2})`}>
			<WheelsShape {...wheelsProps} radius={wheelRadius} />
		</g>
		<g transform={`translate(0 ${height + shift + 2 * wheelRadius + thickness})`}>
			<GroundShape {...groundProps} thickness={thickness} />
		</g>
		<g transform={`translate(0 ${shift})`}>
			<path {...hingeProps} d="M-6 0 A6 6 0 0 0 6 0 L-6 0" fill={hingeProps?.fill ?? 'white'} stroke={hingeProps?.stroke ?? 'currentColor'} strokeWidth={hingeProps?.strokeWidth ?? thickness} />
		</g>
	</PositionedSvgSymbol>
}
