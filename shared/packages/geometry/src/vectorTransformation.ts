import { ensureNumber } from '@step-wise/utils'

import { type VectorLike, Vector, ensureVector } from './Vector'
import { type MatrixLike, Matrix, ensureMatrix } from './Matrix'

// Transform a vector by applying it to the given transformation matrix.
export function transformVector(vector: VectorLike, matrix: MatrixLike, relativeTo?: VectorLike): Vector {
	// Check the input.
	const inputVector = ensureVector(vector)
	const transformationMatrix = ensureMatrix(matrix, inputVector.dimension, inputVector.dimension)
	const origin = ensureVector(relativeTo, inputVector.dimension, true)

	// Apply the transformation.
	const relativeVector = inputVector.subtract(origin)
	const transformedVector = transformationMatrix.multiply(relativeVector)
	return origin.add(transformedVector)
}

// Scale a vector by a factor, either as a fixed number, or a different number per dimension.
export function scaleVector(vector: VectorLike, scales: number | number[], relativeTo?: VectorLike): Vector {
	// Check the input.
	const inputVector = ensureVector(vector)
	const scaleArray = Array.isArray(scales) ? scales.map(scale => ensureNumber(scale)) : inputVector.coordinates.map(() => ensureNumber(scales))
	if (scaleArray.length !== inputVector.dimension) throw new Error(`Invalid scales: expected ${inputVector.dimension} scale values but received ${scaleArray.length}.`)

	// Apply the transformation.
	const matrix = new Matrix(scaleArray.map((scale, rowIndex) => scaleArray.map((_, colIndex) => (rowIndex === colIndex ? scale : 0))))
	return transformVector(inputVector, matrix, relativeTo)
}

// Rotate the vector around a given point. The angle is in radians, counter-clockwise.
export function rotateVector(vector: VectorLike, rotationAngle: number, relativeTo?: VectorLike): Vector {
	// Check the input.
	const inputVector = ensureVector(vector, 2)
	const angle = ensureNumber(rotationAngle)

	// Apply the transformation.
	const matrix = new Matrix([[Math.cos(angle), -Math.sin(angle)],	[Math.sin(angle), Math.cos(angle)]])
	return transformVector(inputVector, matrix, relativeTo)
}

// Reflect along the given direction. Default: reflect along the x-axis.
export function reflectVector(vector: VectorLike, direction?: VectorLike, relativeTo?: VectorLike): Vector {
	const inputVector = ensureVector(vector)
	const axis = direction === undefined ? Vector.getUnitVector(0, inputVector.dimension) : ensureVector(direction, inputVector.dimension, false, true)

	// Reflection along axis u: transform using 2uu^T - I.
	const u = Matrix.fromVector(axis.normalize())
	const matrix = u.multiply(u.transpose()).multiply(2).subtract(Matrix.getIdentity(axis.dimension))
	return transformVector(inputVector, matrix, relativeTo)
}
