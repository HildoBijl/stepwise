/* Drawing is the parent component of every drawing made, either through SVG or Canvas. It is generally used inside other components to make specific types of plots, figures or similar.
 * When Drawing is given a ref, it places in this ref an object { svg: ..., canvas: ... } with references to the respective DOM elements. Note that the option useCanvas needs to be set to true if a Canvas is desired. useSVG is by default set to true, but can be turned off.
 */

import React, { useRef, forwardRef, useImperativeHandle, useState, useEffect, useLayoutEffect } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { select } from 'd3-selection'

import { processOptions, filterOptions } from 'step-wise/util/objects'
import { deg2rad } from 'step-wise/util/numbers'

import { useEventListener } from 'util/react'
import { notSelectable } from 'ui/theme'

import Figure, { defaultOptions as figureDefaultOptions } from './Figure'

const defaultOptions = {
	...figureDefaultOptions, // Includes a maxWidth option to set the maximum width of the figure.
	width: 800, // Viewport width.
	height: 600, // Viewport height.
	useSVG: true,
	useCanvas: false,
	svgContents: undefined, // JSX elements that need to be placed directly into the SVG container.
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
	const [elementsData, setElementsData] = useState([])
	const [defs, setDefs] = useState([])
	const positionedElementsRef = useRef()

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

		// Through addDef and removeDef child elements can add definitions to the SVG element. The functions support single element additions/removals or arrays to add/remove.
		addDef(def) {
			def = Array.isArray(def) ? def : [def]
			setDefs(defs => [...defs, ...def])
		},
		removeDef(def) {
			def = Array.isArray(def) ? def : [def]
			setDefs(defs => defs.filter(currDef => !def.includes(currDef)))
		},

		// Through placeElement and removeElement child elements can add extra React objects to the SVG element.
		placeElement(element, options = {}) {
			setElementsData(elementsData => [...elementsData, { element, options }])
		},
		removeElement(element) {
			setElementsData(elementsData => elementsData.filter(currElement => element !== currElement.element))
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

	// Place elements that need to be placed.
	useLayoutEffect(() => {
		placeElements(drawingRef.current, elementsData, positionedElementsRef.current.children)
	}, [drawingRef, elementsData, positionedElementsRef])

	// Also replace elements on window resizes.
	useEventListener('resize', () => {
		placeElements(drawingRef.current, elementsData, positionedElementsRef.current.children)
	})

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
						{defs}
					</defs>
					{options.svgContents}
				</svg>
			) : null}
			{options.useCanvas ? <canvas ref={canvasRef} width={options.width} height={options.height} /> : null}
			<div ref={positionedElementsRef}>
				{elementsData.map((currElement, index) => <div key={index} className="positionedElement">{currElement.element}</div>)}
			</div>
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

// placeElements places elements onto a drawing subject to the given elements data (an array with { element: [...], options: {...} } form).
function placeElements(drawing, elementsData, positionedElements) {
	// Can we place elements?
	if (!drawing || elementsData.length === 0)
		return

	// Calculate the scale at which the figure is drawn.
	const figureRect = drawing.figure.inner.getBoundingClientRect()
	const figureScale = figureRect.width / drawing.width

	// Walk through all positioned elements and place them accordingly.
	elementsData.forEach((elementData, index) => {
		const domElement = positionedElements[index]
		const { x, y, scale, rotate, horizontalAnchor, verticalAnchor } = processOptions(elementData.options, defaultPlaceElementOptions)
		domElement.style.transformOrigin = `${horizontalAnchor * 100}% ${verticalAnchor * 100}%`
		domElement.style.transform = `
			translate(${-horizontalAnchor * 100}%, ${-verticalAnchor * 100}%)
			scale(${figureScale})
			translate(${x}px, ${y}px)
			scale(${scale})
			rotate(${rotate}deg)
		`
	})
}
const defaultPlaceElementOptions = {
	x: 0,
	y: 0,
	scale: 1,
	rotate: 0, // Degrees.
	horizontalAnchor: 0.5, // Middle. 0 is left and 1 is right.
	verticalAnchor: 0.5, // Middle. 0 is top and 1 is bottom.
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