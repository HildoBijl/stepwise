import { ensureBoolean, ensureNumber, isIn, isPlainObject, normalizeAngle } from '@step-wise/js-utils'
import { ensureVector } from '@step-wise/geometry'

import { type Force, type ForceInput, type Load, type LoadInput, type Moment, type MomentInput, type ApplicationPointPosition, loadApplicationPointPositions, ForceType, MomentType } from './types.ts'
import { isForce, isMoment } from './checks.ts'

export function createForce(value: ForceInput): Force {
	if (!isPlainObject(value)) throw new TypeError(`Invalid Force: expected a plain object.`)
	if (isForce(value) && Object.isFrozen(value)) return value
	return Object.freeze({
		type: ForceType,
		position: ensureVector(value.position, { dimension: 2 }),
		angle: normalizeAngle(value.angle),
		applicationPointAt: ensureApplicationPointPosition(value.applicationPointAt ?? 'end'),
		relativeMagnitude: ensureNumber(value.relativeMagnitude ?? 1, { nonNegative: true, nonZero: true }),
	})
}

export function createMoment(value: MomentInput): Moment {
	if (!isPlainObject(value)) throw new TypeError(`Invalid Moment: expected a plain object.`)
	if (isMoment(value) && Object.isFrozen(value)) return value
	return Object.freeze({
		type: MomentType,
		position: ensureVector(value.position, { dimension: 2 }),
		clockwise: ensureBoolean(value.clockwise),
		openingDirection: normalizeAngle(value.openingDirection ?? 0),
	})
}

export function createLoad(value: LoadInput): Load {
	if (!isPlainObject(value)) throw new TypeError(`Invalid Load: expected a plain object.`)
	switch (value.type) {
		case ForceType: return createForce(value)
		case MomentType: return createMoment(value)
		default: throw new Error(`Invalid Load type: expected "${ForceType}" or "${MomentType}".`)
	}
}

function ensureApplicationPointPosition(value: unknown): ApplicationPointPosition {
	if (!isIn(value, loadApplicationPointPositions)) throw new Error(`Invalid application point position: expected one of ${loadApplicationPointPositions.map(value => `"${value}"`).join(', ')}, but received "${String(value)}".`)
	return value
}
