import { describe, expect, it } from 'vitest'

import { Line, LineSegment, Rectangle, deserializeRectangle, ensureRectangle, isRectangleLike, serializeRectangle } from '..'

describe('Rectangle', () => {
	it('normalizes corners and exposes bounds and named points', () => {
		const rectangle = new Rectangle([4, 6], [0, 2])
		expect(rectangle.min.coordinates).toEqual([0, 2])
		expect(rectangle.max.coordinates).toEqual([4, 6])
		expect(rectangle.bounds).toEqual([[0, 4], [2, 6]])
		expect(rectangle.size.coordinates).toEqual([4, 4])
		expect(rectangle.midpoint.coordinates).toEqual([2, 4])
		expect(rectangle.topLeft.coordinates).toEqual([0, 6])
		expect(rectangle.middleRight.coordinates).toEqual([4, 4])
		expect(rectangle.bottomMiddle.coordinates).toEqual([2, 2])
	})

	it('contains, bounds, and measures points', () => {
		const rectangle = new Rectangle([0, 0], [4, 2])
		expect(rectangle.containsPoint([2, 1])).toBe(true)
		expect(rectangle.containsPoint([5, 1])).toBe(false)
		expect(rectangle.isPointOnBoundary([0, 1])).toBe(true)
		expect(rectangle.isPointOnBoundary([2, 1])).toBe(false)
		expect(rectangle.clampPoint([5, -1]).coordinates).toEqual([4, 0])
		expect(rectangle.clampPoint([2, 0.75], { forceBoundary: true }).coordinates).toEqual([2, 0])
		expect(rectangle.getDistanceToPoint([5, 1])).toBe(1)
		expect(rectangle.getDistanceToPoint([2, 1], { toBoundary: true })).toBe(1)
	})

	it('distinguishes circle containment and intersection', () => {
		const rectangle = new Rectangle([0, 0], [4, 4])
		expect(rectangle.containsCircle([2, 2], 2)).toBe(true)
		expect(rectangle.containsCircle([0, 2], 1)).toBe(false)
		expect(rectangle.intersectsCircle([5, 2], 1)).toBe(true)
		expect(rectangle.intersectsCircle([2, 2], 10)).toBe(true)
		expect(rectangle.intersectsCircle([6, 2], 1)).toBe(false)
	})

	it('contains and intersects line segments', () => {
		const rectangle = new Rectangle([0, 0], [4, 4])
		expect(rectangle.containsLineSegment(new LineSegment([1, 1], [3, 3]))).toBe(true)
		expect(rectangle.intersectsLineSegment(new LineSegment([-1, 2], [5, 2]))).toBe(true)
		expect(rectangle.intersectsLineSegment(new LineSegment([-2, 5], [5, 5]))).toBe(false)
		expect(rectangle.intersectsLineSegment(new LineSegment([2, 2], [2, 2]))).toBe(true)
	})

	it('clips lines to the rectangle', () => {
		const rectangle = new Rectangle([0, 0], [4, 4])
		const intersection = rectangle.getLineIntersection(Line.getHorizontalThrough([0, 2]))
		expect(intersection?.start.coordinates).toEqual([0, 2])
		expect(intersection?.end.coordinates).toEqual([4, 2])
		expect(rectangle.getLineIntersection(new Line([-1, 1], [1, -1]))?.start.equals([0, 0])).toBe(true)
		expect(rectangle.getLineIntersection(Line.getHorizontalThrough([0, 5]))).toBeUndefined()
	})

	it('validates and serializes rectangles', () => {
		const rectangle = new Rectangle([0, 0], [4, 2])
		expect(isRectangleLike({ min: [0, 0], size: [4, 2] })).toBe(true)
		expect(ensureRectangle(rectangle, { dimension: 2 }).equals(rectangle)).toBe(true)
		expect(Rectangle.fromStorageValue(rectangle.toStorageValue()).equals(rectangle)).toBe(true)
		expect(deserializeRectangle(serializeRectangle(rectangle)).equals(rectangle)).toBe(true)
		expect(() => new Rectangle({ min: [0, 0], max: [4, 2], size: [3, 2] })).toThrow()
		expect(() => ensureRectangle(rectangle, { dimension: 3 })).toThrow()
	})
})
