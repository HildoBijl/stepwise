import type { SVGProps } from 'react'

import { ensureNumber } from '@step-wise/js-utils'

export interface GroundShapeProps extends SVGProps<SVGGElement> {
	thickness?: number
	rectangleOpacity?: number
	width?: number
	height?: number
}

export function GroundShape({ height = 12, rectangleOpacity = 0.4, thickness = 2, width = 50, ...groupProps }: GroundShapeProps) {
	// Determine ground properties.
	const resolvedHeight = ensureNumber(height, { nonNegative: true })
	const resolvedOpacity = ensureNumber(rectangleOpacity, { nonNegative: true })
	const resolvedThickness = ensureNumber(thickness, { nonNegative: true })
	const resolvedWidth = ensureNumber(width, { nonNegative: true })

	// Render the ground.
	return <g {...groupProps}>
		<rect className="groundRectangle" fill="currentColor" height={resolvedHeight} opacity={resolvedOpacity} width={resolvedWidth} x={-resolvedWidth / 2} y={0} />
		<line className="groundLine" stroke="currentColor" strokeWidth={resolvedThickness} x1={-resolvedWidth / 2} x2={resolvedWidth / 2} y1={0} y2={0} />
	</g>
}
