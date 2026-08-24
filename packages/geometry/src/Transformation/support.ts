import { isPlainObject } from '@step-wise/js-utils'

import { isMatrixLike } from '../Matrix'
import { isVectorLike } from '../Vector'

import type { TransformationInput, TransformationObjectInput } from './types'

export function isTransformationObject(value: unknown): value is TransformationObjectInput {
	return isPlainObject(value) && isMatrixLike(value.matrix) && (value.translation === undefined || isVectorLike(value.translation))
}

export function isTransformationInput(value: unknown): value is TransformationInput {
	return isMatrixLike(value) || isTransformationObject(value)
}
