import { isTransformationInput } from './support'
import { type TransformationLike, Transformation } from './Transformation'

export function isTransformationLike(value: unknown): value is TransformationLike {
	return value instanceof Transformation || isTransformationInput(value)
}

export function ensureTransformation(transformation: TransformationLike, dimension?: number, requireInvertible = false): Transformation {
	const ensuredTransformation = new Transformation(transformation)
	if (dimension !== undefined && ensuredTransformation.dimension !== dimension) throw new Error(`Invalid Transformation dimension: expected a transformation of dimension ${dimension} but received a transformation of dimension ${ensuredTransformation.dimension}.`)
	if (requireInvertible && !ensuredTransformation.isInvertible()) throw new Error(`Invalid Transformation: required an invertible transformation, but received one that was not invertible.`)
	return ensuredTransformation
}
