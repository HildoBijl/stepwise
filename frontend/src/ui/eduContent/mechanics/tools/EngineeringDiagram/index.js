import React, { forwardRef } from 'react'

import { isVectorLike } from '@step-wise/geometry'
import { M } from '@step-wise/math-display'
import { Arc, BoundedLine, Circle, CornerLabel as DrawingCornerLabel, Curve, DistanceMarker, Drawing, HtmlElement, Label as DrawingLabel, Line as DrawingLine, Polygon, Rectangle, RightAngle, Square, SvgGroup, SvgText, useDrawingCoordinateSystem } from '@step-wise/drawing'
import { Beam as EngineeringBeam, LoadLabel as EngineeringLoadLabel, defaultEngineeringDiagramColors, renderEngineeringDiagram } from '@step-wise/engineering-diagrams'
import { loadNameToVariable } from '@step-wise/mechanics-exercises'

export * from '@step-wise/engineering-diagrams'
export { Arc, BoundedLine, Circle, Curve, Drawing, Polygon, Rectangle, RightAngle, Square, SvgText }

export const loadColors = defaultEngineeringDiagramColors
export function render(data, ref) {
	return renderEngineeringDiagram(data, {}, ref)
}

export const Group = forwardRef(function Group({ graphicalPosition, overflow = true, position, ...props }, ref) {
	return <SvgGroup {...props} clip={!overflow} position={useLegacyPosition(position, graphicalPosition)} ref={ref} />
})

export const Element = forwardRef(function Element({ anchor = [0.5, 0.5], graphicalPosition, position, rotate, ...props }, ref) {
	return <HtmlElement {...props} anchor={[anchor[0] * 2 - 1, 1 - anchor[1] * 2]} position={useLegacyPosition(position, graphicalPosition)} ref={ref} rotate={rotate === undefined ? undefined : -rotate} />
})

export const Label = forwardRef(function Label({ angle, graphicalDistance, distance, ...props }, ref) {
	return <DrawingLabel {...props} angle={angle === undefined ? undefined : -angle} distance={distance ?? { pixelDistance: graphicalDistance ?? 0 }} ref={ref} />
})

export const CornerLabel = forwardRef(function CornerLabel({ graphicalPoints, graphicalSize, points, size, ...props }, ref) {
	const coordinateSystem = useDrawingCoordinateSystem()
	let positions
	if (points === undefined) {
		positions = graphicalPoints?.map(point => ({ pixelPosition: coordinateSystem.renderToPixel(point) }))
	} else {
		positions = points.map((point, index) => {
			const graphicalPoint = coordinateSystem.drawingToPixel(point)
			const offset = isVectorLike(graphicalPoints) ? graphicalPoints : graphicalPoints?.[index]
			return { pixelPosition: coordinateSystem.renderToPixel(offset === undefined ? graphicalPoint : graphicalPoint.add(offset)) }
		})
	}
	return <DrawingCornerLabel {...props} positions={positions} size={size ?? { pixelDistance: graphicalSize ?? 30 }} ref={ref} />
})

export const Line = forwardRef(function Line({ graphicalPoints, points, ...props }, ref) {
	const coordinateSystem = useDrawingCoordinateSystem()
	const positions = graphicalPoints?.map(point => ({ pixelPosition: coordinateSystem.renderToPixel(point) })) ?? points
	return <DrawingLine {...props} positions={positions} ref={ref} />
})

export const Distance = forwardRef(function Distance({ graphicalShift, lineSegment, shift, ...props }, ref) {
	const coordinateSystem = useDrawingCoordinateSystem()
	const legacyShift = graphicalShift ?? (shift && coordinateSystem.drawingVectorToPixel(shift)) ?? [0, 0]
	return <DistanceMarker {...props} positions={[lineSegment.start, lineSegment.end]} pixelOffset={coordinateSystem.renderVectorToPixel(legacyShift)} ref={ref} />
})

export const Beam = forwardRef(function Beam({ points, positions, ...props }, ref) {
	return <EngineeringBeam {...props} positions={positions ?? points} ref={ref} />
})

export const LoadLabel = forwardRef(function LoadLabel({ children, name, ...props }, ref) {
	return <EngineeringLoadLabel {...props} ref={ref}>{children ?? <M>{loadNameToVariable(name)}</M>}</EngineeringLoadLabel>
})

function useLegacyPosition(position, graphicalPosition) {
	const coordinateSystem = useDrawingCoordinateSystem()
	if (position === undefined) return { pixelPosition: coordinateSystem.renderToPixel(graphicalPosition ?? [0, 0]) }
	if (graphicalPosition === undefined) return position
	return { position, pixelOffset: coordinateSystem.renderVectorToPixel(graphicalPosition) }
}
