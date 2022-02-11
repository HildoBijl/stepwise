// Plot is the parent component of every plot made. It gives options to generate various kinds of plots.

import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { scaleLinear } from 'd3-scale'
import { axisLeft, axisBottom } from 'd3-axis'
import { line, curveLinear } from 'd3-shape'

import { ensureNumber } from 'step-wise/util/numbers'
import { processOptions, filterOptions } from 'step-wise/util/objects'

import { useEventListener } from 'util/react'

import Drawing, { defaultDrawingInputOptions, applyStyle } from './Drawing'

export const defaultPlotOptions = {
	...defaultDrawingInputOptions,
}

const defaultPlotProperties = {}

const useStyles = makeStyles((theme) => ({
	plot: {
		'& svg': {
			'& .line': {
				fill: 'none',
				stroke: 'black',
				'stroke-width': 1,
			},
			'& .hoverLine': {
				fill: 'none',
				stroke: theme.palette.primary.main,
				'stroke-width': 1,
			},
		},
	},
}))

export function Plot(options, ref) {
	options = processOptions(options, defaultPlotOptions)
	const classes = useStyles()
	const [useHoverLines, setUseHoverLines] = useState(false)

	// Set up refs and make them accessible to any implementing component.
	const drawingRef = useRef() // This will be the link to the drawing.
	const plotRef = useRef() // This will contain all data for this plot.
	useImperativeHandle(ref, () => ({
		get drawing() {
			return plotRef.current.drawing
		},
		get scale() {
			return plotRef.current.scale
		},
		set range(range) {
			setRange(plotRef.current, range)
		},
		set useHoverLines(useHoverLines) {
			setUseHoverLines(!!useHoverLines)
		},
		drawAxes() {
			return drawAxes(plotRef.current)
		},
		addLabels(xLabel, yLabel) {
			return addLabels(plotRef.current, xLabel, yLabel)
		},
		drawLine(line) {
			return drawLine(plotRef.current, line)
		},
		clearLines() {
			return plotRef.current.gLines.selectAll('*').remove()
		},
		drawCircle(circle) {
			return drawCircle(plotRef.current, circle)
		},
		clearShapes() {
			return plotRef.current.gShapes.selectAll('*').remove()
		},
	}))

	// Initialize the plot object once the drawing is loaded.
	useEffect(() => {
		if (drawingRef.current && !plotRef.current)
			plotRef.current = initialize(drawingRef.current)
	}, [drawingRef, plotRef])

	// Set up event listeners for hover lines.
	const target = useHoverLines && drawingRef.current ? [drawingRef.current.figure.inner] : []
	const applyHoverLines = (evt) => drawHoverLines(plotRef.current, getCoordsFromEvent(plotRef.current, evt))
	const clearHoverLines = () => drawHoverLines(plotRef.current, null)
	useEventListener('mousemove', applyHoverLines, target)
	useEventListener('touchmove', (evt) => {
		applyHoverLines(evt)
		evt.preventDefault() // Prevent smartphone scrolling.
	}, target)
	useEventListener('mouseleave', clearHoverLines, target)

	// Render the drawing.
	options.className = clsx('plot', classes.plot, options.className)
	return <Drawing ref={drawingRef} {...filterOptions(options, defaultDrawingInputOptions)} />
}
export default forwardRef(Plot)

function initialize(drawing) {
	// Get properties from the drawing.
	const { d3svg } = drawing

	// Build up the SVG with the most important containers.
	const gAxes = d3svg.append('g').attr('class', 'axis')
	const gLines = d3svg.append('g').attr('class', 'lines').attr('mask', 'url(#noOverflow)')
	const gShapes = d3svg.append('g').attr('class', 'shapes').attr('mask', 'url(#noOverflow)')
	const gHoverLines = d3svg.append('g').attr('class', 'hoverLines').attr('mask', 'url(#noOverflow)')

	// Store all containers and draw the plot for as much as we can.
	return { ...defaultPlotProperties, drawing, gAxes, gLines, gShapes, gHoverLines }
}

function setRange(plot, range) {
	// Check input.
	range = plot.range = ensureRange(range)

	// Adjust the scale inside the plot.
	plot.scale = {
		input: scaleLinear().domain([range.input.min, range.input.max]).range([0, plot.drawing.width]),
		output: scaleLinear().domain([range.output.min, range.output.max]).range([plot.drawing.height, 0]),
	}

	// Adjust the line function.
	plot.lineFunction = line()
		.x(point => plot.scale.input(point.input))
		.y(point => plot.scale.output(point.output))
		.curve(curveLinear)
}

function ensureRange(range) {
	// Check the range object itself.
	if (typeof range !== 'object')
		throw new Error(`Invalid range: the given range object was not an object but has type "${typeof range}".`)

	// Check its properties.
	const dirs = ['input', 'output']
	dirs.forEach(dir => {
		if (typeof range[dir] !== 'object')
			throw new Error(`Invalid range: the given range object did not have a valid "${dir}" property. This property must be an object but has type "${typeof range[dir]}".`)
		ensureNumber(range[dir].min)
		ensureNumber(range[dir].max)
	})

	// All good.
	return range
}

function drawAxes(plot) {
	// Cannot draw axes if no scale is defined.
	if (!plot.scale)
		return

	// Remove any old axes, if they exist.
	plot.gAxes.selectAll('g').remove()

	// Set up axis styles.
	const inputAxis = axisBottom(plot.scale.input)
	const outputAxis = axisLeft(plot.scale.output)

	// Draw axes.
	plot.gAxes
		.append('g')
		.attr('transform', `translate(0, ${plot.scale.output(0)})`)
		.call(inputAxis)
	plot.gAxes
		.append('g')
		.attr('transform', `translate(${plot.scale.input(0)}, 0)`)
		.call(outputAxis)
}

function addLabels(plot, xLabel, yLabel) {
	plot.drawing.placeText(xLabel, {
		x: plot.drawing.width * 0.6,
		y: plot.scale.output(0) + 36,
	})
	plot.drawing.placeText(yLabel, {
		x: plot.scale.input(0) - 32,
		y: plot.drawing.height * 0.4,
		rotate: -90,
	})
}

function drawLine(plot, line) {
	// Set up the line and shape it.
	line = processOptions(line, { points: [], style: {} })
	const path = plot.gLines
		.append('path')
		.datum(line.points)
		.attr('d', plot.lineFunction)
		.attr('class', 'line')

	// Apply style.
	applyStyle(path, line.style)
}

function drawCircle(plot, circle) {
	// Set up the circle.
	circle = processOptions(circle, { input: 0, output: 0, radius: 5, style: {} })
	const shape = plot.gShapes.append('circle')
		.attr('cx', plot.scale.input(circle.input))
		.attr('cy', plot.scale.output(circle.output))
		.attr('r', circle.radius)
		.attr('class', 'circle')

	// Apply style.
	applyStyle(shape, circle.style)
}

function getCoordsFromEvent(plot, event) {
	const point = plot.drawing.getPointFromEvent(event)
	return getCoordsFromPoint(plot, point)
}

function getCoordsFromPoint(plot, point) {
	return {
		input: plot.scale.input.invert(point.x),
		output: plot.scale.output.invert(point.y),
	}
}

function isCoordWithinRange(coord, range) {
	if (coord.input < range.input.min || coord.input > range.input.max)
		return false
	if (coord.output < range.output.min || coord.output > range.output.max)
		return false
	return true
}

function drawHoverLines(plot, coord) {
	// If the coordinates exist and are within the plot range, set up the points for the line.
	coord = coord && (isCoordWithinRange(coord, plot.range) ? coord : undefined)
	const linePoints = coord ? [{ input: 0, output: coord.output }, coord, { input: coord.input, output: 0 }] : []

	// Use d3 to create the lines.
	const lines = plot.gHoverLines.selectAll('path').data([linePoints])
	const enteringLines = lines.enter().append('path').attr('class', 'hoverLine')
	enteringLines.merge(lines).attr('d', plot.lineFunction)
	lines.exit().remove()
}