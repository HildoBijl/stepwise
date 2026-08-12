import { type Vector as VectorType, type SerializedVector, serializeVector, deserializeVector } from '@step-wise/geometry'
import { type Line as LineType, type SerializedLine, serializeLine, deserializeLine } from '@step-wise/geometry'
import { type LineSegment as LineSegmentType, type SerializedLineSegment, serializeLineSegment, deserializeLineSegment } from '@step-wise/geometry'
import { type Rectangle as RectangleType, type SerializedRectangle, serializeRectangle, deserializeRectangle } from '@step-wise/geometry'

import type { SerializerEntry } from '../types'

export const Vector = {
	serialize: serializeVector,
	deserialize: deserializeVector,
} satisfies SerializerEntry<VectorType, SerializedVector>

export const Line = {
	serialize: serializeLine,
	deserialize: deserializeLine,
} satisfies SerializerEntry<LineType, SerializedLine>

export const LineSegment = {
	serialize: serializeLineSegment,
	deserialize: deserializeLineSegment,
} satisfies SerializerEntry<LineSegmentType, SerializedLineSegment>

export const Rectangle = {
	serialize: serializeRectangle,
	deserialize: deserializeRectangle,
} satisfies SerializerEntry<RectangleType, SerializedRectangle>
