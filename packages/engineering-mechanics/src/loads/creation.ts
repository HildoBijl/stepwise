import { ensureBoolean, ensureNumber, isIn, isPlainObject, normalizeAngle } from '@step-wise/js-utils'
import { ensureVector } from '@step-wise/geometry'

import { type Force, type ForceLike, type Load, type LoadLike, type Moment, type MomentLike, type ApplicationPointPosition, applicationPointPositions, loadTypes } from './types'
import { isForce, isMoment } from './validation'

export function createForce(value: ForceLike): Force {
	if (!isPlainObject(value)) throw new TypeError(`Invalid Force: expected a plain object.`)
	if (isForce(value) && Object.isFrozen(value)) return value
	return Object.freeze({
		type: loadTypes.force,
		position: ensureVector(value.position, { dimension: 2 }),
		angle: normalizeAngle(value.angle),
		applicationPointAt: ensureApplicationPointPosition(value.applicationPointAt ?? 'end'),
		magnitudeFactor: ensureNumber(value.magnitudeFactor ?? 1, { nonNegative: true, nonZero: true }),
	})
}

export function createMoment(value: MomentLike): Moment {
	if (!isPlainObject(value)) throw new TypeError(`Invalid Moment: expected a plain object.`)
	if (isMoment(value) && Object.isFrozen(value)) return value
	return Object.freeze({
		type: loadTypes.moment,
		position: ensureVector(value.position, { dimension: 2 }),
		clockwise: ensureBoolean(value.clockwise),
		openingAngle: normalizeAngle(value.openingAngle ?? 0),
	})
}

export function createLoad(value: LoadLike): Load {
	if (!isPlainObject(value)) throw new TypeError(`Invalid Load: expected a plain object.`)
	switch (value.type) {
		case loadTypes.force: return createForce(value)
		case loadTypes.moment: return createMoment(value)
		default: throw new Error(`Invalid Load type: expected "${loadTypes.force}" or "${loadTypes.moment}".`)
	}
}

function ensureApplicationPointPosition(value: unknown): ApplicationPointPosition {
	if (!isIn(value, applicationPointPositions)) throw new Error(`Invalid application point position: expected one of ${applicationPointPositions.map(value => `"${value}"`).join(', ')}, but received "${String(value)}".`)
	return value
}
