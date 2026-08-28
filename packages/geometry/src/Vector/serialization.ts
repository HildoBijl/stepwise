import { isPlainObject } from '@step-wise/js-utils'

import { type VectorStorageValue } from './types.ts'
import { Vector } from './Vector.ts'
import { isCoordinateList } from './support.ts'

export type SerializedVector = {
	type: typeof Vector.type
	value: VectorStorageValue
}

export function serializeVector(vector: Vector): SerializedVector {
	return {
		type: Vector.type,
		value: vector.toStorageValue(),
	}
}

export function deserializeVector(serializedVector: unknown): Vector {
	if (!isPlainObject(serializedVector) || Object.keys(serializedVector).length !== 2 || serializedVector.type !== Vector.type || !isCoordinateList(serializedVector.value)) throw new Error(`Invalid serialized Vector.`)
	return Vector.fromStorageValue(serializedVector.value)
}
