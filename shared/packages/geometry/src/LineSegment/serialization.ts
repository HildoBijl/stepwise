import { type LineSegmentData } from './types'
import { LineSegment } from './LineSegment'

export type SerializedLineSegment = {
	type: typeof LineSegment.type
	value: LineSegmentData
}

export function serializeLineSegment(lineSegment: LineSegment): SerializedLineSegment {
	return {
		type: LineSegment.type,
		value: lineSegment.toStorageValue(),
	}
}

export function deserializeLineSegment(serializedLineSegment: SerializedLineSegment): LineSegment {
	return LineSegment.fromStorageValue(serializedLineSegment.value)
}
