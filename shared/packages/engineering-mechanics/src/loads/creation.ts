import { isIn } from '@step-wise/utils'
import { ensureVector } from '@step-wise/geometry'

import { type Force, type ForceLike, type Load, type LoadLike, type Moment, type MomentLike, type ApplicationPointPosition, applicationPointPositions, loadTypes } from './types'
import { isForce, isMoment, isLoad } from './validation'

function ensureApplicationPointPosition(value: unknown): ApplicationPointPosition {
	if (!isIn(value, applicationPointPositions)) throw new Error(`Invalid application point position: expected one of ${applicationPointPositions.map(value => `"${value}"`).join(', ')}, but received "${String(value)}".`)
	return value
}

export function createForce(value: ForceLike): Force {
	if (isForce(value)) return value
	return {
		type: loadTypes.force,
		position: ensureVector(value.position, 2),
		direction: ensureVector(value.direction, 2).normalize(),
		applicationPointAt: ensureApplicationPointPosition(value.applicationPointAt ?? 'start'),
	}
}

export function createMoment(value: MomentLike): Moment {
	if (isMoment(value)) return value
	return {
		type: loadTypes.moment,
		position: ensureVector(value.position, 2),
		clockwise: value.clockwise,
	}
}

export function createLoad(value: LoadLike): Load {
	if (isLoad(value)) return value
	switch (value.type) {
		case loadTypes.force: return createForce(value)
		case loadTypes.moment: return createMoment(value)
	}
}
