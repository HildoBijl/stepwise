import { useMemo } from 'react'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureBoolean, applyToEachParameter, processOptions } from 'step-wise/util/objects'
import { Transformation, ensureTransformation } from 'step-wise/geometry'

import { useConsistentValue } from 'util/react'

import { getBoundingRectangle, ensureScale, ensureMargin } from './util'
import useScaleBasedTransformationSettings from './scaleBasedTransformation'

export const defaultScaleToBoundsOptions = {
	maxWidth: Infinity,
	maxHeight: Infinity,
	maxScale: Infinity,
	uniform: true, // Scale uniformly for x and y?
	margin: 0,
	pretransformation: Transformation.getIdentity(2),
}

export default function useBoundsBasedTransformationSettings(points, options = {}) {
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
	return useScaleBasedTransformationSettings(points, scaleAndShiftOptions)
}
