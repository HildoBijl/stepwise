import { ensureNumber } from '@step-wise/js-utils'
import { type LineSegmentLike, type VectorLike, ensureLineSegment, ensureVector } from '@step-wise/geometry'

import { SvgDefsPortal, useDrawingId } from '../../Drawing/index.ts'
import { type Position, useDrawingPixelPositions } from '../../positioning/index.ts'

import { Line, type LineProps } from './Line.tsx'

type DistanceMarkerDefinitionProps =
	| { lineSegment: LineSegmentLike; positions?: never }
	| { positions: readonly [Position, Position]; lineSegment?: never }

export type DistanceMarkerProps = Omit<LineProps, 'close' | 'positions'> & DistanceMarkerDefinitionProps & {
	pixelOffset?: VectorLike
	markerSize?: number
}

export function DistanceMarker(props: DistanceMarkerProps) {
	const { lineSegment, markerSize = 5, pixelOffset = [0, 0], positions, style, ...lineProps } = props
	const id = `${useDrawingId()}-distance-marker`

	// Resolve positions and abort if they are not valid.
	if (lineSegment !== undefined && positions !== undefined) throw new Error('Invalid DistanceMarker definition: expected "lineSegment" or "positions", but not both.')
	if (positions !== undefined && (!Array.isArray(positions) || positions.length !== 2)) throw new Error('Invalid DistanceMarker positions: expected exactly two positions.')
	let inputPositions: readonly [Position, Position]
	if (positions !== undefined) {
		inputPositions = positions
	} else {
		if (lineSegment === undefined) throw new Error('Invalid DistanceMarker definition: expected "lineSegment" or "positions".')
		const ensuredLineSegment = ensureLineSegment(lineSegment, { dimension: 2 })
		inputPositions = [ensuredLineSegment.start, ensuredLineSegment.end]
	}
	const resolvedPositions = useDrawingPixelPositions(inputPositions)
	if (!resolvedPositions?.every(position => position !== undefined)) return null
	ensureNumber(markerSize, { nonNegative: true, nonZero: true })

	// Apply the pixel offset to the resolved positions.
	const offset = ensureVector(pixelOffset, { dimension: 2 })
	const shiftedPositions = resolvedPositions.map(position => ({ pixelPosition: position.add(offset) }))

	// Render the shape with markers at both ends.
	return <>
		<SvgDefsPortal>
			<marker id={id} markerHeight={markerSize * 2} markerUnits="userSpaceOnUse" markerWidth={markerSize * 2} orient="auto-start-reverse" refX={markerSize * 2} refY={markerSize}>
				<path d={`M0 0 L${markerSize * 2} ${markerSize} L0 ${markerSize * 2}`} fill="none" stroke="context-stroke" />
			</marker>
		</SvgDefsPortal>
		<Line {...lineProps} positions={shiftedPositions} style={{ markerEnd: `url(#${id})`, markerStart: `url(#${id})`, ...style }} />
	</>
}
