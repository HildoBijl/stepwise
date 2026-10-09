import { type ReactNode, forwardRef } from 'react'

import type { Distance, Position } from '../../positioning/index.ts'
import { useResolvedDistance, useResolvedPosition } from '../../positioning/index.ts'

import { HtmlElement, type HtmlElementProps } from './HtmlElement.tsx'

export interface CornerLabelProps extends Omit<HtmlElementProps, 'position'> {
	children?: ReactNode
	positions: readonly [Position, Position, Position]
	size?: Distance
}

export const CornerLabel = forwardRef<HTMLDivElement, CornerLabelProps>(function CornerLabel(props, ref) {
	const { positions, size = { pixelDistance: 30 }, ...elementProps } = props

	// Resolve the three positions and the size, and abort if any are not known yet.
	if (!Array.isArray(positions) || positions.length !== 3) throw new Error('Invalid CornerLabel positions: expected exactly three positions.')
	const first = useResolvedPosition(positions[0])
	const corner = useResolvedPosition(positions[1])
	const third = useResolvedPosition(positions[2])
	const resolvedSize = useResolvedDistance(size)
	if (first === undefined || corner === undefined || third === undefined || resolvedSize === undefined) return null

	// Calculate the position of the label based on the three corner positions and the resolved size, then render the HtmlElement at that position.
	const vector1 = first.subtract(corner).normalize()
	const vector2 = third.subtract(corner).normalize()
	const adjustedDistance = resolvedSize / 2 * Math.sqrt(2 / Math.max(0.1, 1 - vector1.dotProduct(vector2)))
	const position = corner.add(vector1.interpolate(vector2).normalize().multiply(adjustedDistance))
	return <HtmlElement {...elementProps} position={{ pixelPosition: position }} ref={ref} />
})
