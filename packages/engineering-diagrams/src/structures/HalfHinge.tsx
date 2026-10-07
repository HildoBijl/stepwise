import type { SVGProps } from 'react'

import type { Position } from '@step-wise/drawing'
import { Vector } from '@step-wise/geometry'
import { ensureNumber } from '@step-wise/js-utils'

import { PositionedSvgSymbol } from '../PositionedSvgSymbol.tsx'

export interface HalfHingeProps extends Omit<SVGProps<SVGGElement>, 'color'> {
	position?: Position
	angle?: number
	radius?: number
	thickness?: number
	color?: string
	pathProps?: SVGProps<SVGPathElement>
}

export function HalfHinge(props: HalfHingeProps) {
	const { angle = Math.PI / 2, className = 'halfHinge', color = 'currentColor', pathProps, position, radius = 6, ref, style, thickness = 2, ...groupProps } = props

	// Determine symbol properties.
	const resolvedRadius = ensureNumber(radius, { nonNegative: true })
	const resolvedThickness = ensureNumber(thickness, { nonNegative: true })
	const start = Vector.fromPolar(resolvedRadius, ensureNumber(angle) - Math.PI / 2)
	const end = Vector.fromPolar(resolvedRadius, ensureNumber(angle) + Math.PI / 2)
	const path = `M${start.x} ${start.y} A${resolvedRadius} ${resolvedRadius} 0 0 1 ${end.x} ${end.y}`

	// Render the symbol.
	return <PositionedSvgSymbol {...groupProps} className={className} color={color} position={position} ref={ref} style={style}>
		<path {...pathProps} d={path} fill={pathProps?.fill ?? 'white'} stroke={pathProps?.stroke ?? 'currentColor'} strokeWidth={pathProps?.strokeWidth ?? resolvedThickness} />
	</PositionedSvgSymbol>
}
