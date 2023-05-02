import React, { forwardRef } from 'react'

import { processOptions, filterOptions } from 'step-wise/util/objects'
import { Vector, Line as GeometryLine, ensureLine as ensureGeometryLine } from 'step-wise/geometry'

import { useGraphicalBounds, useTransformedOrGraphicalValue } from '../DrawingContext'

import { defaultObject, useRefWithEventHandlers } from './util'
import Line, { defaultLine } from './Line'

export const defaultBoundedLine = {
	...defaultObject,
	line: undefined,
	graphicalLine: GeometryLine.fromPoints(Vector.zero, Vector.i),
	className: 'line',
}

// BoundedLine takes a line object and bounds it to the bounds of the drawing. It then draws it similarly to a regular line.
export const BoundedLine = forwardRef((props, ref) => {
	// Process the input.
	let { line, graphicalLine } = processOptions(props, defaultBoundedLine)
	line = ensureGeometryLine(useTransformedOrGraphicalValue(line, graphicalLine), 2)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the line part and display it.
	const bounds = useGraphicalBounds()
	const linePart = bounds?.getLinePart(line)
	return linePart ? <Line ref={ref} {...filterOptions(props, defaultLine)} graphicalPoints={[linePart.start, linePart.end]} /> : null
})
BoundedLine.defaultProps = defaultBoundedLine
export default BoundedLine
