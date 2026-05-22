import React, { forwardRef } from 'react'

import { ensureNumber, ensureString, ensureObject, mergeDefaults } from '@step-wise/utils'
import { ensureRectangle as ensureGeometryRectangle } from '@step-wise/geometry'

import { useGraphicalObject, useGraphicalDistance, SvgPortal } from '../../DrawingContext'

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
	let { dimensions, graphicalDimensions, cornerRadius, graphicalCornerRadius, className, style } = mergeDefaults(props, defaultRectangle)
	dimensions = ensureGeometryRectangle(useGraphicalObject(dimensions, graphicalDimensions), 2)
	cornerRadius = ensureNumber(useGraphicalDistance(cornerRadius, graphicalCornerRadius))
	className = ensureString(className)
	style = { ...defaultRectangle.style, ...ensureObject(style) }
	ref = useRefWithEventHandlers(props, ref)

	// Set up the circle.
	const { min, size } = dimensions
	return <SvgPortal><rect ref={ref} x={min.x} y={min.y} width={size.x} height={size.y} rx={cornerRadius} className={className} style={style} {...filterEventHandlers(props)} /></SvgPortal>
})
Rectangle.defaultProps = defaultRectangle
export default Rectangle
