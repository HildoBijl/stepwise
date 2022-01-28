import React from 'react'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureBoolean, ensureObject, processOptions } from 'step-wise/util/objects'
import { Vector, ensureVector, ensurePositionedVector } from 'step-wise/CAS/linearAlgebra'

import { defaultObject, Group } from './groups'
import { Line, Arc } from './shapes'

// ArrowHead draws an arrowhead in the given container at the given position and with the given angle. It can also be sized up and styled further.
export function ArrowHead(props) {
	// Check input.
	let { position, angle, size, color, className, style } = processOptions(props, defaultArrowHead)
	position = ensureVector(position, 2)
	angle = ensureNumber(angle)
	size = ensureNumber(size)
	color = ensureString(color)
	className = ensureString(className)
	style = ensureObject(style)

	// Draw the arrow head shape and position it.
	return <polygon
		points="0 0, -24 -12, -16 0, -24 12"
		className={className}
		style={{
			fill: color,
			transform: `translate(${position.x}px, ${position.y}px) rotate(${angle * 180 / Math.PI}deg) scale(${size / defaultArrowHead.size})`,
			stroke: 'red',
			...style,
		}}
	/>
}
const defaultArrowHead = {
	...defaultObject,
	position: Vector.zero2D,
	angle: 0,
	size: 4,
	color: 'black',
	className: 'arrowHead',
}

// Force draws a force vector. It must have a positionedVector parameter (a PositionedVector object), can have a size and a color.
export function Force(props) {
	// Check input.
	let { positionedVector, size, color, className, style } = processOptions(props, defaultForce)
	const { vector, end } = ensurePositionedVector(positionedVector)
	size = ensureNumber(size)
	color = ensureString(color)

	// Draw a horizontal force ending in (0, 0) and transform it to position it.
	return <Group position={end} rotate={vector.argument} {...{ className, style }}>
		<Line points={[new Vector(-vector.magnitude, 0), new Vector(-size, 0)]} className="forceLine" style={{ stroke: color, strokeWidth: size }} />
		<ArrowHead size={size} style={{ fill: color }} />
	</Group>
}
export const defaultForce = {
	...defaultObject,
	positionedVector: null,
	size: defaultArrowHead.size,
	color: defaultArrowHead.color,
	className: 'force',
}

// Moment draws a moment vector. The moment must have a position property (a Vector) and a clockwise property (boolean). The options (all optional) include the color, the size (thickness of the line), the radius, the opening (the angle where the opening is in the moment arrow, by default being 0 which means to the right) and the spread (how large the circle arc is). The properties can also contain an extra style parameter to be applied.
export function Moment(props) {
	// Check input.
	let { position, clockwise, size, color, radius, opening, spread, arrowHeadDelta, className, style } = processOptions(props, defaultMoment)
	position = ensureVector(position, 2)
	clockwise = ensureBoolean(clockwise)
	size = ensureNumber(size)
	color = ensureString(color)
	radius = ensureNumber(radius)
	opening = ensureNumber(opening)
	spread = ensureNumber(spread)
	arrowHeadDelta = ensureNumber(arrowHeadDelta)
	className = ensureString(className)
	style = ensureObject(style)

	// Calculate relevant parameters.
	const factor = (clockwise ? 1 : -1)
	const startAngle = factor * (2 * Math.PI - spread) / 2
	const endAngle = startAngle + factor * spread
	const endAngleShortened = endAngle - 2 * factor * size / radius // Shorten the line to prevent passing by the arrow head.

	// Draw a horizontal moment around (0, 0) and transform it to position it.
	return <Group rotate={opening} {...{ position, className, style }}>
		<Arc radius={radius} startAngle={startAngle} endAngle={endAngleShortened} className="momentLine" style={{ stroke: color, strokeWidth: size }} />
		<ArrowHead
			position={Vector.fromPolar(radius, endAngle)}
			angle={endAngle + factor * (Math.PI / 2 - arrowHeadDelta * size / radius)}
			size={size}
			style={{ fill: color }}
		/>
	</Group>
}
export const defaultMoment = {
	...defaultObject,
	position: null,
	clockwise: false,
	size: defaultForce.size,
	color: defaultForce.size,
	radius: 25,
	opening: 0, // The position of the opening in radians, measured clockwise from right.
	spread: 7 / 4 * Math.PI, // Which angle (part of the circle) is drawn?
	arrowHeadDelta: 2.5, // The angle of the arrow head is manually adjusted to make it look OK. This factor is responsible. Increase or decrease it at will.
	className: 'moment',
}