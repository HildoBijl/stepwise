import {
	type Vector, type SerializedVector, VectorType, serializeVector, deserializeVector,
	type Line, type SerializedLine, LineType, serializeLine, deserializeLine,
	type LineSegment, type SerializedLineSegment, LineSegmentType, serializeLineSegment, deserializeLineSegment,
	type Rectangle, type SerializedRectangle, RectangleType, serializeRectangle, deserializeRectangle,
} from '@step-wise/geometry'

import type { InputValueAdapter } from '../types'

export const vectorInputValueAdapter = {
	interpret: deserializeVector,
	toInputValue: serializeVector,
} satisfies InputValueAdapter<SerializedVector, Vector>

export const lineInputValueAdapter = {
	interpret: deserializeLine,
	toInputValue: serializeLine,
} satisfies InputValueAdapter<SerializedLine, Line>

export const lineSegmentInputValueAdapter = {
	interpret: deserializeLineSegment,
	toInputValue: serializeLineSegment,
} satisfies InputValueAdapter<SerializedLineSegment, LineSegment>

export const rectangleInputValueAdapter = {
	interpret: deserializeRectangle,
	toInputValue: serializeRectangle,
} satisfies InputValueAdapter<SerializedRectangle, Rectangle>

export const geometryInputValueAdapters = {
	[VectorType]: vectorInputValueAdapter,
	[LineType]: lineInputValueAdapter,
	[LineSegmentType]: lineSegmentInputValueAdapter,
	[RectangleType]: rectangleInputValueAdapter,
}
