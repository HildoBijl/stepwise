import React, { forwardRef } from 'react'

import { ensureNumber, ensureString, ensureObject, mergeDefaults } from '@step-wise/js-utils'
import { Vector, ensureVector } from '@step-wise/geometry'
import { useEventListenersRef } from '@step-wise/react-utils'

import { useGraphicalVector, useGraphicalDistance, SvgPortal } from '../../DrawingContext'

import { defaultObject, filterEventHandlers, getArcPath } from './util'

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
	let { center, graphicalCenter, radius, graphicalRadius, startAngle, endAngle, className, style } = mergeDefaults(props, defaultArc)
	center = ensureVector(useGraphicalVector(center, graphicalCenter), { dimension: 2 })
	radius = useGraphicalDistance(radius, graphicalRadius)
	startAngle = ensureNumber(startAngle)
	endAngle = ensureNumber(endAngle)
	className = ensureString(className)
	style = { ...defaultArc.style, ...ensureObject(style) }
	ref = useEventListenersRef(filterEventHandlers(props), ref)

	// Draw the arc.
	return <SvgPortal><path ref={ref} className={className} style={style} d={getArcPath(center, radius, startAngle, endAngle)} /></SvgPortal>
})
Arc.defaultProps = defaultArc
export default Arc
