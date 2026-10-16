import { type LineLike, Line as GeometryLine, Rectangle as GeometryRectangle, ensureLine } from '@step-wise/geometry'

import { useDrawingCoordinateSystem } from '../../Drawing/index.ts'
import { type Position, useDrawingPixelPositions } from '../../positioning/index.ts'

import { Line, type LineProps } from './Line.tsx'

type BoundedLineDefinitionProps =
	| { line: LineLike; through?: never }
	| { through: readonly [Position, Position]; line?: never }

export type BoundedLineProps = Omit<LineProps, 'close' | 'positions'> & BoundedLineDefinitionProps

export function BoundedLine(props: BoundedLineProps) {
	const { line, through, ...lineProps } = props
	const coordinateSystem = useDrawingCoordinateSystem()

	// Resolve positions and abort if they are not valid.
	if (line !== undefined && through !== undefined) throw new Error('Invalid BoundedLine definition: expected "line" or "through", but not both.')
	if (through !== undefined && (!Array.isArray(through) || through.length !== 2)) throw new Error('Invalid BoundedLine positions: expected exactly two positions.')
	let positions: readonly [Position, Position]
	if (through !== undefined) {
		positions = through
	} else {
		if (line === undefined) throw new Error('Invalid BoundedLine definition: expected "line" or "through".')
		const ensuredLine = ensureLine(line, { dimension: 2 })
		positions = [ensuredLine.start, ensuredLine.getPointAtFactor(1)]
	}
	const resolvedPositions = useDrawingPixelPositions(positions)
	if (!resolvedPositions?.every(position => position !== undefined)) return null

	// Get the intersection of the line with the coordinate system bounds.
	const { width, height } = coordinateSystem
	const [first, second] = resolvedPositions
	const segment = new GeometryRectangle([0, 0], [width, height]).getLineIntersection(new GeometryLine(first, second.subtract(first)))
	if (!segment) return null

	// Render the shape.
	return <Line {...lineProps} positions={[{ pixelPosition: segment.start }, { pixelPosition: segment.end }]} />
}
