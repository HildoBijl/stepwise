
import React, { useRef, useCallback, useEffect, useLayoutEffect } from 'react'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureObject, processOptions, filterOptions, removeProperties } from 'step-wise/util/objects'
import { Vector, ensureVector, ensureCorner } from 'step-wise/geometry'

import { ensureReactElement, useEqualRefOnEquality, useEventListener } from 'util/react'

import { useDrawingContext, useTransformedOrGraphicalValue, useScaledOrGraphicalValue } from './DrawingContext'

// PositionedElement allows for the positioning of elements onto the drawing.
export function PositionedElement(props) {
	// Check input.
	let { children, position, graphicalPosition, rotate, scale, anchor, style } = processOptions(props, defaultPositionedElement)
	children = ensureReactElement(children)
	position = ensureVector(useTransformedOrGraphicalValue(position, graphicalPosition, defaultPositionedElementPosition), 2)
	rotate = ensureNumber(rotate)
	scale = ensureNumber(scale)
	anchor = ensureVector(anchor, 2)
	style = ensureObject(style)

	// Make sure the vector references remain consistent.
	position = useEqualRefOnEquality(position)
	anchor = useEqualRefOnEquality(anchor)
	console.log(anchor.str)
	console.log(position.str)

	// Extract the drawing from the context.
	const drawing = useDrawingContext()

	// Define a handler that positions the element accordingly.
	const ref = useRef()
	const updateElementPosition = useCallback(() => {
		// Can we do anything?
		const element = ref.current
		if (!element || !drawing || !drawing.figure || !drawing.figure.inner || !drawing.transformationSettings || !drawing.transformationSettings.bounds)
			return

		// Calculate the scale at which the figure is drawn.
		const figureRect = drawing.figure.inner.getBoundingClientRect()
		const figureScale = figureRect.width / drawing.transformationSettings.bounds.width

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
	useLayoutEffect(updateElementPosition, [updateElementPosition, children])
	useEventListener('resize', updateElementPosition) // Window resize.
	useEffect(updateElementPosition, [updateElementPosition, drawing])

	// Render the children.
	return <div className="positionedElement" style={style} ref={ref}>{children}</div>
}
const defaultPositionedElement = {
	children: null,
	position: undefined,
	graphicalPosition: undefined,
	rotate: 0, // Radians.
	scale: 1,
	anchor: new Vector(0.5, 0.5), // Use 0 for left/top and 1 for right/bottom.
	style: {},
}
const defaultPositionedElementPosition = Vector.zero

// Label sets a label at a certain point. To set it up, give the point, the angle at which the label should be positioned, and the distance from said point. Optionally, the anchor point can be included too.
export function Label(props) {
	// Check input.
	let { children, position, graphicalPosition, distance, graphicalDistance, angle, anchor } = processOptions(props, defaultLabel)
	children = ensureReactElement(children)
	position = ensureVector(useTransformedOrGraphicalValue(position, graphicalPosition, defaultLabelPosition), 2)
	distance = ensureNumber(useScaledOrGraphicalValue(distance, graphicalDistance, defaultLabelDistance))
	angle = ensureNumber(angle)
	anchor = anchor === undefined ? getAnchorFromAngle(angle + Math.PI) : ensureVector(anchor, 2)

	// Find the position shift and apply it.
	const delta = Vector.fromPolar(distance, angle)
	return <PositionedElement {...filterOptions(props, defaultPositionedElement)} graphicalPosition={position.add(delta)} anchor={anchor}>{children}</PositionedElement>
}
const defaultLabel = {
	...defaultPositionedElement,
	distance: undefined,
	graphicalDistance: undefined,
	angle: -Math.PI * 3 / 4,
	anchor: undefined,
}
const defaultLabelPosition = Vector.zero
const defaultLabelDistance = 6

function getAnchorFromAngle(angle) {
	const processCoordinate = (angle) => {
		// Prepare the angle.
		angle = angle % (2 * Math.PI)
		if (angle < 0)
			angle += 2 * Math.PI

		// Check various cases.
		if (angle <= Math.PI / 4)
			return 1
		if (angle < Math.PI * 3 / 4)
			return 0.5 - 0.5 * Math.tan(angle - Math.PI / 2)
		if (angle <= Math.PI * 5 / 4)
			return 0
		if (angle <= Math.PI * 7 / 4)
			return 0.5 + 0.5 * Math.tan(angle - Math.PI * 3 / 2)
		return 1
	}
	return new Vector(processCoordinate(angle), processCoordinate(angle - Math.PI / 2))
}

// CornerLabel is a label that is placed in the corner between two lines. To define it, we need three points defining the angle. A size parameter indicating the graphical size of the label can also be given, which is used to properly distance it.
export function CornerLabel(props) {
	// Check input.
	let { children, points, graphicalPoints, size, graphicalSize } = processOptions(props, defaultCornerLabel)
	children = ensureReactElement(children)
	points = ensureCorner(useTransformedOrGraphicalValue(points, graphicalPoints, defaultCornerLabelPoints), 2)
	size = ensureNumber(useScaledOrGraphicalValue(size, graphicalSize, defaultCornerLabelSize))

	// Calculate the given position. Use an adjustment on the size of the corner: smaller angles should give a larger distance. For this adjustment, pretend the label is circular with the given size as double the radius.
	const point = points[1]
	const vector1 = points[0].subtract(point).normalize()
	const vector2 = points[2].subtract(point).normalize()
	const adjustedDistance = size / 2 * Math.sqrt(2 / Math.max(0.1, 1 - vector1.dotProduct(vector2)))
	const delta = vector1.interpolate(vector2).normalize().multiply(adjustedDistance)
	return <PositionedElement {...filterOptions(props, defaultPositionedElement)} graphicalPosition={point.add(delta)}>{children}</PositionedElement>
}
const defaultCornerLabel = {
	...removeProperties(defaultPositionedElement, ['position', 'graphicalPosition']),
	points: undefined,
	graphicalPoints: undefined,
	size: undefined,
	graphicalSize: undefined,
}
const defaultCornerLabelPoints = [Vector.i, Vector.zero, Vector.j]
const defaultCornerLabelSize = 30