
import React, { useRef, useCallback, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureBoolean, ensureObject, processOptions } from 'step-wise/util/objects'
import { Vector, ensureVector } from 'step-wise/geometry'

import { ensureReactElement, useEqualRefOnEquality } from 'util/react'
import { notSelectable } from 'ui/theme'
import { useResizeListener } from 'ui/layout/App'

import { useDrawingContext, useTransformedOrGraphicalValue } from '../DrawingContext'

const useStyles = makeStyles((theme) => ({
	element: {
		left: 0,
		...notSelectable,
		position: 'absolute',
		top: 0,
		transformOrigin: '0% 0%',
		zIndex: 0,
	},
}))

export const defaultElement = {
	children: null,
	position: undefined,
	graphicalPosition: Vector.zero,
	shift: undefined,
	graphicalShift: Vector.zero, // Useful if the position is defined in drawing coordinates but the shift is in graphical coordinates.
	rotate: 0, // Radians.
	scale: 1,
	anchor: new Vector(0.5, 0.5), // Use 0 for left/top and 1 for right/bottom.
	ignoreMouse: true,
	style: {},
	className: undefined,
}

export default function Element(props) {
	const classes = useStyles()

	// Check input.
	let { children, position, graphicalPosition, shift, graphicalShift, rotate, scale, anchor, ignoreMouse, style } = processOptions(props, defaultElement)
	children = ensureReactElement(children)
	position = ensureVector(useTransformedOrGraphicalValue(position, graphicalPosition), 2)
	shift = ensureVector(useTransformedOrGraphicalValue(shift, graphicalShift), 2)
	rotate = ensureNumber(rotate)
	scale = ensureNumber(scale)
	anchor = ensureVector(anchor, 2)
	ignoreMouse = ensureBoolean(ignoreMouse)
	style = { ...defaultElement.style, ...ensureObject(style) }

	// Check if mouse events should be ignore.
	if (ignoreMouse)
		style.pointerEvents = 'none'

	// Make sure the vector references remain consistent.
	position = position.add(shift)
	position = useEqualRefOnEquality(position)
	anchor = useEqualRefOnEquality(anchor)

	// Extract the drawing from the context.
	const drawing = useDrawingContext()

	// Define a handler that positions the element accordingly.
	const ref = useRef()
	const updateElementPosition = useCallback(() => {
		// Can we do anything?
		const element = ref.current
		if (!element || !drawing || !drawing.figure || !drawing.figure.inner || !drawing.transformationSettings || !drawing.transformationSettings.graphicalBounds)
			return

		// Calculate the scale at which the figure is drawn.
		const figureRect = drawing.figure.inner.getBoundingClientRect()
		const figureScale = figureRect.width / drawing.transformationSettings.graphicalBounds.width

		// Position the element accordingly.
		element.style.transformOrigin = `${anchor.x * 100}% ${anchor.y * 100}%`
		element.style.transform = `
			translate(${-anchor.x * 100}%, ${-anchor.y * 100}%)
			scale(${figureScale})
			translate(${position.x}px, ${position.y}px)
			scale(${scale})
			rotate(${rotate * 180 / Math.PI}deg)
		`
	}, [ref, drawing, position, rotate, scale, anchor])

	// Properly position the element on a change of settings, a change of contents or on a window resize.
	useEffect(updateElementPosition, [updateElementPosition, children, drawing])
	useResizeListener(updateElementPosition)

	// Render the children.
	return <div className={clsx('drawingElement', classes.element, props.className)} style={style} ref={ref}>{children}</div>
}
Element.defaultProps = defaultElement
