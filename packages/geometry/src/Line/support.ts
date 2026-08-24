import { isPlainObject } from '@step-wise/js-utils'

import { isVectorLike } from '../Vector'

import type { LineInput } from './types'

export function isLineObject(value: unknown): value is LineInput {
	return isPlainObject(value) && isVectorLike(value.start) && isVectorLike(value.direction)
}

export function isLineInput(value: unknown): value is LineInput {
	return isLineObject(value)
}
