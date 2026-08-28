import { describe, expect, it } from 'vitest'

import { createInterpolationTable } from './tableCreation.ts'
import { interpolateTable, interpolateTableInput, interpolateTableOutputs } from './tableInterpolation.ts'

const singleInputTable = createInterpolationTable({ inputLabels: ['a'], inputAxes: [[0, 1, 2, 3]], outputLabels: ['x'], outputGrids: [[2, 4, 6, 8]] })
const decreasingTable = createInterpolationTable({ inputLabels: ['a'], inputAxes: [[0, 1, 2, 3]], outputLabels: ['x'], outputGrids: [[8, 6, 4, 2]] })
const nonMonotonicTable = createInterpolationTable({ inputLabels: ['a'], inputAxes: [[0, 1, 2, 3]], outputLabels: ['x'], outputGrids: [[0, 2, 1, 3]] })
const tableWithUndefined = createInterpolationTable({ inputLabels: ['a'], inputAxes: [[0, 1, 2, 3]], outputLabels: ['x'], outputGrids: [[0, undefined, 4, 6]] })
const multiDimensionalTable = createInterpolationTable({
	inputLabels: ['a', 'b'],
	inputAxes: [[0, 1, 2], [0, 1, 2, 3]],
	outputLabels: ['x', 'y', 'z'],
	outputGrids: [[[0, 2, 4], [3, 5, 7], [6, 8, 10], [9, 11, 13]], [[0, 3, 6], [-2, 1, 4], [-4, -1, 2], [-6, -3, 0]], [[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3]]],
})

describe('interpolateTable', () => {
	it('accepts scalar, array, and labeled-object input', () => {
		expect(interpolateTable(1.5, singleInputTable)).toBe(5)
		expect(interpolateTable([1.5], singleInputTable)).toBe(5)
		expect(interpolateTable({ a: 1.5 }, singleInputTable)).toBe(5)
		expect(interpolateTable([1.5, 2.5], multiDimensionalTable, 'x')).toBe(10.5)
		expect(interpolateTable({ a: 1.5, b: 2.5 }, multiDimensionalTable, 'y')).toBe(-0.5)
	})

	it('handles decreasing, non-monotonic, undefined, and out-of-range data', () => {
		expect(interpolateTable(0.5, decreasingTable)).toBe(7)
		expect(interpolateTable(2.5, nonMonotonicTable)).toBe(2)
		expect(interpolateTable(0.5, tableWithUndefined)).toBeUndefined()
		expect(interpolateTable(2.5, tableWithUndefined)).toBe(5)
		expect(interpolateTable([3, 2.5], multiDimensionalTable, 'x')).toBeUndefined()
	})

	it('requires unambiguous outputs and compatible input shapes', () => {
		expect(() => interpolateTable([1.5, 2.5], multiDimensionalTable)).toThrow(/output label is required/)
		expect(() => interpolateTable(1.5, multiDimensionalTable, 'x')).toThrow(/single-input tables/)
		expect(() => interpolateTable([1.5], multiDimensionalTable, 'x')).toThrow(/expected 2 input values/)
		expect(() => interpolateTable(1.5, singleInputTable, 'unknown')).toThrow(/unknown output label/)
	})

	it('requires object inputs to contain own properties', () => {
		const table = createInterpolationTable({ ...singleInputTable, inputLabels: ['toString'] })
		expect(() => interpolateTable({}, table)).toThrow(/missing input value/)
	})
})

describe('interpolateTableOutputs', () => {
	it('interpolates all or selected outputs', () => {
		expect(interpolateTableOutputs([1.5, 2.5], multiDimensionalTable)).toEqual({ x: 10.5, y: -0.5, z: 2.5 })
		expect(interpolateTableOutputs({ a: 1.5, b: 2.5 }, multiDimensionalTable, ['z', 'x'])).toEqual({ z: 2.5, x: 10.5 })
	})

	it('rejects duplicate and unknown requested output labels', () => {
		expect(() => interpolateTableOutputs(1.5, singleInputTable, ['x', 'x'])).toThrow(/duplicate output labels/)
		expect(() => interpolateTableOutputs(1.5, singleInputTable, ['unknown'])).toThrow(/unknown output label/)
	})
})

describe('interpolateTableInput', () => {
	it('inverts strictly increasing and decreasing one-dimensional tables', () => {
		expect(interpolateTableInput(5, singleInputTable)).toBe(1.5)
		expect(interpolateTableInput(2, singleInputTable)).toBe(0)
		expect(interpolateTableInput(8, singleInputTable)).toBe(3)
		expect(interpolateTableInput(5, decreasingTable)).toBe(1.5)
	})

	it('returns undefined outside the inverse range', () => {
		expect(interpolateTableInput(1, singleInputTable)).toBeUndefined()
		expect(interpolateTableInput(9, singleInputTable)).toBeUndefined()
	})

	it('rejects unsuitable inverse tables', () => {
		expect(() => interpolateTableInput(5, multiDimensionalTable, 'x')).toThrow(/exactly one input/)
		expect(() => interpolateTableInput(3, tableWithUndefined)).toThrow(/undefined values/)
		expect(() => interpolateTableInput(1.5, nonMonotonicTable)).toThrow(/direction changes/)
	})
})
