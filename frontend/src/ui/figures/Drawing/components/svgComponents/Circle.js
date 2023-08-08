import React, { forwardRef } from 'react'

import { ensureNumber, ensureString, ensureObject, processOptions } from 'step-wise/util'
import { Vector, ensureVector } from 'step-wise/geometry'

import { useGraphicalVector, useGraphicalDistance, SvgPortal } from '../../DrawingContext'

import { defaultObject, useRefWithEventHandlers, filterEventHandlers } from './util'

export const defaultCircle = {
	...defaultObject,
	center: undefined,
	graphicalCenter: Vector.zero,
	radius: undefined,
	graphicalRadius: 0,
}

// Circle draws a circle. It can be given a radius (in drawing coordinate distance, which will be scaled) or a graphicalRadius (in graphical coordinates).
export const Circle = forwardRef((props, ref) => {
	// Process the input.
	let { center, graphicalCenter, radius, graphicalRadius, className, style } = processOptions(props, defaultCircle)
	center = ensureVector(useGraphicalVector(center, graphicalCenter), 2)
	radius = ensureNumber(useGraphicalDistance(radius, graphicalRadius), true)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the circle.
	return <SvgPortal><circle ref={ref} cx={center.x} cy={center.y} r={radius} className={className} style={style} {...filterEventHandlers(props)} /></SvgPortal>
})
Circle.defaultProps = defaultCircle
export default Circle
