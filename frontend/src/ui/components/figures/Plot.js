// Plot is the parent component of every plot made. It gives options to generate various kinds of plots.

import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { select } from 'd3-selection'
import { scaleLinear } from 'd3-scale'
import { axisLeft, axisBottom } from 'd3-axis'
import { line, curveLinear } from 'd3-shape'

import { ensureNumber } from 'step-wise/util/numbers'
import { processOptions, filterOptions } from 'step-wise/util/objects'

import Drawing, { defaultOptions as drawingDefaultOptions } from './Drawing'

const defaultOptions = {
	...drawingDefaultOptions,
}
export { defaultOptions }

const defaultPlotProperties = {}

const defaultLineAttributes = {
	class: 'line',
}

const useStyles = makeStyles((theme) => ({
	plot: {
		'& svg': {
			// Format D3 axes.
			// ToDo: check if we still need this.
			'& .tick': {
				stroke: 'currentColor', // For the axis tick numbers.
				line: {
					stroke: 'currentColor', // For the tick lines.
				},
			},
			'& .domain': {
				stroke: 'currentColor', // For the axes.
			},
			'& .line': {
				fill: 'none',
				stroke: 'black',
				'stroke-width': 1,
			},
		},
	},
}))

export function Plot(options, ref) {
	options = processOptions(options, defaultOptions)
	const classes = useStyles()

	// Set up refs and make them accessible to any implementing component.
	const drawingRef = useRef() // This will be the link to the drawing.
	const plotRef = useRef() // This will contain all data for this plot.
	useImperativeHandle(ref, () => ({
		get drawing() {
			return drawingRef.current
		},
		get svg() {
			return plotRef.current.svg
		},
		get scale() {
			return plotRef.current.scale
		},
		set range(range) {
			setRange(plotRef.current, range)
		},
		drawLine(line) {
			return drawLine(plotRef.current, line)
		},
		addLabels(xLabel, yLabel) {
			return addLabels(plotRef.current, xLabel, yLabel)
		},
	}))

	// Initialize the plot object once the drawing is loaded.
	useEffect(() => {
		if (drawingRef.current && !plotRef.current)
			plotRef.current = initialize(drawingRef.current)
	}, [drawingRef, plotRef])

	// Render the drawing.
	options.className = clsx('plot', classes.plot, options.className)
	return <Drawing ref={drawingRef} {...filterOptions(options, drawingDefaultOptions)} />
}
export default forwardRef(Plot)

function initialize(drawing) {
	// Get properties from the drawing.
	const { width, height, svg: svgDOM } = drawing

	// Build up the SVG with the most important containers.
	const svg = select(svgDOM)
	const gAxes = svg.append('g').attr('class', 'axis')
	const gLines = svg.append('g').attr('class', 'lines').attr('mask', 'url(#noOverflow)')

	// Store all containers and draw the plot for as much as we can.
	const plot = { ...defaultPlotProperties, svg, gAxes, gLines, width: parseFloat(width), height: parseFloat(height), lines: [] }
	drawAxes(plot)
	return plot
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

function setRange(plot, range) {
	// Check input.
	range = plot.range = ensureRange(range)

	// Adjust the scale inside the plot.
	plot.scale = {
		input: scaleLinear().domain([range.input.min, range.input.max]).range([0, plot.width]),
		output: scaleLinear().domain([range.output.min, range.output.max]).range([plot.height, 0]),
	}

	// Adjust the line function.
	plot.lineFunction = line()
		.x(point => plot.scale.input(point.input))
		.y(point => plot.scale.output(point.output))
		.curve(curveLinear)

	// Redraw the axes.
	drawAxes(plot)
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

function drawLine(plot, line) {
	// Set up the line and shape it.
	const path = plot.gLines
		.append('path')
		.datum(line.points)
		.attr('d', plot.lineFunction)

	// Apply attributes.
	const attributes = { ...defaultLineAttributes, ...(line.attributes || {}) }
	Object.keys(attributes).forEach(key => {
		path.attr(key, attributes[key]) // ToDo: use style instead.
	})

	// Apply style.
	Object.keys(line.style || {}).forEach(key => {
		path.style(key, line.style[key])
	})
}

function addLabels(plot, xLabel, yLabel) {
	plot.svg.append('text')
		.attr('text-anchor', 'middle')
		.attr('x', plot.width * 0.6) // Distance to the right.
		.attr('y', plot.scale.output(0) + 36) // Distance downwards.
		.text(xLabel)
	plot.svg.append('text')
		.attr('text-anchor', 'middle')
		.attr('transform', 'rotate(-90)')
		.attr('x', -plot.height * 0.4) // Distance upwards.
		.attr('y', plot.scale.input(0) - 32) // Distance to the right.
		.text(yLabel)
}

// ToDo: use or remove? Might be useful when implementing hovering and showing lines.
// function isPointWithinRange(point, range) {
// 	if (point.input < range.input.min || point.input > range.input.max)
// 		return false
// 	if (point.output < range.output.min || point.output > range.output.max)
// 		return false
// 	return true
// }