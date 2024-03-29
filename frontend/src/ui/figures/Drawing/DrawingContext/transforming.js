import { isNumber, hasIterableParameters, applyMapping } from 'step-wise/util'
import { Vector, Transformation } from 'step-wise/geometry'

import { applyTransformation } from '../transformation'

import { useTransformationSettings } from './context'

// useTransformation receives a vector, an array of vectors or a basic object with only vectors, and applies the transformation from the drawing to all these vectors.
export function useTransformation(points, preventShift) {
	// Extract the transformation.
	const transformation = useTransformationSettings()?.transformation || Transformation.getIdentity(2)

	// Apply the transformation.
	return applyTransformation(points, transformation, preventShift)
}

// useScaling receives a number, an array of numbers or a basic object with only number properties, and multiplies these numbers by the scale.
export function useScaling(numbers) {
	// Extract the scaling factor.
	const scale = useTransformationSettings()?.scale || [1, 1]
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
		return applyMapping(numbers, number => applyScaling(number))
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
		return applyMapping(graphicalPoints, point => transformedPoints.add(point))
	}
	if (Vector.isVector(graphicalPoints))
		return applyMapping(transformedPoints, point => point.add(graphicalPoints))
	return applyMapping(transformedPoints, (point, index) => point.add(graphicalPoints[index]))
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
		return applyMapping(graphicalObject, obj => transformedObject.add(obj))
	}
	if (!hasIterableParameters(graphicalObject))
		return applyMapping(transformedObject, obj => obj.add(graphicalObject))
	return applyMapping(transformedObject, (obj, index) => obj.add(graphicalObject[index]))
}
