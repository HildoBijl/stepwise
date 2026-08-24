import { isLineSegmentInput } from './support'
import { type LineSegmentLike, LineSegment } from './LineSegment'

export function isLineSegmentLike(value: unknown): value is LineSegmentLike {
	return value instanceof LineSegment || isLineSegmentInput(value)
}

export function ensureLineSegment(lineSegment: LineSegmentLike, options: { dimension?: number } = {}): LineSegment {
	const ensuredLineSegment = new LineSegment(lineSegment)
	if (options.dimension !== undefined && ensuredLineSegment.dimension !== options.dimension) throw new Error(`Invalid LineSegment dimension: expected a LineSegment of dimension ${options.dimension} but received one of dimension ${ensuredLineSegment.dimension}.`)
	return ensuredLineSegment
}
