import { isPlainObject } from '@step-wise/js-utils'

import { isMatrixLike } from '../Matrix/index.ts'
import { isVectorLike } from '../Vector/index.ts'

import type { TransformationInput, TransformationObjectInput } from './types.ts'

export function isTransformationObject(value: unknown): value is TransformationObjectInput {
	return isPlainObject(value) && isMatrixLike(value.matrix) && (value.translation === undefined || isVectorLike(value.translation))
}

export function isTransformationInput(value: unknown): value is TransformationInput {
	return isMatrixLike(value) || isTransformationObject(value)
}
