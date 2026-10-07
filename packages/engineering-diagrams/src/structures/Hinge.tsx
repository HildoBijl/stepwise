import type { SVGProps } from 'react'

import type { Position } from '@step-wise/drawing'

import { PositionedSvgSymbol } from '../PositionedSvgSymbol.tsx'
import { HingeShape } from '../shapes/HingeShape.tsx'

export interface HingeProps extends Omit<SVGProps<SVGGElement>, 'color'> {
	position?: Position
	radius?: number
	thickness?: number
	color?: string
	circleProps?: SVGProps<SVGCircleElement>
}

export function Hinge(props: HingeProps) {
	const { circleProps, className = 'hinge', color = 'currentColor', position, radius = 6, ref, style, thickness = 2, ...groupProps } = props

	// Render the symbol.
	return <PositionedSvgSymbol {...groupProps} className={className} color={color} position={position} ref={ref} style={style}>
		<HingeShape {...circleProps} radius={radius} thickness={thickness} />
	</PositionedSvgSymbol>
}
