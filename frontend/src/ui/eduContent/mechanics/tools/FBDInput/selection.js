import { LineSegment, Vector } from '@step-wise/geometry'
import { isForce, isMoment } from '@step-wise/engineering-mechanics'

import { defaultGraphicalForceLength, defaultGraphicalMomentRadius } from '../support'

export function doesLoadTouchRectangle(load, rectangle, scale) {
	if (isForce(load))
		return rectangle.intersectsLineSegment(getForceLineSegment(load, scale))
	if (isMoment(load))
		return rectangle.intersectsCircle(load.position, defaultGraphicalMomentRadius / scale)
	return false
}

export function getForceLineSegment(force, scale) {
	const magnitude = defaultGraphicalForceLength / scale
	const vector = Vector.fromPolar(magnitude, force.angle)
	return force.applicationPointAt === 'end'
		? new LineSegment({ end: force.position, vector })
		: new LineSegment({ start: force.position, vector })
}

export function getScaleFactor(transformationSettings) {
	const scale = transformationSettings?.scale
	if (!scale) return 1
	if (typeof scale === 'number') return scale
	return Math.sqrt(scale[0] * scale[1])
}
