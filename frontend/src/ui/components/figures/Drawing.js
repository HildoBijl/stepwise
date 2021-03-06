/* Drawing is the parent component of every drawing made, either through SVG or Canvas. It is generally used inside other components to make specific types of plots, figures or similar.
 * When Drawing is given a ref, it places in this ref an object { svg: ..., canvas: ... } with references to the respective DOM elements. Note that the option useCanvas needs to be set to true if a Canvas is desired.
 */

import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { select } from 'd3-selection'

import { processOptions, filterOptions } from 'step-wise/util/objects'
import { deg2rad } from 'step-wise/util/numbers'

import { notSelectable } from 'ui/theme'

import Figure, { defaultOptions as figureDefaultOptions } from './Figure'

const defaultOptions = {
	...figureDefaultOptions, // Includes a maxWidth option to set the maximum width of the figure.
	width: 800, // Viewport width.
	height: 600, // Viewport height.
	useSVG: true,
	useCanvas: false,
}
delete defaultOptions.aspectRatio // We override the aspect ratio based on the width and height of the viewport.
export { defaultOptions }

const useStyles = makeStyles((theme) => ({
	drawing: {
		'& svg': {
			display: 'block',
			...notSelectable,
			overflow: 'visible',
			width: '100%',
			zIndex: 2,
		},

		'& canvas': {
			height: '100%',
			...notSelectable,
			width: '100%',
			zIndex: 1,
		},
	},
}))

function Drawing(options, ref) {
	// Process, calculate and check options and style.
	options = processOptions(options, defaultOptions)
	options.aspectRatio = options.height / options.width
	if (!options.useSVG && !options.useCanvas)
		throw new Error('Drawing render error: cannot generate a plot without either an SVG or a canvas.')
	const classes = useStyles()

	// Set up refs and make them accessible to any implementing component.
	const figureRef = useRef()
	const drawingRef = useRef()
	useImperativeHandle(ref, () => ({
		get figure() {
			return drawingRef.current.figure
		},
		get svg() {
			return drawingRef.current.svg
		},
		get d3svg() {
			return drawingRef.current.d3svg
		},
		get canvas() {
			return drawingRef.canvas.svg
		},
		get context() {
			return drawingRef.current.context
		},
		get width() {
			return drawingRef.current.width
		},
		get height() {
			return drawingRef.current.height
		},
		placeText(text, options) {
			return placeText(drawingRef.current, text, options)
		},
		clearText() {
			return drawingRef.current.gText.selectAll('*').remove()
		},
		getPointFromEvent(event) {
			return getPointFromEvent(drawingRef.current, event)
		},
	}))

	// Initialize the SVG element once the drawing is loaded.
	useEffect(() => {
		if (figureRef.current && !drawingRef.current)
			drawingRef.current = initialize(figureRef.current, svgRef.current, canvasRef.current)
	}, [figureRef, drawingRef])

	// Make sure the width and height are always up-to-date.
	useEffect(() => {
		drawingRef.current.width = parseFloat(options.width)
		drawingRef.current.height = parseFloat(options.height)
	}, [options.width, options.height])

	// Render figure with SVG and Canvas properly placed.
	const svgRef = useRef()
	const canvasRef = useRef()
	options.className = clsx('drawing', classes.drawing, options.className)
	return (
		<Figure ref={figureRef} {...filterOptions(options, figureDefaultOptions)}>
			{options.useSVG ? (
				<svg ref={svgRef} viewBox={`0 0 ${options.width} ${options.height}`}>
					<defs>
						<mask id="noOverflow">
							<rect x="0" y="0" width={options.width} height={options.height} fill="#fff" />
						</mask>
					</defs>
				</svg>
			) : null}
			{options.useCanvas ? <canvas ref={canvasRef} width={options.width} height={options.height} /> : null}
		</Figure>
	)
}
export default forwardRef(Drawing)

function initialize(figure, svg, canvas) {
	// Build up the SVG with the most important containers.
	let d3svg, gText
	if (svg) {
		d3svg = select(svg)
		gText = d3svg.append('g').attr('class', 'text')
	}

	// Prepare the Canvas context.
	let context
	if (canvas) {
		context = canvas.getContext('2d')
	}

	// Store everything in the drawing ref.
	return { figure, svg, d3svg, gText, canvas, context }
}

const defaultPlaceTextOptions = {
	textAnchor: 'middle',
	x: 0,
	y: 0,
	rotate: 0, // Degrees.
}
function placeText(drawing, text, options = {}) {
	options = processOptions(options, defaultPlaceTextOptions)
	const alpha = deg2rad(options.rotate)
	drawing.gText.append('text')
		.attr('text-anchor', options.textAnchor)
		.attr('transform', `rotate(${options.rotate})`)
		.attr('x', options.x * Math.cos(alpha) + options.y * Math.sin(alpha))
		.attr('y', -options.x * Math.sin(alpha) + options.y * Math.cos(alpha))
		.text(text)
}

// getPointFromEvent returns the point in SVG/Canvas coordinates based on an event.
function getPointFromEvent(drawing, event) {
	const innerFigure = drawing.figure.inner
	const rect = innerFigure.getBoundingClientRect()
	const eventProcessed = ((event.touches && event.touches[0]) || event)
	return {
		x: (eventProcessed.clientX - rect.left) / rect.width * drawing.width,
		y: (eventProcessed.clientY - rect.top) / rect.height * drawing.height,
	}
}