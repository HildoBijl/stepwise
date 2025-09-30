import { useMemo } from 'react'

import { applyMapping, processOptions } from 'step-wise/util'
import { Vector, ensureVector, Rectangle, Transformation, ensureTransformation } from 'step-wise/geometry'

import { useConsistentValue } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests due to Jest using the Node util package instead.

import { getBoundingRectangle, ensureScale, ensureMargin } from './util'

export const defaultScaleBasedTransformationOptions = {
	scale: 1,
	margin: 0,
	pretransformation: Transformation.getIdentity(2),
}

export function useScaleBasedTransformationSettings(points, options = {}) {
	// Ensure consistent input.
	points = useConsistentValue(points)
	options = useConsistentValue(options)

	// Wrap the settings calculation in a useMemo for reference equality and efficiency.
	return useMemo(() => {
		// Check the input.
		let { scale, margin, pretransformation } = processOptions(options, defaultScaleBasedTransformationOptions)
		scale = ensureScale(scale)
		margin = ensureMargin(margin)
		pretransformation = ensureTransformation(pretransformation)

		// Pretransform the points, scale them, find their bounds, use this to determine their shift and then shift the points.
		let transformedPoints = applyMapping(points, point => pretransformation.apply(point))
		const scaleTransformation = Transformation.getScale(scale)
		transformedPoints = applyMapping(transformedPoints, point => scaleTransformation.apply(ensureVector(point, 2)))
		const currBounds = getBoundingRectangle(transformedPoints)
		const shift = new Vector(...[0, 1].map(axis => -currBounds.getBounds(axis)[0] + margin[axis][0]))
		const shiftTransformation = Transformation.getShift(shift)
		transformedPoints = applyMapping(transformedPoints, point => shiftTransformation.apply(point))

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
			scale,
			bounds,
			graphicalBounds,
			transformation,
			inverseTransformation,
		}
	}, [points, options])
}
