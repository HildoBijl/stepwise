import React, { forwardRef } from 'react'

import { ensureString, ensureObject, mergeDefaults, pickFromDefaults } from '@step-wise/utils'
import { Vector, ensureVector, ensureLineSegment } from '@step-wise/geometry'

import { useGraphicalObject, useGraphicalVector } from '../../DrawingContext'

import { defaultObject, useRefWithEventHandlers } from './util'
import Line, { defaultLine } from './Line'

export const defaultDistance = {
	...defaultObject,
	lineSegment: undefined,
	graphicalLineSegment: undefined,
	shift: undefined,
	graphicalShift: Vector.zero,
	style: {
		...defaultObject.style,
		fill: 'none',
		stroke: 'black',
		strokeWidth: 1,
		markerStart: 'url(#distanceArrowHead)',
		markerEnd: 'url(#distanceArrowHead)',
	},
	className: 'distance',
}

// Distance renders a distance spread. The given distance object must have a "lineSegment" parameter, which is a LineSegment object: an object with a start, vector and/or end (two out of the three). It assumes the arrow heads will be added through the distance class and the SVG style definitions.
export const Distance = forwardRef((props, ref) => {
	// Process the input.
	let { lineSegment, graphicalLineSegment, shift, graphicalShift, style, className } = mergeDefaults(props, defaultDistance)
	lineSegment = ensureLineSegment(useGraphicalObject(lineSegment, graphicalLineSegment), 2)
	shift = ensureVector(useGraphicalVector(shift, graphicalShift, true), 2)
	style = { ...defaultDistance.style, ...ensureObject(style) }
	className = ensureString(className)
	ref = useRefWithEventHandlers(props, ref)

	// Render the line with the appropriate style. Enforce that the default className is used, because this adds the arrow spread.
	lineSegment = lineSegment.add(shift)
	return <Line ref={ref} {...pickFromDefaults(props, defaultLine)} graphicalPoints={[lineSegment.start, lineSegment.end]} style={style} className={className} />
})
Distance.defaultProps = defaultDistance
export default Distance
