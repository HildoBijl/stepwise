import { isPlainObject } from '@step-wise/utils'

import { isMatrixLike } from '../Matrix'
import { isVectorLike } from '../Vector'

import type { TransformationInput, TransformationDescription } from './types'

export function isTransformationObject(value: unknown): value is TransformationDescription {
	return isPlainObject(value) && isMatrixLike(value.matrix) && isVectorLike(value.translation)
}

export function isTransformationInput(value: unknown): value is TransformationInput {
	return isMatrixLike(value) || isTransformationObject(value)
}
