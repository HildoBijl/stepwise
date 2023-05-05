import React, { forwardRef } from 'react'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureObject, processOptions } from 'step-wise/util/objects'
import { ensureRectangle as ensureGeometryRectangle } from 'step-wise/geometry'

import { useGraphicalObject, useGraphicalDistance } from '../DrawingContext'

import { defaultObject, useRefWithEventHandlers, filterEventHandlers } from './util'

export const defaultRectangle = {
	...defaultObject,
	dimensions: undefined, // A Rectangle.
	graphicalDimensions: undefined,
	cornerRadius: undefined,
	graphicalCornerRadius: 0,
}

export const Rectangle = forwardRef((props, ref) => {
	// Process the input.
	let { dimensions, graphicalDimensions, cornerRadius, graphicalCornerRadius, className, style } = processOptions(props, defaultRectangle)
	dimensions = ensureGeometryRectangle(useGraphicalObject(dimensions, graphicalDimensions), 2)
	cornerRadius = ensureNumber(useGraphicalDistance(cornerRadius, graphicalCornerRadius))
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the circle.
	const { start, vector, end } = dimensions
	return <rect ref={ref} x={Math.min(start.x, end.x)} y={Math.min(start.y, end.y)} width={Math.abs(vector.x)} height={Math.abs(vector.y)} rx={cornerRadius} className={className} style={style} {...filterEventHandlers(props)} />
})
Rectangle.defaultProps = defaultRectangle
export default Rectangle
