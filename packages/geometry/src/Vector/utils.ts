import { isVectorInput } from './support.ts'
import { type VectorLike, Vector } from './Vector.ts'

// Check if the given value is something that can be interpreted as a Vector.
export function isVectorLike(value: unknown): value is VectorLike {
	return value instanceof Vector || isVectorInput(value)
}

export type EnsureVectorOptions = {
	dimension?: number
	defaultZero?: boolean
	nonZero?: boolean
}

// Turn into a Vector (with optional property requirements) or throw an error.
export function ensureVector(vector: VectorLike | undefined, options: EnsureVectorOptions = {}): Vector {
	const { dimension, defaultZero = false, nonZero = false } = options

	// Check default fallbacks.
	if (defaultZero && nonZero) throw new Error(`Invalid ensureVector options: "defaultZero" and "nonZero" cannot both be true.`)
	if (vector === undefined) {
		if (defaultZero) {
			if (dimension === undefined) throw new Error(`Invalid ensureVector call: cannot use a default zero vector without specifying a dimension.`)
			return Vector.getZero(dimension)
		}
		throw new Error(`Invalid ensureVector call: received an undefined Vector, while no fallback has been turned on.`)
	}

	// Set up the vector and check it.
	const ensuredVector = new Vector(vector as VectorLike)
	if (dimension !== undefined && ensuredVector.dimension !== dimension) throw new Error(`Invalid Vector dimension: expected a vector of dimension ${dimension} but received a vector of dimension ${ensuredVector.dimension}.`)
	if (nonZero && ensuredVector.isZero()) throw new Error(`Invalid Vector: received a zero vector (dimension ${ensuredVector.dimension}) but this is not allowed.`)
	return ensuredVector
}

export type EnsureVectorArrayOptions = {
	dimension?: number
	length?: number
}

// Turn into a Vector list (with optional requirements) or throw an error.
export function ensureVectorArray(vectors: VectorLike[], options: EnsureVectorArrayOptions = {}): Vector[] {
	const { dimension, length } = options
	if (!Array.isArray(vectors)) throw new Error(`Invalid Vector array: expected an array of vectors or vector-like objects (arrays or objects with coordinates) but received a parameter of type "${typeof vectors}".`)
	if (length !== undefined && vectors.length !== length) throw new Error(`Invalid Vector array: expected an array with ${length} vectors, but the array had ${vectors.length} elements instead.`)
	return vectors.map(vector => ensureVector(vector, { dimension }))
}

// Turn into a list of three Vector objects or throw an error.
export function ensureCorner(points: VectorLike[], options: { dimension?: number } = {}): [Vector, Vector, Vector] {
	return ensureVectorArray(points, { dimension: options.dimension ?? 2, length: 3 }) as [Vector, Vector, Vector]
}
