import { gridInterpolate } from './gridInterpolation'
import { tableInterpolate, multiOutputTableInterpolate } from './tableInterpolation'

const singleInputTable = {
	inputLabels: ['a'],
	inputValues: [[0, 1, 2, 3]],
	outputLabels: ['x'],
	grids: [[2, 4, 6, 8]],
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
		})
		test('returns undefined when interpolating outside the grid', () => {
			expect(tableInterpolate([3, 2.5], multiDimensionalTable, 'x')).toBeUndefined()
			expect(tableInterpolate([-1, 2.5], multiDimensionalTable, 'x')).toBeUndefined()
		})
		test('returns undefined when interpolation touches an undefined grid value', () => {
			expect(tableInterpolate(0.5, tableWithUndefined)).toBeUndefined()
			expect(tableInterpolate(1.5, tableWithUndefined)).toBeUndefined()
			expect(tableInterpolate(2.5, tableWithUndefined)).toBe(5)
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

	describe('gridInterpolate', () => {
		test('interpolates directly on grids', () => {
			expect(gridInterpolate([1.5, 2.5], multiDimensionalTable.grids[0], ...multiDimensionalTable.inputValues)).toBe(10.5)
			expect(gridInterpolate(1.5, [2, 4, 6, 8], [0, 1, 2, 3])).toBe(5)
		})
	})
})
