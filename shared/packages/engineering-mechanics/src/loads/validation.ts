import { compareNumbers, isIn, isPlainObject } from '@step-wise/utils'
import { Vector } from '@step-wise/geometry'

import { type Force, type Load, type Moment, applicationPointPositions, loadTypes } from './types'

export function isForce(value: unknown): value is Force {
	if (!isPlainObject(value) || value.type !== loadTypes.force) return false
	if (!(value.position instanceof Vector) || value.position.dimension !== 2) return false
	if (!(value.direction instanceof Vector) || value.direction.dimension !== 2 || !compareNumbers(value.direction.magnitude, 1)) return false
	if (!isIn(value.applicationPointAt, applicationPointPositions)) return false
	return true
}

export function isMoment(value: unknown): value is Moment {
	if (!isPlainObject(value) || value.type !== loadTypes.moment) return false
	if (!(value.position instanceof Vector) || value.position.dimension !== 2) return false
	if (typeof value.clockwise !== 'boolean') return false
	return true
}

export function isLoad(value: unknown): value is Load {
	return isForce(value) || isMoment(value)
}
