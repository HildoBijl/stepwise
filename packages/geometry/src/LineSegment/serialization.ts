import { isPlainObject } from '@step-wise/js-utils'

import { isCoordinateList } from '../Vector/index.ts'

import { type LineSegmentStorageValue } from './types.ts'
import { LineSegment } from './LineSegment.ts'

export type SerializedLineSegment = {
	type: typeof LineSegment.type
	value: LineSegmentStorageValue
}

export function isSerializedLineSegment(value: unknown): value is SerializedLineSegment {
	return isPlainObject(value) && Object.keys(value).length === 2 && value.type === LineSegment.type && isPlainObject(value.value) && Object.keys(value.value).length === 2 && isCoordinateList(value.value.start) && isCoordinateList(value.value.end)
}

export function serializeLineSegment(lineSegment: LineSegment): SerializedLineSegment {
	return {
		type: LineSegment.type,
		value: lineSegment.toStorageValue(),
	}
}

export function deserializeLineSegment(serializedLineSegment: unknown): LineSegment {
	if (!isSerializedLineSegment(serializedLineSegment)) throw new Error(`Invalid serialized LineSegment.`)
	return LineSegment.fromStorageValue(serializedLineSegment.value as LineSegmentStorageValue)
}
