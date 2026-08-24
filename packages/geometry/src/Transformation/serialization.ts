import { isPlainObject } from '@step-wise/js-utils'

import { isMatrixArray } from '../Matrix'
import { isCoordinateList } from '../Vector'

import { type TransformationStorageValue } from './types'
import { Transformation } from './Transformation'

export type SerializedTransformation = {
	type: typeof Transformation.type
	value: TransformationStorageValue
}

export function serializeTransformation(transformation: Transformation): SerializedTransformation {
	return {
		type: Transformation.type,
		value: transformation.toStorageValue(),
	}
}

export function deserializeTransformation(serializedTransformation: unknown): Transformation {
	if (!isPlainObject(serializedTransformation) || Object.keys(serializedTransformation).length !== 2 || serializedTransformation.type !== Transformation.type || !isPlainObject(serializedTransformation.value) || Object.keys(serializedTransformation.value).length !== 2 || !isMatrixArray(serializedTransformation.value.matrix) || !isCoordinateList(serializedTransformation.value.translation)) throw new Error(`Invalid serialized Transformation.`)
	return Transformation.fromStorageValue(serializedTransformation.value as TransformationStorageValue)
}
