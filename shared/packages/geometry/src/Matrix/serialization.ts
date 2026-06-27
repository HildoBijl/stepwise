import { type MatrixArray } from './types'
import { Matrix } from './Matrix'

export type SerializedMatrix = {
	type: typeof Matrix.type
	value: MatrixArray
}

export function serializeMatrix(matrix: Matrix): SerializedMatrix {
	return {
		type: Matrix.type,
		value: matrix.toStorageValue(),
	}
}

export function deserializeMatrix(serializedMatrix: SerializedMatrix): Matrix {
	return Matrix.fromStorageValue(serializedMatrix.value)
}
