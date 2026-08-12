import { isPlainObject } from '@step-wise/utils'

import { isVectorLike } from '../Vector'

import type { LineInput, LineObject } from './types'

export function isLineObject(value: unknown): value is LineObject {
	return isPlainObject(value) && isVectorLike(value.start) && isVectorLike(value.direction)
}

export function isLineInput(value: unknown): value is LineInput {
	return isLineObject(value)
}
