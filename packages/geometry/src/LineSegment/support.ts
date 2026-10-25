import { isPlainObject } from '@step-wise/js-utils'

import { isVectorLike } from '../Vector/index.ts'

import type { LineSegmentEndpoints, LineSegmentInput, LineSegmentObject } from './types.ts'

export function isLineSegmentEndpoints(value: unknown): value is LineSegmentEndpoints {
	return Array.isArray(value) && value.length === 2 && isVectorLike(value[0]) && isVectorLike(value[1])
}

export function isLineSegmentObject(value: unknown): value is LineSegmentObject {
	if (!isPlainObject(value)) return false

	const hasStart = value.start !== undefined
	const hasEnd = value.end !== undefined
	const hasVector = value.vector !== undefined

	// A line segment must at least specify two of the three.
	const count = Number(hasStart) + Number(hasEnd) + Number(hasVector)
	if (count < 2) return false
	if (hasStart && !isVectorLike(value.start)) return false
	if (hasEnd && !isVectorLike(value.end)) return false
	if (hasVector && !isVectorLike(value.vector)) return false
	return true
}

export function isLineSegmentInput(value: unknown): value is LineSegmentInput {
	return isLineSegmentEndpoints(value) || isLineSegmentObject(value)
}
