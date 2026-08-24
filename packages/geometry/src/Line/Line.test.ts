import { describe, expect, it } from 'vitest'

import { Line, deserializeLine, ensureLine, isLineLike, serializeLine } from '..'

describe('Line', () => {
	it('constructs lines and derives their geometric properties', () => {
		const line = new Line([1, 2], [3, 4])
		expect(line.start.coordinates).toEqual([1, 2])
		expect(line.secondPoint.coordinates).toEqual([4, 6])
		expect(line.normalizedDirection.magnitude).toBeCloseTo(1)
		expect(line.dimension).toBe(2)
		expect(Line.getHorizontalThrough([0, 2]).distanceFromOrigin).toBeCloseTo(2)
	})

	it('finds points, factors, projections, and distances', () => {
		const line = new Line([1, 1], [2, 1])
		expect(line.containsPoint([5, 3])).toBe(true)
		expect(line.getPointAtFactor(2).coordinates).toEqual([5, 3])
		expect(line.getFactorAtCoordinate(0, 5)).toBe(2)
		expect(line.getPointAtCoordinate(0, 5).coordinates).toEqual([5, 3])
		expect(line.getClosestPointFactor([1, 3])).toBeCloseTo(0.4)
		expect(line.getClosestPoint([1, 3]).coordinates).toEqual([1.8, 1.4])
		expect(line.getDistanceFrom([1, 3])).toBeCloseTo(Math.sqrt(3.2))
	})

	it('compares and intersects lines', () => {
		const horizontal = Line.getHorizontalThrough([0, 1])
		const vertical = Line.getVerticalThrough([2, 0])
		expect(horizontal.isOrthogonalTo(vertical)).toBe(true)
		expect(horizontal.intersects(vertical)).toBe(true)
		expect(horizontal.getIntersection(vertical)?.coordinates).toEqual([2, 1])
		expect(horizontal.equals(new Line([3, 1], [-2, 0]))).toBe(true)
		expect(horizontal.equals(new Line([3, 1], [-2, 0]), true)).toBe(false)
		expect(horizontal.getIntersection(Line.getHorizontalThrough([0, 2]))).toBeNull()
	})

	it('normalizes, reverses, and constructs lines through factories', () => {
		const line = new Line([1, 1], [2, 0])
		expect(line.normalize().equals(Line.getHorizontalThrough([0, 1]), true)).toBe(true)
		expect(line.reverse().direction.equals([-2, 0])).toBe(true)
		expect(Line.fromPoints([1, 2], [4, 6]).direction.coordinates).toEqual([3, 4])
		expect(Line.fromPointAndAngle([1, 2], Math.PI / 2).containsPoint([1, 5])).toBe(true)
		expect(Line.fromAngleAndDistance(0, 3).distanceFromOrigin).toBeCloseTo(3)
	})

	it('validates and serializes lines', () => {
		const line = new Line([1, 2], [3, 4])
		expect(isLineLike({ start: [1, 2], direction: [3, 4] })).toBe(true)
		expect(ensureLine(line, { dimension: 2 }).equals(line, true)).toBe(true)
		expect(Line.fromStorageValue(line.toStorageValue()).equals(line, true)).toBe(true)
		expect(deserializeLine(serializeLine(line)).equals(line, true)).toBe(true)
		expect(() => new Line([0, 0], [0, 0])).toThrow()
		expect(() => ensureLine(line, { dimension: 3 })).toThrow()
		expect(() => line.getFactorAtCoordinate(1, 3)).not.toThrow()
		expect(() => Line.getHorizontalThrough([0, 0]).getFactorAtCoordinate(1, 3)).toThrow()
	})
})
