import { describe, expect, test } from 'vitest'

import { unitsCompatible, unitsEqual, unitsEquivalent } from './comparisonFunctions'

describe('unit comparison functions', () => {
	test('distinguishes written equality, scaled equivalence, and compatibility', () => {
		expect(unitsEqual('m * s', 's * m')).toBe(true)
		expect(unitsEqual('N', 'kg * m / s^2')).toBe(false)
		expect(unitsEquivalent('N', 'kg * m / s^2')).toBe(true)
		expect(unitsEquivalent('km', 'm')).toBe(false)
		expect(unitsCompatible('km', 'm')).toBe(true)
		expect(unitsCompatible('m', 's')).toBe(false)
	})
})
