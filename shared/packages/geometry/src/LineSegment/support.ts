import { isPlainObject } from '@step-wise/utils'

import { isVectorLike } from '../Vector'

import type { LineSegmentInput, LineSegmentObject } from './types'

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
	return isLineSegmentObject(value)
}
