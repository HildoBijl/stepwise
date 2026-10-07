import { PositionedSvgSymbol } from '../PositionedSvgSymbol.tsx'
import { type WheelsShapeProps, GroundShape, SupportBlockShape, WheelsShape } from '../shapes/index.ts'
import type { FixedSupportProps } from './FixedSupport.tsx'

export interface RollerSupportProps extends FixedSupportProps {
	wheelRadius?: number
	wheelsProps?: WheelsShapeProps
}

export function RollerSupport(props: RollerSupportProps) {
	const { angle = Math.PI / 2, blockProps, groundProps, height = 6, positionFactor = 1 / 6, ref, thickness = 2, wheelRadius = 4, wheelsProps, width = 36, ...symbolProps } = props
	const base = height * (positionFactor + 1 / 2)
	return <PositionedSvgSymbol {...symbolProps} angle={Math.PI / 2 - angle} className={symbolProps.className ?? 'rollerSupport'} ref={ref}>
		<g transform={`translate(0 ${height * positionFactor})`}>
			<SupportBlockShape {...blockProps} height={height} width={width} />
		</g>
		<g transform={`translate(0 ${base + wheelRadius})`}>
			<WheelsShape {...wheelsProps} radius={wheelRadius} />
		</g>
		<g transform={`translate(0 ${base + 2 * wheelRadius + thickness / 2})`}>
			<GroundShape {...groundProps} thickness={thickness} width={groundProps?.width ?? width + 14} />
		</g>
	</PositionedSvgSymbol>
}
