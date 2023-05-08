// Every Drawing provides a context. This file deals with everything related to that.

import { createContext, useContext } from 'react'

import { isNumber } from 'step-wise/util/numbers'
import { hasIterableParameters, applyToEachParameter } from 'step-wise/util/objects'
import { Vector, Transformation } from 'step-wise/geometry'

import { Portal } from 'util/react'

import { applyTransformation } from './transformation'

// Set up a context so elements inside the drawing can ask for the drawing.
export const DrawingContext = createContext(null)

// Get the data out of the context.
export function useDrawingContext() {
	return useContext(DrawingContext)
}

// Get the ID of the surrounding drawing.
export function useDrawingId() {
	const drawing = useDrawingContext()
	return drawing?.id
}

// Get specifically the bounds from the drawing context.
export function useBounds() {
	const drawing = useDrawingContext()
	return drawing?.transformationSettings?.bounds
}

// Get specifically the graphicalBounds from the drawing context.
export function useGraphicalBounds() {
	const drawing = useDrawingContext()
	return drawing?.transformationSettings?.graphicalBounds
}

// useTransformation receives a vector, an array of vectors or a basic object with only vectors, and applies the transformation from the drawing to all these vectors.
export function useTransformation(points, preventShift) {
	// Extract the transformation.
	const drawing = useDrawingContext()
	const transformation = (drawing?.transformationSettings?.transformation) || Transformation.getIdentity(2)

	// Apply the transformation.
	return applyTransformation(points, transformation, preventShift)
}

// useScaling receives a number, an array of numbers or a basic object with only number properties, and multiplies these numbers by the scale.
export function useScaling(numbers) {
	// Extract the scaling factor.
	const drawing = useDrawingContext()
	const scale = (drawing?.transformationSettings?.scale) || [1, 1]
	const scaleFactor = Math.pow(scale.reduce((product, value) => value * product, 1), 1 / scale.length) // Geometric mean of the scale of all axes.

	// Define a (recursive) scaling function.
	const applyScaling = numbers => {
		// On undefined do nothing.
		if (numbers === undefined)
			return undefined

		// If the numbers parameter is a single number, apply the scaling directly.
		if (isNumber(numbers))
			return numbers * scaleFactor

		// Apply the scaling to each element of the given array/object.
		return applyToEachParameter(numbers, number => applyScaling(number))
	}

	// Run the scaling.
	return applyScaling(numbers)
}

// useGraphicalVector takes a (set of) point(s) (Vector(s)) in drawing coordinates, and a corresponding (set of) point(s) in graphical coordinates. It transforms the drawing coordinates to graphical coordinates and then adds the graphical coordinates. If either of them is undefined, zero is used.
export function useGraphicalVector(drawingPoints, graphicalPoints, preventShift) {
	const transformedPoints = useTransformation(drawingPoints, preventShift)

	// If only one of the two is given, simply apply it.
	if (drawingPoints === undefined) {
		if (graphicalPoints === undefined)
			return undefined
		return graphicalPoints
	}
	if (graphicalPoints === undefined)
		return transformedPoints

	// If both are given, add them up. How to do this depends on whether a single vector or an array/object of vectors was given.
	if (Vector.isVector(transformedPoints)) {
		if (Vector.isVector(graphicalPoints))
			return transformedPoints.add(graphicalPoints)
		return applyToEachParameter(graphicalPoints, point => transformedPoints.add(point))
	}
	if (Vector.isVector(graphicalPoints))
		return applyToEachParameter(transformedPoints, point => point.add(graphicalPoints))
	return applyToEachParameter(transformedPoints, (point, index) => point.add(graphicalPoints[index]))
}

// useGraphicalDistance takes a number (like a distance) in drawing coordinates, and a corresponding number in graphical coordinates. It transforms (scales) the drawing-distance to a graphical value. If given, the graphical distance is then added, returning the sum of the two.
export function useGraphicalDistance(drawingValue, graphicalValue) {
	const scaledValue = useScaling(drawingValue)
	if (drawingValue === undefined) {
		if (graphicalValue === undefined)
			return undefined
		return graphicalValue
	}
	if (graphicalValue === undefined)
		return scaledValue
	return scaledValue + graphicalValue
}

// useGraphicalObject takes two objects (think of Lines or so), one in drawing coordinates and the other in graphical coordinates. Possibly only one of the two is given. It transforms the drawing one to graphical coordinates. If both are given, they are then added together. This is all dependent on whether they have a transform-function (needed for the transformation) and an add-function (needed for the addition). 
export function useGraphicalObject(drawingObject, graphicalObject) {
	// If only one is given, return the other.
	const transformedObject = useTransformation(drawingObject)
	if (drawingObject === undefined) {
		if (graphicalObject === undefined)
			return undefined
		return graphicalObject
	}
	if (graphicalObject === undefined)
		return transformedObject

	// If both are given, check if we need to apply it iteratively.
	if (!hasIterableParameters(transformedObject)) {
		if (!hasIterableParameters(graphicalObject))
			return transformedObject.add(graphicalObject)
		return applyToEachParameter(graphicalObject, obj => transformedObject.add(obj))
	}
	if (!hasIterableParameters(graphicalObject))
		return applyToEachParameter(transformedObject, obj => obj.add(graphicalObject))
	return applyToEachParameter(transformedObject, (obj, index) => obj.add(graphicalObject[index]))
}

/*
 * Portals for getting DOM elements in the right container.
 */

export function HtmlPortal({ children }) {
	const { htmlContents } = useDrawingContext()
	return <Portal target={htmlContents}>{children}</Portal>
}

const IsInSvgPortalContext = createContext()
export function SvgPortal({ children }) {
	const { svg } = useDrawingContext()
	const isInSvgPortal = useContext(IsInSvgPortalContext)
	return isInSvgPortal ? children : <IsInSvgPortalContext.Provider value={true}><Portal target={svg}>{children}</Portal></IsInSvgPortalContext.Provider> // Only set up a portal on the first SVG component encountered (like a Group) and not on descendants (like shapes inside that Group).
}

export function SvgDefsPortal({ children }) {
	const { svgDefs } = useDrawingContext()
	return <Portal target={svgDefs}>{children}</Portal>
}
