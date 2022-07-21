
import React, { useRef, useCallback, useEffect, useLayoutEffect } from 'react'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureBoolean, ensureObject, processOptions, filterOptions, removeProperties } from 'step-wise/util/objects'
import { Vector, ensureVector, ensureVectorArray, ensureCorner } from 'step-wise/geometry'

import { ensureReactElement, useEqualRefOnEquality, useEventListener } from 'util/react'

import { useDrawingContext, useTransformedOrGraphicalValue, useScaledOrGraphicalValue } from './DrawingContext'

// PositionedElement allows for the positioning of elements onto the drawing.
export function PositionedElement(props) {
	// Check input.
	let { children, position, graphicalPosition, shift, graphicalShift, rotate, scale, anchor, ignoreMouse, style } = processOptions(props, defaultPositionedElement)
	children = ensureReactElement(children)
	position = ensureVector(useTransformedOrGraphicalValue(position, graphicalPosition), 2)
	shift = ensureVector(useTransformedOrGraphicalValue(shift, graphicalShift), 2)
	rotate = ensureNumber(rotate)
	scale = ensureNumber(scale)
	anchor = ensureVector(anchor, 2)
	ignoreMouse = ensureBoolean(ignoreMouse)
	style = { ...defaultPositionedElement.style, ...ensureObject(style) }

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
	useLayoutEffect(updateElementPosition, [updateElementPosition, children])
	useEventListener('resize', updateElementPosition) // Window resize.
	useEffect(updateElementPosition, [updateElementPosition, drawing])

	// Render the children.
	return <div className="positionedElement" style={style} ref={ref}>{children}</div>
}
const defaultPositionedElement = {
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
}

// Label sets a label at a certain point. To set it up, give the point, the angle at which the label should be positioned, and the distance from said point. Optionally, the anchor point can be included too.
export function Label(props) {
	// Check input.
	let { children, position, graphicalPosition, distance, graphicalDistance, angle, anchor } = processOptions(props, defaultLabel)
	children = ensureReactElement(children)
	position = ensureVector(useTransformedOrGraphicalValue(position, graphicalPosition), 2)
	distance = ensureNumber(useScaledOrGraphicalValue(distance, graphicalDistance))
	angle = ensureNumber(angle)
	anchor = anchor === undefined ? getAnchorFromAngle(angle + Math.PI) : ensureVector(anchor, 2)

	// Find the position shift and apply it.
	const delta = Vector.fromPolar(distance, angle)
	return <PositionedElement {...filterOptions(removeProperties(props, 'position'), defaultPositionedElement)} graphicalPosition={position.add(delta)} anchor={anchor}>{children}</PositionedElement>
}
const defaultLabel = {
	...defaultPositionedElement,
	distance: undefined,
	graphicalDistance: 6,
	angle: -Math.PI * 3 / 4,
	anchor: undefined,
}

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
	points = ensureCorner(useTransformedOrGraphicalValue(points, graphicalPoints), 2)
	size = ensureNumber(useScaledOrGraphicalValue(size, graphicalSize))

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
	graphicalPoints: [Vector.i, Vector.zero, Vector.j],
	size: undefined,
	graphicalSize: 30,
}

// LineLabel is a label that is placed along a line, between two points. To define it, we need two points defining the line. We also need a third point "oppositeTo" which the label should be placed opposite to. 
export function LineLabel(props) {
	// Check input.
	let { children, points, graphicalPoints, oppositeTo, graphicalOppositeTo } = processOptions(props, defaultLineLabel)
	children = ensureReactElement(children)
	points = ensureVectorArray(useTransformedOrGraphicalValue(points, graphicalPoints), 2, 2)
	oppositeTo = ensureVector(useTransformedOrGraphicalValue(oppositeTo, graphicalOppositeTo))

	// Determine the angle.
	const delta = points[1].subtract(points[0])
	const relative = oppositeTo.subtract(points[0])
	const sign = Math.sign(delta.y * relative.x - delta.x * relative.y) // Cross product.
	const angle = delta.argument + sign * Math.PI / 2

	// Set up the PositionedElement.
	const position = points[0].interpolate(points[1])
	return <Label {...filterOptions(props, defaultLabel)} graphicalPosition={position} angle={angle}>{children}</Label>
}
const defaultLineLabel = {
	...removeProperties(defaultLabel, ['position', 'graphicalPosition']),
	points: undefined,
	graphicalPoints: [Vector.i, Vector.zero],
	oppositeTo: undefined,
	graphicalOppositeTo: undefined,
}