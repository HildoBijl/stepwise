// This util file contains various useful functions supporting figures, drawings, plots, etcetera. Because they are not connected to any of these objects specifically, the functions are put here.

import { ensureNumber } from 'step-wise/util/numbers'
import { isBasicObject, applyToEachParameter, processOptions } from 'step-wise/util/objects'
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

/* scaleToBounds gets a set of 2D points (an object or array) and scales all the points such that they exactly fit within the required limits. These limits are set in the options object. This object can have the following parameters.
 * - margin (default 0): the margin that will be applied around the points. These can be set either by giving a number (when equal for x and y) or by giving an array of two numbers [marginX, marginY] or by giving an array of arrays [[marginLeft, marginRight], [marginTop, marginBottom]].
 * - maxWidth (default Infinity): the maximum width that will be applied (taking into account margins).
 * - maxHeight (default Infinity): identical but then for the height.
 * - maxScale (default Infinity): the maximum scale that will be applied.
 * Whichever of all the given maxima is the most stringent will be applied.
 *
 * As a result, an object is returned with parameters:
 * - points: the result.
 * - bounds: a Rectangle object indicating the bounds.
 * - scale: the scale factor applied.
 * - transform: a function that transforms future points.
 * - inverseTransform: the inverse function of the transform function.
 * Of the given bounds Rectangle, at least one the "width" and "height" properties equals its maximum value, after taking into account margins.
 */
export function scaleToBounds(points, options = {}) {
	// Check the input.
	if (options.maxWidth === undefined && options.maxHeight === undefined && options.maxScale === undefined)
		throw new Error(`Invalid scaleToBounds options: one maximum must be set. Cannot apply bounds if there are no limits defined.`)
	let { maxWidth, maxHeight, maxScale, margin } = processOptions(options, defaultScaleToBoundsOptions)
	maxWidth = ensureNumber(maxWidth)
	maxHeight = ensureNumber(maxHeight)
	maxScale = ensureNumber(maxScale)
	if (!Array.isArray(margin))
		margin = [margin, margin]
	margin = margin.map(directionMargin => {
		if (!Array.isArray(directionMargin))
			directionMargin = [directionMargin, directionMargin]
		directionMargin.forEach(marginNumber => ensureNumber(marginNumber))
		return directionMargin
	})

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
	let scale = Math.min(maxScale, (maxWidth - margin[0][0] - margin[0][1]) / (maxX - minX), (maxHeight - margin[1][0] - margin[1][1]) / (maxY - minY))
	if (Math.abs(scale) === Infinity)
		scale = 1
	const shift1 = new Vector(minX, minY)
	const shift2 = new Vector(margin[0][0], margin[1][0])
	const transform = point => point.subtract(shift1).multiply(scale).add(shift2)
	const inverseTransform = point => point.subtract(shift2).divide(scale).add(shift1)

	// Return a Rectangle indicating the bounds.
	const width = (maxX - minX) * scale + margin[0][0] + margin[0][1]
	const height = (maxY - minY) * scale + margin[1][0] + margin[1][1]
	const bounds = new Rectangle({ start: new Vector(0, 0), end: new Vector(width, height) })

	// Apply the scale and shift.
	return {
		points: applyToEachParameter(points, transform),
		scale,
		bounds,
		transform,
		inverseTransform,
	}
}
const defaultScaleToBoundsOptions = {
	maxWidth: Infinity,
	maxHeight: Infinity,
	maxScale: Infinity,
	margin: 0,
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
