import { describe, expect, it } from 'vitest'

import { createInterpolationTable, ensureInterpolationTable } from './tableCreation'

describe('interpolation table creation', () => {
	it('copies and deeply freezes the table structure', () => {
		const inputLabels = ['a']
		const inputAxes = [[0, 1]]
		const outputGrids = [[2, 4]]
		const table = createInterpolationTable({ inputLabels, inputAxes, outputLabels: ['x'], outputGrids })
		inputLabels[0] = 'changed'
		inputAxes[0][0] = 10
		outputGrids[0][0] = 20
		expect(table).toEqual({ inputLabels: ['a'], inputAxes: [[0, 1]], outputLabels: ['x'], outputGrids: [[2, 4]] })
		expect(Object.isFrozen(table)).toBe(true)
		expect(Object.isFrozen(table.inputAxes)).toBe(true)
		expect(Object.isFrozen(table.inputAxes[0])).toBe(true)
		expect(Object.isFrozen(table.outputGrids[0])).toBe(true)
	})

	it('validates unknown values through ensureInterpolationTable', () => {
		const definition: unknown = { inputLabels: ['a'], inputAxes: [[0, 1]], outputLabels: ['x'], outputGrids: [[2, 4]] }
		expect(ensureInterpolationTable(definition)).toEqual(definition)
	})

	it('rejects invalid definitions through both creation boundaries', () => {
		const invalidTable = { inputLabels: ['a'], inputAxes: [[0, 1]], outputLabels: ['x', 'x'], outputGrids: [[2, 4], [3, 5]] }
		expect(() => createInterpolationTable(invalidTable)).toThrow(/invalid table/)
		expect(() => ensureInterpolationTable(invalidTable)).toThrow(/invalid table/)
	})
})
