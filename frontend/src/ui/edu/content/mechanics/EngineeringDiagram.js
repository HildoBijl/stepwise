// Plot is the parent component of every plot made. It gives options to generate various kinds of plots.

import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { line } from 'd3-shape'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureBoolean, processOptions, filterOptions } from 'step-wise/util/objects'
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
		lines: d3svg.append('g').attr('class', 'lines'),
		distances: d3svg.append('g').attr('class', 'distances'),
		forces: d3svg.append('g').attr('class', 'forces'),
		moments: d3svg.append('g').attr('class', 'moments'),
		beams: d3svg.append('g').attr('class', 'beams'),
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
	radius: 30,
	opening: 0, // The position of the opening in radians, measured clockwise from left.
	spread: 3 / 2 * Math.PI, // Which angle (part of the circle) is drawn? Usually we take three quarters of a circle.
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
	let { size, strutSize, color, style } = processOptions(options, defaultBeamOptions)
	size = ensureNumber(size)
	strutSize = ensureNumber(strutSize)

	// Make a group.
	const group = container.append('g').attr('class', 'beam')
	applyStyle(container, style)

	// Draw the corner struts.
	points.forEach((point, index) => {
		if (index === 0 || index === points.length - 1)
			return
		const prev = points[index - 1].subtract(point).unitVector().multiply(strutSize).add(point)
		const next = points[index + 1].subtract(point).unitVector().multiply(strutSize).add(point)
		drawLine(group, [prev, point, next], { fill: color, 'stroke-width': 0 })
	})

	// Draw a line for the beam.
	drawLine(group, points, { stroke: color, 'stroke-width': size }).attr('class', 'beamLine')

	// All done! Return the result.
	return group
}
const defaultBeamOptions = {
	size: 6,
	strutSize: 15,
	color: 'black',
	style: {},
}

/*
 * Below are various supporting functions.
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