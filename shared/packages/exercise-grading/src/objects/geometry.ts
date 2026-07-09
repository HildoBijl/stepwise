import { Vector, VectorType } from '@step-wise/geometry'
import { Line, LineType } from '@step-wise/geometry'
import { LineSegment, LineSegmentType } from '@step-wise/geometry'
import { Rectangle, RectangleType } from '@step-wise/geometry'

import type { TypeCompareFunction } from '../types'

export function compareVector(input: unknown, correct: unknown): boolean {
	if (!(correct instanceof Vector) || !(input instanceof Vector)) throw new Error(`Invalid Vector comparison: received parameters that were not Vectors.`)
	return correct.equals(input)
}

export function compareLine(input: unknown, correct: unknown): boolean {
	if (!(correct instanceof Line) || !(input instanceof Line)) throw new Error(`Invalid Line comparison: received parameters that were not Lines.`)
	return correct.equals(input)
}

export function compareLineSegment(input: unknown, correct: unknown): boolean {
	if (!(correct instanceof LineSegment) || !(input instanceof LineSegment)) throw new Error(`Invalid LineSegment comparison: received parameters that were not LineSegments.`)
	return correct.equals(input)
}

export function compareRectangle(input: unknown, correct: unknown): boolean {
	if (!(correct instanceof Rectangle) || !(input instanceof Rectangle)) throw new Error(`Invalid Rectangle comparison: received parameters that were not Rectangles.`)
	return correct.equals(input)
}

export const geometryCompareFunctions = {
	[VectorType]: compareVector,
	[LineType]: compareLine,
	[LineSegmentType]: compareLineSegment,
	[RectangleType]: compareRectangle,
} satisfies Record<string, TypeCompareFunction>
