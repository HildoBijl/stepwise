import React from 'react'
import clsx from 'clsx'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureObject, processOptions, filterOptions } from 'step-wise/util/objects'
import { Vector, ensureVector, ensureVectorArray, ensurePositionedVector } from 'step-wise/CAS/linearAlgebra'

// These are the parameters inherited by all object types.
export const defaultObject = {
	type: undefined,
	className: '',
	style: {},
}

// Group sets up a groups with a given position, rotation and scale. (In that order: it's first translated, then rotated and then scaled.)
export function Group(props) {
	// Check input.
	const { position, rotate, scale, className, style, children } = processOptions(props, defaultGroup)

	// Set up the group with the right transform property.
	return <g className={className} style={{
		...style,
		transform: `translate(${position.x}px, ${position.y}px) rotate(${rotate * 180 / Math.PI}deg) scale(${scale}) ${style.transform || ''}`,
	}}>{children}</g>
}
const defaultGroup = {
	...defaultObject,
	position: Vector.zero,
	rotate: 0,
	scale: 1,
	children: null,
}

// Line draws a line from the given points array and an optional style object.
export function Line(props) {
	// Process the input.
	let { points, className, style } = processOptions(props, defaultLine)
	points = ensureVectorArray(points, 2)
	className = ensureString(className)
	style = ensureObject(style)

	// Set up the line.
	const path = getLinePath(points)
	return <path className={className} style={style} d={path} />
}
export const defaultLine = {
	...defaultObject,
	className: 'line',
	points: [],
}

// getLinePath takes an array of points and turns it into an SVG line string.
export function getLinePath(points) {
	return `M${points.map(point => `${point.x} ${point.y}`).join(' L')}`
}

export function Circle(props) {
	// Process the input.
	let { center, radius, className, style } = processOptions(props, defaultCircle)
	center = ensureVector(center, 2)
	radius = ensureNumber(radius, true)
	className = ensureString(className)
	style = ensureObject(style)

	// Set up the circle.
	return <circle cx={center.x} cy={center.y} r={radius} className={className} style={style} />
}
export const defaultCircle = {
	...defaultObject,
	center: null,
	radius: 10,
}

export function Rectangle(props) {
	// Process the input.
	let { dimensions, className, style } = processOptions(props, defaultRectangle)
	dimensions = ensurePositionedVector(dimensions, 2)
	className = ensureString(className)
	style = ensureObject(style)

	// Set up the circle.
	const { start, vector, end } = dimensions
	return <rect x={Math.min(start.x, end.x)} y={Math.min(start.y, end.y)} width={Math.abs(vector.x)} height={Math.abs(vector.y)} className={className} style={style} />
}
export const defaultRectangle = {
	...defaultObject,
	dimensions: null, // A PositionedVector.
}

export function Square(props) {
	// Process the input.
	let { center, side, className, style } = processOptions(props, defaultSquare)
	center = ensureVector(center, 2)
	side = ensureNumber(side, true)
	className = ensureString(className)
	style = ensureObject(style)

	// Set up the circle.
	return <rect x={center.x - side / 2} y={center.y - side / 2} width={side} height={side} className={className} style={style} />
}
export const defaultSquare = {
	...defaultObject,
	center: null, // A Vector.
	side: 10,
}

// Arc draws an arc (part of a circle) from a given position (center) with a given radius, startAngle and endAngle. Angles are measured in radians with the rightmost point being zero, clockwise positive.
export function Arc(props) {
	// Check input.
	let { position, radius, startAngle, endAngle, className, style } = processOptions(props, defaultArc)
	position = ensureVector(position, 2)
	radius = ensureNumber(radius)
	startAngle = ensureNumber(startAngle)
	endAngle = ensureNumber(endAngle)
	className = ensureString(className)
	style = ensureObject(style)

	// Draw the arc.
	return <path className={className} style={style} d={getArcPath(position, radius, startAngle, endAngle)} />
}
export const defaultArc = {
	...defaultObject,
	position: Vector.zero,
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
export function Distance(props) {
	let { positionedVector, className } = processOptions(props, defaultDistance)
	positionedVector = ensurePositionedVector(positionedVector)
	return <Line {...filterOptions(props, defaultLine)} points={[positionedVector.start, positionedVector.end]} className={clsx(className, 'distance')} />
}
const defaultDistance = {
	...defaultObject,
	positionedVector: null,
	className: 'distance',
}
