import { describe, expect, it } from 'vitest'

import { Quantity } from '@step-wise/physics-core'

import { createExactQuantities, createQuantityGrid } from './tableSupport'

describe('createExactQuantities', () => {
	it('creates exact quantities without changing the input', () => {
		const values = [1, 2, 3] as const
		const quantities = createExactQuantities(values, 'bar')
		expect(values).toEqual([1, 2, 3])
		expect(quantities.map(quantity => quantity.setUnit('bar').number)).toEqual([1, 2, 3])
		expect(quantities.every(quantity => quantity.value.significantDigits === Infinity)).toBe(true)
	})
})

describe('createQuantityGrid', () => {
	it('recursively creates quantities while preserving precision and gaps', () => {
		const grid = createQuantityGrid([['1.20', undefined], [2, '3.400']], 'kJ/kg')
		expect(grid[0]?.[0]).toBeInstanceOf(Quantity)
		expect((grid[0]?.[0] as Quantity).value.significantDigits).toBe(3)
		expect(grid[0]?.[1]).toBeUndefined()
		expect((grid[1]?.[1] as Quantity).value.significantDigits).toBe(4)
	})
})
