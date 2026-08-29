import {
	Vector, type SerializedVector, VectorType, isSerializedVector, serializeVector, deserializeVector,
	Line, type SerializedLine, LineType, isSerializedLine, serializeLine, deserializeLine,
	LineSegment, type SerializedLineSegment, LineSegmentType, isSerializedLineSegment, serializeLineSegment, deserializeLineSegment,
	Rectangle, type SerializedRectangle, RectangleType, isSerializedRectangle, serializeRectangle, deserializeRectangle,
} from '@step-wise/geometry'

import type { InputValueAdapter } from '../types.ts'

export const vectorInputValueAdapter = {
	isInputValue: isSerializedVector,
	isDomainValue: (value: unknown): value is Vector => value instanceof Vector,
	interpret: deserializeVector,
	toInputValue: serializeVector,
} satisfies InputValueAdapter<SerializedVector, Vector>

export const lineInputValueAdapter = {
	isInputValue: isSerializedLine,
	isDomainValue: (value: unknown): value is Line => value instanceof Line,
	interpret: deserializeLine,
	toInputValue: serializeLine,
} satisfies InputValueAdapter<SerializedLine, Line>

export const lineSegmentInputValueAdapter = {
	isInputValue: isSerializedLineSegment,
	isDomainValue: (value: unknown): value is LineSegment => value instanceof LineSegment,
	interpret: deserializeLineSegment,
	toInputValue: serializeLineSegment,
} satisfies InputValueAdapter<SerializedLineSegment, LineSegment>

export const rectangleInputValueAdapter = {
	isInputValue: isSerializedRectangle,
	isDomainValue: (value: unknown): value is Rectangle => value instanceof Rectangle,
	interpret: deserializeRectangle,
	toInputValue: serializeRectangle,
} satisfies InputValueAdapter<SerializedRectangle, Rectangle>

export const geometryInputValueAdapters = {
	[VectorType]: vectorInputValueAdapter,
	[LineType]: lineInputValueAdapter,
	[LineSegmentType]: lineSegmentInputValueAdapter,
	[RectangleType]: rectangleInputValueAdapter,
}
