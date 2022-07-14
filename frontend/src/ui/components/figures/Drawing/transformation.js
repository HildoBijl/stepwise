/* This util file contains useful functions for transforming points for Drawings and such. It is important to keep in mind the various coordinate systems here.
 * - Drawing coordinates: the coordinates used to define points in the drawing with. For instance, when making a plot, these are the actual plot values.
 * - Graphical coordinates: the actual pixels. Usually an image is like 600 pixels wide or so, and this also is in relation to stroke widths of lines, etcetera.
 * - Client coordinates: the position with respect to the page. If the drawing is scaled to 50% its original size, then graphical coordinates are made smaller too, but client coordinates are what actually appears on the screen.
 * Points/locations are always defined in drawing coordinates, while graphical matters (line thickness, font sizes) are defined in graphical coordinates. This file does not concern itself with client coordinates.
 * 
 * The functions below set up the right transformation settings between the two coordinate systems. They generally return a transformationSettings object which is a basic object with parameters:
 * - transformation: the transformation from drawing coordinates to graphical coordinates. This transformation can always be requested for the inverse.
 * - bounds: a Rectangle object indicating the bounds of the graphical coordinates. It always has its top at (0,0).
 * - scale: an array [scaleX, scaleY] that is applied in the x- and y-directions.
 * - points: the points that were provided in drawing coordinates transformed to graphical coordinates. This is only returned when actually provided.
 * This data is then generally passed on to a Drawing component (or extension of it) to properly position child objects. Functions attempt to get reference stability to prevent constant updates of child components.
 */

import { useMemo } from 'react'

import { isNumber, ensureNumber, ensureInt } from 'step-wise/util/numbers'
import { ensureBoolean, applyToEachParameter, processOptions } from 'step-wise/util/objects'
import { Vector, ensureVector, Rectangle, ensureRectangle, Transformation, ensureTransformation } from 'step-wise/geometry'

import { useConsistentValue } from 'util/react'

// getBoundingRectangle gets a set of points (an object or array) and checks the bounds of these points. It returns a Rectangle object for these bounds.
export function getBoundingRectangle(points) {
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
	return new Rectangle({ start: new Vector(minX, minY), end: new Vector(maxX, maxY) })
}

// useIdentityTransformationSettings returns transformation settings that do absolutely nothing. The transformation is the identity, and the bounds are set up using the given width and height.
export function useIdentityTransformationSettings(width, height, points) {
	points = useConsistentValue(points)
	return useMemo(() => ({
		bounds: new Rectangle({ start: new Vector(0, 0), end: new Vector(width, height) }),
		transformation: Transformation.getIdentity(2),
		inverseTransformation: Transformation.getIdentity(2),
		scale: [1, 1],
		points,
	}), [width, height, points])
}

/* useScaleAndShiftTransformationSettings takes a set of points, and scales them by a certain factor. It then shifts them such that they fit within a certain margin. Options include:
 * - scale: which factor should they be scaled by? Can be a single factor or an array [scaleX, scaleY].
 * - margin: which margins should be applied? Can be a single number, a number per direction [marginX, marginY] or a number per side [[marginLeft, marginRight], [marginTop, marginBottom]].
 * - pretransformation: a transformation to be applied to each point before anything happens.
 * Returned is a transformationSettings object in the default format.
 */
export function useScaleAndShiftTransformationSettings(points, options = {}) {
	// Ensure consistent input.
	points = useConsistentValue(points)
	options = useConsistentValue(options)

	// Wrap the function in a useMemo for reference equality.
	return useMemo(() => {
		// Check the input.
		let { scale, margin, pretransformation } = processOptions(options, defaultScaleAndShiftOptions)
		scale = ensureScale(scale)
		margin = ensureMargin(margin)
		pretransformation = ensureTransformation(pretransformation)

		// Pretransform the points, scale them, find their bounds, use this to determine their shift and then shift the points.
		let transformedPoints = applyToEachParameter(points, point => pretransformation.apply(point))
		const scaleTransformation = Transformation.getScale(scale)
		transformedPoints = applyToEachParameter(transformedPoints, point => scaleTransformation.apply(ensureVector(point, 2)))
		const currBounds = getBoundingRectangle(transformedPoints)
		const shift = new Vector(...[0, 1].map(axis => -currBounds.getBounds(axis)[0] + margin[axis][0]))
		const shiftTransformation = Transformation.getShift(shift)
		transformedPoints = applyToEachParameter(transformedPoints, point => shiftTransformation.apply(point))

		// Set up the full transformation and determine the final bounds including both margins.
		const transformation = pretransformation.chain(scaleTransformation).chain(shiftTransformation)
		const graphicalBounds = new Rectangle({
			start: new Vector(0, 0),
			end: new Vector(...currBounds.size.map((length, axis) => length + margin[axis][0] + margin[axis][1])),
		})
		const inverseTransformation = transformation.inverse
		const bounds = graphicalBounds.transform(inverseTransformation)

		// Return all data.
		return {
			points: transformedPoints,
			scale,
			bounds,
			graphicalBounds,
			transformation,
			inverseTransformation,
		}
	}, [points, options])
}
const defaultScaleAndShiftOptions = {
	scale: 1,
	margin: 0,
	pretransformation: Transformation.getIdentity(2),
}

/* useScaleToBoundsTransformationSettings takes a set of points, and scales them as much as possible such that they fit within given bounds, taking into account the given margins. It also shifts them to make them fit in the right rectangle. Options include:
 * - margin (default 0): the margin that will be applied around the points. These can be set either by giving a number (when equal for x and y) or by giving an array of two numbers [marginX, marginY] or by giving an array of arrays [[marginLeft, marginRight], [marginTop, marginBottom]].
 * - maxWidth (default Infinity): the maximum width that will be applied (taking into account margins).
 * - maxHeight (default Infinity): identical but then for the height.
 * - maxScale (default Infinity): the maximum scale that will be applied. Can also be specified per axis as [maxScaleX, maxScaleY].
 * - uniform (default true): should uniform scaling be applied?
 * - pretransformation: a transformation to be applied to each point before anything happens.
 * Whichever of all the given maxima is the most stringent will be applied. The resulting object has the following parameters:
 * - points: the transformed points.
 * - transformation: a transformation object that can transform further points.
 * - bounds: the bounds of the rectangle containing all the points, including margins.
 * - scale: the scale applied. This is always an array of the form [scaleX, scaleY].
 * Of the given bounds Rectangle, at least one the "width" and "height" properties equals its maximum value, after taking into account margins.
 */
export function useScaleToBoundsTransformationSettings(points, options = {}) {
	// Ensure consistent input.
	points = useConsistentValue(points)
	options = useConsistentValue(options)

	// Wrap the function in a useMemo for reference equality.
	const scaleAndShiftOptions = useMemo(() => {
		// Check that at least one bound has been set.
		if (options.maxWidth === undefined && options.maxHeight === undefined && options.maxScale === undefined)
			throw new Error(`Invalid ScaleToBounds options: one maximum must be set. Cannot apply bounds if there are no limits defined.`)

		// Process the input.
		let { maxWidth, maxHeight, maxScale, margin, uniform, pretransformation } = processOptions(options, defaultScaleToBoundsOptions)
		maxWidth = ensureNumber(maxWidth)
		maxHeight = ensureNumber(maxHeight)
		maxScale = ensureScale(maxScale)
		margin = ensureMargin(margin)
		uniform = ensureBoolean(uniform)
		pretransformation = ensureTransformation(pretransformation)

		// Pretransform the points, find their bounds and use it to calculate the scale to be applied.
		const transformedPoints = applyToEachParameter(points, point => pretransformation.apply(point))
		const currBounds = getBoundingRectangle(transformedPoints)
		let scale = [0, 1].map(axis => {
			const maxSize = (axis === 0 ? maxWidth : maxHeight)
			const maxSizeWithoutMargin = maxSize - margin[axis][0] - margin[axis][1]
			return Math.min(
				maxSizeWithoutMargin / currBounds.getSize(axis),
				maxScale[axis],
			)
		})

		// Run some checks: on a uniform scale pick the smallest scale and use it for both directions. Also, make sure that there is no Infinite scaling. This is a sign that the points are on one line, and no scaling should be applied.
		if (uniform)
			scale = new Array(2).fill(Math.min(...scale))
		scale = scale.map(currScale => Math.abs(currScale) === Infinity ? 1 : currScale)

		// Apply the calculated scale.
		return { scale, margin, pretransformation }
	}, [points, options])

	// Pass on to the scaleAndShift transformer.
	return useScaleAndShiftTransformationSettings(points, scaleAndShiftOptions)
}
const defaultScaleToBoundsOptions = {
	maxWidth: Infinity,
	maxHeight: Infinity,
	maxScale: Infinity,
	uniform: true, // Scale uniformly for x and y?
	margin: 0,
	pretransformation: Transformation.getIdentity(2),
}

// useDefinedBoundsTransformationSettings takes a set of points and scales them to fit within the given bounds. If only a width or a height is given, the scaling is done uniformly. If they are both given, the scaling is done non-uniformly. Optionally, a pointBounds parameter (a Rectangle) can be provided, in which case this rectangle is scaled to the given width/height and not the points bounds.
export function useDefinedBoundsTransformationSettings(points, options = {}) {
	// Ensure consistent input.
	points = useConsistentValue(points)
	options = useConsistentValue(options)

	// Wrap the function in a useMemo for reference equality.
	const definedBoundsOptions = useMemo(() => {
		// Check the input.
		let { width, height, pointBounds, margin, pretransformation } = processOptions(options, defaultDefinedBoundsOptions)
		width = ensureNumber(width)
		height = ensureNumber(height)
		margin = ensureMargin(margin)
		pretransformation = ensureTransformation(pretransformation)

		// Ensure that either a width or height is defined.
		if (width === undefined && height === undefined)
			throw new Error(`Invalid DefinedBounds options: expected either a width or a height (or both) to be defined, but no bounds were given.`)
		if (width !== undefined)
			width = ensureNumber(width, true)
		if (height !== undefined)
			height = ensureNumber(height, true)

		// Determine the point bounds, unless these have been given already.
		if (pointBounds === undefined) {
			const transformedPoints = applyToEachParameter(points, point => pretransformation.apply(point))
			pointBounds = getBoundingRectangle(transformedPoints)
		} else {
			pointBounds = ensureRectangle(pointBounds, 2)
		}

		// Use the bounds to determine the scale.
		let scale
		if (width !== undefined && height !== undefined)
			scale = [(width - margin[0][0] - margin[0][1]) / pointBounds.width, (height - margin[1][0] - margin[1][1]) / pointBounds.height]
		else if (width !== undefined)
			scale = ensureScale((height - margin[1][0] - margin[1][1]) / pointBounds.height)
		else
			scale = ensureScale((width - margin[0][0] - margin[0][1]) / pointBounds.width)

		// Apply the calculated scale.
		return { scale, margin, pretransformation }
	}, [points, options])

	// Pass on to the scaleAndShift transformer.
	return useScaleAndShiftTransformationSettings(points, definedBoundsOptions)
}
const defaultDefinedBoundsOptions = {
	width: undefined,
	height: undefined,
	pointBounds: undefined,
	margin: 0,
	pretransformation: Transformation.getIdentity(2),
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

// useRotationReflectionTransformation gives a transformation that first reflects along the x-axis (if reflection is set to true) and then rotates (by the given rotation angle). Optionally, this can be done with respect to a given point. It only gives the transformation object directly and not transformation settings with bounds, scales, etcetera, since that data is not available. It is mainly used to set up a pretransformation.
export function useRotationReflectionTransformation(rotation = 0, reflection = true, relativeTo) {
	relativeTo = useConsistentValue(relativeTo)
	return useMemo(() => {
		let transformation = Transformation.getRotation(rotation)
		if (reflection)
			transformation = Transformation.getReflection(Vector.getUnitVector(0, 2)).chain(transformation)
		return transformation.getRelativeTo(relativeTo)
	}, [rotation, reflection, relativeTo])
}

// applyTransformation takes a set of Vectors (an array, a basic object or just a Vector itself) and applies the given transformation to all of them. It can also be done recursively, with arrays of arrays or similar.
export function applyTransformation(points, transformation, preventShift) {
	transformation = ensureTransformation(transformation)

	// On undefined do nothing.
	if (points === undefined)
		return undefined

	// If the points parameter is a single vector, apply it.
	if (points instanceof Vector || (Array.isArray(points) && points.every(element => isNumber(element))))
		return transformation.apply(points, preventShift)

	// If the parameter has a transform function, apply it.
	if (typeof points.transform === 'function')
		return points.transform(transformation, preventShift)

	// Apply the transformation to each element of the given array/object.
	return applyToEachParameter(points, point => applyTransformation(point, transformation, preventShift))
}
