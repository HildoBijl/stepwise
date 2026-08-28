import { hasOnlyKeys, isIn, isPlainObject, omitDefaults } from '@step-wise/js-utils'
import { type VectorStorageValue, Vector, isCoordinateList } from '@step-wise/geometry'

import { type ApplicationPointPosition, type Force, type Load, type Moment, loadApplicationPointPositions, ForceType, MomentType } from './types.ts'
import { createForce, createMoment } from './creation.ts'

/*
 * Forces
 */

export type SerializedForce = {
	type: ForceType
	position: VectorStorageValue
	angle: number
	applicationPointAt?: ApplicationPointPosition
	relativeMagnitude?: number
}

export function serializeForce(force: Force): SerializedForce {
	return {
		type: ForceType,
		position: force.position.toStorageValue(),
		angle: force.angle,
		...omitDefaults({ applicationPointAt: force.applicationPointAt, relativeMagnitude: force.relativeMagnitude }, { applicationPointAt: 'end', relativeMagnitude: 1 }),
	}
}

export function deserializeForce(force: unknown): Force {
	if (!isPlainObject(force) || !hasOnlyKeys(force, ['type', 'position', 'angle', 'applicationPointAt', 'relativeMagnitude']) || force.type !== ForceType || !isCoordinateList(force.position) || typeof force.angle !== 'number' || (Object.hasOwn(force, 'applicationPointAt') && !isIn(force.applicationPointAt, loadApplicationPointPositions)) || (Object.hasOwn(force, 'relativeMagnitude') && typeof force.relativeMagnitude !== 'number')) throw new Error(`Invalid serialized Force.`)
	return createForce({
		position: Vector.fromStorageValue(force.position),
		angle: force.angle,
		...(Object.hasOwn(force, 'applicationPointAt') ? { applicationPointAt: force.applicationPointAt as ApplicationPointPosition } : {}),
		...(Object.hasOwn(force, 'relativeMagnitude') ? { relativeMagnitude: force.relativeMagnitude as number } : {}),
	})
}

/*
 * Moments
 */

export type SerializedMoment = {
	type: MomentType
	position: VectorStorageValue
	clockwise: boolean
	openingDirection?: number
}

export function serializeMoment(moment: Moment): SerializedMoment {
	return {
		type: MomentType,
		position: moment.position.toStorageValue(),
		clockwise: moment.clockwise,
		...omitDefaults({ openingDirection: moment.openingDirection }, { openingDirection: 0 }),
	}
}

export function deserializeMoment(moment: unknown): Moment {
	if (!isPlainObject(moment) || !hasOnlyKeys(moment, ['type', 'position', 'clockwise', 'openingDirection']) || moment.type !== MomentType || !isCoordinateList(moment.position) || typeof moment.clockwise !== 'boolean' || (Object.hasOwn(moment, 'openingDirection') && typeof moment.openingDirection !== 'number')) throw new Error(`Invalid serialized Moment.`)
	return createMoment({
		position: Vector.fromStorageValue(moment.position),
		clockwise: moment.clockwise,
		...(Object.hasOwn(moment, 'openingDirection') ? { openingDirection: moment.openingDirection as number } : {}),
	})
}

/*
 * Loads
 */

export type SerializedLoad = SerializedForce | SerializedMoment

export function serializeLoad(load: Load): SerializedLoad {
	switch (load.type) {
		case ForceType: return serializeForce(load)
		case MomentType: return serializeMoment(load)
	}
}


export function deserializeLoad(load: unknown): Load {
	if (!isPlainObject(load)) throw new Error(`Invalid serialized Load.`)
	switch (load.type) {
		case ForceType: return deserializeForce(load)
		case MomentType: return deserializeMoment(load)
		default: throw new Error(`Invalid serialized Load type.`)
	}
}
