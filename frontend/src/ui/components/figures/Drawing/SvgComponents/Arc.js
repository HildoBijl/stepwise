import React, { forwardRef } from 'react'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureObject, processOptions } from 'step-wise/util/objects'
import { Vector, ensureVector } from 'step-wise/geometry'

import { useGraphicalVector, useGraphicalDistance, SvgPortal } from '../DrawingContext'

import { defaultObject, useRefWithEventHandlers, filterEventHandlers, getArcPath } from './util'

export const defaultArc = {
	...defaultObject,
	center: undefined,
	graphicalCenter: Vector.zero,
	radius: undefined,
	graphicalRadius: 0,
	startAngle: 0,
	endAngle: Math.PI,
	className: 'arc',
}

// Arc draws an arc (part of a circle) from a given position (center) with a given radius, startAngle and endAngle. Angles are measured in radians with the rightmost point being zero, clockwise positive.
export const Arc = forwardRef((props, ref) => {
	// Check input.
	let { center, graphicalCenter, radius, graphicalRadius, startAngle, endAngle, className, style } = processOptions(props, defaultArc)
	center = ensureVector(useGraphicalVector(center, graphicalCenter), 2)
	radius = useGraphicalDistance(radius, graphicalRadius)
	startAngle = ensureNumber(startAngle)
	endAngle = ensureNumber(endAngle)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Draw the arc.
	return <SvgPortal><path ref={ref} className={className} style={style} d={getArcPath(center, radius, startAngle, endAngle)} {...filterEventHandlers(props)} /></SvgPortal>
})
Arc.defaultProps = defaultArc
export default Arc
