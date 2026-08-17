import { isIn, isPlainObject } from '@step-wise/js-utils'
import { Vector } from '@step-wise/geometry'

import { type Force, type Load, type Moment, applicationPointPositions, loadTypes } from './types'

export function isForce(value: unknown): value is Force {
	if (!isPlainObject(value) || value.type !== loadTypes.force) return false
	if (!(value.position instanceof Vector) || value.position.dimension !== 2) return false
	if (!(typeof value.angle === 'number') || value.angle < 0 || value.angle >= 2 * Math.PI) return false
	if (!isIn(value.applicationPointAt, applicationPointPositions)) return false
	if (typeof value.magnitudeFactor !== 'number' || !Number.isFinite(value.magnitudeFactor) || value.magnitudeFactor <= 0) return false
	return true
}

export function isMoment(value: unknown): value is Moment {
	if (!isPlainObject(value) || value.type !== loadTypes.moment) return false
	if (!(value.position instanceof Vector) || value.position.dimension !== 2) return false
	if (typeof value.clockwise !== 'boolean') return false
	if (!(typeof value.openingAngle === 'number') || value.openingAngle < 0 || value.openingAngle >= 2 * Math.PI) return false
	return true
}

export function isLoad(value: unknown): value is Load {
	return isForce(value) || isMoment(value)
}
