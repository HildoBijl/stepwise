import { describe, expect, it } from 'vitest'

import { isInterpolationAxis, isInterpolationFraction, isInterpolationGrid, isInterpolationTable, isInterpolationValue, isNumberLike } from './checks.ts'
import { createInterpolationTable } from './tableCreation.ts'

class TestNumber {
	constructor(readonly number: number, readonly comparisonValue = number) {}
	add(value: TestNumber): TestNumber { return new TestNumber(this.number + value.number) }
	subtract(value: TestNumber): TestNumber { return new TestNumber(this.number - value.number) }
	multiply(value: TestNumber | number): TestNumber { return new TestNumber(this.number * (typeof value === 'number' ? value : value.number)) }
	divide(value: TestNumber | number): TestNumber { return new TestNumber(this.number / (typeof value === 'number' ? value : value.number)) }
	compare(value: TestNumber): number { return this.comparisonValue - value.comparisonValue }
}

const table = createInterpolationTable({ inputLabels: ['a'], inputAxes: [[0, 1, 2, 3]], outputLabels: ['x'], outputGrids: [[2, 4, 6, 8]] })

describe('interpolation checks', () => {
	it('recognizes complete finite number-like objects', () => {
		expect(isNumberLike(new TestNumber(1))).toBe(true)
		expect(isNumberLike({ number: 1 })).toBe(false)
		expect(isNumberLike(new TestNumber(Infinity))).toBe(false)
	})

	it('accepts only finite interpolation values', () => {
		expect(isInterpolationValue(1)).toBe(true)
		expect(isInterpolationValue(new TestNumber(1))).toBe(true)
		expect(isInterpolationValue(NaN)).toBe(false)
		expect(isInterpolationValue(Infinity)).toBe(false)
	})

	it('recognizes fractions on the closed unit interval', () => {
		expect(isInterpolationFraction(0)).toBe(true)
		expect(isInterpolationFraction(1)).toBe(true)
		expect(isInterpolationFraction(-0.01)).toBe(false)
		expect(isInterpolationFraction(1.01)).toBe(false)
	})

	it('accepts non-empty ascending axes, including duplicate coordinates', () => {
		expect(isInterpolationAxis([1])).toBe(true)
		expect(isInterpolationAxis([1, 2, 3])).toBe(true)
		expect(isInterpolationAxis([1, 1, 2])).toBe(true)
	})

	it('rejects empty, descending, and mixed-type axes', () => {
		expect(isInterpolationAxis([])).toBe(false)
		expect(isInterpolationAxis([1, 3, 2])).toBe(false)
		expect(isInterpolationAxis([3, 2, 1])).toBe(false)
		expect(isInterpolationAxis([1, new TestNumber(2)])).toBe(false)
	})

	it('uses compare to order number-like axis values', () => {
		expect(isInterpolationAxis([new TestNumber(1, 1), new TestNumber(1, 2)])).toBe(true)
		expect(isInterpolationAxis([new TestNumber(1, 2), new TestNumber(1, 1)])).toBe(false)
	})

	it('accepts grids with undefined leaves and rejects mixed leaf types', () => {
		expect(isInterpolationGrid([[1, undefined], [2, 3]])).toBe(true)
		expect(isInterpolationGrid([1, new TestNumber(2)])).toBe(false)
	})

	it('validates multidimensional tables from the last input dimension inward', () => {
		const multiDimensionalTable = createInterpolationTable({ inputLabels: ['a', 'b'], inputAxes: [[0, 1, 2], [0, 1, 2, 3]], outputLabels: ['x'], outputGrids: [[[0, 2, 4], [3, 5, 7], [6, 8, 10], [9, 11, 13]]] })
		expect(isInterpolationTable(multiDimensionalTable)).toBe(true)
		expect(isInterpolationTable({ ...multiDimensionalTable, outputGrids: [multiDimensionalTable.outputGrids[0].slice(0, 3)] })).toBe(false)
	})

	it('rejects duplicate labels and mixed output types', () => {
		expect(isInterpolationTable({ ...table, inputLabels: ['a', 'a'], inputAxes: [[0, 1], [0, 1]], outputGrids: [[[2, 4], [6, 8]]] })).toBe(false)
		expect(isInterpolationTable({ ...table, outputLabels: ['x', 'x'], outputGrids: [[2, 4, 6, 8], [3, 5, 7, 9]] })).toBe(false)
		expect(isInterpolationTable({ ...table, outputGrids: [[2, new TestNumber(4), 6, 8]] })).toBe(false)
	})
})
