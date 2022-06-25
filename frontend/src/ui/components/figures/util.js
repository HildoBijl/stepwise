// This util file contains various useful functions supporting figures, drawings, plots, etcetera. Because they are not connected to any of these objects specifically, the functions are put here.

import { ensureNumber } from 'step-wise/util/numbers'
import { isBasicObject, applyToEachParameter } from 'step-wise/util/objects'
import { Vector, ensureVector, ensureVectorArray, Rectangle } from 'step-wise/geometry'

// rotateAndReflect rotates all points along the given angle (in radians) and reflects it to (unless the second parameter is set to false). This is useful to randomize figures. Upon the transformation, the reflection is done first and then the rotation.
export function rotateAndReflect(points, rotation = 0, reflect = true, relativeTo) {
	// Check the input.
	if (!isBasicObject(points) && !Array.isArray(points))
		throw new Error(`Invalid points: expected as points an object or array with Vector elements, but received something of type "${typeof points}" with value "${points}".`)

	// Apply the transformation to each point.
	return applyToEachParameter(points, point => {
		point = ensureVector(point, 2)
		if (reflect)
			point = point.reflect(relativeTo)
		if (rotation !== 0)
			point = point.rotate(rotation, relativeTo)
		return point
	})
}

// scaleToBounds gets a set of 2D points (an object or array) and scales all the points such that they exactly fit within maxWidth and maxHeight (whichever bound if more narrow). Optionally extra margins can be included, either by giving a number (when equal for x and y) or by giving an array of two numbers [marginX, marginY]. As a result, an object is returned with parameters "points" (the result), "bounds" (a Rectangle indicating the bounds), "scale" (the scale applied) and "transform" (a function that transforms future points). At least one of "width" and "height" equals its maximum value, taking into account margins.
export function scaleToBounds(points, maxWidth, maxHeight, margin = 0) {
	// Check the input.
	maxWidth = ensureNumber(maxWidth)
	maxHeight = ensureNumber(maxHeight)
	if (!Array.isArray(margin))
		margin = [margin, margin]
	margin.forEach(marginNumber => ensureNumber(marginNumber))

	// First find the bounds of the points.
	let minX, maxX, minY, maxY
	applyToEachParameter(points, point => {
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

	// Determine the scale and shift. If no valid scale is found, do not scale points.
	let scale = Math.min((maxWidth - 2 * margin[0]) / (maxX - minX), (maxHeight - 2 * margin[1]) / (maxY - minY))
	if (Math.abs(scale) === Infinity)
		scale = 1
	const shift1 = new Vector(minX, minY)
	const shift2 = new Vector(margin[0], margin[1])
	const transform = point => point.subtract(shift1).multiply(scale).add(shift2)

	// Return a Rectangle indicating the bounds.
	const width = (maxX - minX) * scale + 2 * margin[0]
	const height = (maxY - minY) * scale + 2 * margin[1]
	const bounds = new Rectangle({ start: new Vector(0, 0), end: new Vector(width, height) })

	// Apply the scale and shift.
	return {
		points: applyToEachParameter(points, transform),
		scale,
		bounds,
		transform,
	}
}

// getCornerLabelPosition takes an array of three points describing a corner, and a distance parameter, and returns the position where the corner label should be positioned.
export function getCornerLabelPosition(points, labelSize = 20) {
	// Check input.
	points = ensureVectorArray(points, 2)
	if (points.length !== 3)
		throw new Error(`Invalid points array: expected an array of three vectors, but received one with ${points.length} vectors. Cannot process this.`)
	labelSize = ensureNumber(labelSize)

	// Calculate the given position. Use an adjustment on the size of the corner: smaller angles should give a larger distance. For this adjustment, pretend the label is circular with the given radius.
	const point = points[1]
	const vector1 = points[0].subtract(point).normalize()
	const vector2 = points[2].subtract(point).normalize()
	const adjustedDistance = labelSize * Math.sqrt(2 / Math.max(0.1, 1 - vector1.dotProduct(vector2)))
	const delta = vector1.interpolate(vector2).normalize().multiply(adjustedDistance)
	window.data = { point, vector1, vector2, adjustedDistance, delta }
	return point.add(delta)
}
