import { gridInterpolate } from './gridInterpolation'
import { tableInterpolate, multiOutputTableInterpolate, inverseTableInterpolate } from './tableInterpolation'

const singleInputTable = {
	inputLabels: ['a'],
	inputValues: [[0, 1, 2, 3]],
	outputLabels: ['x'],
	grids: [[2, 4, 6, 8]],
}

const decreasingTable = {
	inputLabels: ['a'],
	inputValues: [[0, 1, 2, 3]],
	outputLabels: ['x'],
	grids: [[8, 6, 4, 2]],
}

const nonMonotonicTable = {
	inputLabels: ['a'],
	inputValues: [[0, 1, 2, 3]],
	outputLabels: ['x'],
	grids: [[0, 2, 1, 3]],
}

const tableWithUndefined = {
	inputLabels: ['a'],
	inputValues: [[0, 1, 2, 3]],
	outputLabels: ['x'],
	grids: [[0, undefined, 4, 6]],
}

const multiDimensionalTable = {
	inputLabels: ['a', 'b'],
	inputValues: [[0, 1, 2], [0, 1, 2, 3]],
	outputLabels: ['x', 'y', 'z'],
	grids: [
		[[0, 2, 4], [3, 5, 7], [6, 8, 10], [9, 11, 13]],
		[[0, 3, 6], [-2, 1, 4], [-4, -1, 2], [-6, -3, 0]],
		[[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3]],
	],
}

describe('interpolation', () => {
	describe('tableInterpolate', () => {
		test('interpolates a single-input table with direct value input', () => {
			expect(tableInterpolate(1.5, singleInputTable)).toBe(5)
			expect(tableInterpolate([1.5], singleInputTable)).toBe(5)
			expect(tableInterpolate({ a: 1.5 }, singleInputTable)).toBe(5)
			expect(tableInterpolate(0.5, decreasingTable)).toBe(7)
			expect(tableInterpolate(2.5, decreasingTable)).toBe(3)
			expect(tableInterpolate(0.5, nonMonotonicTable)).toBe(1)
			expect(tableInterpolate(2.5, nonMonotonicTable)).toBe(2)
		})
		test('returns undefined when interpolation touches an undefined grid value', () => {
			expect(tableInterpolate(0.5, tableWithUndefined)).toBeUndefined()
			expect(tableInterpolate(1.5, tableWithUndefined)).toBeUndefined()
			expect(tableInterpolate(2.5, tableWithUndefined)).toBe(5)
		})
		test('returns undefined when interpolating outside the grid', () => {
			expect(tableInterpolate([3, 2.5], multiDimensionalTable, 'x')).toBeUndefined()
			expect(tableInterpolate([-1, 2.5], multiDimensionalTable, 'x')).toBeUndefined()
		})
		test('interpolates a single output from a table using array input', () => {
			expect(tableInterpolate([1.5, 2.5], multiDimensionalTable, 'x')).toBe(10.5)
			expect(tableInterpolate([1.5, 2.5], multiDimensionalTable, 'y')).toBe(-0.5)
			expect(tableInterpolate([1.5, 2.5], multiDimensionalTable, 'z')).toBe(2.5)
		})
		test('interpolates a single output from a table using object input', () => {
			expect(tableInterpolate({ a: 1.5, b: 2.5 }, multiDimensionalTable, 'x')).toBe(10.5)
			expect(tableInterpolate({ a: 1.5, b: 2.5 }, multiDimensionalTable, 'y')).toBe(-0.5)
			expect(tableInterpolate({ a: 1.5, b: 2.5 }, multiDimensionalTable, 'z')).toBe(2.5)
		})
		test('throws when a single-output lookup is ambiguous', () => {
			expect(() => tableInterpolate([1.5, 2.5], multiDimensionalTable)).toThrow()
		})
		test('throws when single-value input is used for a multi-input table', () => {
			expect(() => tableInterpolate(1.5, multiDimensionalTable, 'x')).toThrow()
		})
	})

	describe('multiOutputTableInterpolate', () => {
		test('interpolates multiple outputs from a table', () => {
			expect(multiOutputTableInterpolate([1.5, 2.5], multiDimensionalTable)).toEqual({ x: 10.5, y: -0.5, z: 2.5 })
		})
		test('interpolates selected outputs from a table', () => {
			expect(multiOutputTableInterpolate({ a: 1.5, b: 2.5 }, multiDimensionalTable, ['z', 'x'])).toEqual({ z: 2.5, x: 10.5 })
		})
	})

	describe('inverse table interpolation', () => {
		test('inverts a single-output one-dimensional table', () => {
			expect(inverseTableInterpolate(5, singleInputTable)).toBe(1.5)
			expect(inverseTableInterpolate(2, singleInputTable)).toBe(0)
			expect(inverseTableInterpolate(8, singleInputTable)).toBe(3)
		})
		test('returns undefined outside the inverse range', () => {
			expect(inverseTableInterpolate(1, singleInputTable)).toBeUndefined()
			expect(inverseTableInterpolate(9, singleInputTable)).toBeUndefined()
		})
		test('throws on multi-dimensional tables', () => {
			expect(() => inverseTableInterpolate(5, multiDimensionalTable, 'x')).toThrow()
		})
		test('throws when the selected output contains undefined values', () => {
			expect(() => inverseTableInterpolate(3, tableWithUndefined)).toThrow()
		})
		test('throws when the selected output is not strictly monotonic', () => {
			expect(() => inverseTableInterpolate(1.5, nonMonotonicTable)).toThrow()
		})
		test('works for strictly decreasing output series', () => {
			expect(inverseTableInterpolate(5, decreasingTable)).toBe(1.5)
		})
	})

	describe('gridInterpolate', () => {
		test('interpolates directly on grids', () => {
			expect(gridInterpolate(1.5, [2, 4, 6, 8], [0, 1, 2, 3])).toBe(5)
			expect(gridInterpolate([1.5, 2.5], multiDimensionalTable.grids[0], ...multiDimensionalTable.inputValues)).toBe(10.5)
		})
	})
})
