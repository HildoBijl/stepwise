import { isPlainObject } from '@step-wise/utils'

import { isVectorLike } from '../Vector'

import type { LineSegmentInput, LineSegmentObject } from './types'

export function isLineSegmentObject(value: unknown): value is LineSegmentObject {
	if (!isPlainObject(value)) return false
	const obj = value as Record<string, unknown>

	const hasStart = obj.start !== undefined
	const hasVector = obj.vector !== undefined
	const hasEnd = obj.end !== undefined

	// A line segment must at least specify two of the three.
	const count = Number(hasStart) + Number(hasVector) + Number(hasEnd)
	if (count < 2) return false

	if (hasStart && !isVectorLike(obj.start)) return false
	if (hasVector && !isVectorLike(obj.vector)) return false
	if (hasEnd && !isVectorLike(obj.end)) return false

	return true
}

export function isLineSegmentInput(value: unknown): value is LineSegmentInput {
	return isLineSegmentObject(value)
}
