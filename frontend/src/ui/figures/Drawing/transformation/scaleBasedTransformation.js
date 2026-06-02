import { useMemo } from 'react'

import { mapValues, mergeDefaults } from '@step-wise/utils'
import { Vector, ensureVector, Rectangle, Transformation, ensureTransformation } from '@step-wise/geometry'

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
		let { scale, margin, pretransformation } = mergeDefaults(options, defaultScaleBasedTransformationOptions)
		scale = ensureScale(scale)
		margin = ensureMargin(margin)
		pretransformation = ensureTransformation(pretransformation)

		// Pretransform the points, scale them, find their bounds, use this to determine their shift and then shift the points.
		let transformedPoints = mapValues(points, point => pretransformation.transform(point))
		const scaleTransformation = Transformation.fromScale(scale)
		transformedPoints = mapValues(transformedPoints, point => scaleTransformation.transform(ensureVector(point, 2)))
		const currBounds = getBoundingRectangle(transformedPoints)
		const shift = new Vector(...[0, 1].map(axis => -currBounds.getBounds(axis)[0] + margin[axis][0]))
		const shiftTransformation = Transformation.fromTranslation(shift)
		transformedPoints = mapValues(transformedPoints, point => shiftTransformation.transform(point))

		// Set up the full transformation and determine the final bounds including both margins.
		const transformation = pretransformation.then(scaleTransformation).then(shiftTransformation)
		const max = new Vector(...currBounds.size.coordinates.map((length, axis) => length + margin[axis][0] + margin[axis][1]))
		const graphicalBounds = new Rectangle({
			min: Vector.zero,
			max,
		})
		const inverseTransformation = transformation.inverse
		const bounds = new Rectangle({
			min: inverseTransformation.transform(Vector.zero),
			max: inverseTransformation.transform(max),
		})

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
