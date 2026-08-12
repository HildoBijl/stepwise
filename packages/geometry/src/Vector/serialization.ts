import { type VectorData } from './types'
import { Vector } from './Vector'

export type SerializedVector = {
	type: typeof Vector.type
	value: VectorData
}

export function serializeVector(vector: Vector): SerializedVector {
	return {
		type: Vector.type,
		value: vector.toStorageValue(),
	}
}

export function deserializeVector(serializedVector: SerializedVector): Vector {
	return Vector.fromStorageValue(serializedVector.value)
}
