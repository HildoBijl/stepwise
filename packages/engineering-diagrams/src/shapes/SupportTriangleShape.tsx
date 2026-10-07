import type { SVGProps } from 'react'

import { ensureNumber } from '@step-wise/js-utils'

export interface SupportTriangleShapeProps extends SVGProps<SVGPolygonElement> {
	thickness?: number
	width?: number
	height?: number
}

export function SupportTriangleShape({ height = 20, thickness = 2, width = 32, ...polygonProps }: SupportTriangleShapeProps) {
	// Determine support properties.
	const resolvedHeight = ensureNumber(height, { nonNegative: true })
	const resolvedThickness = ensureNumber(thickness, { nonNegative: true })
	const resolvedWidth = ensureNumber(width, { nonNegative: true })

	// Render the support.
	return <polygon {...polygonProps} fill={polygonProps.fill ?? 'white'} points={`0 0, ${-resolvedWidth / 2} ${resolvedHeight}, ${resolvedWidth / 2} ${resolvedHeight}`} stroke={polygonProps.stroke ?? 'currentColor'} strokeWidth={polygonProps.strokeWidth ?? resolvedThickness} />
}
