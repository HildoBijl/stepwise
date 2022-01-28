import React from 'react'
import clsx from 'clsx'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureObject, processOptions, filterOptions } from 'step-wise/util/objects'
import { Vector, ensureVector, ensureVectorArray, ensurePositionedVector } from 'step-wise/CAS/linearAlgebra'

import { defaultObject } from './groups'

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
	position: Vector.zero2D,
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