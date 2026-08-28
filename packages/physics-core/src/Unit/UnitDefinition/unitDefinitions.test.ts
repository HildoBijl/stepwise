import { Unit } from '../Unit/index.ts'

import { type UnitDefinition } from './UnitDefinition.ts'
import { unitDefinitionList } from './unitDefinitions.ts'

describe('base-unit definitions', () => {
	test('have unique string representations', () => {
		const representations = unitDefinitionList.flatMap(unit => [unit.symbol, ...unit.aliases])
		expect(new Set(representations).size).toBe(representations.length)
	})

	test('reference known units in conversion definitions', () => {
		for (const unit of unitDefinitionList) {
			const conversionUnit = unit.toStandard?.unit ?? unit.toBase
			if (conversionUnit !== undefined) expect(() => new Unit(conversionUnit)).not.toThrow()
		}
	})

	test('do not contain cyclic conversions', () => {
		const dependencies = new Map<UnitDefinition, readonly UnitDefinition[]>(unitDefinitionList.map(unit => {
			const conversionUnit = unit.toStandard?.unit ?? unit.toBase
			return [unit, conversionUnit === undefined ? [] : new Unit(conversionUnit).factors.map(element => element.unit)]
		}))
		const visited = new Set<UnitDefinition>()
		const active = new Set<UnitDefinition>()
		const visit = (unit: UnitDefinition): void => {
			if (active.has(unit)) throw new Error(`Cyclic conversion involving "${unit.symbol}".`)
			if (visited.has(unit)) return
			active.add(unit)
			dependencies.get(unit)?.forEach(visit)
			active.delete(unit)
			visited.add(unit)
		}
		expect(() => unitDefinitionList.forEach(visit)).not.toThrow()
	})
})
import { describe, expect, test } from 'vitest'
