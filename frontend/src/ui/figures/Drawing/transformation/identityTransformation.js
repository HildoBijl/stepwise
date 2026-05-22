import { useMemo } from 'react'

import { Vector, Rectangle, Transformation } from '@step-wise/geometry'

import { useConsistentValue } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests due to Jest using the Node util package instead.

export function useIdentityTransformationSettings(width, height, points) {
	points = useConsistentValue(points)
	const bounds = useMemo(() => new Rectangle({ min: new Vector(0, 0), max: new Vector(width, height) }), [width, height])
	return useMemo(() => ({
		points,
		scale: [1, 1],
		bounds,
		graphicalBounds: bounds,
		transformation: Transformation.getIdentity(2),
		inverseTransformation: Transformation.getIdentity(2),
	}), [bounds, points])
}
