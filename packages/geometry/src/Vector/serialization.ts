import { isPlainObject } from '@step-wise/js-utils'

import { type VectorStorageValue } from './types.ts'
import { Vector } from './Vector.ts'
import { isCoordinateList } from './support.ts'

export type SerializedVector = {
	type: typeof Vector.type
	value: VectorStorageValue
}

export function isSerializedVector(value: unknown): value is SerializedVector {
	return isPlainObject(value) && Object.keys(value).length === 2 && value.type === Vector.type && isCoordinateList(value.value)
}

export function serializeVector(vector: Vector): SerializedVector {
	return {
		type: Vector.type,
		value: vector.toStorageValue(),
	}
}

export function deserializeVector(serializedVector: unknown): Vector {
	if (!isSerializedVector(serializedVector)) throw new Error(`Invalid serialized Vector.`)
	return Vector.fromStorageValue(serializedVector.value)
}
