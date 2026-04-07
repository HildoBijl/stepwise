import { isVectorInput } from './support'
import { type VectorLike, Vector } from './Vector'

// Check if the given value is something that can be interpreted as a Vector.
export function isVectorLike(value: unknown): value is VectorLike {
	return value instanceof Vector || isVectorInput(value)
}

// Turn into a Vector (with optional property requirements) or throw an error.
export function ensureVector(vector: VectorLike | undefined, dimension?: number, useDefaultZero = false, preventZero = false): Vector {
	// Check default fallbacks.
	if (useDefaultZero && preventZero) throw new Error(`Invalid ensureVector settings: you have set "useDefaultZero" to true but "preventZero" also to true. That's a contradiction in itself.`)
	if (useDefaultZero && vector === undefined) {
		if (dimension === undefined) throw new Error(`Invalid ensureVector call: cannot use a default zero vector without specifying a dimension.`)
		return Vector.getZero(dimension)
	}

	// Set up the vector and check it.
	const ensuredVector = new Vector(vector as VectorLike)
	if (dimension !== undefined && ensuredVector.dimension !== dimension) throw new Error(`Invalid Vector dimension: expected a vector of dimension ${dimension} but received a vector of dimension ${ensuredVector.dimension}.`)
	if (preventZero && ensuredVector.isZero()) throw new Error(`Invalid Vector: received a zero vector (dimension ${ensuredVector.dimension}) but this is not allowed.`)
	return ensuredVector
}

// Turn into a Vector list (with optional requirements) or throw an error.
export function ensureVectorArray(vectors: VectorLike[], dimension?: number, numElements?: number): Vector[] {
	if (!Array.isArray(vectors)) throw new Error(`Invalid Vector array: expected an array of vectors or vector-like objects (arrays or objects with coordinates) but received a parameter of type "${typeof vectors}".`)
	if (numElements !== undefined && vectors.length !== numElements) throw new Error(`Invalid Vector array: expected an array with ${numElements} vectors, but the array had ${vectors.length} elements instead.`)
	return vectors.map(vector => ensureVector(vector, dimension))
}

// Turn into a list of three Vector objects or throw an error.
export function ensureCorner(points: VectorLike[], dimension = 2): [Vector, Vector, Vector] {
	return ensureVectorArray(points, dimension, 3) as [Vector, Vector, Vector]
}
