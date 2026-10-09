import { forwardRef } from 'react'

import { type Distance, type Position, useResolvedDistance, useResolvedPositions } from '../../positioning/index.ts'

import { Line, type LineProps } from './Line.tsx'

export interface RightAngleProps extends Omit<LineProps, 'close' | 'positions'> {
	positions: readonly [Position, Position, Position]
	size: Distance
}

export const RightAngle = forwardRef<SVGPathElement, RightAngleProps>(function RightAngle(props, ref) {
	const { positions, size, ...lineProps } = props
	// Resolve positions/distances and abort if they are not valid.
	if (!Array.isArray(positions) || positions.length !== 3) throw new Error('Invalid RightAngle positions: expected exactly three positions.')
	const resolvedPositions = useResolvedPositions(positions)
	const resolvedSize = useResolvedDistance(size)
	if (resolvedPositions === undefined || resolvedSize === undefined) return null

	// Calculate the positions of the right angle marker based on the resolved positions and size.
	const [first, corner, third] = resolvedPositions
	const vector1 = first.subtract(corner).normalize().multiply(resolvedSize)
	const vector2 = third.subtract(corner).normalize().multiply(resolvedSize)
	const markerPositions = [corner.add(vector1), corner.add(vector1).add(vector2), corner.add(vector2)]

	// Render the shape.
	return <Line {...lineProps} positions={markerPositions.map(position => ({ pixelPosition: position }))} ref={ref} />
})
