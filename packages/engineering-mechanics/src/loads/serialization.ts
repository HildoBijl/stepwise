import { hasOnlyKeys, isIn, isPlainObject } from '@step-wise/js-utils'
import { type VectorStorageValue, Vector, isCoordinateList } from '@step-wise/geometry'

import { type ApplicationPointPosition, type Force, type Load, type Moment, loadApplicationPointPositions, ForceType, MomentType } from './types'
import { createForce, createMoment } from './creation'

/*
 * Forces
 */

export type SerializedForce = {
	type: ForceType
	position: VectorStorageValue
	angle: number
	applicationPointAt: ApplicationPointPosition
	relativeMagnitude: number
}

export function serializeForce(force: Force): SerializedForce {
	return {
		type: ForceType,
		position: force.position.toStorageValue(),
		angle: force.angle,
		applicationPointAt: force.applicationPointAt,
		relativeMagnitude: force.relativeMagnitude,
	}
}

export function deserializeForce(force: unknown): Force {
	if (!isPlainObject(force) || !hasOnlyKeys(force, ['type', 'position', 'angle', 'applicationPointAt', 'relativeMagnitude']) || force.type !== ForceType || !isCoordinateList(force.position) || typeof force.angle !== 'number' || !isIn(force.applicationPointAt, loadApplicationPointPositions) || typeof force.relativeMagnitude !== 'number') throw new Error(`Invalid serialized Force.`)
	return createForce({
		position: Vector.fromStorageValue(force.position),
		angle: force.angle,
		applicationPointAt: force.applicationPointAt,
		relativeMagnitude: force.relativeMagnitude,
	})
}

/*
 * Moments
 */

export type SerializedMoment = {
	type: MomentType
	position: VectorStorageValue
	clockwise: boolean
	openingDirection: number
}

export function serializeMoment(moment: Moment): SerializedMoment {
	return {
		type: MomentType,
		position: moment.position.toStorageValue(),
		clockwise: moment.clockwise,
		openingDirection: moment.openingDirection,
	}
}

export function deserializeMoment(moment: unknown): Moment {
	if (!isPlainObject(moment) || !hasOnlyKeys(moment, ['type', 'position', 'clockwise', 'openingDirection']) || moment.type !== MomentType || !isCoordinateList(moment.position) || typeof moment.clockwise !== 'boolean' || typeof moment.openingDirection !== 'number') throw new Error(`Invalid serialized Moment.`)
	return createMoment({
		position: Vector.fromStorageValue(moment.position),
		clockwise: moment.clockwise,
		openingDirection: moment.openingDirection,
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
