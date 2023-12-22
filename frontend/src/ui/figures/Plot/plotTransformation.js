import { useMemo } from 'react'

import { ensureBoolean, removeProperties, filterOptions, processOptions, firstOf, lastOf } from 'step-wise/util'
import { Vector, Rectangle, Transformation } from 'step-wise/geometry'

import { useConsistentValue } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests.

import { getBoundingRectangle, ensureScale } from '../Drawing/transformation/util'
import { useBoundsBasedTransformationSettings, defaultBoundsBasedTransformationOptions } from '../Drawing'

import { getTicks } from './ticks'

export const defaultPlotTransformationOptions = {
	...removeProperties(defaultBoundsBasedTransformationOptions, ['pretransformation']), // Plots do not allow pretransformations.
	uniform: false, // Override default setting.
	includeOrigin: true,
	extendBoundsToTicks: true,
	desiredNumTicks: [9, 8], // The desired number of ticks for each direction.
}

export function usePlotTransformationSettings(points, options = {}) {
	// Ensure consistent input.
	points = useConsistentValue(points)
	options = useConsistentValue(processOptions(options, defaultPlotTransformationOptions))

	// Check the options.
	let { includeOrigin, extendBoundsToTicks, desiredNumTicks } = options
	includeOrigin = ensureBoolean(includeOrigin)
	extendBoundsToTicks = ensureBoolean(extendBoundsToTicks)
	desiredNumTicks = useConsistentValue(ensureScale(desiredNumTicks))

	// Get the bounds and extract ticks from them. Also update the bounds given these ticks.
	const { ticks, bounds } = useMemo(() => {
		// First get a bound around all points and use those to calculate the ticks.
		const pointsWithOrigin = includeOrigin ? [...points, Vector.zero] : points
		let bounds = getBoundingRectangle(pointsWithOrigin)
		const ticks = bounds.bounds.map(([min, max], index) => getTicks(min, max, desiredNumTicks[index], extendBoundsToTicks))

		// Depending on whether we extend bounds, update the bounds.
		if (extendBoundsToTicks)
			bounds = new Rectangle({ start: ticks.map(ticksForAxis => firstOf(ticksForAxis)), end: ticks.map(ticksForAxis => lastOf(ticksForAxis)) })

		return { ticks, bounds }
	}, [points, includeOrigin, desiredNumTicks, extendBoundsToTicks])

	// For the ticks, set up a start and end point and use these 
	const boundsPoints = useMemo(() => [bounds.start, bounds.end], [bounds])
	const optionsFiltered = useMemo(() => ({
		...filterOptions(options, defaultBoundsBasedTransformationOptions), // Select options suitable here.
		pretransformation: Transformation.verticalFlip, // Make sure plots have upwards positive.
	}), [options])
	const boundsBasedTransformationSettings = useBoundsBasedTransformationSettings(boundsPoints, optionsFiltered)

	// Add in the tick information to the transformation settings.
	return useMemo(() => ({
		...boundsBasedTransformationSettings,
		ticks,
		plotBounds: new Rectangle({ start: ticks.map(ticksForAxis => firstOf(ticksForAxis)), end: ticks.map(ticksForAxis => lastOf(ticksForAxis)) }),
	}), [boundsBasedTransformationSettings, ticks])
}
