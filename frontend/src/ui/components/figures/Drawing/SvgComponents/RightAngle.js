import React, { forwardRef } from 'react'

import { processOptions, filterOptions, removeProperties } from 'step-wise/util/objects'
import { Vector, ensureCorner } from 'step-wise/geometry'

import { useTransformedOrGraphicalValue, useScaledOrGraphicalValue } from '../DrawingContext'

import { defaultObject, useRefWithEventHandlers } from './util'
import Line, { defaultLine } from './Line'

export const defaultRightAngle = {
	...defaultObject,
	points: undefined,
	graphicalPoints: [Vector.i, Vector.zero, Vector.j],
	className: 'rightAngle',
	size: undefined,
	graphicalSize: 12,
}

// RightAngle renders a right-angle marker of two lines. It expects three points that form said angle, in which the middle one is the one at which the angle should be drawn. Also a size parameter can be given.
export const RightAngle = forwardRef((props, ref) => {
	// Process the input.
	let { points, graphicalPoints, size, graphicalSize } = processOptions(props, defaultRightAngle)
	points = ensureCorner(useTransformedOrGraphicalValue(points, graphicalPoints), 2)
	if (points.length !== 3)
		throw new Error(`Invalid RightAngle points: expected exactly three points, of which the middle one is the given corner, but received ${points.length} points.`)
	size = useScaledOrGraphicalValue(size, graphicalSize)
	ref = useRefWithEventHandlers(props, ref)

	// Determine the shape of the right angle.
	const point = points[1]
	const vector1 = points[0].subtract(point).normalize()
	const vector2 = points[2].subtract(point).normalize()
	const anglePoints = [
		point.add(vector1.multiply(size)),
		point.add(vector1.multiply(size)).add(vector2.multiply(size)),
		point.add(vector2.multiply(size)),
	]

	// Render the line with the appropriate style.
	return <Line ref={ref} {...filterOptions(removeProperties(props, 'points'), defaultLine)} graphicalPoints={anglePoints} />
})
export default RightAngle
