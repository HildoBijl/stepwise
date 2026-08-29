import { Vector, type SerializedVector, isSerializedVector, serializeVector, deserializeVector } from '@step-wise/geometry'
import { Line, type SerializedLine, isSerializedLine, serializeLine, deserializeLine } from '@step-wise/geometry'
import { LineSegment, type SerializedLineSegment, isSerializedLineSegment, serializeLineSegment, deserializeLineSegment } from '@step-wise/geometry'
import { Rectangle, type SerializedRectangle, isSerializedRectangle, serializeRectangle, deserializeRectangle } from '@step-wise/geometry'

import type { SerializationAdapter } from '../types.ts'

export const vectorAdapter = {
	isDomainValue: (value: unknown): value is Vector => value instanceof Vector,
	isSerializedValue: isSerializedVector,
	serialize: serializeVector,
	deserialize: deserializeVector,
} satisfies SerializationAdapter<Vector, SerializedVector>

export const lineAdapter = {
	isDomainValue: (value: unknown): value is Line => value instanceof Line,
	isSerializedValue: isSerializedLine,
	serialize: serializeLine,
	deserialize: deserializeLine,
} satisfies SerializationAdapter<Line, SerializedLine>

export const lineSegmentAdapter = {
	isDomainValue: (value: unknown): value is LineSegment => value instanceof LineSegment,
	isSerializedValue: isSerializedLineSegment,
	serialize: serializeLineSegment,
	deserialize: deserializeLineSegment,
} satisfies SerializationAdapter<LineSegment, SerializedLineSegment>

export const rectangleAdapter = {
	isDomainValue: (value: unknown): value is Rectangle => value instanceof Rectangle,
	isSerializedValue: isSerializedRectangle,
	serialize: serializeRectangle,
	deserialize: deserializeRectangle,
} satisfies SerializationAdapter<Rectangle, SerializedRectangle>
