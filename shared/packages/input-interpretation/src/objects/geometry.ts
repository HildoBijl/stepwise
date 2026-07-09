import {
	type Vector, type SerializedVector, VectorType, serializeVector, deserializeVector,
	type Line, type SerializedLine, LineType, serializeLine, deserializeLine,
	type LineSegment, type SerializedLineSegment, LineSegmentType, serializeLineSegment, deserializeLineSegment,
	type Rectangle, type SerializedRectangle, RectangleType, serializeRectangle, deserializeRectangle,
} from '@step-wise/geometry'

import type { InterpreterEntry } from '../types'

export { VectorType, LineType, LineSegmentType, RectangleType }

export type VectorInputValue = SerializedVector
export const VectorInterpreter = {
	interpret: deserializeVector,
	toInputValue: serializeVector,
} satisfies InterpreterEntry<SerializedVector, Vector>

export type LineInputValue = SerializedLine
export const LineInterpreter = {
	interpret: deserializeLine,
	toInputValue: serializeLine,
} satisfies InterpreterEntry<SerializedLine, Line>

export type LineSegmentInputValue = SerializedLineSegment
export const LineSegmentInterpreter = {
	interpret: deserializeLineSegment,
	toInputValue: serializeLineSegment,
} satisfies InterpreterEntry<SerializedLineSegment, LineSegment>

export type RectangleInputValue = SerializedRectangle
export const RectangleInterpreter = {
	interpret: deserializeRectangle,
	toInputValue: serializeRectangle,
} satisfies InterpreterEntry<SerializedRectangle, Rectangle>

export const geometryInterpreters = {
	[VectorType]: VectorInterpreter,
	[LineType]: LineInterpreter,
	[LineSegmentType]: LineSegmentInterpreter,
	[RectangleType]: RectangleInterpreter,
}
