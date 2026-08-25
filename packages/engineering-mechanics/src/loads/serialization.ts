import { hasOnlyKeys, isIn, isPlainObject } from '@step-wise/js-utils'
import { type VectorStorageValue, Vector, isCoordinateList } from '@step-wise/geometry'

import { type ApplicationPointPosition, type Force, type Load, type Moment, applicationPointPositions, loadTypes } from './types'
import { createForce, createMoment } from './creation'

/*
 * Forces
 */

export type SerializedForce = {
	type: typeof loadTypes.force
	position: VectorStorageValue
	angle: number
	applicationPointAt: ApplicationPointPosition
	magnitudeFactor: number
}

export function serializeForce(force: Force): SerializedForce {
	return {
		type: loadTypes.force,
		position: force.position.toStorageValue(),
		angle: force.angle,
		applicationPointAt: force.applicationPointAt,
		magnitudeFactor: force.magnitudeFactor,
	}
}

export function deserializeForce(force: unknown): Force {
	if (!isPlainObject(force) || !hasOnlyKeys(force, ['type', 'position', 'angle', 'applicationPointAt', 'magnitudeFactor']) || force.type !== loadTypes.force || !isCoordinateList(force.position) || typeof force.angle !== 'number' || !isIn(force.applicationPointAt, applicationPointPositions) || typeof force.magnitudeFactor !== 'number') throw new Error(`Invalid serialized Force.`)
	return createForce({
		position: Vector.fromStorageValue(force.position),
		angle: force.angle,
		applicationPointAt: force.applicationPointAt,
		magnitudeFactor: force.magnitudeFactor,
	})
}

/*
 * Moments
 */

export type SerializedMoment = {
	type: typeof loadTypes.moment
	position: VectorStorageValue
	clockwise: boolean
	openingAngle: number
}

export function serializeMoment(moment: Moment): SerializedMoment {
	return {
		type: loadTypes.moment,
		position: moment.position.toStorageValue(),
		clockwise: moment.clockwise,
		openingAngle: moment.openingAngle,
	}
}

export function deserializeMoment(moment: unknown): Moment {
	if (!isPlainObject(moment) || !hasOnlyKeys(moment, ['type', 'position', 'clockwise', 'openingAngle']) || moment.type !== loadTypes.moment || !isCoordinateList(moment.position) || typeof moment.clockwise !== 'boolean' || typeof moment.openingAngle !== 'number') throw new Error(`Invalid serialized Moment.`)
	return createMoment({
		position: Vector.fromStorageValue(moment.position),
		clockwise: moment.clockwise,
		openingAngle: moment.openingAngle,
	})
}

/*
 * Loads
 */

export type SerializedLoad = SerializedForce | SerializedMoment

export function serializeLoad(load: Load): SerializedLoad {
	switch (load.type) {
		case loadTypes.force: return serializeForce(load)
		case loadTypes.moment: return serializeMoment(load)
	}
}


export function deserializeLoad(load: unknown): Load {
	if (!isPlainObject(load)) throw new Error(`Invalid serialized Load.`)
	switch (load.type) {
		case loadTypes.force: return deserializeForce(load)
		case loadTypes.moment: return deserializeMoment(load)
		default: throw new Error(`Invalid serialized Load type.`)
	}
}
