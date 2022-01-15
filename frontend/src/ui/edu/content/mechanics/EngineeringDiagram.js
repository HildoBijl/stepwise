// Plot is the parent component of every plot made. It gives options to generate various kinds of plots.

import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { line } from 'd3-shape'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureBoolean, processOptions, filterOptions } from 'step-wise/util/objects'
import { ensureVector } from 'step-wise/CAS/linearAlgebra/Vector'

import Drawing, { defaultOptions as drawingDefaultOptions, applyStyle } from '../../../components/figures/Drawing'

const defaultOptions = {
	...drawingDefaultOptions,
}
export { defaultOptions }

const defaultPlotProperties = {}

const useStyles = makeStyles((theme) => ({
	engineeringDiagram: {
		'& svg': {
			'& .distance': {
				fill: 'none',
				stroke: 'black',
				'stroke-width': 1,
			},
			'& .force': {
				fill: 'none',
				stroke: 'black',
				'stroke-width': 3,
			},
			'& .moment': {
				fill: 'none',
				stroke: 'black',
				'stroke-width': 3,
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
		drawDistance(distance) {
			return drawDistance(diagramRef.current, distance)
		},
		drawForce(force) {
			return drawForce(diagramRef.current, force)
		},
		drawMoment(moment) {
			return drawMoment(diagramRef.current, moment)
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
	const gDistances = d3svg.append('g').attr('class', 'distances')
	const gForces = d3svg.append('g').attr('class', 'forces')
	const gMoments = d3svg.append('g').attr('class', 'moments')
	const gShapes = d3svg.append('g').attr('class', 'shapes').attr('mask', 'url(#noOverflow)')

	// Store all containers and draw the plot for as much as we can.
	return { ...defaultPlotProperties, drawing, gDistances, gForces, gMoments, gShapes }
}

/*
 * Below are various arrow drawing functions.
 */

// drawDistance draws a distance spread. It must be an object with a start, vector and end parameter (well, two out of these three) given in Vector form.
function drawDistance(diagram, distance, style = {}) {
	// Process the input.
	const { start, end } = processStartEndCombination(distance)

	// Set up the line and shape it.
	const path = diagram.gDistances
		.append('path')
		.attr('d', line()([[start.x, start.y], [end.x, end.y]]))
		.attr('class', 'distance')
		.attr('marker-start', 'url(#distanceArrowHead)')
		.attr('marker-end', 'url(#distanceArrowHead)')

	// Apply style.
	applyStyle(path, style)
}

// drawForce draws a force vector. It must be an object with a start, vector and end parameter (well, two out of these three) given in Vector form.
function drawForce(diagram, force, style = {}) {
	// Process the input.
	const { start, end } = processStartEndCombination(force)

	// Set up the line and shape it.
	const path = diagram.gForces
		.append('path')
		.attr('d', line()([[start.x, start.y], [end.x, end.y]]))
		.attr('class', 'force')
		.attr('marker-end', 'url(#forceArrowHead)')

	// Apply style.
	applyStyle(path, style)
}

// drawMoment draws a moment vector. Options include the position (mandatory; a Vector), clockwise (boolean), opening (the angle where the opening is in the moment arrow, by default being 0 which means to the right), the radius and the spread (how large the circle arc is).
function drawMoment(diagram, moment, style = {}) {
	// Extract and check the input.
	moment = processOptions(moment, defaultMoment)
	const position = ensureVector(moment.position)
	const clockwise = ensureBoolean(moment.clockwise)
	const opening = ensureNumber(moment.opening)
	const radius = ensureNumber(moment.radius)
	const spread = ensureNumber(moment.spread)
	const arrowHeadDeltaProduct = ensureNumber(moment.arrowHeadDeltaProduct)

	// Set up the path for the moment arc.
	const factor = (clockwise ? -1 : 1)
	const startAngle = opening + factor * (2 * Math.PI - spread) / 2
	const endAngle = startAngle + factor * spread
	const arcPath = getArcPath(position.x, position.y, radius, startAngle, endAngle)

	// Add a tiny straight line to properly angle the arrow head.
	const epsilon = 0.001
	const arrowHeadAngle = endAngle - factor * arrowHeadDeltaProduct / radius
	const arrowHeadAddition = `l${-epsilon * factor * Math.sin(arrowHeadAngle)} ${-epsilon * factor * Math.cos(arrowHeadAngle)}`

	// Create the path in SVG.
	const path = diagram.gMoments
		.append('path')
		.attr('d', arcPath + arrowHeadAddition)
		.attr('class', 'moment')
		.attr('marker-end', 'url(#forceArrowHead)')

	// Apply style.
	applyStyle(path, style)
}
const defaultMoment = {
	position: undefined,
	clockwise: false,
	opening: 0, // The position of the opening in radians, measured counterclockwise from left.
	radius: 30,
	spread: 3 / 2 * Math.PI, // Which angle (part of the circle) is drawn? Usually we take three quarters of a circle.
	arrowHeadDeltaProduct: 10, // The angle of the arrow head is manually adjusted to make it look OK. This is done such that [adjustmentAngle] * [radius] equals a certain amount. That is this amount. Increase or decrease for more/less angle adjustment.
}

/*
 * Below are various supporting functions.
 */

// processStartEndCombination takes an object with a start, vector and/or end property (always two out of these three) and finds the remaining one. The result is returned. A thorough check is also performed whether the parameters are indeed present.
function processStartEndCombination(data) {
	data = processOptions(data, defaultStartEndCombination)
	let start, vector, end
	if (!data.end) {
		start = ensureVector(data.start, 2)
		vector = ensureVector(data.vector, 2)
		end = start.add(vector)
	} else if (!data.start) {
		end = ensureVector(data.end, 2)
		vector = ensureVector(data.vector, 2)
		start = end.subtract(vector)
	} else {
		start = ensureVector(data.start, 2)
		end = ensureVector(data.end, 2)
		vector = end.subtract(start)
	}
	return { start, vector, end }
}
const defaultStartEndCombination = {
	start: undefined,
	vector: undefined,
	end: undefined,
}

// getArcPath takes a circle center (x,y), a radius, a start angle and an end angle, and gives the SVG path string that makes this path. For angles, the right is taken as zero and counterclockwise is taken as positive.
function getArcPath(x, y, radius, startAngle, endAngle) {
	// Determine arc start and end.
	const start = {
		x: x + radius * Math.cos(startAngle),
		y: y - radius * Math.sin(startAngle),
	}
	const end = {
		x: x + radius * Math.cos(endAngle),
		y: y - radius * Math.sin(endAngle),
	}

	// Determine the flags needed by SVG.
	const largeArcFlag = Math.abs(endAngle - startAngle) <= Math.PI ? '0' : '1'
	const sweepFlag = endAngle > startAngle ? '0' : '1'

	// Set up the path.
	return `M${start.x} ${start.y} A${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`
}