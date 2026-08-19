import { useMemo } from 'react'

import { Vector, Rectangle, Transformation } from '@step-wise/geometry'

import { useConsistentPoints } from './util'

export function useIdentityTransformationSettings(width, height, points) {
	points = useConsistentPoints(points)
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
