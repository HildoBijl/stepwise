import { Vector, VectorType } from '@step-wise/geometry'
import { Line, LineType } from '@step-wise/geometry'
import { LineSegment, LineSegmentType } from '@step-wise/geometry'
import { Rectangle, RectangleType } from '@step-wise/geometry'

import type { TypeCompareFunction } from '../types'

export function compareVector(inputValue: unknown, expectedValue: unknown): boolean {
	if (!(expectedValue instanceof Vector) || !(inputValue instanceof Vector)) throw new Error(`Invalid Vector comparison: received parameters that were not Vectors.`)
	return expectedValue.equals(inputValue)
}

export function compareLine(inputValue: unknown, expectedValue: unknown): boolean {
	if (!(expectedValue instanceof Line) || !(inputValue instanceof Line)) throw new Error(`Invalid Line comparison: received parameters that were not Lines.`)
	return expectedValue.equals(inputValue)
}

export function compareLineSegment(inputValue: unknown, expectedValue: unknown): boolean {
	if (!(expectedValue instanceof LineSegment) || !(inputValue instanceof LineSegment)) throw new Error(`Invalid LineSegment comparison: received parameters that were not LineSegments.`)
	return expectedValue.equals(inputValue)
}

export function compareRectangle(inputValue: unknown, expectedValue: unknown): boolean {
	if (!(expectedValue instanceof Rectangle) || !(inputValue instanceof Rectangle)) throw new Error(`Invalid Rectangle comparison: received parameters that were not Rectangles.`)
	return expectedValue.equals(inputValue)
}

export const geometryCompareFunctions = {
	[VectorType]: compareVector,
	[LineType]: compareLine,
	[LineSegmentType]: compareLineSegment,
	[RectangleType]: compareRectangle,
} satisfies Record<string, TypeCompareFunction>
