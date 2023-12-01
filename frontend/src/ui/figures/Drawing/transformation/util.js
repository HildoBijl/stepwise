import { useMemo } from 'react'

import { ensureNumber, ensureInt, applyMapping } from 'step-wise/util'
import { Vector, ensureVector, Rectangle, Transformation, ensureTransformation } from 'step-wise/geometry'

import { useConsistentValue } from 'util'

// getBoundingRectangle gets a set of points (an object or array) and checks the bounds of these points. It returns a Rectangle object for these bounds.
export function getBoundingRectangle(points) {
	let minX, maxX, minY, maxY
	applyMapping(points, point => {
		point = ensureVector(point, 2)
		if (minX === undefined || point.x < minX)
			minX = point.x
		if (maxX === undefined || point.x > maxX)
			maxX = point.x
		if (minY === undefined || point.y < minY)
			minY = point.y
		if (maxY === undefined || point.y > maxY)
			maxY = point.y
	})
	return new Rectangle({ start: new Vector(minX, minY), end: new Vector(maxX, maxY) })
}

// ensureScale takes a possible scale definition (could be a number or an array of two numbers) and ensures it's the proper shape of [scaleX, scaleY]. Also works for higher dimensions when indicated.
export function ensureScale(scale, dimension = 2) {
	// Make sure it's an array.
	dimension = ensureInt(dimension, true)
	if (!Array.isArray(scale))
		scale = new Array(dimension).fill(scale)
	if (scale.length !== dimension)
		throw new Error(`Invalid scale: expected an array with at most ${dimension} elements - one per each dimension - but received an array with ${scale.length} elements.`)

	// Make sure the array is filled with numbers.
	return scale.map(directionScale => ensureNumber(directionScale))
}

// ensureMargin takes a possible margin definition (could be a number, an array, or an array of arrays) and ensures it's the proper shape of [[left, right], [top, bottom]] for two dimensions. Also works for higher dimensions when indicated.
export function ensureMargin(margin, dimension = 2) {
	// Make sure it's an array.
	dimension = ensureInt(dimension, true)
	if (!Array.isArray(margin))
		margin = new Array(dimension).fill(margin)
	if (margin.length !== dimension)
		throw new Error(`Invalid margin: expected an array with at most ${dimension} elements - one per each dimension - but received an array with ${margin.length} elements.`)

	// Make sure it consists of arrays too.
	return margin.map(directionMargin => {
		if (!Array.isArray(directionMargin))
			directionMargin = [directionMargin, directionMargin]
		if (directionMargin.length !== 2)
			throw new Error(`Invalid margin: expected a sub-array per direction with at most two elements - the margin at the lower and upper side - but received an array with ${directionMargin.length} elements.`)

		// Make sure that the array contains of numbers.
		return directionMargin.map(marginNumber => ensureNumber(marginNumber))
	})
}

// applyTransformation takes a set of Vectors (an array, a basic object or just a Vector itself) and applies the given transformation to all of them. It can also be done recursively, with arrays of arrays or similar.
export function applyTransformation(points, transformation, preventShift) {
	transformation = ensureTransformation(transformation)

	// On undefined do nothing.
	if (points === undefined)
		return undefined

	// If the points parameter is a single vector, apply it.
	if (Vector.isVector(points))
		return transformation.apply(points, preventShift)

	// If the parameter has a transform function, apply it.
	if (typeof points.transform === 'function')
		return points.transform(transformation, preventShift)

	// Apply the transformation to each element of the given array/object.
	return applyMapping(points, point => applyTransformation(point, transformation, preventShift))
}

// useRotationReflectionTransformation gives a Transformation object that first reflects along the x-axis (if reflection is set to true) and then rotates (by the given rotation angle). Optionally, this can be done with respect to a given point. It only gives the Transformation object and not transformation settings with bounds, scales, etcetera, since that data is not available. It is mainly used to set up a pretransformation, when random rotation and reflection values are used.
export function useRotationReflectionTransformation(rotation = 0, reflection = true, relativeTo) {
	relativeTo = useConsistentValue(relativeTo)
	return useMemo(() => {
		let transformation = Transformation.getRotation(rotation)
		if (reflection)
			transformation = Transformation.getReflection(Vector.getUnitVector(0, 2)).chain(transformation)
		return transformation.getRelativeTo(relativeTo)
	}, [rotation, reflection, relativeTo])
}
