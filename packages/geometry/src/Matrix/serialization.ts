import { isPlainObject } from '@step-wise/js-utils'

import { type MatrixArray as MatrixStorageValue } from './types'
import { Matrix } from './Matrix'
import { isMatrixArray } from './support'

export type SerializedMatrix = {
	type: typeof Matrix.type
	value: MatrixStorageValue
}

export function serializeMatrix(matrix: Matrix): SerializedMatrix {
	return {
		type: Matrix.type,
		value: matrix.toStorageValue(),
	}
}

export function deserializeMatrix(serializedMatrix: unknown): Matrix {
	if (!isPlainObject(serializedMatrix) || Object.keys(serializedMatrix).length !== 2 || serializedMatrix.type !== Matrix.type || !isMatrixArray(serializedMatrix.value)) throw new Error(`Invalid serialized Matrix.`)
	return Matrix.fromStorageValue(serializedMatrix.value)
}
