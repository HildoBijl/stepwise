import { type VectorData, Vector } from '@step-wise/geometry'

import { type ApplicationPointPosition, type Force, type Load, type Moment, loadTypes } from './types'
import { createForce, createMoment } from './creation'

/*
 * Forces
 */

export type SerializedForce = {
	type: typeof loadTypes.force
	position: VectorData
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

export function deserializeForce(force: SerializedForce): Force {
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
	position: VectorData
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

export function deserializeMoment(moment: SerializedMoment): Moment {
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

export function deserializeLoad(load: SerializedLoad): Load {
	switch (load.type) {
		case loadTypes.force: return deserializeForce(load)
		case loadTypes.moment: return deserializeMoment(load)
	}
}
