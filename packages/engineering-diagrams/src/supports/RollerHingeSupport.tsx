import { PositionedSvgSymbol } from '../PositionedSvgSymbol.tsx'
import { type WheelsShapeProps, GroundShape, HingeShape, SupportTriangleShape, WheelsShape } from '../shapes/index.ts'
import type { HingeSupportProps } from './HingeSupport.tsx'

export interface RollerHingeSupportProps extends HingeSupportProps {
	wheelRadius?: number
	wheelsProps?: WheelsShapeProps
}

export function RollerHingeSupport(props: RollerHingeSupportProps) {
	const { angle = Math.PI / 2, groundProps, height = 20, hingeProps, ref, thickness = 2, triangleProps, wheelRadius = 4, wheelsProps, width = 32, ...symbolProps } = props
	return <PositionedSvgSymbol {...symbolProps} angle={angle - Math.PI / 2} className={symbolProps.className ?? 'rollerHingeSupport'} ref={ref}>
		<SupportTriangleShape {...triangleProps} height={height} thickness={thickness} width={width} />
		<g transform={`translate(0 ${height + wheelRadius + thickness / 2})`}>
			<WheelsShape {...wheelsProps} radius={wheelRadius} />
		</g>
		<g transform={`translate(0 ${height + 2 * wheelRadius + thickness})`}>
			<GroundShape {...groundProps} thickness={thickness} />
		</g>
		<HingeShape {...hingeProps} radius={hingeProps?.r === undefined ? 6 : Number(hingeProps.r)} thickness={thickness} />
	</PositionedSvgSymbol>
}
