import { useMemo } from 'react'

import { applyToEachParameter, processOptions } from 'step-wise/util/objects'
import { Vector, ensureVector, Rectangle, Transformation, ensureTransformation } from 'step-wise/geometry'

import { useConsistentValue } from 'util/react'

import { getBoundingRectangle, ensureScale, ensureMargin } from './util'

export const defaultScaleAndShiftOptions = {
	scale: 1,
	margin: 0,
	pretransformation: Transformation.getIdentity(2),
}

export default function useScaleBasedTransformationSettings(points, options = {}) {
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
