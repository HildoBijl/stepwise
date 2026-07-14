import { isIn, normalizeAngle } from '@step-wise/utils'
import { ensureVector } from '@step-wise/geometry'

import { type Force, type ForceLike, type Load, type LoadLike, type Moment, type MomentLike, type ApplicationPointPosition, applicationPointPositions, loadTypes } from './types'
import { isForce, isMoment, isLoad } from './validation'

export function createForce(value: ForceLike): Force {
	if (isForce(value)) return value
	return {
		type: loadTypes.force,
		position: ensureVector(value.position, 2),
		angle: normalizeAngle(value.angle),
		applicationPointAt: ensureApplicationPointPosition(value.applicationPointAt ?? 'end'),
	}
}

export function createMoment(value: MomentLike): Moment {
	if (isMoment(value)) return value
	return {
		type: loadTypes.moment,
		position: ensureVector(value.position, 2),
		clockwise: value.clockwise,
		openingAngle: normalizeAngle(value.openingAngle ?? 0),
	}
}

export function createLoad(value: LoadLike): Load {
	if (isLoad(value)) return value
	switch (value.type) {
		case loadTypes.force: return createForce(value)
		case loadTypes.moment: return createMoment(value)
	}
}

function ensureApplicationPointPosition(value: unknown): ApplicationPointPosition {
	if (!isIn(value, applicationPointPositions)) throw new Error(`Invalid application point position: expected one of ${applicationPointPositions.map(value => `"${value}"`).join(', ')}, but received "${String(value)}".`)
	return value
}
