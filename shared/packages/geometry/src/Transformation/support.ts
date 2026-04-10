import { isPlainObject } from '@step-wise/utils'

import { isMatrixLike } from '../Matrix'
import { isVectorLike } from '../Vector'

import type { TransformationInput, TransformationDescription } from './types'

export function isTransformationDescription(value: unknown): value is TransformationDescription {
	if (!isPlainObject(value)) return false
	const obj = value as Record<string, unknown>
	if (!isMatrixLike(obj.matrix)) return false
	if (obj.translation !== undefined && !isVectorLike(obj.translation)) return false
	return true
}

export function isTransformationInput(value: unknown): value is TransformationInput {
	return isMatrixLike(value) || isTransformationDescription(value)
}
