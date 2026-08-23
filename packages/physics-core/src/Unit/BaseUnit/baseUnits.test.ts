import { Unit } from '../Unit'

import { type BaseUnit } from './BaseUnit'
import { baseUnitList } from './baseUnits'

describe('base-unit definitions', () => {
	test('have unique string representations', () => {
		const representations = baseUnitList.flatMap(unit => [unit.letter, ...unit.alternatives])
		expect(new Set(representations).size).toBe(representations.length)
	})

	test('reference known units in conversion definitions', () => {
		for (const unit of baseUnitList) {
			const conversionUnit = unit.toStandard?.unit ?? unit.toBase
			if (conversionUnit !== undefined) expect(() => new Unit(conversionUnit)).not.toThrow()
		}
	})

	test('do not contain cyclic conversions', () => {
		const dependencies = new Map<BaseUnit, readonly BaseUnit[]>(baseUnitList.map(unit => {
			const conversionUnit = unit.toStandard?.unit ?? unit.toBase
			return [unit, conversionUnit === undefined ? [] : new Unit(conversionUnit).allElements.map(element => element.unit)]
		}))
		const visited = new Set<BaseUnit>()
		const active = new Set<BaseUnit>()
		const visit = (unit: BaseUnit): void => {
			if (active.has(unit)) throw new Error(`Cyclic conversion involving "${unit.letter}".`)
			if (visited.has(unit)) return
			active.add(unit)
			dependencies.get(unit)?.forEach(visit)
			active.delete(unit)
			visited.add(unit)
		}
		expect(() => baseUnitList.forEach(visit)).not.toThrow()
	})
})
