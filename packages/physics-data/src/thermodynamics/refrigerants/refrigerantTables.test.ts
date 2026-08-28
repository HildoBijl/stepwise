import { describe, expect, it } from 'vitest'

import { interpolateTable } from '@step-wise/interpolation'
import { Quantity } from '@step-wise/physics-core'

import { createQuantityGrid } from '../../utils/index.ts'

import * as R134A from './R134A.ts'
import { createRefrigerantPressureTable } from './refrigerantTables.ts'

describe('createRefrigerantPressureTable', () => {
	it('creates a frozen one-dimensional pressure table', () => {
		const pressure = new Quantity('1 bar')
		const temperatures = [new Quantity('0 dC'), new Quantity('10 dC')]
		const table = createRefrigerantPressureTable(pressure, temperatures, createQuantityGrid([100, 110], 'kJ/kg'), createQuantityGrid([1, 1.1], 'kJ/kg * K'))
		expect(Object.isFrozen(table)).toBe(true)
		expect(table.pressure).toBe(pressure)
		expect(table.table.inputLabels).toEqual(['temperature'])
		expect(table.table.outputLabels).toEqual(['enthalpy', 'entropy'])
		expect(interpolateTable(new Quantity('5 dC'), table.table, 'enthalpy')?.setUnit('kJ/kg').number).toBeCloseTo(105)
	})
})

describe('R134A dataset', () => {
	it('defines its critical point and ordered pressure tables', () => {
		expect(R134A.criticalPoint.pressure.setUnit('bar').number).toBeCloseTo(40.592)
		expect(R134A.criticalPoint.temperature.setUnit('dC').number).toBeCloseTo(101.061)
		const pressures = R134A.tablesByPressure.map(table => table.pressure.setUnit('bar').number)
		expect(pressures).toEqual([...pressures].sort((a, b) => a - b))
	})

	it('contains a saturation discontinuity in every subcritical pressure table', () => {
		for (const { pressure, table } of R134A.tablesByPressure) {
			if (pressure.compare(R134A.criticalPoint.pressure) >= 0) continue
			const temperatures = table.inputAxes[0].map(value => value.setUnit('dC').number)
			expect(temperatures.some((temperature, index) => index > 0 && temperature === temperatures[index - 1])).toBe(true)
		}
	})
})
