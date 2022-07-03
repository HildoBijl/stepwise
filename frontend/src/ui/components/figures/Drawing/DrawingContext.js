// Every Drawing provides a context. This file deals with everything related to that.

import { createContext, useContext } from 'react'

import { isNumber } from 'step-wise/util/numbers'
import { applyToEachParameter } from 'step-wise/util/objects'

import { Vector, Transformation } from 'step-wise/geometry'

// Set up a context so elements inside the drawing can ask for the drawing.
export const DrawingContext = createContext(null)

// Get the data out of the context.
export function useDrawingContext() {
	return useContext(DrawingContext)
}

// Get specifically the bounds from the drawing context.
export function useBounds() {
	const drawing = useDrawingContext()
	return drawing?.transformationSettings?.bounds
}

// useTransformation receives a vector, an array of vectors or a basic object with only vectors, and applies the transformation from the drawing to all these vectors.
export function useTransformation(points, preventShift) {
	// Extract the transformation.
	const drawing = useDrawingContext()
	const transformation = (drawing?.transformationSettings?.transformation) || Transformation.getIdentity(2)

	// Define a (recursive) transformation function.
	const applyTransformation = points => {
		// On undefined do nothing.
		if (points === undefined)
			return undefined

		// If the points parameter is a single vector, apply it.
		if (points instanceof Vector)
			return transformation.apply(points, preventShift)

		// If the parameter has a transform function, apply it.
		if (typeof points.transform === 'function')
			return points.transform(transformation, preventShift)

		// Apply the transformation to each element of the given array/object.
		return applyToEachParameter(points, point => applyTransformation(point))
	}

	// Run the transformation.
	return applyTransformation(points)
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

// useTransformedOrGraphicalValue takes two values: a (set of) points in drawing coordinates and a (set of) points in graphical coordinates. If the first one is defined, it is scaled and used. Otherwise the second is used. If both fail, the third value given (the default) will be used.
export function useTransformedOrGraphicalValue(drawingPoints, graphicalPoints, preventShift = false) {
	const transformedPoints = useTransformation(drawingPoints, preventShift)
	if (drawingPoints)
		return transformedPoints
	return graphicalPoints
}

// useScaledOrGraphicalValue takes two numbers: a size in drawing coordinates and a size in graphical coordinates. If the first one is defined, it is scaled and used. Otherwise the second is used. If both fail, the third value given (the default) will be used.
export function useScaledOrGraphicalValue(drawingSize, graphicalSize) {
	const scaledSize = useScaling(drawingSize)
	if (drawingSize !== undefined)
		return scaledSize
	return graphicalSize
}
