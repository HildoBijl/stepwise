import { isPlainObject } from '@step-wise/js-utils'

import { isCoordinateList } from '../Vector'

import { type LineSegmentStorageValue } from './types'
import { LineSegment } from './LineSegment'

export type SerializedLineSegment = {
	type: typeof LineSegment.type
	value: LineSegmentStorageValue
}

export function serializeLineSegment(lineSegment: LineSegment): SerializedLineSegment {
	return {
		type: LineSegment.type,
		value: lineSegment.toStorageValue(),
	}
}

export function deserializeLineSegment(serializedLineSegment: unknown): LineSegment {
	if (!isPlainObject(serializedLineSegment) || Object.keys(serializedLineSegment).length !== 2 || serializedLineSegment.type !== LineSegment.type || !isPlainObject(serializedLineSegment.value) || Object.keys(serializedLineSegment.value).length !== 2 || !isCoordinateList(serializedLineSegment.value.start) || !isCoordinateList(serializedLineSegment.value.end)) throw new Error(`Invalid serialized LineSegment.`)
	return LineSegment.fromStorageValue(serializedLineSegment.value as LineSegmentStorageValue)
}
