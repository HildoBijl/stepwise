import { isInterpolationInputSeries, isInterpolationTable, isInterpolationValue } from './checks'
import { gridInterpolate } from './gridInterpolation'
import { rangeInterpolate } from './rangeInterpolation'
import { tableInterpolate, multiOutputTableInterpolate, inverseTableInterpolate } from './tableInterpolation'

class TestNumber {
	constructor(readonly number: number) {}
	add(value: TestNumber): TestNumber { return new TestNumber(this.number + value.number) }
	subtract(value: TestNumber): TestNumber { return new TestNumber(this.number - value.number) }
	multiply(value: TestNumber | number): TestNumber { return new TestNumber(this.number * (typeof value === 'number' ? value : value.number)) }
	divide(value: TestNumber | number): TestNumber { return new TestNumber(this.number / (typeof value === 'number' ? value : value.number)) }
	compare(value: TestNumber): number { return this.number - value.number }
}

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
	describe('isInterpolationValue', () => {
		test('accepts only finite numeric representations', () => {
			expect(isInterpolationValue(1)).toBe(true)
			expect(isInterpolationValue(new TestNumber(1))).toBe(true)
			expect(isInterpolationValue(NaN)).toBe(false)
			expect(isInterpolationValue(Infinity)).toBe(false)
			expect(isInterpolationValue(new TestNumber(Infinity))).toBe(false)
		})
	})

	describe('rangeInterpolate', () => {
		test('rejects an input range with equal endpoints', () => {
			expect(() => rangeInterpolate(1, [2, 4], [1, 1])).toThrow(/endpoints must differ/)
		})
		test('reports missing and excess input ranges', () => {
			expect(() => rangeInterpolate([0.5, 0.5], [[0, 1], [2, 3]], [0, 1])).toThrow(/Expected 2 input ranges, but received 1/)
			expect(() => rangeInterpolate([0.5], [0, 1], [0, 1], [0, 1])).toThrow(/Expected 1 input range, but received 2/)
			expect(() => rangeInterpolate([0.5, 0.5], [[0, 1], [2, 3]], [0, 1], [0, 1], [0, 1])).toThrow(/Expected 2 input ranges, but received 3/)
		})
	})

	describe('isInterpolationInputSeries', () => {
		test('accepts non-empty ascending series, including duplicate coordinates', () => {
			expect(isInterpolationInputSeries([1])).toBe(true)
			expect(isInterpolationInputSeries([1, 2, 3])).toBe(true)
			expect(isInterpolationInputSeries([1, 1, 2])).toBe(true)
		})

		test('rejects empty and descending series', () => {
			expect(isInterpolationInputSeries([])).toBe(false)
			expect(isInterpolationInputSeries([1, 3, 2])).toBe(false)
			expect(isInterpolationInputSeries([3, 2, 1])).toBe(false)
			expect(isInterpolationInputSeries([1, new TestNumber(2)])).toBe(false)
		})
	})

	describe('isInterpolationTable', () => {
		test('validates multidimensional grids from the last input dimension inward', () => {
			expect(isInterpolationTable(multiDimensionalTable)).toBe(true)
			expect(isInterpolationTable({ ...multiDimensionalTable, grids: [multiDimensionalTable.grids[0].slice(0, 3)] })).toBe(false)
		})
		test('rejects duplicate input and output labels', () => {
			expect(isInterpolationTable({ ...singleInputTable, inputLabels: ['a', 'a'], inputValues: [[0, 1], [0, 1]], grids: [[[2, 4], [6, 8]]] })).toBe(false)
			expect(isInterpolationTable({ ...singleInputTable, outputLabels: ['x', 'x'], grids: [[2, 4, 6, 8], [3, 5, 7, 9]] })).toBe(false)
		})
		test('rejects grids that mix numbers and number-like objects', () => {
			expect(isInterpolationTable({ ...singleInputTable, grids: [[2, new TestNumber(4), 6, 8]] })).toBe(false)
		})
	})

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
		test('rejects duplicate labels and inherited object inputs', () => {
			expect(() => tableInterpolate([0.5, 0.5], { ...singleInputTable, inputLabels: ['a', 'a'], inputValues: [[0, 1], [0, 1]], grids: [[[2, 4], [6, 8]]] })).toThrow(/duplicate input labels/)
			expect(() => tableInterpolate(0.5, { ...singleInputTable, outputLabels: ['x', 'x'], grids: [[2, 4, 6, 8], [3, 5, 7, 9]] }, 'x')).toThrow(/duplicate output label/)
			expect(() => tableInterpolate({}, { ...singleInputTable, inputLabels: ['toString'] })).toThrow(/missing input value/)
		})
	})

	describe('multiOutputTableInterpolate', () => {
		test('interpolates multiple outputs from a table', () => {
			expect(multiOutputTableInterpolate([1.5, 2.5], multiDimensionalTable)).toEqual({ x: 10.5, y: -0.5, z: 2.5 })
		})
		test('interpolates selected outputs from a table', () => {
			expect(multiOutputTableInterpolate({ a: 1.5, b: 2.5 }, multiDimensionalTable, ['z', 'x'])).toEqual({ z: 2.5, x: 10.5 })
		})
		test('rejects duplicate requested output labels', () => {
			expect(() => multiOutputTableInterpolate(1.5, singleInputTable, ['x', 'x'])).toThrow(/duplicate output labels/)
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
		test('returns an exact grid value without requiring defined neighboring values', () => {
			expect(gridInterpolate(0, [2, undefined], [0, 1])).toBe(2)
			expect(gridInterpolate(1, [undefined, 4], [0, 1])).toBe(4)
			expect(gridInterpolate(1, [undefined, 4, undefined], [0, 1, 2])).toBe(4)
		})
		test('only traverses exact coordinates in multidimensional grids', () => {
			const sparseGrid = [
				[1, undefined, undefined],
				[2, 3, undefined],
				[4, 5, 6],
			]
			expect(gridInterpolate([1, 1], sparseGrid, [0, 1, 2], [0, 1, 2])).toBe(3)
		})
		test('allows singleton series for exact-coordinate lookup', () => {
			expect(gridInterpolate(1, [5], [1])).toBe(5)
			expect(gridInterpolate(2, [5], [1])).toBeUndefined()
		})
		test('rejects invalid input series', () => {
			expect(() => gridInterpolate(1, [], [])).toThrow(/non-empty and ascending/)
			expect(() => gridInterpolate(1, [2, 4], [2, 1])).toThrow(/non-empty and ascending/)
		})
		test('interpolates on either side of duplicate coordinates and rejects the ambiguous coordinate itself', () => {
			expect(gridInterpolate(0.5, [0, 10, 20, 30], [0, 1, 1, 2])).toBe(5)
			expect(gridInterpolate(1.5, [0, 10, 20, 30], [0, 1, 1, 2])).toBe(25)
			expect(() => gridInterpolate(1, [0, 10, 20, 30], [0, 1, 1, 2])).toThrow(/duplicated coordinate.*ambiguous output/)
		})
		test('rejects output grids whose dimensions do not match the input series', () => {
			expect(() => gridInterpolate([0.5, 1], [[0, 1], [2, 3]], [0, 1], [0, 1, 2])).toThrow(/dimensions must match/)
			expect(() => gridInterpolate(0.5, [0, 1, 2], [0, 1])).toThrow(/dimensions must match/)
		})
		test('rejects non-finite inputs and outputs', () => {
			expect(() => gridInterpolate(Infinity, [2, 4], [0, 1])).toThrow(/finite interpolation value/)
			expect(() => gridInterpolate(0, [Infinity, 4], [0, 1])).toThrow(/finite interpolation value/)
		})
	})
})
