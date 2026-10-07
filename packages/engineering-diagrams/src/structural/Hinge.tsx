import type { SVGProps } from 'react'

import { type Position } from '@step-wise/drawing'
import { ensureNumber } from '@step-wise/js-utils'

import { PositionedSvgSymbol } from '../PositionedSvgSymbol.tsx'

export interface HingeProps extends Omit<SVGProps<SVGGElement>, 'color'> {
	position?: Position
	radius?: number
	thickness?: number
	color?: string
	circleProps?: SVGProps<SVGCircleElement>
}

export function Hinge(props: HingeProps) {
	const { circleProps, className = 'hinge', color = 'currentColor', position, radius = 6, ref, style, thickness = 2, ...groupProps } = props

	// Determine symbol properties.
	const resolvedRadius = ensureNumber(radius, { nonNegative: true })
	const resolvedThickness = ensureNumber(thickness, { nonNegative: true })

	// Render the symbol.
	return <PositionedSvgSymbol {...groupProps} className={className} color={color} position={position} ref={ref} style={style}>
		<circle {...circleProps} cx={0} cy={0} fill={circleProps?.fill ?? 'white'} r={resolvedRadius} stroke={circleProps?.stroke ?? 'currentColor'} strokeWidth={circleProps?.strokeWidth ?? resolvedThickness} />
	</PositionedSvgSymbol>
}
