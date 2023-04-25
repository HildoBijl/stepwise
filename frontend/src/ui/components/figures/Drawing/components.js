import React, { forwardRef } from 'react'
import clsx from 'clsx'

import { ensureNumber, mod } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { firstOf, lastOf } from 'step-wise/util/arrays'
import { repeat } from 'step-wise/util/functions'
import { ensureBoolean, ensureObject, processOptions, filterOptions, filterProperties, removeProperties } from 'step-wise/util/objects'
import { Vector, ensureVector, ensureVectorArray, ensureCorner, Span, ensureSpan, Rectangle as GeometryRectangle, ensureRectangle as ensureGeometryRectangle, Line as GeometryLine, ensureLine as ensureGeometryLine } from 'step-wise/geometry'

import { useEnsureRef, useEventListeners } from 'util/react'

import { useDrawingId, useGraphicalBounds, useTransformedOrGraphicalValue, useScaledOrGraphicalValue } from './DrawingContext'

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
	let { position, graphicalPosition, shift, graphicalShift, rotate, scale, overflow, className, style, children } = processOptions(props, defaultGroup)
	position = ensureVector(useTransformedOrGraphicalValue(position, graphicalPosition), 2)
	shift = ensureVector(useTransformedOrGraphicalValue(shift, graphicalShift, true), 2)
	rotate = ensureNumber(rotate)
	scale = ensureNumber(scale)
	overflow = ensureBoolean(overflow)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the group with the right transform property.
	const drawingId = useDrawingId()
	return <g ref={ref} className={className} style={{
		...style,
		clipPath: overflow ? '' : `url(#noOverflow${drawingId})`,
		transform: `translate(${position.x + shift.x}px, ${position.y + shift.y}px) rotate(${rotate * 180 / Math.PI}deg) scale(${scale}) ${style.transform || ''}`,
	}}>{children}</g>
})
const defaultGroup = {
	...defaultObject,
	position: undefined,
	graphicalPosition: Vector.zero,
	shift: undefined,
	graphicalShift: Vector.zero,
	rotate: 0,
	scale: 1,
	overflow: true,
	children: null,
}

// Line draws a line from the given points array and an optional style object.
export const Line = forwardRef((props, ref) => {
	// Process the input.
	let { points, graphicalPoints, close, className, style } = processOptions(props, defaultLine)
	points = ensureVectorArray(useTransformedOrGraphicalValue(points, graphicalPoints), 2)
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
	points: undefined,
	graphicalPoints: [],
	close: false,
}

// getPointSvg takes a point and displays its coordinates.
export function getPointSvg(point) {
	return `${point.x} ${point.y}`
}

// getLinePath takes an array of points and turns it into an SVG line string.
export function getLinePath(points, close) {
	return `M${points.map(getPointSvg).join(' L')}${close ? ' Z' : ''}`
}

// Curve draws a smooth curve along/through a set of points. Parameters include the curve part (0 means straight, 1 means maximally curved) or the spread of the curve (similar to curve radius). With the "through" parameter it can be determined whether the curve should go through the points or only along them.
export const Curve = forwardRef((props, ref) => {
	// Process the input.
	let { points, graphicalPoints, spread, graphicalSpread, part, through, close, className, style } = processOptions(props, defaultCurve)
	points = ensureVectorArray(useTransformedOrGraphicalValue(points, graphicalPoints), 2)
	spread = useScaledOrGraphicalValue(spread, graphicalSpread)
	part = ensureNumber(part)
	through = ensureBoolean(through)
	close = ensureBoolean(close)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the line.
	const path = (through ? getCurvePathThrough : getCurvePathAlong)(points, close, part, spread)
	return <path ref={ref} className={className} style={style} d={path} {...filterEventHandlers(props)} />
})
export const defaultCurve = {
	...defaultLine,
	className: 'curve',
	through: true,
	spread: undefined,
	graphicalSpread: undefined,
	part: 1,
}

// getCurvePathAlong takes an array of points and turns it into an SVG curve string by smoothly going along (but not through) the points.
export function getCurvePathAlong(points, close, part, spread) {
	// Filter out duplicate points.
	points = points.filter((point, index) => index === 0 || !point.equals(points[index - 1]))

	// On a closed path, add the start to the end of the points list.
	if (close && !firstOf(points).equals(lastOf(points)))
		points = [...points, firstOf(points)]

	// Walk through the line segments and get the connecting points.
	const lines = repeat(points.length - 1, index => {
		const start = points[index]
		const end = points[index + 1]
		if (spread !== undefined) {
			const distance = start.subtract(end).magnitude
			const factor = Math.min(spread / distance, 0.5)
			return [start.interpolate(end, factor), end.interpolate(start, factor)]
		}
		return [start.interpolate(end, part / 2), end.interpolate(start, part / 2)]
	})

	// For a non-closed curve, ensure that the first and last points are the starting and ending points.
	if (!close) {
		lines[0][0] = firstOf(points)
		lines[lines.length - 1][1] = lastOf(points)
	}

	// Walk through the line segments and set up SVG.
	let svg = `M${getPointSvg(firstOf(lines)[0])}`
	repeat(lines.length, index => {
		// Set up the SVG for the line. If this is the last line segment, return it.
		const line = lines[index]
		const lineSvg = `L${getPointSvg(line[1])}` // Line to the end.
		if (index === lines.length - 1 && !close) {
			svg += lineSvg
			return
		}

		// Merge together with the SVG for the subsequent curve.
		const cornerPoint = points[index + 1]
		const nextLine = lines[(index + 1) % lines.length]
		const curveSvg = `Q${getPointSvg(cornerPoint)} ${getPointSvg(nextLine[0])}`
		svg += `${lineSvg}${curveSvg}`
	})
	return svg
}

// getCurvePathThrough takes an array of points and turns it into an SVG curve string by smoothly going through the points.
export function getCurvePathThrough(points, close, part, spread) {
	// Filter out duplicate points.
	points = points.filter((point, index) => index === 0 || !point.equals(points[index - 1]))

	// For each point, calculate control points.
	const controlPoints = points.map((point, index) => {
		// For the starting/ending point, do not add control points.
		if (!close && (index === 0 || index === points.length - 1))
			return [point, point]

		// Find the control direction: the direction which the forward-pointing control point must be positioned.
		const prevPoint = points[mod(index - 1, points.length)]
		const nextPoint = points[mod(index + 1, points.length)]
		const prevRelative = prevPoint.subtract(point)
		const nextRelative = nextPoint.subtract(point)
		let controlDirection = nextRelative.normalize().subtract(prevRelative.normalize())

		// Check a special case: there's a 180 degree angle.
		if (controlDirection.magnitude === 0)
			return [point, point]
		controlDirection = controlDirection.normalize()

		// On a spread, apply the control points with the given distance.
		if (spread !== undefined) {
			const relativeControlPoint = controlDirection.multiply(spread)
			return [point.subtract(relativeControlPoint), point.add(relativeControlPoint)]
		}

		// On a part, project the relative vector onto the control direction vector.
		return [point.add(prevRelative.getProjectionOn(controlDirection).multiply(part / 2)), point.add(nextRelative.getProjectionOn(controlDirection).multiply(part / 2))]
	})

	// Apply the control points: walk through the line segments and use them one by one.
	let svg = `M${getPointSvg(firstOf(points))}`
	repeat(points.length - (close ? 0 : 1), index => {
		const nextIndex = mod(index + 1, points.length)
		const controlPoint1 = controlPoints[index][1]
		const controlPoint2 = controlPoints[nextIndex][0]
		const endPoint = points[nextIndex]
		svg += `C${getPointSvg(controlPoint1)} ${getPointSvg(controlPoint2)} ${getPointSvg(endPoint)}`
	})
	return svg
}

// Polygon draws a polygon. It is effectively a closed Line.
export const Polygon = forwardRef((props, ref) => {
	return <Line {...props} close={true} />
})

// Circle draws a circle. It can be given a radius (in drawing coordinate distance, which will be scaled) or a graphicalRadius (in graphical coordinates).
export const Circle = forwardRef((props, ref) => {
	// Process the input.
	let { center, graphicalCenter, radius, graphicalRadius, className, style } = processOptions(props, defaultCircle)
	center = ensureVector(useTransformedOrGraphicalValue(center, graphicalCenter), 2)
	radius = ensureNumber(useScaledOrGraphicalValue(radius, graphicalRadius), true)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the circle.
	return <circle ref={ref} cx={center.x} cy={center.y} r={radius} className={className} style={style} {...filterEventHandlers(props)} />
})
export const defaultCircle = {
	...defaultObject,
	center: undefined,
	graphicalCenter: Vector.zero,
	radius: undefined,
	graphicalRadius: 20,
}

export const Rectangle = forwardRef((props, ref) => {
	// Process the input.
	let { dimensions, graphicalDimensions, cornerRadius, graphicalCornerRadius, className, style } = processOptions(props, defaultRectangle)
	dimensions = ensureGeometryRectangle(useTransformedOrGraphicalValue(dimensions, graphicalDimensions), 2)
	cornerRadius = ensureNumber(useScaledOrGraphicalValue(cornerRadius, graphicalCornerRadius))
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the circle.
	const { start, vector, end } = dimensions
	return <rect ref={ref} x={Math.min(start.x, end.x)} y={Math.min(start.y, end.y)} width={Math.abs(vector.x)} height={Math.abs(vector.y)} rx={cornerRadius} className={className} style={style} {...filterEventHandlers(props)} />
})
export const defaultRectangle = {
	...defaultObject,
	dimensions: undefined, // A Span.
	graphicalDimensions: new GeometryRectangle({ start: Vector.zero, end: new Vector(100, 50) }),
	cornerRadius: undefined,
	graphicalCornerRadius: 0,
}

export const Square = forwardRef((props, ref) => {
	// Process the input.
	let { center, graphicalCenter, side, graphicalSide, className, style } = processOptions(props, defaultSquare)
	center = ensureVector(useTransformedOrGraphicalValue(center, graphicalCenter), 2)
	side = useScaledOrGraphicalValue(side, graphicalSide)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the square.
	return <rect ref={ref} x={center.x - side / 2} y={center.y - side / 2} width={side} height={side} className={className} style={style} {...filterEventHandlers(props)} />
})
export const defaultSquare = {
	...defaultObject,
	center: undefined,
	graphicalCenter: Vector.zero,
	side: undefined,
	graphicalSide: 20,
}

// Arc draws an arc (part of a circle) from a given position (center) with a given radius, startAngle and endAngle. Angles are measured in radians with the rightmost point being zero, clockwise positive.
export const Arc = forwardRef((props, ref) => {
	// Check input.
	let { center, graphicalCenter, radius, graphicalRadius, startAngle, endAngle, className, style } = processOptions(props, defaultArc)
	center = ensureVector(useTransformedOrGraphicalValue(center, graphicalCenter), 2)
	radius = useScaledOrGraphicalValue(radius, graphicalRadius)
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
	center: undefined,
	graphicalCenter: Vector.zero,
	radius: undefined,
	graphicalRadius: 50,
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

// Distance renders a distance spread. The given distance object must have a "span" parameter, which is a Span object: an object with a start, vector and/or end (two out of the three). It assumes the arrow heads will be added through the distance class and the SVG style definitions.
export const Distance = forwardRef((props, ref) => {
	// Process the input.
	let { span, graphicalSpan, shift, graphicalShift, className } = processOptions(props, defaultDistance)
	span = ensureSpan(useTransformedOrGraphicalValue(span, graphicalSpan), 2)
	shift = ensureVector(useTransformedOrGraphicalValue(shift, graphicalShift, true), 2)
	className = ensureString(className)
	ref = useRefWithEventHandlers(props, ref)

	// Render the line with the appropriate style. Enfore that the className is used, because this adds the arrow spread.
	span = span.add(shift)
	return <Line ref={ref} {...filterOptions(props, defaultLine)} graphicalPoints={[span.start, span.end]} className={clsx(className, className === defaultDistance.className ? '' : defaultDistance.className)} />
})
const defaultDistance = {
	...defaultObject,
	span: undefined,
	graphicalSpan: new Span({ start: Vector.zero, end: new Vector(100, 0) }),
	shift: undefined,
	graphicalShift: Vector.zero,
	className: 'distance',
}

// BoundedLine takes a line object and bounds it to the bounds of the drawing. It then draws it similarly to a regular line.
export const BoundedLine = forwardRef((props, ref) => {
	// Process the input.
	let { line, graphicalLine } = processOptions(props, defaultBoundedLine)
	line = ensureGeometryLine(useTransformedOrGraphicalValue(line, graphicalLine), 2)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the line part and display it.
	const bounds = useGraphicalBounds()
	const linePart = bounds?.getLinePart(line)
	return linePart ? <Line ref={ref} {...filterOptions(props, defaultLine)} graphicalPoints={[linePart.start, linePart.end]} /> : null
})
const defaultBoundedLine = {
	...defaultObject,
	line: undefined,
	graphicalLine: GeometryLine.fromPoints(Vector.zero, Vector.i),
	className: 'line',
}

// RightAngle renders a right-angle marker of two lines. It expects three points that form said angle, in which the middle one is the one at which the angle should be drawn. Also a size parameter can be given.
export const RightAngle = forwardRef((props, ref) => {
	// Process the input.
	let { points, graphicalPoints, size, graphicalSize } = processOptions(props, defaultRightAngle)
	points = ensureCorner(useTransformedOrGraphicalValue(points, graphicalPoints), 2)
	if (points.length !== 3)
		throw new Error(`Invalid RightAngle points: expected exactly three points, of which the middle one is the given corner, but received ${points.length} points.`)
	size = useScaledOrGraphicalValue(size, graphicalSize)
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
	return <Line ref={ref} {...filterOptions(removeProperties(props, 'points'), defaultLine)} graphicalPoints={anglePoints} />
})
const defaultRightAngle = {
	...defaultObject,
	points: undefined,
	graphicalPoints: [Vector.i, Vector.zero, Vector.j],
	className: 'rightAngle',
	size: undefined,
	graphicalSize: 12,
}
