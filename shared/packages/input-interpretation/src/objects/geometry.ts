import {
	type Vector as VectorType, type SerializedVector, serializeVector, deserializeVector,
	type Line as LineType, type SerializedLine, serializeLine, deserializeLine,
	type LineSegment as LineSegmentType, type SerializedLineSegment, serializeLineSegment, deserializeLineSegment,
	type Rectangle as RectangleType, type SerializedRectangle, serializeRectangle, deserializeRectangle,
} from '@step-wise/geometry'

import type { InterpreterEntry } from '../types'

export type VectorInputValue = SerializedVector
export const Vector = {
	interpret: deserializeVector,
	toInputValue: serializeVector,
} satisfies InterpreterEntry<SerializedVector, VectorType>

export type LineInputValue = SerializedLine
export const Line = {
	interpret: deserializeLine,
	toInputValue: serializeLine,
} satisfies InterpreterEntry<SerializedLine, LineType>

export type LineSegmentInputValue = SerializedLineSegment
export const LineSegment = {
	interpret: deserializeLineSegment,
	toInputValue: serializeLineSegment,
} satisfies InterpreterEntry<SerializedLineSegment, LineSegmentType>

export type RectangleInputValue = SerializedRectangle
export const Rectangle = {
	interpret: deserializeRectangle,
	toInputValue: serializeRectangle,
} satisfies InterpreterEntry<SerializedRectangle, RectangleType>
