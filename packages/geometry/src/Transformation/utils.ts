import { isVectorLike } from '../Vector/index.ts'
import { isLineLike } from '../Line/index.ts'
import { isLineSegmentLike } from '../LineSegment/index.ts'
import { isRectangleLike } from '../Rectangle/index.ts'

import type { TransformableLike } from './types.ts'
import { isTransformationInput } from './support.ts'
import { type TransformationLike, Transformation } from './Transformation.ts'

export function isTransformationLike(value: unknown): value is TransformationLike {
	return value instanceof Transformation || isTransformationInput(value)
}

export function ensureTransformation(transformation: TransformationLike, options: { dimension?: number, invertible?: boolean } = {}): Transformation {
	const ensuredTransformation = new Transformation(transformation)
	if (options.dimension !== undefined && ensuredTransformation.dimension !== options.dimension) throw new Error(`Invalid Transformation dimension: expected a transformation of dimension ${options.dimension} but received a transformation of dimension ${ensuredTransformation.dimension}.`)
	if (options.invertible && !ensuredTransformation.isInvertible()) throw new Error(`Invalid Transformation: required an invertible transformation, but received one that was not invertible.`)
	return ensuredTransformation
}

export function isTransformable(value: unknown): value is TransformableLike {
	return isVectorLike(value) || isLineLike(value) || isLineSegmentLike(value) || isRectangleLike(value)
}
