import React, { forwardRef } from 'react'
import clsx from 'clsx'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureBoolean, ensureObject, processOptions, filterOptions, filterProperties } from 'step-wise/util/objects'
import { Vector, ensureVector, ensureVectorArray, ensurePositionedVector, ensureRectangle as ensureRectangleShape } from 'step-wise/geometry'

import { useEnsureRef, useEventListeners } from 'util/react'

// Define event handlers that objects can use.
export const defaultEventHandlers = {}
const eventHandlers = ['mouseenter', 'mouseleave', 'click', 'mousedown', 'mouseup']
eventHandlers.forEach(name => { defaultEventHandlers[name] = undefined })
export const filterEventHandlers = (options) => filterProperties(options, eventHandlers)
export const useRefWithEventHandlers = (props, ref) => {
	ref = useEnsureRef(ref)
	useEventListeners(filterEventHandlers(props), ref)
	return ref
}

// These are the parameters inherited by all object types.
export const defaultObject = {
	...defaultEventHandlers,
	type: undefined,
	className: '',
	style: {},
}

// Group sets up a groups with a given position, rotation and scale. (In that order: it's first translated, then rotated and then scaled.)
export const Group = forwardRef((props, ref) => {
	// Process the input.
	let { position, rotate, scale, className, style, children } = processOptions(props, defaultGroup)
	position = ensureVector(position, 2)
	rotate = ensureNumber(rotate)
	scale = ensureNumber(scale)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the group with the right transform property.
	return <g ref={ref} className={className} style={{
		...style,
		transform: `translate(${position.x}px, ${position.y}px) rotate(${rotate * 180 / Math.PI}deg) scale(${scale}) ${style.transform || ''}`,
	}}>{children}</g>
})
const defaultGroup = {
	...defaultObject,
	position: Vector.zero,
	rotate: 0,
	scale: 1,
	children: null,
}

// Line draws a line from the given points array and an optional style object.
export const Line = forwardRef((props, ref) => {
	// Process the input.
	let { points, close, className, style } = processOptions(props, defaultLine)
	points = ensureVectorArray(points, 2)
	close = ensureBoolean(close)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the line.
	const path = getLinePath(points, close)
	return <path ref={ref} className={className} style={style} d={path} {...filterEventHandlers(props)} />
})
export const defaultLine = {
	...defaultObject,
	className: 'line',
	points: [],
	close: false,
}

// getLinePath takes an array of points and turns it into an SVG line string.
export function getLinePath(points, close) {
	return `M${points.map(point => `${point.x} ${point.y}`).join(' L')}${close ? ' Z' : ''}`
}

// Polygon draws a polygon. It is effectively a closed Line.
export const Polygon = forwardRef((props, ref) => {
	return <Line {...props} close={true} />
})

export const Circle = forwardRef((props, ref) => {
	// Process the input.
	let { center, radius, className, style } = processOptions(props, defaultCircle)
	center = ensureVector(center, 2)
	radius = ensureNumber(radius, true)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the circle.
	return <circle ref={ref} cx={center.x} cy={center.y} r={radius} className={className} style={style} {...filterEventHandlers(props)} />
})
export const defaultCircle = {
	...defaultObject,
	center: null,
	radius: 10,
}

export const Rectangle = forwardRef((props, ref) => {
	// Process the input.
	let { dimensions, className, style } = processOptions(props, defaultRectangle)
	dimensions = ensureRectangleShape(dimensions, 2)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the circle.
	const { start, vector, end } = dimensions
	return <rect ref={ref} x={Math.min(start.x, end.x)} y={Math.min(start.y, end.y)} width={Math.abs(vector.x)} height={Math.abs(vector.y)} className={className} style={style} {...filterEventHandlers(props)} />
})
export const defaultRectangle = {
	...defaultObject,
	dimensions: null, // A PositionedVector.
}

export const Square = forwardRef((props, ref) => {
	// Process the input.
	let { center, side, className, style } = processOptions(props, defaultSquare)
	center = ensureVector(center, 2)
	side = ensureNumber(side, true)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the circle.
	return <rect ref={ref} x={center.x - side / 2} y={center.y - side / 2} width={side} height={side} className={className} style={style} {...filterEventHandlers(props)} />
})
export const defaultSquare = {
	...defaultObject,
	center: null, // A Vector.
	side: 10,
}

// Arc draws an arc (part of a circle) from a given position (center) with a given radius, startAngle and endAngle. Angles are measured in radians with the rightmost point being zero, clockwise positive.
export const Arc = forwardRef((props, ref) => {
	// Check input.
	let { center, radius, startAngle, endAngle, className, style } = processOptions(props, defaultArc)
	center = ensureVector(center, 2)
	radius = ensureNumber(radius)
	startAngle = ensureNumber(startAngle)
	endAngle = ensureNumber(endAngle)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Draw the arc.
	return <path ref={ref} className={className} style={style} d={getArcPath(center, radius, startAngle, endAngle)} {...filterEventHandlers(props)} />
})
export const defaultArc = {
	...defaultObject,
	center: Vector.zero,
	radius: 50,
	startAngle: 0,
	endAngle: Math.PI,
	className: 'arc',
}

// getArcPath takes a circle center (a Vector), a radius, a start angle and an end angle, and gives the SVG path string that makes this path. For angles, the right is taken as zero and clockwise is taken as positive.
export function getArcPath(center, radius, startAngle, endAngle) {
	// Determine arc start and end.
	const start = center.add(Vector.fromPolar(radius, startAngle))
	const end = center.add(Vector.fromPolar(radius, endAngle))

	// Determine the flags needed by SVG.
	const largeArcFlag = Math.abs(endAngle - startAngle) <= Math.PI ? '0' : '1'
	const sweepFlag = endAngle < startAngle ? '0' : '1'

	// Set up the path.
	return `M${start.x} ${start.y} A${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`
}

// Distance renders a distance spread. The given distance object must have a "positionedVector" parameter, which is a PositionedVector object: an object with a start, vector and/or end (two out of the three). It assumes the arrow heads will be added through the distance class and the SVG style definitions.
export const Distance = forwardRef((props, ref) => {
	// Process the input.
	let { positionedVector, className } = processOptions(props, defaultDistance)
	positionedVector = ensurePositionedVector(positionedVector, 2)
	className = ensureString(className)
	ref = useRefWithEventHandlers(props, ref)

	// Render the line with the appropriate style. Enfore that the className is used, because this adds the arrow spread.
	return <Line ref={ref} {...filterOptions(props, defaultLine)} points={[positionedVector.start, positionedVector.end]} className={clsx(className, className === defaultDistance.className ? '' : defaultDistance.className)} />
})
const defaultDistance = {
	...defaultObject,
	positionedVector: null,
	className: 'distance',
}

// RightAngle renders a right-angle marker of two lines. It expects three points that form said angle, in which the middle one is the one at which the angle should be drawn. Also a size parameter can be given.
export const RightAngle = forwardRef((props, ref) => {
	// Process the input.
	let { points, size } = processOptions(props, defaultRightAngle)
	points = ensureVectorArray(points, 2)
	if (points.length !== 3)
		throw new Error(`Invalid RightAngle points: expected exactly three points, of which the middle one is the given corner, but received ${points.length} points.`)
	size = ensureNumber(size)
	ref = useRefWithEventHandlers(props, ref)

	// Determine the shape of the right angle.
	const point = points[1]
	const vector1 = points[0].subtract(point).normalize()
	const vector2 = points[2].subtract(point).normalize()
	const anglePoints = [
		point.add(vector1.multiply(size)),
		point.add(vector1.multiply(size)).add(vector2.multiply(size)),
		point.add(vector2.multiply(size)),
	]

	// Render the line with the appropriate style.
	return <Line ref={ref} {...filterOptions(props, defaultLine)} points={anglePoints} />
})
const defaultRightAngle = {
	...defaultObject,
	points: [],
	className: 'rightAngle',
	size: 12,
}