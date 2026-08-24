import { describe, expect, it } from 'vitest'

import { Line, LineSegment, deserializeLineSegment, ensureLineSegment, isLineSegmentLike, serializeLineSegment } from '..'

describe('LineSegment', () => {
	it('constructs segments from any consistent pair of properties', () => {
		expect(new LineSegment({ start: [1, 2], vector: [3, 4] }).end.coordinates).toEqual([4, 6])
		expect(new LineSegment({ end: [4, 6], vector: [3, 4] }).start.coordinates).toEqual([1, 2])
		expect(new LineSegment([1, 2], [4, 6]).vector.coordinates).toEqual([3, 4])
		expect(() => new LineSegment({ start: [1, 2], end: [4, 6], vector: [1, 1] })).toThrow()
	})

	it('provides segment properties and comparisons', () => {
		const segment = new LineSegment([0, 0], [2, 2])
		expect(segment.midpoint.coordinates).toEqual([1, 1])
		expect(segment.hasEndpoint([2, 2])).toBe(true)
		expect(segment.sharesEndpointWith(new LineSegment([2, 2], [3, 2]))).toBe(true)
		expect(segment.equals(new LineSegment([2, 2], [0, 0]))).toBe(false)
		expect(segment.equals(new LineSegment([2, 2], [0, 0]), true)).toBe(true)
		expect(segment.isOrthogonalTo(new LineSegment([0, 0], [1, -1]))).toBe(true)
	})

	it('checks whether segments lie on equal lines', () => {
		const segment = new LineSegment([0, 0], [2, 0])
		expect(segment.liesOnLine(Line.xAxis)).toBe(true)
		expect(segment.isCollinearWith(new LineSegment([3, 0], [5, 0]))).toBe(true)
		expect(segment.isCollinearWith(new LineSegment([3, 0], [5, 0]), false, true)).toBe(false)
		expect(new LineSegment([1, 0], [1, 0]).liesOnLine(Line.xAxis)).toBe(true)
		expect(() => new LineSegment([1, 0], [1, 0]).line).toThrow()
	})

	it('returns new segments for operations', () => {
		const segment = new LineSegment([0.4, 1.6], [2.4, 3.6])
		expect(segment.reverse().start.coordinates).toEqual([2.4, 3.6])
		expect(segment.round().start.coordinates).toEqual([0, 2])
		expect(segment.add([1, 2]).start.coordinates).toEqual([1.4, 3.6])
		expect(segment.subtract([1, 2]).end.coordinates).toEqual([1.4, 1.6])
		expect(segment.start.coordinates).toEqual([0.4, 1.6])
	})

	it('validates and serializes segments', () => {
		const segment = new LineSegment([1, 2], [3, 4])
		expect(isLineSegmentLike({ start: [1, 2], end: [3, 4] })).toBe(true)
		expect(ensureLineSegment(segment, { dimension: 2 }).equals(segment)).toBe(true)
		expect(LineSegment.fromStorageValue(segment.toStorageValue()).equals(segment)).toBe(true)
		expect(deserializeLineSegment(serializeLineSegment(segment)).equals(segment)).toBe(true)
		expect(() => ensureLineSegment(segment, { dimension: 3 })).toThrow()
	})
})
