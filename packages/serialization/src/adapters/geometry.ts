import { type Vector as VectorType, type SerializedVector, serializeVector, deserializeVector } from '@step-wise/geometry'
import { type Line as LineType, type SerializedLine, serializeLine, deserializeLine } from '@step-wise/geometry'
import { type LineSegment as LineSegmentType, type SerializedLineSegment, serializeLineSegment, deserializeLineSegment } from '@step-wise/geometry'
import { type Rectangle as RectangleType, type SerializedRectangle, serializeRectangle, deserializeRectangle } from '@step-wise/geometry'

import type { SerializationAdapter } from '../types.ts'

export const vectorAdapter = {
	serialize: serializeVector,
	deserialize: deserializeVector,
} satisfies SerializationAdapter<VectorType, SerializedVector>

export const lineAdapter = {
	serialize: serializeLine,
	deserialize: deserializeLine,
} satisfies SerializationAdapter<LineType, SerializedLine>

export const lineSegmentAdapter = {
	serialize: serializeLineSegment,
	deserialize: deserializeLineSegment,
} satisfies SerializationAdapter<LineSegmentType, SerializedLineSegment>

export const rectangleAdapter = {
	serialize: serializeRectangle,
	deserialize: deserializeRectangle,
} satisfies SerializationAdapter<RectangleType, SerializedRectangle>
