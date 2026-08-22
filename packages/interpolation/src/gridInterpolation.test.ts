import { describe, expect, it } from 'vitest'

import { getBracketingIndices, interpolateGrid } from './gridInterpolation'

const inputAxes = [[0, 1, 2], [0, 1, 2, 3]] as const
const outputGrid = [[0, 2, 4], [3, 5, 7], [6, 8, 10], [9, 11, 13]] as const

describe('interpolateGrid', () => {
	it('interpolates one- and multi-dimensional grids', () => {
		expect(interpolateGrid(1.5, [2, 4, 6, 8], [0, 1, 2, 3])).toBe(5)
		expect(interpolateGrid([1.5, 2.5], outputGrid, ...inputAxes)).toBe(10.5)
	})

	it('returns exact grid values without requiring defined neighbors', () => {
		expect(interpolateGrid(0, [2, undefined], [0, 1])).toBe(2)
		expect(interpolateGrid(1, [undefined, 4, undefined], [0, 1, 2])).toBe(4)
	})

	it('only traverses exact coordinates in multidimensional grids', () => {
		const sparseGrid = [[1, undefined, undefined], [2, 3, undefined], [4, 5, 6]]
		expect(interpolateGrid([1, 1], sparseGrid, [0, 1, 2], [0, 1, 2])).toBe(3)
	})

	it('supports singleton axes for exact lookups', () => {
		expect(interpolateGrid(1, [5], [1])).toBe(5)
		expect(interpolateGrid(2, [5], [1])).toBeUndefined()
	})

	it('returns undefined outside the grid', () => {
		expect(interpolateGrid(-1, [2, 4], [0, 1])).toBeUndefined()
		expect(interpolateGrid([3, 2.5], outputGrid, ...inputAxes)).toBeUndefined()
	})

	it('uses either side of duplicate coordinates and rejects the ambiguous coordinate', () => {
		expect(interpolateGrid(0.5, [0, 10, 20, 30], [0, 1, 1, 2])).toBe(5)
		expect(interpolateGrid(1.5, [0, 10, 20, 30], [0, 1, 1, 2])).toBe(25)
		expect(() => interpolateGrid(1, [0, 10, 20, 30], [0, 1, 1, 2])).toThrow(/duplicated coordinate.*ambiguous output/)
	})

	it('rejects invalid axes, dimensions, and non-finite values', () => {
		expect(() => interpolateGrid(1, [], [])).toThrow(/non-empty and ascending/)
		expect(() => interpolateGrid(1, [2, 4], [2, 1])).toThrow(/non-empty and ascending/)
		expect(() => interpolateGrid([0.5, 1], [[0, 1], [2, 3]], [0, 1], [0, 1, 2])).toThrow(/dimensions must match/)
		expect(() => interpolateGrid(Infinity, [2, 4], [0, 1])).toThrow(/finite interpolation value/)
		expect(() => interpolateGrid(0, [Infinity, 4], [0, 1])).toThrow(/finite interpolation value/)
	})
})

describe('getBracketingIndices', () => {
	it('finds intervals across the axis', () => {
		expect(getBracketingIndices(1.5, index => [0, 1, 2, 3][index], 4)).toEqual([1, 2])
		expect(getBracketingIndices(-1, index => [0, 1, 2, 3][index], 4)).toEqual([0, 1])
		expect(getBracketingIndices(5, index => [0, 1, 2, 3][index], 4)).toEqual([2, 3])
	})

	it('rejects invalid axis lengths', () => {
		expect(() => getBracketingIndices(1, index => index, 0)).toThrow(/positive safe integer/)
		expect(() => getBracketingIndices(1, index => index, 1.5)).toThrow(/positive safe integer/)
	})
})
