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

		// Arrow drawing functions.
		drawLine(line, style) {
			return drawLine(diagramRef.current, line, style)
		},
		drawDistance(distance, style) {
			return drawDistance(diagramRef.current, distance, style)
		},
		drawForce(force, options) {
			return drawForce(diagramRef.current, force, options)
		},
		drawMoment(moment, options) {
			return drawMoment(diagramRef.current, moment, options)
		},

		// Shape drawing functions.
		clearShapes() { // TODO: Do we need to keep this?
			return diagramRef.current.gShapes.selectAll('*').remove()
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
	const gLines = d3svg.append('g').attr('class', 'lines')
	const gDistances = d3svg.append('g').attr('class', 'distances')
	const gForces = d3svg.append('g').attr('class', 'forces')
	const gMoments = d3svg.append('g').attr('class', 'moments')
	const gShapes = d3svg.append('g').attr('class', 'shapes').attr('mask', 'url(#noOverflow)')

	// Store all containers and draw the plot for as much as we can.
	return { ...defaultPlotProperties, drawing, gLines, gDistances, gForces, gMoments, gShapes }
}

/*
 * Below are various arrow drawing functions.
 */

// drawLine draws a line from the given lineData (a start-vector-end combination) and an optional style object.
function drawLine(diagram, lineData, style = {}, container = diagram.gLines) {
	// Process the input.
	const { start, end } = ensureSVE(lineData)

	// Set up the line and shape it.
	const path = container
		.append('path')
		.attr('d', line()([[start.x, start.y], [end.x, end.y]]))
		.attr('class', 'line')

	// Apply style.
	return applyStyle(path, style)
}

// drawDistance draws a distance spread. It must be an object with a start, vector and end parameter (well, two out of these three) given in Vector form.
function drawDistance(diagram, distance, style = {}, container = diagram.gDistances) {
	return drawLine(diagram, distance, style, container).attr('class', 'distance')
}

// drawForce draws a force vector. It must be an object with a start, vector and end parameter (well, two out of these three) given in Vector form.
function drawForce(diagram, force, options = {}, container = diagram.gForces) {
	// Check input.
	force = ensureSVE(force)
	let { size, color, style } = processOptions(options, defaultForceOptions)
	size = ensureNumber(size)

	// Make a group.
	const group = container.append('g').attr('class', 'force')
	applyStyle(container, style)

	// Draw a line for the force. Make sure to shorten the force a bit so its ending falls inside the arrow head.
	const forceShortened = ensureSVE({ start: force.start, vector: force.vector.shorten(size) })
	drawLine(diagram, forceShortened, { stroke: color, 'stroke-width': size }, group).attr('class', 'forceLine')

	// Draw the arrow head with the proper orientation.
	drawArrowHead(group, force.end, force.vector.argument, size, { fill: color })

	// All done! Return the result.
	return group
}
const defaultForceOptions = {
	size: 5,
	color: 'black',
	style: {},
}

// drawMoment draws a moment vector. The moment must have a position property (a Vector) and a clockwise property (boolean), both mandatory. The options (all optional) include the color, the size (thickness of the line), the radius, the opening (the angle where the opening is in the moment arrow, by default being 0 which means to the right) and the spread (how large the circle arc is). The options can also contain an extra style parameter to be applied.
function drawMoment(diagram, moment, options = {}, container = diagram.gMoments) {
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

// drawArrowHead draws an arrowhead in the given container at the given position and with the given angle. It can also be sized up and styled further.
function drawArrowHead(container, position, angle = 0, size = defaultArrowHeadSize, style = {}) {
	// Check input.
	position = ensureVector(position, 2)
	angle = ensureNumber(angle)
	size = ensureNumber(size)

	// Draw the arrow head shape and position it.
	const arrowHead = container
		.append('polygon')
		.attr('points', '0 0, -30 -15, -20 0, -30 15')
		.attr('class', 'arrowHead')
		.attr('transform', `translate(${position.x}, ${position.y}) rotate(${angle * 180 / Math.PI}) scale(${size / defaultArrowHeadSize})`)

	// Add any potentially given style.
	return applyStyle(arrowHead, style)
}
const defaultArrowHeadSize = defaultForceOptions.size

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