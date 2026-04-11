import { isPlainObject } from '@step-wise/utils'

import { isVectorLike } from '../Vector'

import type { LineInput, LineObject } from './types'

export function isLineObject(value: unknown): value is LineObject {
	if (!isPlainObject(value)) return false
	const obj = value as Record<string, unknown>
	return isVectorLike(obj.start) && isVectorLike(obj.direction)
}

export function isLineInput(value: unknown): value is LineInput {
	return isLineObject(value)
}
