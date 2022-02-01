/* Drawing is the parent component of every drawing made, either through SVG or Canvas. It is generally used inside other components to make specific types of plots, figures or similar.
 * When Drawing is given a ref, it places in this ref an object { svg: ..., canvas: ... } with references to the respective DOM elements. Note that the option useCanvas needs to be set to true if a Canvas is desired. useSVG is by default set to true, but can be turned off.
 */

import React, { createContext, useContext, useRef, forwardRef, useImperativeHandle, useEffect, useLayoutEffect } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { select } from 'd3-selection'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureObject, processOptions, filterOptions } from 'step-wise/util/objects'
import { deg2rad } from 'step-wise/util/numbers'
import { Vector, ensureVector, PositionedVector } from 'step-wise/CAS/linearAlgebra'

import { ensureReactElement, useEqualRefOnEquality, useMousePosition as useClientMousePosition, useBoundingClientRect } from 'util/react'
import { notSelectable } from 'ui/theme'

import Figure, { defaultOptions as figureDefaultOptions } from '../Figure'

const defaultOptions = {
	...figureDefaultOptions, // Includes a maxWidth option to set the maximum width of the figure.
	width: 800, // Viewport width.
	height: 600, // Viewport height.
	useSVG: true,
	useCanvas: false,
	svgContents: undefined, // JSX elements that need to be placed directly into the SVG container.
	svgDefs: undefined, // JSX elements that are placed in the defs part of the SVG container.
	htmlContents: undefined, // JSX elements for regular HTML, often inside a PositionedElement container.
}
delete defaultOptions.aspectRatio // We override the aspect ratio based on the width and height of the viewport.
export { defaultOptions }

// Set up a context so elements inside the drawing can ask for the drawing.
const DrawingContext = createContext(null)

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

		'& .positionedElement': {
			left: 0,
			...notSelectable,
			position: 'absolute',
			top: 0,
			transformOrigin: '0% 0%',
			zIndex: 0,
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
	const htmlContentsRef = useRef()

	// Set up refs and make them accessible to any implementing component.
	const figureRef = useRef()
	const drawingRef = useRef()
	useImperativeHandle(ref, () => ({
		// Basic getters.
		get figure() { return drawingRef.current.figure },
		get svg() { return drawingRef.current.svg },
		get d3svg() { return drawingRef.current.d3svg },
		get canvas() { return drawingRef.canvas.svg },
		get context() { return drawingRef.current.context },
		get width() { return drawingRef.current.width },
		get height() { return drawingRef.current.height },
		get bounds() { return new PositionedVector({ start: [0, 0], end: [drawingRef.current.width, drawingRef.current.height] }) },

		// Position functions.
		getPosition(clientCoordinates, figureRect) {
			// If no clientCoordinates have been given, we cannot do anything.
			if (!clientCoordinates)
				return null

			// If no figure rectangle has been provided, find it. (It can be already provided for efficiency.)
			const drawing = drawingRef.current
			if (!figureRect) {
				const figureInner = drawing.figure && drawing.figure.inner
				if (!figureInner)
					return null
				figureRect = figureInner.getBoundingClientRect()
			}

			// Calculate the position.
			clientCoordinates = ensureVector(clientCoordinates, 2)
			return new Vector([
				(clientCoordinates.x - figureRect.x) * drawing.width / figureRect.width,
				(clientCoordinates.y - figureRect.y) * drawing.height / figureRect.height,
			])
		},
		isInside(position) {
			if (!position)
				return false
			return position.x >= 0 && position.x <= drawingRef.current.width && position.y >= 0 && position.y <= drawingRef.current.height
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
		<DrawingContext.Provider value={drawingRef.current}>
			<Figure ref={figureRef} {...filterOptions(options, figureDefaultOptions)}>
				{options.useSVG ? (
					<svg ref={svgRef} viewBox={`0 0 ${options.width} ${options.height}`}>
						<defs>
							<mask id="noOverflow">
								<rect x="0" y="0" width={options.width} height={options.height} fill="#fff" />
							</mask>
							{options.svgDefs}
						</defs>
						{options.svgContents}
					</svg>
				) : null}
				{options.useCanvas ? <canvas ref={canvasRef} width={options.width} height={options.height} /> : null}
				<div ref={htmlContentsRef}>
					{options.htmlContents}
				</div>
			</Figure>
		</DrawingContext.Provider>
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

// Get the data out of the context.
export function useDrawingContext() {
	return useContext(DrawingContext)
}

// placeText places a given text into the SVG element.
function placeText(drawing, text, options = {}) {
	options = processOptions(options, defaultPlaceTextOptions)
	const rotate = deg2rad(options.rotate)
	drawing.gText.append('text')
		.attr('text-anchor', options.textAnchor)
		.attr('transform', `rotate(${options.rotate})`)
		.attr('x', options.x * Math.cos(rotate) + options.y * Math.sin(rotate))
		.attr('y', -options.x * Math.sin(rotate) + options.y * Math.cos(rotate))
		.text(text)
}
const defaultPlaceTextOptions = {
	textAnchor: 'middle',
	x: 0,
	y: 0,
	rotate: 0, // Degrees.
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

// applyStyle takes an object and applies the corresponding style object to it. It returns the given object.
export function applyStyle(obj, style = {}) {
	Object.keys(style).forEach(key => {
		obj.style(key, style[key])
	})
	return obj
}

// PositionedElement allows for the positioning of elements onto the drawing.
export function PositionedElement(props) {
	// Check input.
	let { children, position, rotate, scale, anchor, style } = processOptions(props, defaultPositionedElement)
	children = ensureReactElement(children)
	position = ensureVector(position, 2)
	rotate = ensureNumber(rotate)
	scale = ensureNumber(scale)
	anchor = ensureVector(anchor, 2)
	style = ensureObject(style)

	// Make sure the vector references remain consistent.
	position = useEqualRefOnEquality(position)
	anchor = useEqualRefOnEquality(anchor)

	// Extract the drawing from the context.
	const drawing = useDrawingContext()

	// Use a layout effect to properly position the element.
	const ref = useRef()
	useLayoutEffect(() => {
		// Can we do anything?
		const element = ref.current
		if (!element || !drawing || !drawing.figure || !drawing.figure.inner)
			return

		// Calculate the scale at which the figure is drawn.
		const figureRect = drawing.figure.inner.getBoundingClientRect()
		const figureScale = figureRect.width / drawing.width

		// Position the element accordingly.
		element.style.transformOrigin = `${anchor.x * 100}% ${anchor.y * 100}%`
		element.style.transform = `
			translate(${-anchor.x * 100}%, ${-anchor.y * 100}%)
			scale(${figureScale})
			translate(${position.x}px, ${position.y}px)
			scale(${scale})
			rotate(${rotate * 180 / Math.PI}deg)
		`
	}, [drawing, children, position, rotate, scale, anchor])

	// Render the children.
	return <div className="positionedElement" style={style} ref={ref}>{children}</div>
}
const defaultPositionedElement = {
	children: null,
	position: Vector.zero,
	rotate: 0, // Radians.
	scale: 1,
	anchor: new Vector(0.5, 0.5), // Use 0 for left/top and 1 for right/bottom.
	style: {},
}

// useMousePosition tracks the position of the mouse and gives the coordinates with respect to mouse coordinates. This is of the form { x: 100, y: 200 }. The function must be provided with a reference to the drawing.
export function useMousePosition(drawingRef) {
	const drawing = drawingRef && drawingRef.current
	const figureInner = drawing && drawing.figure && drawing.figure.inner

	// Acquire data. Return null on missing data.
	const clientMousePosition = useClientMousePosition()
	const figureRect = useBoundingClientRect(figureInner)
	if (!clientMousePosition || !figureRect)
		return null

	// Calculate relative position and scale it.
	return drawing.getPosition(clientMousePosition, figureRect)
}