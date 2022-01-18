// Plot is the parent component of every plot made. It gives options to generate various kinds of plots.

import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { line } from 'd3-shape'

import { ensureInt, ensureNumber } from 'step-wise/util/numbers'
import { ensureBoolean, ensureObject, processOptions, filterOptions } from 'step-wise/util/objects'
import { repeat } from 'step-wise/util/functions'
import { Vector, ensureVector, ensureSVE } from 'step-wise/CAS/linearAlgebra/Vector'

import Drawing, { defaultOptions as drawingDefaultOptions, applyStyle } from '../../../components/figures/Drawing'

const defaultOptions = {
	...drawingDefaultOptions,
}
export { defaultOptions }

const defaultPlotProperties = {}

const useStyles = makeStyles((theme) => ({
	engineeringDiagram: {
		'& svg': {
			'& .line, & .distance': {
				fill: 'none',
				stroke: 'black',
				'stroke-width': 1,
			},
			'& .distance': {
				'marker-start': 'url(#distanceArrowHead)',
				'marker-end': 'url(#distanceArrowHead)',
			},
			'& .forceLine': {
				fill: 'none',
			},
			'& .momentLine': {
				fill: 'none',
			},
			'& .arrowHead': {
				fill: 'black',
				'stroke-width': 0,
			},
			'& .beamLine': {
				fill: 'none',
			},
			'& .beamStrut': {
				'stroke-width': 0,
			},
			'& .supportTriangle': {
				fill: 'white',
			},
			'& .supportBlock': {
				'stroke-width': 0,
			},
			'& .wheel': {
				'stroke-width': 0,
			},
		},
	},
}))

export function EngineeringDiagram(options, ref) {
	options = processOptions(options, defaultOptions)
	const classes = useStyles()

	// Set up refs and make them accessible to any implementing component.
	const drawingRef = useRef() // This will be the link to the drawing.
	const diagramRef = useRef() // This will contain all data for this diagram.
	useImperativeHandle(ref, () => ({
		get drawing() {
			return diagramRef.current.drawing
		},

		// Line/arrow drawing functions.
		drawLine(line, style) {
			return drawLine(diagramRef.current.groups.lines, line, style)
		},
		drawDistance(distance, style) {
			return drawDistance(diagramRef.current.groups.distances, distance, style)
		},
		drawForce(force, options) {
			return drawForce(diagramRef.current.groups.forces, force, options)
		},
		drawMoment(moment, options) {
			return drawMoment(diagramRef.current.groups.moments, moment, options)
		},

		// Structure drawing functions.
		drawBeam(points, options) {
			return drawBeam(diagramRef.current.groups.beams, points, options)
		},
		drawHinge(position, options) {
			return drawHinge(diagramRef.current.groups.connections, position, options)
		},
		drawFixedSupport(position, options) {
			return drawFixedSupport(diagramRef.current.groups.supports, position, options)
		},
		drawHingeSupport(position, options) {
			return drawHingeSupport(diagramRef.current.groups.supports, position, options)
		},
		drawRollerSupport(position, options) {
			return drawRollerSupport(diagramRef.current.groups.supports, position, options)
		},
		drawRollerHingeSupport(position, options) {
			return drawRollerHingeSupport(diagramRef.current.groups.supports, position, options)
		},
	}))

	// Initialize the diagram object once the drawing is loaded.
	useEffect(() => {
		if (drawingRef.current && !diagramRef.current)
			diagramRef.current = initialize(drawingRef.current)
	}, [drawingRef, diagramRef])

	// Render the drawing.
	options.className = clsx('engineeringDiagram', classes.engineeringDiagram, options.className)
	return <Drawing ref={drawingRef} {...filterOptions(options, drawingDefaultOptions)} />
}
export default forwardRef(EngineeringDiagram)

function initialize(drawing) {
	// Get properties from the drawing.
	const { d3svg } = drawing

	// Add definitions for markers. For the definition, assume the line points to the right and ends at refX, refY.
	drawing.addDef([
		<marker id="distanceArrowHead" key="distanceArrowHead" markerWidth="16" markerHeight="16" refX="16" refY="8" orient="auto-start-reverse">
			<polygon points="16 8, 0 0, 10 8, 0 16" />
		</marker>,
		<marker id="forceArrowHead" key="forceArrowHead" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto-start-reverse">
			<polygon points="8 4, 0 0, 2 4, 0 8" />
		</marker>
	])

	// Build up the SVG with the most important containers.
	const groups = {
		beams: d3svg.append('g').attr('class', 'beams'),
		supports: d3svg.append('g').attr('class', 'supports'),
		connections: d3svg.append('g').attr('class', 'connections'),
		lines: d3svg.append('g').attr('class', 'lines'),
		distances: d3svg.append('g').attr('class', 'distances'),
		forces: d3svg.append('g').attr('class', 'forces'),
		moments: d3svg.append('g').attr('class', 'moments'),
	}

	// Store all containers and draw the plot for as much as we can.
	return { ...defaultPlotProperties, drawing, groups }
}

/*
 * Below are various line/arrow drawing functions.
 */

// drawLine draws a line from the given lineData (a start-vector-end combination) and an optional style object.
function drawLine(container, points, style = {}) {
	// Process the input.
	if (!Array.isArray(points))
		throw new Error(`Invalid line points: expected an array of points but received a parameter of type "${typeof points}".`)
	points = points.map(point => ensureVector(point, 2))

	// Set up the line and shape it.
	const path = container
		.append('path')
		.attr('d', line()(points.map(point => [point.x, point.y])))
		.attr('class', 'line')

	// Apply style.
	return applyStyle(path, style)
}

// drawDistance draws a distance spread. It must be an object with a start, vector and end parameter (well, two out of these three) given in Vector form.
function drawDistance(container, distance, style = {}) {
	distance = ensureSVE(distance)
	return drawLine(container, [distance.start, distance.end], style).attr('class', 'distance')
}

// drawForce draws a force vector. It must be an object with a start, vector and end parameter (well, two out of these three) given in Vector form.
function drawForce(container, force, options = {}) {
	// Check input.
	const { start, vector, end } = ensureSVE(force)
	let { size, color, style } = processOptions(options, defaultForceOptions)
	size = ensureNumber(size)

	// Make a group.
	const group = container.append('g').attr('class', 'force')
	applyStyle(container, style)

	// Draw a line for the force. Make sure to shorten the force a bit so its ending falls inside the arrow head.
	const vectorShortened = vector.shorten(size)
	const endShortened = start.add(vectorShortened)
	drawLine(group, [start, endShortened], { stroke: color, 'stroke-width': size }).attr('class', 'forceLine')

	// Draw the arrow head with the proper orientation.
	drawArrowHead(group, end, vector.argument, size, { fill: color })

	// All done! Return the result.
	return group
}
const defaultForceOptions = {
	size: 4,
	color: 'black',
	style: {},
}

// drawArrowHead draws an arrowhead in the given container at the given position and with the given angle. It can also be sized up and styled further.
function drawArrowHead(container, position, angle = 0, size = defaultArrowHeadSize, style = {}) {
	// Check input.
	position = ensureVector(position, 2)
	angle = ensureNumber(angle)
	size = ensureNumber(size)

	// Draw the arrow head shape and position it.
	const arrowHead = container
		.append('polygon')
		.attr('points', '0 0, -24 -12, -16 0, -24 12')
		.attr('class', 'arrowHead')
		.attr('transform', `translate(${position.x}, ${position.y}) rotate(${angle * 180 / Math.PI}) scale(${size / defaultArrowHeadSize})`)

	// Add any potentially given style.
	return applyStyle(arrowHead, style)
}
const defaultArrowHeadSize = defaultForceOptions.size

// drawMoment draws a moment vector. The moment must have a position property (a Vector) and a clockwise property (boolean), both mandatory. The options (all optional) include the color, the size (thickness of the line), the radius, the opening (the angle where the opening is in the moment arrow, by default being 0 which means to the right) and the spread (how large the circle arc is). The options can also contain an extra style parameter to be applied.
function drawMoment(container, moment, options = {}) {
	// Check input.
	let { position, clockwise } = processOptions(moment, defaultMoment)
	position = ensureVector(position, 2)
	clockwise = ensureBoolean(clockwise)
	let { size, color, style, opening, radius, spread, arrowHeadDelta } = processOptions(options, defaultMomentOptions)
	size = ensureNumber(size)
	radius = ensureNumber(radius)
	opening = ensureNumber(opening)
	spread = ensureNumber(spread)
	arrowHeadDelta = ensureNumber(arrowHeadDelta)

	// Make a group.
	const group = container.append('g').attr('class', 'moment')
	applyStyle(container, style)

	// Draw an arc for the moment.
	const factor = (clockwise ? 1 : -1)
	const startAngle = opening + factor * (2 * Math.PI - spread) / 2
	const endAngle = startAngle + factor * spread
	const endAngleShortened = endAngle - 2 * factor * size / radius // Shorten the line to prevent passing by the arrow head.
	const arcPath = getArcPath(position, radius, startAngle, endAngleShortened)
	const path = group.append('path').attr('d', arcPath).attr('class', 'momentLine')
	applyStyle(path, { stroke: color, 'stroke-width': size })

	// Draw the arrow head with the proper orientation.
	const arrowHeadAngle = endAngle + factor * (Math.PI / 2 - arrowHeadDelta * size / radius)
	const arrowHeadPosition = position.add(Vector.fromPolar(radius, endAngle))
	drawArrowHead(group, arrowHeadPosition, arrowHeadAngle, size, { fill: color })

	// All done! Return the result.
	return group
}
const defaultMoment = {
	position: undefined,
	clockwise: false,
}
const defaultMomentOptions = {
	...defaultForceOptions,
	radius: 25,
	opening: 0, // The position of the opening in radians, measured clockwise from left.
	spread: 7 / 4 * Math.PI, // Which angle (part of the circle) is drawn? Usually we take three quarters of a circle.
	arrowHeadDelta: 2.5, // The angle of the arrow head is manually adjusted to make it look OK. This factor is responsible. Increase or decrease it at will.
}

/*
 * Below are drawing functions for structures.
 */

function drawBeam(container, points, options = {}) {
	// Check input.
	if (!Array.isArray(points))
		throw new Error(`Invalid beam points: expected an array of points but received a parameter of type "${typeof points}".`)
	points = points.map(point => ensureVector(point, 2))
	let { thickness, strutSize, strutOpacity, color, style } = processOptions(options, defaultBeamOptions)
	thickness = ensureNumber(thickness)
	strutSize = ensureNumber(strutSize)
	strutOpacity = ensureNumber(strutOpacity)

	// Make a group.
	const group = container.append('g').attr('class', 'beam')
	applyStyle(container, style)

	// Draw the corner struts.
	points.forEach((point, index) => {
		if (index > 0 && index < points.length - 1) {
			const prev = points[index - 1].subtract(point).unitVector().multiply(strutSize).add(point)
			const next = points[index + 1].subtract(point).unitVector().multiply(strutSize).add(point)
			drawLine(group, [point, next, prev, point], { fill: color, opacity: strutOpacity }).attr('class', 'beamStrut')
		}
	})

	// Draw a line for the beam.
	drawLine(group, points, { stroke: color, 'stroke-width': thickness }).attr('class', 'beamLine')

	// All done! Return the result.
	return group
}
const defaultBeamOptions = {
	thickness: 4,
	strutSize: 12,
	strutOpacity: 0.75,
	color: 'black',
	style: {},
}

function drawHinge(container, position, options = {}) {
	// Check input.
	position = ensureVector(position, 2)
	let { radius, thickness, color, style } = processOptions(options, defaultHingeOptions)
	radius = ensureNumber(radius)
	thickness = ensureNumber(thickness)
	style = ensureObject(style)

	// Set up the circle and shape it.
	const path = container
		.append('circle')
		.attr('cx', position.x)
		.attr('cy', position.y)
		.attr('r', radius)
		.attr('class', 'hinge')

	// Apply style.
	return applyStyle(path, { ...defaultHingeOptions.style, ...style, stroke: color, 'stroke-width': thickness })
}
const defaultHingeOptions = {
	radius: 6,
	thickness: 2,
	color: defaultBeamOptions.color,
	style: {
		fill: 'white',
	},
}

function drawFixedSupport(container, position, options = {}) {
	// Check input.
	position = ensureVector(position, 2)
	let { angle, color, thickness, height, width, positionFactor, groundOptions } = processOptions(options, defaultFixedSupportOptions)
	angle = ensureNumber(angle)
	thickness = ensureNumber(thickness)
	height = ensureNumber(height)
	width = ensureNumber(width)
	positionFactor = ensureNumber(positionFactor)
	groundOptions = ensureObject(groundOptions)

	// Make a group and position it appropriately.
	const group = getPositionedGroup(container, position, angle).attr('class', 'support fixedSupport')

	// Draw the required parts.
	drawSupportBlock(group, new Vector(0, height * positionFactor), { width: width, height: height, color })
	drawGround(group, new Vector(0, height * (1 / 2 + positionFactor)), { color, thickness, ...groundOptions })

	// All done! Return the result.
	return group
}
const defaultFixedSupportOptions = {
	angle: Math.PI / 2,
	color: defaultBeamOptions.color,
	thickness: defaultHingeOptions.thickness,
	height: 6,
	width: 36,
	positionFactor: 1 / 6, // The position factor determines how much above the middle of the rectangle the incoming beam is positioned, as a part of the full rectangle height.
	groundOptions: {},
}

function drawHingeSupport(container, position, options = {}) {
	// Check input.
	position = ensureVector(position, 2)
	let { angle, height, width, color, thickness, groundOptions } = processOptions(options, defaultHingeSupportOptions)
	angle = ensureNumber(angle)
	height = ensureNumber(height)
	width = ensureNumber(width)
	thickness = ensureNumber(thickness)
	groundOptions = ensureObject(groundOptions)

	// Make a group and position it appropriately.
	const group = getPositionedGroup(container, position, angle).attr('class', 'support fixedSupport')

	// Draw the required parts.
	drawSupportTriangle(group, new Vector(0, 0), { height, width, color, thickness })
	drawGround(group, new Vector(0, height), { color, thickness, ...groundOptions })
	drawHinge(group, new Vector(0, 0), { color, thickness })

	// All done! Return the result.
	return group
}
const defaultHingeSupportOptions = {
	angle: defaultFixedSupportOptions.angle,
	height: 20,
	width: 32,
	color: defaultBeamOptions.color,
	thickness: defaultHingeOptions.thickness,
	groundOptions: {},
}

function drawRollerSupport(container, position, options = {}) {
	// Check input.
	position = ensureVector(position, 2)
	let { angle, color, thickness, height, width, positionFactor, groundOptions, numWheels, wheelRadius, wheelOptions } = processOptions(options, defaultRollerSupportOptions)
	angle = ensureNumber(angle)
	thickness = ensureNumber(thickness)
	height = ensureNumber(height)
	width = ensureNumber(width)
	positionFactor = ensureNumber(positionFactor)
	groundOptions = ensureObject(groundOptions)
	numWheels = ensureInt(numWheels, true, true)
	wheelRadius = ensureNumber(wheelRadius)
	wheelOptions = ensureObject(wheelOptions)

	// Make a group and position it appropriately.
	const group = getPositionedGroup(container, position, angle).attr('class', 'support rollerSupport')

	// Draw the required parts.
	drawGround(group, new Vector(0, height * (1 / 2 + positionFactor) + 2 * wheelRadius + thickness / 2), { color, thickness, ...groundOptions })
	drawSupportBlock(group, new Vector(0, height * positionFactor), { width: width, height: height, color })
	drawWheels(group, new Vector(0, height * (1 / 2 + positionFactor) + wheelRadius), { numWheels, wheelRadius, color, ...wheelOptions })

	// All done! Return the result.
	return group
}
const defaultRollerSupportOptions = {
	...defaultFixedSupportOptions,
	wheelRadius: 4,
	numWheels: 4,
	wheelOptions: {},
}

function drawRollerHingeSupport(container, position, options = {}) {
	// Check input.
	position = ensureVector(position, 2)
	let { angle, height, width, color, thickness, groundOptions, numWheels, wheelRadius, wheelOptions } = processOptions(options, defaultRollerHingeSupportOptions)
	angle = ensureNumber(angle)
	height = ensureNumber(height)
	width = ensureNumber(width)
	thickness = ensureNumber(thickness)
	groundOptions = ensureObject(groundOptions)
	numWheels = ensureInt(numWheels, true, true)
	wheelRadius = ensureNumber(wheelRadius)
	wheelOptions = ensureObject(wheelOptions)

	// Make a group and position it appropriately.
	const group = getPositionedGroup(container, position, angle).attr('class', 'support rollerHingeSupport')

	// Draw the required parts.
	drawGround(group, new Vector(0, height + 2 * wheelRadius + thickness), { color, thickness, ...groundOptions })
	drawSupportTriangle(group, new Vector(0, 0), { height, width, color, thickness })
	drawWheels(group, new Vector(0, height + wheelRadius + thickness / 2), { numWheels, wheelRadius, color, ...wheelOptions })
	drawHinge(group, new Vector(0, 0), { color, thickness })

	// All done! Return the result.
	return group
}
const defaultRollerHingeSupportOptions = {
	...defaultHingeSupportOptions,
	numWheels: defaultRollerSupportOptions.numWheels,
	wheelRadius: defaultRollerSupportOptions.wheelRadius,
	wheelOptions: {},
}

/*
 * Below are support functions for drawing parts of structures.
 */

function getPositionedGroup(container, position, angle) {
	return container.append('g').attr('transform', `translate(${position.x}, ${position.y}) rotate(${angle * 180 / Math.PI - 90})`) // Subtract 90 degrees because by default we draw parts for a horizontal ground, which is an angle of 90 degrees. (Angles are defined such that the right is zero degrees and clockwise counts positive.)
}

function drawGround(container, position, options = {}) {
	// Check input.
	position = ensureVector(position, 2)
	let { thickness, height, width, rectangleOpacity, color } = processOptions(options, defaultGroundOptions)
	thickness = ensureNumber(thickness)
	height = ensureNumber(height)
	width = ensureNumber(width)
	rectangleOpacity = ensureNumber(rectangleOpacity)

	// Make a group.
	const group = container.append('g')
		.attr('class', 'ground')
		.attr('transform', `translate(${position.x}, ${position.y})`)

	// Draw the filled ground rectangle. Coordinates are for the ninety degree angle, having a horizontal ground.
	group.append('rect')
		.attr('x', -width / 2)
		.attr('y', 0)
		.attr('width', width)
		.attr('height', height)
		.style('fill', color)
		.style('opacity', rectangleOpacity)

	// Draw the ground line.
	drawLine(group, [new Vector(-width / 2, 0), new Vector(width / 2, 0)], { stroke: color, 'stroke-width': thickness })

	// All done! Return the result.
	return group
}
const defaultGroundOptions = {
	thickness: defaultHingeOptions.thickness,
	height: 12,
	width: 50,
	rectangleOpacity: 0.4,
	color: defaultHingeOptions.color,
}

function drawSupportTriangle(container, position, options = {}) {
	// Check input.
	position = ensureVector(position, 2)
	let { thickness, height, width, color } = processOptions(options, defaultSupportTriangleOptions)
	thickness = ensureNumber(thickness)
	height = ensureNumber(height)
	width = ensureNumber(width)

	// Draw the triangle.
	return container.append('polygon')
		.attr('points', `0 0, ${-width / 2} ${height}, ${width / 2} ${height}`)
		.attr('class', 'supportTriangle')
		.attr('transform', `translate(${position.x}, ${position.y})`)
		.style('stroke', color)
		.style('stroke-width', thickness)
}
const defaultSupportTriangleOptions = {
	thickness: defaultHingeOptions.thickness,
	height: defaultHingeOptions.height,
	width: defaultHingeOptions.width,
	color: defaultHingeOptions.color,
}

function drawSupportBlock(container, position, options = {}) {
	// Check input.
	position = ensureVector(position, 2)
	let { height, width, color } = processOptions(options, defaultSupportBlockOptions)
	height = ensureNumber(height)
	width = ensureNumber(width)

	// Draw the support block.
	return container.append('rect')
		.attr('x', -width / 2)
		.attr('y', -height / 2)
		.attr('width', width)
		.attr('height', height)
		.attr('class', 'supportBlock')
		.attr('transform', `translate(${position.x}, ${position.y})`)
		.style('fill', color)
}
const defaultSupportBlockOptions = {
	color: defaultBeamOptions.color,
	width: defaultFixedSupportOptions.blockWidth,
	height: defaultFixedSupportOptions.blockHeight,
}

function drawWheels(container, position, options = {}) {
	// Check input.
	position = ensureVector(position, 2)
	let { numWheels, wheelRadius, color } = processOptions(options, defaultWheelsOptions)
	numWheels = ensureInt(numWheels, true, true)
	wheelRadius = ensureNumber(wheelRadius)

	// Make the container for the wheels.
	const wheels = container.append('g')
		.attr('class', 'wheels')
		.attr('transform', `translate(${position.x}, ${position.y})`)

	// Add every individual wheel.
	repeat(numWheels, (index) => {
		wheels.append('circle')
			.attr('cx', (2 * index + 1 - numWheels) * wheelRadius)
			.attr('cy', 0)
			.attr('r', wheelRadius)
			.attr('class', 'wheel')
			.style('fill', color)
	})

	// All done! Return the container.
	return wheels
}
const defaultWheelsOptions = {
	numWheels: defaultRollerSupportOptions.numWheels,
	wheelRadius: defaultRollerSupportOptions.wheelRadius,
	color: defaultBeamOptions.color,
}

/*
 * Below are various SVG-supporting functions.
 */

// getArcPath takes a circle center (a Vector), a radius, a start angle and an end angle, and gives the SVG path string that makes this path. For angles, the right is taken as zero and clockwise is taken as positive.
function getArcPath(center, radius, startAngle, endAngle) {
	// Determine arc start and end.
	const start = center.add(Vector.fromPolar(radius, startAngle))
	const end = center.add(Vector.fromPolar(radius, endAngle))

	// Determine the flags needed by SVG.
	const largeArcFlag = Math.abs(endAngle - startAngle) <= Math.PI ? '0' : '1'
	const sweepFlag = endAngle < startAngle ? '0' : '1'

	// Set up the path.
	return `M${start.x} ${start.y} A${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`
}