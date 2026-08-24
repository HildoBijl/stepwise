import { describe, expect, it } from 'vitest'

import { Vector, deserializeVector, ensureCorner, ensureVector, ensureVectorArray, isCoordinateList, isCoordinateObject, isVectorLike, serializeVector } from '..'

describe('Vector', () => {
	it('constructs vectors from lists and coordinate objects without retaining mutable input', () => {
		const coordinates = [3, 4]
		const vector = new Vector(coordinates)
		coordinates[0] = 9
		const output = vector.coordinates
		output[1] = 9
		expect(vector.coordinates).toEqual([3, 4])
		expect(new Vector({ x: 1, y: 2, z: 3 }).coordinates).toEqual([1, 2, 3])
	})

	it('provides geometric properties and tolerant comparisons', () => {
		const vector = new Vector(3, 4)
		expect(vector.dimension).toBe(2)
		expect(vector.squaredMagnitude).toBe(25)
		expect(vector.magnitude).toBe(5)
		expect(new Vector(0, 1).angle).toBeCloseTo(Math.PI / 2)
		expect(vector.hasEqualMagnitude([-3, -4])).toBe(true)
		expect(vector.hasSameDirection([6, 8])).toBe(true)
		expect(vector.hasSameDirection([-6, -8], true)).toBe(true)
		expect(vector.isOrthogonalTo([-4, 3])).toBe(true)
	})

	it('performs immutable vector operations', () => {
		const vector = new Vector(3, 4)
		expect(vector.negate().coordinates).toEqual([-3, -4])
		expect(vector.add([1, 2]).coordinates).toEqual([4, 6])
		expect(vector.subtract([1, 2]).coordinates).toEqual([2, 2])
		expect(vector.multiply(2).coordinates).toEqual([6, 8])
		expect(vector.divide(2).coordinates).toEqual([1.5, 2])
		expect(vector.interpolate([5, 8], 0.5).coordinates).toEqual([4, 6])
		expect(vector.normalize().magnitude).toBeCloseTo(1)
		expect(vector.setMagnitude(10).magnitude).toBeCloseTo(10)
		expect(new Vector(1.4, 2.6).round().coordinates).toEqual([1, 3])
		expect(vector.shorten(2).magnitude).toBeCloseTo(3)
		expect(vector.coordinates).toEqual([3, 4])
	})

	it('calculates products, projections, and distances', () => {
		expect(new Vector(1, 2).dotProduct([3, 4])).toBe(11)
		expect(new Vector(1, 0).crossProduct([0, 1])).toBe(1)
		expect((new Vector(1, 0, 0).crossProduct([0, 1, 0]) as Vector).coordinates).toEqual([0, 0, 1])
		expect(new Vector(3, 4).projectOnto([1, 0]).coordinates).toEqual([3, 0])
		expect(new Vector(3, 4).orthogonalComponent([1, 0]).coordinates).toEqual([0, 4])
		expect(new Vector(3, 4).distanceTo([0, 0])).toBe(5)
	})

	it('creates standard vectors', () => {
		expect(Vector.getZero(3).coordinates).toEqual([0, 0, 0])
		expect(Vector.getUnitVector(1, 3).coordinates).toEqual([0, 1, 0])
		expect(Vector.fromPolar(2, Math.PI / 2).equals([0, 2])).toBe(true)
	})

	it('validates vector contracts', () => {
		expect(isCoordinateList([1, 2])).toBe(true)
		expect(isCoordinateObject({ x: 1, y: 2 })).toBe(true)
		expect(isVectorLike(new Vector(1, 2))).toBe(true)
		expect(ensureVector(undefined, { dimension: 2, defaultZero: true }).equals([0, 0])).toBe(true)
		expect(ensureVectorArray([[1, 2], [3, 4]], { dimension: 2, length: 2 })).toHaveLength(2)
		expect(ensureCorner([[0, 0], [1, 0], [1, 1]], { dimension: 2 })).toHaveLength(3)
		expect(() => ensureVector([0, 0], { nonZero: true })).toThrow()
		expect(() => ensureVector([1, 2], { dimension: 3 })).toThrow()
		expect(() => new Vector(0, 0).normalize()).toThrow()
		expect(() => new Vector(1, 2).divide(0)).toThrow()
	})

	it('round-trips storage and serialized values', () => {
		const vector = new Vector(2, 3)
		expect(Vector.fromStorageValue(vector.toStorageValue()).equals(vector)).toBe(true)
		expect(deserializeVector(serializeVector(vector)).equals(vector)).toBe(true)
		expect(() => deserializeVector({ type: 'Vector', value: [1, 2], extra: true })).toThrow()
	})
})
