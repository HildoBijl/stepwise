import { Vector, VectorType } from '@step-wise/geometry'
import { Line, LineType } from '@step-wise/geometry'
import { LineSegment, LineSegmentType } from '@step-wise/geometry'
import { Rectangle, RectangleType } from '@step-wise/geometry'
import type { ValueEqualityAdapter } from '@step-wise/value-equality'

export function areVectorsEqual(inputValue: Vector, expectedValue: Vector): boolean {
	return expectedValue.equals(inputValue)
}

export function areLinesEqual(inputValue: Line, expectedValue: Line): boolean {
	return expectedValue.equals(inputValue)
}

export function areLineSegmentsEqual(inputValue: LineSegment, expectedValue: LineSegment): boolean {
	return expectedValue.equals(inputValue)
}

export function areRectanglesEqual(inputValue: Rectangle, expectedValue: Rectangle): boolean {
	return expectedValue.equals(inputValue)
}

export const geometryEqualityAdapters = {
	[VectorType]: {
		isValue: (value): value is Vector => value instanceof Vector,
		areEqual: areVectorsEqual,
	} satisfies ValueEqualityAdapter<Vector>,
	[LineType]: {
		isValue: (value): value is Line => value instanceof Line,
		areEqual: areLinesEqual,
	} satisfies ValueEqualityAdapter<Line>,
	[LineSegmentType]: {
		isValue: (value): value is LineSegment => value instanceof LineSegment,
		areEqual: areLineSegmentsEqual,
	} satisfies ValueEqualityAdapter<LineSegment>,
	[RectangleType]: {
		isValue: (value): value is Rectangle => value instanceof Rectangle,
		areEqual: areRectanglesEqual,
	} satisfies ValueEqualityAdapter<Rectangle>,
}
