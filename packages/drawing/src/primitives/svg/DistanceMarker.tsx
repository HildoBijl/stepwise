import { forwardRef } from 'react'

import { ensureNumber } from '@step-wise/js-utils'
import { type VectorLike, ensureVector } from '@step-wise/geometry'

import { SvgDefsPortal, useDrawingCoordinateSystem, useDrawingId } from '../../Drawing/index.ts'
import { type Position, useResolvedPositions } from '../../positioning/index.ts'

import { Line, type LineProps } from './Line.tsx'

export interface DistanceMarkerProps extends Omit<LineProps, 'close' | 'positions'> {
	positions: readonly [Position, Position]
	pixelOffset?: VectorLike
	markerSize?: number
}

export const DistanceMarker = forwardRef<SVGPathElement, DistanceMarkerProps>(function DistanceMarker(props, ref) {
	const { markerSize = 5, pixelOffset = [0, 0], positions, style, ...lineProps } = props
	const coordinateSystem = useDrawingCoordinateSystem()
	const id = `${useDrawingId()}-distance-marker`

	// Resolve positions and abort if they are not valid.
	if (!Array.isArray(positions) || positions.length !== 2) throw new Error('Invalid DistanceMarker positions: expected exactly two positions.')
	const resolvedPositions = useResolvedPositions(positions)
	if (resolvedPositions === undefined) return null
	ensureNumber(markerSize, { nonNegative: true, nonZero: true })

	// Apply the pixel offset to the resolved positions.
	const offset = coordinateSystem.pixelVectorToRender(ensureVector(pixelOffset, { dimension: 2 }))
	const shiftedPositions = resolvedPositions.map(position => ({ pixelPosition: coordinateSystem.renderToPixel(position.add(offset)) }))

	// Render the shape with markers at both ends.
	return <>
		<SvgDefsPortal>
			<marker id={id} markerHeight={markerSize * 2} markerUnits="userSpaceOnUse" markerWidth={markerSize * 2} orient="auto-start-reverse" refX={markerSize} refY={markerSize}>
				<path d={`M${markerSize * 2} 0 L0 ${markerSize} L${markerSize * 2} ${markerSize * 2} Z`} fill="context-stroke" />
			</marker>
		</SvgDefsPortal>
		<Line {...lineProps} positions={shiftedPositions} ref={ref} style={{ markerEnd: `url(#${id})`, markerStart: `url(#${id})`, ...style }} />
	</>
})
