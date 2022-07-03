import React, { forwardRef } from 'react'

import { defaultMomentRadius, defaultGraphicalMomentRadius, defaultMomentOpening } from 'step-wise/settings/engineeringMechanics'
import { ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureBoolean, ensureObject, processOptions } from 'step-wise/util/objects'
import { Vector, ensureVector, ensurePositionedVector } from 'step-wise/geometry'

import { components as drawingComponents, useScaledOrGraphicalValue, useTransformedOrGraphicalValue } from 'ui/components/figures'

const { defaultObject, useRefWithEventHandlers, Group, Line, Arc } = drawingComponents

// ArrowHead draws an arrowhead in the given container at the given position and with the given angle. It can also be sized up and styled further.
export const ArrowHead = forwardRef((props, ref) => {
	// Check input.
	let { position, graphicalPosition, angle, size, color, className, style } = processOptions(props, defaultArrowHead)
	position = ensureVector(useTransformedOrGraphicalValue(position, graphicalPosition), 2)
	angle = ensureNumber(angle)
	size = ensureNumber(size)
	color = ensureString(color)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Draw the arrow head shape and position it.
	return <polygon
		ref={ref}
		points="0 0, -20 -10, -14 0, -20 10"
		className={className}
		style={{
			fill: color,
			transform: `translate(${position.x}px, ${position.y}px) rotate(${angle * 180 / Math.PI}deg) scale(${size / defaultArrowHead.size})`,
			stroke: 'red',
			...style,
		}}
	/>
})
const defaultArrowHead = {
	...defaultObject,
	position: undefined,
	graphicalPosition: Vector.zero,
	angle: 0,
	size: 4,
	color: 'black',
	className: 'arrowHead',
}

// Force draws a force vector. It must have a positionedVector parameter (a PositionedVector object), can have a size and a color.
export const Force = forwardRef((props, ref) => {
	// Check input.
	let { positionedVector, graphicalPositionedVector, size, color, className, style } = processOptions(props, defaultForce)
	const { vector, end } = ensurePositionedVector(useTransformedOrGraphicalValue(positionedVector, graphicalPositionedVector), 2)
	size = ensureNumber(size)
	color = ensureString(color)
	ref = useRefWithEventHandlers(props, ref)

	// Draw a horizontal force ending in (0, 0) and transform it to position it.
	return <Group ref={ref} graphicalPosition={end} rotate={vector.argument} {...{ className, style }}>
		<Line graphicalPoints={[new Vector(-vector.magnitude, 0), new Vector(-size, 0)]} className="forceLine" style={{ stroke: color, strokeWidth: size }} />
		<ArrowHead size={size} style={{ fill: color }} />
	</Group>
})
export const defaultForce = {
	...defaultObject,
	positionedVector: undefined,
	graphicalPositionedVector: undefined,
	size: defaultArrowHead.size,
	color: defaultArrowHead.color,
	className: 'force',
}

// Moment draws a moment vector. The moment must have a position property (a Vector) and a clockwise property (boolean). The options (all optional) include the color, the size (thickness of the line), the radius, the opening (the angle where the opening is in the moment arrow, by default being 0 which means to the right) and the spread (how large the circle arc is). The properties can also contain an extra style parameter to be applied.
export const Moment = forwardRef((props, ref) => {
	// Check input.
	let { position, graphicalPosition, clockwise, size, color, radius, graphicalRadius, opening, spread, arrowHeadDelta, className, style } = processOptions(props, defaultMoment)
	clockwise = ensureBoolean(clockwise)
	size = ensureNumber(size)
	color = ensureString(color)
	radius = ensureNumber(useScaledOrGraphicalValue(radius, graphicalRadius, defaultMomentRadius))
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
	return <Group ref={ref} rotate={opening} {...{ position, graphicalPosition, className, style }}>
		<Arc graphicalRadius={radius} startAngle={startAngle} endAngle={endAngleShortened} className="momentLine" style={{ stroke: color, strokeWidth: size }} />
		<ArrowHead
			graphicalPosition={Vector.fromPolar(radius, endAngle)}
			angle={endAngle + factor * (Math.PI / 2 - arrowHeadDelta * size / radius)}
			size={size}
			style={{ fill: color }}
		/>
	</Group>
})
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