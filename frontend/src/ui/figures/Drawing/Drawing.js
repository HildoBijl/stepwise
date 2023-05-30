/* Drawing is the parent component of every drawing made, either through SVG or Canvas. It is generally used inside other components to make specific types of plots, figures or similar.
 * When Drawing is given a ref, it places in this ref an object { svg: ..., canvas: ... } with references to the respective DOM elements. Note that the option useCanvas needs to be set to true if a Canvas is desired. The option useSvg is by default true.
 */

import React, { useRef, forwardRef, useImperativeHandle, useId } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'
import { processOptions, filterOptions } from 'step-wise/util/objects'
import { resolveFunctions } from 'step-wise/util/functions'
import { Vector, ensureVector } from 'step-wise/geometry'

import { getEventPosition } from 'util/dom'
import { useMousePosition as useClientMousePosition, useBoundingClientRect, useForceUpdateEffect } from 'util/react'
import { notSelectable } from 'ui/theme'

import Figure, { defaultFigureOptions } from '../Figure'

import { DrawingContext, useDrawingContext, SvgDefsPortal } from './DrawingContext'

const defaultDrawingOptions = {
	...defaultFigureOptions,
	maxWidth: bounds => bounds.width, // Override the default maxWidth (undefined, meaning full width) to the bounds. Set to "fill" to always fill the available page width.
	transformationSettings: undefined, // An object containing data on figure bounds and a transformation that is applied to get from drawing coordinates to graphical coordinates.
	useSvg: true,
	useCanvas: false,
}
delete defaultDrawingOptions.aspectRatio // We override the aspect ratio based on the width and height of the viewport.
export { defaultDrawingOptions }

const useStyles = makeStyles((theme) => ({
	drawing: {},

	drawingSVG: {
		display: 'block',
		...notSelectable,
		overflow: 'visible',
		pointerEvents: 'none', // Prevent a box around the SVG when clicking on it.
		width: '100%',
		zIndex: 2,
	},

	drawingCanvas: {
		height: '100%',
		...notSelectable,
		width: '100%',
		zIndex: 1,
	},
}))

export const Drawing = forwardRef((options, ref) => {
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
	const figureRef = useRef()
	const htmlContentsRef = useRef()
	const svgRef = useRef()
	const svgDefsRef = useRef()
	const canvasRef = useRef()
	useForceUpdateEffect() // Rerender the component once references are established.

	// Determine figure size parameters to use for rendering.
	const { graphicalBounds } = transformationSettings
	const { width, height } = graphicalBounds
	options.aspectRatio = height / width // This must be passed on to the Figure object.
	options.maxWidth = options.maxWidth === 'fill' ? undefined : resolveFunctions(options.maxWidth, graphicalBounds)

	// Set up refs and make them accessible to any implementing component.
	useImperativeHandle(ref, () => ({
		// Basic getters.
		get figure() { return figureRef.current },
		get svg() { return svgRef.current },
		get canvas() { return canvasRef.current },
		get context() { return canvasRef.current.getContext('2d') },
		get transformationSettings() { return transformationSettings },
		get width() { return transformationSettings.graphicalBounds.width },
		get height() { return transformationSettings.graphicalBounds.height },
		get bounds() { return transformationSettings.bounds },
		get graphicalBounds() { return transformationSettings.graphicalBounds },
		get transformation() { return transformationSettings.transformation },
		get inverseTransformation() { return transformationSettings.inverseTransformation },
		get scale() { return transformationSettings.scale },

		// Coordinate manipulation functions. Note the distinction between client points, graphical points and drawing points, all in different coordinate systems.
		getGraphicalCoordinates(cPoint, figureRect) {
			return getGraphicalCoordinates(cPoint, transformationSettings, figureRef.current, figureRect)
		},
		getDrawingCoordinates(cPoint, figureRect) {
			const gPoint = getGraphicalCoordinates(cPoint, transformationSettings, figureRef.current, figureRect)
			const inverseTransformation = transformationSettings.inverseTransformation
			return gPoint && inverseTransformation.apply(gPoint)
		},
		getPointFromEvent(event) {
			const cPoint = getEventPosition(event)
			const gPoint = getGraphicalCoordinates(cPoint, transformationSettings, figureRef.current)
			const inverseTransformation = transformationSettings.inverseTransformation
			return gPoint && inverseTransformation.apply(gPoint)
		},
		contains(dPoint) {
			if (!dPoint)
				return false
			return transformationSettings.bounds.contains(dPoint)
		},
		applyBounds(dPoint) {
			return transformationSettings.bounds.applyBounds(dPoint)
		},
	}))

	// Render figure with SVG and Canvas properly placed.
	options.className = clsx('drawing', classes.drawing, options.className)
	return (
		<DrawingContext.Provider value={{ id, transformationSettings, figure: figureRef.current, svg: svgRef.current, svgDefs: svgDefsRef.current, htmlContents: htmlContentsRef.current, canvas: canvasRef.current }}>
			<Figure ref={figureRef} {...filterOptions(options, defaultFigureOptions)}>
				{options.useSvg ? (
					<svg ref={svgRef} className={classes.drawingSVG} viewBox={`0 0 ${width} ${height}`}>
						<defs ref={svgDefsRef} />
					</svg>
				) : null}
				{options.useCanvas ? <canvas ref={canvasRef} className={classes.drawingCanvas} width={width} height={height} /> : null}
				<div ref={htmlContentsRef} className={classes.drawingHtmlContainer} />
				{options.children}

				{/* Clip path to prevent overflow. */}
				<SvgDefsPortal>
					<clipPath id={`noOverflow${id}`}>
						<rect x="0" y="0" width={width} height={height} fill="#fff" rx={7} />
					</clipPath>
				</SvgDefsPortal>

				{/* Markers for distance arrows. */}
				<SvgDefsPortal>
					<marker id="distanceArrowHead" key="distanceArrowHead" markerWidth="12" markerHeight="12" refX="12" refY="6" orient="auto-start-reverse">
						<path d="M0 0 L12 6 L0 12" stroke="black" strokeWidth="1" fill="none" />
					</marker>
					<marker id="forceArrowHead" key="forceArrowHead" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto-start-reverse">
						<polygon points="8 4, 0 0, 2 4, 0 8" />
					</marker>
				</SvgDefsPortal>
			</Figure>
		</DrawingContext.Provider>
	)
})
export default Drawing

/*
 * Positioning functions.
 */

// getGraphicalCoordinates takes client coordinates and transforms them to graphical coordinates. It may be provided with a figureRect, but if it's not present, then it's recalculated based on the references in the drawing.
function getGraphicalCoordinates(clientCoordinates, transformationSettings, figure, figureRect) {
	// If no clientCoordinates have been given, we cannot do anything.
	if (!clientCoordinates)
		return null

	// If no figure rectangle has been provided, find it. (It can be already provided for efficiency.)
	if (!figureRect) {
		const figureInner = figure?.inner
		if (!figureInner)
			return null
		figureRect = figureInner.getBoundingClientRect()
	}

	// Calculate the position.
	clientCoordinates = ensureVector(clientCoordinates, 2)
	return new Vector([
		(clientCoordinates.x - figureRect.x) * transformationSettings.graphicalBounds.width / figureRect.width,
		(clientCoordinates.y - figureRect.y) * transformationSettings.graphicalBounds.height / figureRect.height,
	])
}

// useGraphicalMousePosition tracks the position of the mouse in graphical coordinates. This is of the from {x: 120, y: 90 }.
export function useGraphicalMousePosition(drawing) {
	// Acquire data.
	let { figure, transformationSettings } = useDrawingContext()
	if (drawing) { // ToDo: remove this once contexts have been established for input fields.
		figure = drawing.figure
		transformationSettings = drawing.transformationSettings
	}
	const clientMousePosition = useClientMousePosition()
	const figureRect = useBoundingClientRect(figure?.inner)

	// Return undefined on missing data.
	if (!clientMousePosition || !figureRect || figureRect.width === 0 || figureRect.height === 0)
		return undefined

	// Calculate the position in graphical coordinates.
	return getGraphicalCoordinates(clientMousePosition, transformationSettings, figure, figureRect)
}

// useMousePosition tracks the position of the mouse and gives the location in drawing coordinates. This is of the form { x: 3.5, y: -2.5 }. The function must be provided with a reference to the drawing.
export function useMousePosition() {
	// Acquire the position in graphical coordinates.
	const { transformationSettings } = useDrawingContext()
	const graphicalMousePosition = useGraphicalMousePosition()

	// Transform to drawing coordinates.
	const inverseTransformation = transformationSettings.inverseTransformation
	return graphicalMousePosition && inverseTransformation.apply(graphicalMousePosition)
}
