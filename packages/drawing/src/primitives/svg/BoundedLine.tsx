import { forwardRef } from 'react'

import { Line as GeometryLine, Rectangle as GeometryRectangle } from '@step-wise/geometry'

import { useDrawingCoordinateSystem } from '../../Drawing/index.ts'
import { type Position, useResolvedPositions } from '../../positioning/index.ts'

import { Line, type LineProps } from './Line.tsx'

export interface BoundedLineProps extends Omit<LineProps, 'close' | 'positions'> {
	through: readonly [Position, Position]
}

export const BoundedLine = forwardRef<SVGPathElement, BoundedLineProps>(function BoundedLine(props, ref) {
	const { through, ...lineProps } = props
	const coordinateSystem = useDrawingCoordinateSystem()

	// Resolve positions and abort if they are not valid.
	if (!Array.isArray(through) || through.length !== 2) throw new Error('Invalid BoundedLine positions: expected exactly two positions.')
	const resolvedPositions = useResolvedPositions(through)
	if (resolvedPositions === undefined) return null

	// Get the intersection of the line with the coordinate system bounds.
	const { width, height } = coordinateSystem
	const [first, second] = resolvedPositions
	const segment = new GeometryRectangle([0, 0], [width, height]).getLineIntersection(new GeometryLine(first, second.subtract(first)))
	if (!segment) return null

	// Render the shape.
	return <Line {...lineProps} positions={[{ pixelPosition: segment.start }, { pixelPosition: segment.end }]} ref={ref} />
})
