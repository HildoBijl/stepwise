import type { SVGProps } from 'react'

import { ensureNumber } from '@step-wise/js-utils'

export interface SupportBlockShapeProps extends SVGProps<SVGRectElement> {
	width?: number
	height?: number
}

export function SupportBlockShape({ height = 6, width = 36, ...rectangleProps }: SupportBlockShapeProps) {
	// Determine block properties.
	const resolvedHeight = ensureNumber(height, { nonNegative: true })
	const resolvedWidth = ensureNumber(width, { nonNegative: true })

	// Render the block.
	return <rect {...rectangleProps} fill={rectangleProps.fill ?? 'currentColor'} height={resolvedHeight} strokeWidth={rectangleProps.strokeWidth ?? 0} width={resolvedWidth} x={-resolvedWidth / 2} y={-resolvedHeight / 2} />
}
