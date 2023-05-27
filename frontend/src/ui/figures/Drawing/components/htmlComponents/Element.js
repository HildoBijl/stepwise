import React, { forwardRef, useCallback, useLayoutEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureBoolean, ensureObject, processOptions } from 'step-wise/util/objects'
import { Vector, ensureVector } from 'step-wise/geometry'

import { useEnsureRef, ensureReactElement, useEqualRefOnEquality } from 'util/react'
import { notSelectable } from 'ui/theme'
import { useResizeListener } from 'ui/layout/App'

import { useDrawingContext, useGraphicalVector, HtmlPortal } from '../../DrawingContext'

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
	graphicalPosition: undefined,
	rotate: 0, // Radians.
	scale: 1,
	anchor: new Vector(0.5, 0.5), // Use 0 for left/top and 1 for right/bottom.
	ignoreMouse: true,
	style: {},
	className: undefined,
}

export const Element = forwardRef((props, ref) => {
	ref = useEnsureRef(ref)
	const classes = useStyles()

	// Check input.
	let { children, position, graphicalPosition, rotate, scale, anchor, ignoreMouse, style } = processOptions(props, defaultElement)
	children = ensureReactElement(children)
	position = ensureVector(useGraphicalVector(position, graphicalPosition), 2)
	rotate = ensureNumber(rotate)
	scale = ensureNumber(scale)
	anchor = ensureVector(anchor, 2)
	ignoreMouse = ensureBoolean(ignoreMouse)
	style = { ...defaultElement.style, ...ensureObject(style) }

	// Check if mouse events should be ignored.
	if (ignoreMouse)
		style.pointerEvents = 'none'

	// Make sure the vector references remain consistent.
	position = useEqualRefOnEquality(position)
	anchor = useEqualRefOnEquality(anchor)

	// Extract the drawing from the context.
	const { transformationSettings, figure } = useDrawingContext()

	// Define a handler that positions the element accordingly.
	const updateElementPosition = useCallback(() => {
		// Can we do anything?
		const element = ref.current
		if (!element || !transformationSettings?.graphicalBounds || !figure?.inner)
			return

		// Calculate the scale at which the figure is drawn.
		const figureRect = figure.inner.getBoundingClientRect()
		const figureScale = figureRect.width / transformationSettings.graphicalBounds.width

		// Position the element accordingly.
		element.style.transformOrigin = `${anchor.x * 100}% ${anchor.y * 100}%`
		element.style.transform = `
			translate(${-anchor.x * 100}%, ${-anchor.y * 100}%)
			scale(${figureScale})
			translate(${position.x}px, ${position.y}px)
			scale(${scale})
			rotate(${rotate * 180 / Math.PI}deg)
		`
	}, [ref, transformationSettings, figure, position, rotate, scale, anchor])

	// Properly position the element on a change of settings, a change of contents or on a window resize.
	useLayoutEffect(updateElementPosition, [updateElementPosition, children])
	useResizeListener(updateElementPosition)

	// Render the children inside the Drawing HTML contents container.
	return <HtmlPortal><div ref={ref} className={clsx('drawingElement', classes.element, props.className)} style={style}>{children}</div></HtmlPortal>
})
Element.defaultProps = defaultElement
Element.plotType = 'html'
export default Element
