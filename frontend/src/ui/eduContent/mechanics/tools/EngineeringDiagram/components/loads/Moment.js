import React, { forwardRef } from 'react'

import { ensureNumber, ensureString, ensureBoolean, processOptions } from 'step-wise/util'
import { Vector } from 'step-wise/geometry'
import { defaultMomentRadius, defaultGraphicalMomentRadius, defaultMomentOpening } from 'step-wise/eduContent/mechanics'

import { useGraphicalDistance } from 'ui/figures'
import { Group, Arc } from 'ui/figures/Drawing/components/svgComponents'
import { defaultObject, useRefWithEventHandlers } from 'ui/figures/Drawing/components/svgComponents/util'

import ArrowHead from './ArrowHead'
import { defaultForce } from './Force'

export const defaultMoment = {
	...defaultObject,
	position: undefined,
	graphicalPosition: Vector.zero,
	clockwise: false,
	size: defaultForce.size,
	color: defaultForce.color,
	radius: undefined,
	graphicalRadius: defaultGraphicalMomentRadius,
	opening: defaultMomentOpening, // The position of the opening in radians, measured clockwise from right.
	spread: 7 / 4 * Math.PI, // Which angle (part of the circle) is drawn?
	arrowHeadDelta: 2.5, // The angle of the arrow head is manually adjusted to make it look OK. This factor is responsible. Increase or decrease it at will.
	className: 'moment',
}

// Moment draws a moment vector. The moment must have a position property (a Vector) and a clockwise property (boolean). The options (all optional) include the color, the size (thickness of the line), the radius, the opening (the angle where the opening is in the moment arrow, by default being 0 which means to the right) and the spread (how large the circle arc is). The properties can also contain an extra style parameter to be applied.
export const Moment = forwardRef((props, ref) => {
	// Check input.
	let { position, graphicalPosition, clockwise, size, color, radius, graphicalRadius, opening, spread, arrowHeadDelta, className, style } = processOptions(props, defaultMoment)
	clockwise = ensureBoolean(clockwise)
	size = ensureNumber(size)
	color = ensureString(color)
	radius = ensureNumber(useGraphicalDistance(radius, graphicalRadius, defaultMomentRadius))
	opening = ensureNumber(opening)
	spread = ensureNumber(spread)
	arrowHeadDelta = ensureNumber(arrowHeadDelta)
	ref = useRefWithEventHandlers(props, ref)

	// Calculate relevant parameters.
	const factor = (clockwise ? 1 : -1)
	const startAngle = factor * (2 * Math.PI - spread) / 2
	const endAngle = startAngle + factor * spread
	const endAngleShortened = endAngle - 2 * factor * size / radius // Shorten the line to prevent passing by the arrow head.

	// Draw a horizontal moment around (0, 0) and transform it to position it.
	return <Group ref={ref} rotate={opening} className={className} {...{ position, graphicalPosition, style }}>
		<Arc graphicalRadius={radius} startAngle={startAngle} endAngle={endAngleShortened} className="momentLine" style={{ fill: 'none', stroke: color, strokeWidth: size }} />
		<ArrowHead
			graphicalPosition={Vector.fromPolar(radius, endAngle)}
			angle={endAngle + factor * (Math.PI / 2 - arrowHeadDelta * size / radius)}
			size={size}
			style={{ fill: color }}
		/>
	</Group>
})
Moment.defaultProps = defaultMoment
export default Moment
