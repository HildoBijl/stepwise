import { describe, expect, test } from 'vitest'

import { UnitFactor } from '../UnitFactor'

import { compareUnitFactors, defaultUnitSimplificationOptions, resolveUnitSimplificationOptions } from './simplification'

describe('unit simplification support', () => {
	test('applies defaults and accepts each target', () => {
		expect(resolveUnitSimplificationOptions()).toEqual(defaultUnitSimplificationOptions)
		for (const target of ['unchanged', 'normalizedPrefixes', 'standard', 'base'] as const) expect(resolveUnitSimplificationOptions({ target }).target).toBe(target)
	})

	test('rejects invalid targets and flags', () => {
		expect(() => resolveUnitSimplificationOptions({ target: 'invalid' as never })).toThrow(RangeError)
		expect(() => resolveUnitSimplificationOptions({ combine: 'yes' as never })).toThrow(/boolean/)
	})

	test('sorts factors by unit order, symbol, and prefix exponent', () => {
		expect(compareUnitFactors(new UnitFactor('s'), new UnitFactor('m'))).toBeGreaterThan(0)
		expect(compareUnitFactors(new UnitFactor('mm'), new UnitFactor('km'))).toBeLessThan(0)
		expect(compareUnitFactors(new UnitFactor('m'), new UnitFactor('m'))).toBe(0)
	})
})
