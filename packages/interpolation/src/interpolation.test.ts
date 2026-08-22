import { isInterpolationAxis, isInterpolationTable, isInterpolationValue } from './checks'
import { getBracketingIndices, interpolateGrid } from './gridInterpolation'
import { interpolateRange } from './rangeInterpolation'
import { createInterpolationTable, ensureInterpolationTable } from './tableCreation'
import { interpolateTable, interpolateTableOutputs, interpolateTableInput } from './tableInterpolation'

class TestNumber {
	constructor(readonly number: number, readonly comparisonValue = number) {}
	add(value: TestNumber): TestNumber { return new TestNumber(this.number + value.number) }
	subtract(value: TestNumber): TestNumber { return new TestNumber(this.number - value.number) }
	multiply(value: TestNumber | number): TestNumber { return new TestNumber(this.number * (typeof value === 'number' ? value : value.number)) }
	divide(value: TestNumber | number): TestNumber { return new TestNumber(this.number / (typeof value === 'number' ? value : value.number)) }
	compare(value: TestNumber): number { return this.comparisonValue - value.comparisonValue }
}

const singleInputTable = createInterpolationTable({
	inputLabels: ['a'],
	inputAxes: [[0, 1, 2, 3]],
	outputLabels: ['x'],
	outputGrids: [[2, 4, 6, 8]],
})

const decreasingTable = createInterpolationTable({
	inputLabels: ['a'],
	inputAxes: [[0, 1, 2, 3]],
	outputLabels: ['x'],
	outputGrids: [[8, 6, 4, 2]],
})

const nonMonotonicTable = createInterpolationTable({
	inputLabels: ['a'],
	inputAxes: [[0, 1, 2, 3]],
	outputLabels: ['x'],
	outputGrids: [[0, 2, 1, 3]],
})

const tableWithUndefined = createInterpolationTable({
	inputLabels: ['a'],
	inputAxes: [[0, 1, 2, 3]],
	outputLabels: ['x'],
	outputGrids: [[0, undefined, 4, 6]],
})

const multiDimensionalTable = createInterpolationTable({
	inputLabels: ['a', 'b'],
	inputAxes: [[0, 1, 2], [0, 1, 2, 3]],
	outputLabels: ['x', 'y', 'z'],
	outputGrids: [
		[[0, 2, 4], [3, 5, 7], [6, 8, 10], [9, 11, 13]],
		[[0, 3, 6], [-2, 1, 4], [-4, -1, 2], [-6, -3, 0]],
		[[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3]],
	],
})

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

	describe('interpolateRange', () => {
		test('rejects an input range with equal endpoints', () => {
			expect(() => interpolateRange(1, [2, 4], [1, 1])).toThrow(/endpoints must differ/)
		})
		test('interpolates within a single range', () => {
			expect(interpolateRange(0.5, [2, 4], [0, 1])).toBe(3)
		})
	})

	describe('isInterpolationAxis', () => {
		test('accepts non-empty ascending series, including duplicate coordinates', () => {
			expect(isInterpolationAxis([1])).toBe(true)
			expect(isInterpolationAxis([1, 2, 3])).toBe(true)
			expect(isInterpolationAxis([1, 1, 2])).toBe(true)
		})

		test('rejects empty and descending series', () => {
			expect(isInterpolationAxis([])).toBe(false)
			expect(isInterpolationAxis([1, 3, 2])).toBe(false)
			expect(isInterpolationAxis([3, 2, 1])).toBe(false)
			expect(isInterpolationAxis([1, new TestNumber(2)])).toBe(false)
		})
		test('uses compare rather than the numeric representation to order number-like values', () => {
			expect(isInterpolationAxis([new TestNumber(1, 1), new TestNumber(1, 2)])).toBe(true)
			expect(isInterpolationAxis([new TestNumber(1, 2), new TestNumber(1, 1)])).toBe(false)
		})
	})

	describe('isInterpolationTable', () => {
		test('validates multidimensional grids from the last input dimension inward', () => {
			expect(isInterpolationTable(multiDimensionalTable)).toBe(true)
			expect(isInterpolationTable({ ...multiDimensionalTable, outputGrids: [multiDimensionalTable.outputGrids[0].slice(0, 3)] })).toBe(false)
		})
		test('rejects duplicate input and output labels', () => {
			expect(isInterpolationTable({ ...singleInputTable, inputLabels: ['a', 'a'], inputAxes: [[0, 1], [0, 1]], outputGrids: [[[2, 4], [6, 8]]] })).toBe(false)
			expect(isInterpolationTable({ ...singleInputTable, outputLabels: ['x', 'x'], outputGrids: [[2, 4, 6, 8], [3, 5, 7, 9]] })).toBe(false)
		})
		test('rejects grids that mix numbers and number-like objects', () => {
			expect(isInterpolationTable({ ...singleInputTable, outputGrids: [[2, new TestNumber(4), 6, 8]] })).toBe(false)
		})
	})

	describe('table creation', () => {
		test('rejects invalid definitions through both creation boundaries', () => {
			const invalidTable = { ...singleInputTable, outputLabels: ['x', 'x'], outputGrids: [[2, 4, 6, 8], [3, 5, 7, 9]] }
			expect(() => createInterpolationTable(invalidTable)).toThrow(/invalid table/)
			expect(() => ensureInterpolationTable(invalidTable)).toThrow(/invalid table/)
		})
		test('copies and freezes the table structure', () => {
			const inputLabels = ['a']
			const table = createInterpolationTable({ inputLabels, inputAxes: [[0, 1]], outputLabels: ['x'], outputGrids: [[2, 4]] })
			inputLabels[0] = 'changed'
			expect(table.inputLabels).toEqual(['a'])
			expect(Object.isFrozen(table)).toBe(true)
			expect(Object.isFrozen(table.outputGrids[0])).toBe(true)
		})
	})

	describe('interpolateTable', () => {
		test('interpolates a single-input table with direct value input', () => {
			expect(interpolateTable(1.5, singleInputTable)).toBe(5)
			expect(interpolateTable([1.5], singleInputTable)).toBe(5)
			expect(interpolateTable({ a: 1.5 }, singleInputTable)).toBe(5)
			expect(interpolateTable(0.5, decreasingTable)).toBe(7)
			expect(interpolateTable(2.5, decreasingTable)).toBe(3)
			expect(interpolateTable(0.5, nonMonotonicTable)).toBe(1)
			expect(interpolateTable(2.5, nonMonotonicTable)).toBe(2)
		})
		test('returns undefined when interpolation touches an undefined grid value', () => {
			expect(interpolateTable(0.5, tableWithUndefined)).toBeUndefined()
			expect(interpolateTable(1.5, tableWithUndefined)).toBeUndefined()
			expect(interpolateTable(2.5, tableWithUndefined)).toBe(5)
		})
		test('returns undefined when interpolating outside the grid', () => {
			expect(interpolateTable([3, 2.5], multiDimensionalTable, 'x')).toBeUndefined()
			expect(interpolateTable([-1, 2.5], multiDimensionalTable, 'x')).toBeUndefined()
		})
		test('interpolates a single output from a table using array input', () => {
			expect(interpolateTable([1.5, 2.5], multiDimensionalTable, 'x')).toBe(10.5)
			expect(interpolateTable([1.5, 2.5], multiDimensionalTable, 'y')).toBe(-0.5)
			expect(interpolateTable([1.5, 2.5], multiDimensionalTable, 'z')).toBe(2.5)
		})
		test('interpolates a single output from a table using object input', () => {
			expect(interpolateTable({ a: 1.5, b: 2.5 }, multiDimensionalTable, 'x')).toBe(10.5)
			expect(interpolateTable({ a: 1.5, b: 2.5 }, multiDimensionalTable, 'y')).toBe(-0.5)
			expect(interpolateTable({ a: 1.5, b: 2.5 }, multiDimensionalTable, 'z')).toBe(2.5)
		})
		test('throws when a single-output lookup is ambiguous', () => {
			expect(() => interpolateTable([1.5, 2.5], multiDimensionalTable)).toThrow()
		})
		test('throws when single-value input is used for a multi-input table', () => {
			expect(() => interpolateTable(1.5, multiDimensionalTable, 'x')).toThrow()
		})
		test('rejects inherited object inputs', () => {
			const table = createInterpolationTable({ ...singleInputTable, inputLabels: ['toString'] })
			expect(() => interpolateTable({}, table)).toThrow(/missing input value/)
		})
	})

	describe('interpolateTableOutputs', () => {
		test('interpolates multiple outputs from a table', () => {
			expect(interpolateTableOutputs([1.5, 2.5], multiDimensionalTable)).toEqual({ x: 10.5, y: -0.5, z: 2.5 })
		})
		test('interpolates selected outputs from a table', () => {
			expect(interpolateTableOutputs({ a: 1.5, b: 2.5 }, multiDimensionalTable, ['z', 'x'])).toEqual({ z: 2.5, x: 10.5 })
		})
		test('rejects duplicate requested output labels', () => {
			expect(() => interpolateTableOutputs(1.5, singleInputTable, ['x', 'x'])).toThrow(/duplicate output labels/)
		})
	})

	describe('inverse table interpolation', () => {
		test('inverts a single-output one-dimensional table', () => {
			expect(interpolateTableInput(5, singleInputTable)).toBe(1.5)
			expect(interpolateTableInput(2, singleInputTable)).toBe(0)
			expect(interpolateTableInput(8, singleInputTable)).toBe(3)
		})
		test('returns undefined outside the inverse range', () => {
			expect(interpolateTableInput(1, singleInputTable)).toBeUndefined()
			expect(interpolateTableInput(9, singleInputTable)).toBeUndefined()
		})
		test('throws on multi-dimensional tables', () => {
			expect(() => interpolateTableInput(5, multiDimensionalTable, 'x')).toThrow()
		})
		test('throws when the selected output contains undefined values', () => {
			expect(() => interpolateTableInput(3, tableWithUndefined)).toThrow()
		})
		test('throws when the selected output is not strictly monotonic', () => {
			expect(() => interpolateTableInput(1.5, nonMonotonicTable)).toThrow()
		})
		test('works for strictly decreasing output series', () => {
			expect(interpolateTableInput(5, decreasingTable)).toBe(1.5)
		})
	})

	describe('interpolateGrid', () => {
		test('interpolates directly on grids', () => {
			expect(interpolateGrid(1.5, [2, 4, 6, 8], [0, 1, 2, 3])).toBe(5)
			expect(interpolateGrid([1.5, 2.5], multiDimensionalTable.outputGrids[0], ...multiDimensionalTable.inputAxes)).toBe(10.5)
		})
		test('returns an exact grid value without requiring defined neighboring values', () => {
			expect(interpolateGrid(0, [2, undefined], [0, 1])).toBe(2)
			expect(interpolateGrid(1, [undefined, 4], [0, 1])).toBe(4)
			expect(interpolateGrid(1, [undefined, 4, undefined], [0, 1, 2])).toBe(4)
		})
		test('only traverses exact coordinates in multidimensional grids', () => {
			const sparseGrid = [
				[1, undefined, undefined],
				[2, 3, undefined],
				[4, 5, 6],
			]
			expect(interpolateGrid([1, 1], sparseGrid, [0, 1, 2], [0, 1, 2])).toBe(3)
		})
		test('allows singleton series for exact-coordinate lookup', () => {
			expect(interpolateGrid(1, [5], [1])).toBe(5)
			expect(interpolateGrid(2, [5], [1])).toBeUndefined()
		})
		test('rejects invalid input axes', () => {
			expect(() => interpolateGrid(1, [], [])).toThrow(/non-empty and ascending/)
			expect(() => interpolateGrid(1, [2, 4], [2, 1])).toThrow(/non-empty and ascending/)
		})
		test('interpolates on either side of duplicate coordinates and rejects the ambiguous coordinate itself', () => {
			expect(interpolateGrid(0.5, [0, 10, 20, 30], [0, 1, 1, 2])).toBe(5)
			expect(interpolateGrid(1.5, [0, 10, 20, 30], [0, 1, 1, 2])).toBe(25)
			expect(() => interpolateGrid(1, [0, 10, 20, 30], [0, 1, 1, 2])).toThrow(/duplicated coordinate.*ambiguous output/)
		})
		test('rejects output grids whose dimensions do not match the input axes', () => {
			expect(() => interpolateGrid([0.5, 1], [[0, 1], [2, 3]], [0, 1], [0, 1, 2])).toThrow(/dimensions must match/)
			expect(() => interpolateGrid(0.5, [0, 1, 2], [0, 1])).toThrow(/dimensions must match/)
		})
		test('rejects non-finite inputs and outputs', () => {
			expect(() => interpolateGrid(Infinity, [2, 4], [0, 1])).toThrow(/finite interpolation value/)
			expect(() => interpolateGrid(0, [Infinity, 4], [0, 1])).toThrow(/finite interpolation value/)
		})
	})

	describe('getBracketingIndices', () => {
		test('rejects invalid series lengths', () => {
			expect(() => getBracketingIndices(1, index => index, 0)).toThrow(/positive safe integer/)
			expect(() => getBracketingIndices(1, index => index, 1.5)).toThrow(/positive safe integer/)
		})
	})
})
