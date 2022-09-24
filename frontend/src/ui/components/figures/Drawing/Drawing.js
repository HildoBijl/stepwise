/* Drawing is the parent component of every drawing made, either through SVG or Canvas. It is generally used inside other components to make specific types of plots, figures or similar.
 * When Drawing is given a ref, it places in this ref an object { svg: ..., canvas: ... } with references to the respective DOM elements. Note that the option useCanvas needs to be set to true if a Canvas is desired. The option useSvg is by default true.
 */

import React, { useRef, forwardRef, useImperativeHandle, useEffect, useId } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { select } from 'd3-selection'

import { deg2rad } from 'step-wise/util/numbers'
import { processOptions, filterOptions } from 'step-wise/util/objects'
import { resolveFunctions } from 'step-wise/util/functions'
import { Vector, ensureVector } from 'step-wise/geometry'

import { useMousePosition as useClientMousePosition, useBoundingClientRect, useForceUpdate } from 'util/react'
import { notSelectable } from 'ui/theme'

import Figure, { defaultOptions as figureDefaultOptions } from '../Figure'

import { DrawingContext } from './DrawingContext'

const defaultDrawingOptions = {
	...figureDefaultOptions, // Includes a maxWidth option to set the maximum width of the figure. This can also be a function of the drawing bounds.
	transformationSettings: undefined, // An object containing data on figure bounds and a transformation that is applied to get from drawing coordinates to graphical coordinates.
	useSvg: true,
	useCanvas: false,
	svgContents: undefined, // JSX elements that need to be placed directly into the SVG container.
	svgDefs: undefined, // JSX elements that are placed in the defs part of the SVG container.
	htmlContents: undefined, // JSX elements for regular HTML, often inside a PositionedElement container.
}
delete defaultDrawingOptions.aspectRatio // We override the aspect ratio based on the width and height of the viewport.
export { defaultDrawingOptions }

const useStyles = makeStyles((theme) => ({
	drawing: {},

	drawingSVG: {
		display: 'block',
		...notSelectable,
		overflow: 'visible',
		width: '100%',
		zIndex: 2,

		'& .line': {
			fill: 'none',
			stroke: 'black',
			'stroke-width': 1,
		},
	},

	drawingCanvas: {
		height: '100%',
		...notSelectable,
		width: '100%',
		zIndex: 1,
	},

	drawingHtmlContainer: {
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
	// Process and check the options.
	options = processOptions(options, defaultDrawingOptions)
	const { transformationSettings } = options
	if (!transformationSettings)
		throw new Error(`Drawing render error: no transformation settings are given. Use any of the "use[...]TransformationSettings" functions from the transformation utility file to get transformation settings.`)
	if (!options.useSvg && !options.useCanvas)
		throw new Error('Drawing render error: cannot generate a drawing without either an SVG or a canvas present. Either useSvg or useCanvas must be set to true.')

	// Set up styles and references.
	const id = useId()
	const classes = useStyles()
	const htmlContentsRef = useRef()
	const svgRef = useRef()
	const canvasRef = useRef()

	// Determine figure size parameters to use for rendering.
	const { graphicalBounds } = transformationSettings
	const { width, height } = graphicalBounds
	options.aspectRatio = height / width // This must be passed on to the Figure object.
	options.maxWidth = resolveFunctions(options.maxWidth, graphicalBounds)

	// Set up refs and make them accessible to any implementing component.
	const figureRef = useRef()
	const drawingRef = useRef()
	useImperativeHandle(ref, () => ({
		// Basic getters.
		get figure() { return drawingRef.current.figure },
		get svg() { return drawingRef.current.svg },
		get d3svg() { return drawingRef.current.d3svg },
		get canvas() { return drawingRef.current.canvas },
		get context() { return drawingRef.current.context },
		get width() { return drawingRef.current.transformationSettings.graphicalBounds.width },
		get height() { return drawingRef.current.transformationSettings.graphicalBounds.height },
		get bounds() { return drawingRef.current.transformationSettings.bounds },
		get graphicalBounds() { return drawingRef.current.transformationSettings.graphicalBounds },
		get transformation() { return drawingRef.current.transformationSettings.transformation },
		get inverseTransformation() { return drawingRef.current.transformationSettings.inverseTransformation },
		get scale() { return drawingRef.current.transformationSettings.scale },
		get transformationSettings() { return drawingRef.current.transformationSettings },

		// Coordinate manipulation functions. Note the distinction between client points, graphical points and drawing points, all in different coordinate systems.
		getGraphicalCoordinates(cPoint, figureRect) {
			return getGraphicalCoordinates(cPoint, drawingRef.current, figureRect)
		},
		getDrawingCoordinates(cPoint, figureRect) {
			const gPoint = getGraphicalCoordinates(cPoint, drawingRef.current, figureRect)
			const inverseTransformation = drawingRef.current.transformationSettings.inverseTransformation
			return gPoint && inverseTransformation.apply(gPoint)
		},
		getPointFromEvent(event) {
			const cPoint = getClientCoordinatesFromEvent(event)
			const gPoint = getGraphicalCoordinates(cPoint, drawingRef.current)
			const inverseTransformation = drawingRef.current.transformationSettings.inverseTransformation
			return gPoint && inverseTransformation.apply(gPoint)
		},
		isInside(dPoint) {
			if (!dPoint)
				return false
			return drawingRef.current.transformationSettings.bounds.isInside(dPoint)
		},
		applyBounds(dPoint) {
			return drawingRef.current.transformationSettings.bounds.applyBounds(dPoint)
		},

		placeText(text, options) {
			return placeText(drawingRef.current, text, options)
		},
		clearText() {
			return drawingRef.current.gText.selectAll('*').remove()
		},
	}))

	// Initialize the SVG element once the drawing is loaded.
	const forceUpdate = useForceUpdate()
	useEffect(() => {
		if (figureRef.current) {
			drawingRef.current = initialize(id, figureRef.current, svgRef.current, canvasRef.current)
			forceUpdate() // A forced update is needed to ensure the new ref is applied into the DrawingContext.
		}
	}, [id, figureRef, svgRef, drawingRef, forceUpdate])

	// Make sure the transformation settings are always up-to-date.
	useEffect(() => {
		drawingRef.current.transformationSettings = transformationSettings
	}, [transformationSettings])

	// Render figure with SVG and Canvas properly placed.
	options.className = clsx('drawing', classes.drawing, options.className)
	return (
		<DrawingContext.Provider value={drawingRef.current}>
			<Figure ref={figureRef} {...filterOptions(options, figureDefaultOptions)}>
				{options.useSvg ? (
					<svg ref={svgRef} className={classes.drawingSVG} viewBox={`0 0 ${width} ${height}`}>
						<defs>
							<clipPath id={`noOverflow${id}`}>
								<rect x="0" y="0" width={width} height={height} fill="#fff" rx={7} />
							</clipPath>
							{options.svgDefs}
						</defs>
						{options.svgContents}
					</svg>
				) : null}
				{options.useCanvas ? <canvas ref={canvasRef} className={classes.drawingCanvas} width={width} height={height} /> : null}
				<div ref={htmlContentsRef} className={classes.drawingHtmlContainer}>
					{options.htmlContents}
				</div>
			</Figure>
		</DrawingContext.Provider>
	)
}
export default forwardRef(Drawing)

function initialize(id, figure, svg, canvas, transformationSettings) {
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
	return { id, figure, svg, d3svg, gText, canvas, context, transformationSettings }
}

/*
 * Positioning functions.
 */

// getGraphicalCoordinates takes client coordinates and transforms them to graphical coordinates. It may be provided with a figureRect, but if it's not present, then it's recalculated based on the references in the drawing.
function getGraphicalCoordinates(clientCoordinates, drawing, figureRect) {
	// If no clientCoordinates have been given, we cannot do anything.
	if (!clientCoordinates)
		return null

	// If no figure rectangle has been provided, find it. (It can be already provided for efficiency.)
	if (!figureRect) {
		const figureInner = drawing.figure && drawing.figure.inner
		if (!figureInner)
			return null
		figureRect = figureInner.getBoundingClientRect()
	}

	// Calculate the position.
	clientCoordinates = ensureVector(clientCoordinates, 2)
	return new Vector([
		(clientCoordinates.x - figureRect.x) * drawing.transformationSettings.graphicalBounds.width / figureRect.width,
		(clientCoordinates.y - figureRect.y) * drawing.transformationSettings.graphicalBounds.height / figureRect.height,
	])
}

// getClientCoordinatesFromEvent returns the point in SVG/Canvas coordinates based on an event.
function getClientCoordinatesFromEvent(event) {
	const eventProcessed = ((event.touches && event.touches[0]) || event)
	return new Vector({ x: eventProcessed.clientX, y: eventProcessed.clientY })
}

// placeText places a given text into the SVG element.
function placeText(drawing, text, options = {}) {
	options = processOptions(options, defaultPlaceTextOptions)
	const rotate = deg2rad(options.rotate)
	const dPoint = new Vector(options.x, options.y)
	const gPoint = drawing.transformationSettings.transformation.apply(dPoint)
	drawing.gText.append('text')
		.attr('text-anchor', options.textAnchor)
		.attr('transform', `rotate(${options.rotate})`)
		.attr('x', gPoint.x * Math.cos(rotate) + gPoint.y * Math.sin(rotate))
		.attr('y', -gPoint.x * Math.sin(rotate) + gPoint.y * Math.cos(rotate))
		.text(text)
}
const defaultPlaceTextOptions = {
	textAnchor: 'middle',
	x: 0,
	y: 0,
	rotate: 0, // Degrees.
}

// applyStyle takes an object and applies the corresponding style object to it. It returns the given object.
export function applyStyle(obj, style = {}) {
	Object.keys(style).forEach(key => {
		obj.style(key, style[key])
	})
	return obj
}

// useGraphicalMousePosition tracks the position of the mouse in graphical coordinates. This is of the from {x: 120, y: 90 }. The function must be provided with a reference to the drawing.
export function useGraphicalMousePosition(drawing) {
	// Acquire data.
	const clientMousePosition = useClientMousePosition()
	const figureRect = useBoundingClientRect(drawing && drawing.figure && drawing.figure.inner)

	// Return undefined on missing data.
	if (!clientMousePosition || !figureRect || figureRect.width === 0 || figureRect.height === 0)
		return undefined

	// Calculate the position in graphical coordinates.
	return getGraphicalCoordinates(clientMousePosition, drawing, figureRect)
}

// useMousePosition tracks the position of the mouse and gives the location in drawing coordinates. This is of the form { x: 3.5, y: -2.5 }. The function must be provided with a reference to the drawing.
export function useMousePosition(drawing) {
	// Acquire the position in graphical coordinates.
	const graphicalMousePosition = useGraphicalMousePosition(drawing)

	// Transform to drawing coordinates.
	const inverseTransformation = drawing.transformationSettings.inverseTransformation
	return graphicalMousePosition && inverseTransformation.apply(graphicalMousePosition)
}
