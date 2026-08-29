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

export function isSerializedForce(value: unknown): value is SerializedForce {
	return isPlainObject(value) && hasOnlyKeys(value, ['type', 'position', 'angle', 'applicationPointAt', 'relativeMagnitude']) && value.type === ForceType && isCoordinateList(value.position) && typeof value.angle === 'number' && (!Object.hasOwn(value, 'applicationPointAt') || isIn(value.applicationPointAt, loadApplicationPointPositions)) && (!Object.hasOwn(value, 'relativeMagnitude') || typeof value.relativeMagnitude === 'number')
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
	if (!isSerializedForce(force)) throw new Error(`Invalid serialized Force.`)
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

export function isSerializedMoment(value: unknown): value is SerializedMoment {
	return isPlainObject(value) && hasOnlyKeys(value, ['type', 'position', 'clockwise', 'openingDirection']) && value.type === MomentType && isCoordinateList(value.position) && typeof value.clockwise === 'boolean' && (!Object.hasOwn(value, 'openingDirection') || typeof value.openingDirection === 'number')
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
	if (!isSerializedMoment(moment)) throw new Error(`Invalid serialized Moment.`)
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

export function isSerializedLoad(value: unknown): value is SerializedLoad {
	return isSerializedForce(value) || isSerializedMoment(value)
}

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
