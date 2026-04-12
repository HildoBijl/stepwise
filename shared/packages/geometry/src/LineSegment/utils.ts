import { isLineSegmentInput } from './support'
import { type LineSegmentLike, LineSegment } from './LineSegment'

export function isLineSegmentLike(value: unknown): value is LineSegmentLike {
	return value instanceof LineSegment || isLineSegmentInput(value)
}

export function ensureLineSegment(lineSegment: LineSegmentLike, dimension?: number): LineSegment {
	const ensuredLineSegment = new LineSegment(lineSegment)
	if (dimension !== undefined && ensuredLineSegment.dimension !== dimension) throw new Error(`Invalid LineSegment dimension: expected a LineSegment of dimension ${dimension} but received one of dimension ${ensuredLineSegment.dimension}.`)
	return ensuredLineSegment
}
