import { isIn, isPlainObject } from '@step-wise/js-utils'
import { Vector } from '@step-wise/geometry'

import { type Force, type Load, type Moment, loadApplicationPointPositions, ForceType, MomentType } from './types.ts'

export function isForce(value: unknown): value is Force {
	if (!isPlainObject(value) || value.type !== ForceType) return false
	if (!(value.position instanceof Vector) || value.position.dimension !== 2) return false
	if (typeof value.angle !== 'number' || !Number.isFinite(value.angle) || value.angle < 0 || value.angle >= 2 * Math.PI) return false
	if (!isIn(value.applicationPointAt, loadApplicationPointPositions)) return false
	if (typeof value.relativeMagnitude !== 'number' || !Number.isFinite(value.relativeMagnitude) || value.relativeMagnitude <= 0) return false
	return true
}

export function isMoment(value: unknown): value is Moment {
	if (!isPlainObject(value) || value.type !== MomentType) return false
	if (!(value.position instanceof Vector) || value.position.dimension !== 2) return false
	if (typeof value.clockwise !== 'boolean') return false
	if (typeof value.openingDirection !== 'number' || !Number.isFinite(value.openingDirection) || value.openingDirection < 0 || value.openingDirection >= 2 * Math.PI) return false
	return true
}

export function isLoad(value: unknown): value is Load {
	return isForce(value) || isMoment(value)
}
