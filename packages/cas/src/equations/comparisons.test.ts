import { describe, expect, test } from 'vitest'

import { equationComparisons } from './comparisons.ts'

describe('equationComparisons', () => {
	test('distinguishes exact, ordered, and switched equality', () => {
		expect(equationComparisons.areExactlyEqual('x+2=5', 'x+2=5')).toBe(true)
		expect(equationComparisons.areExactlyEqual('x+2=5', '2+x=5')).toBe(false)
		expect(equationComparisons.areEqualExceptOrder('x+2=5', '2+x=5')).toBe(true)
		expect(equationComparisons.areEqualExceptOrder('x+2=5', '5=x+2')).toBe(false)
		expect(equationComparisons.areEqualExceptOrderOrSideSwitch('x+2=5', '5=2+x')).toBe(true)
	})

	test('compares sides and permits an optional switch', () => {
		expect(equationComparisons.haveEquivalentSides('x+1-1=2+3', 'x=5')).toBe(true)
		expect(equationComparisons.haveEquivalentSides('5=x', 'x=5')).toBe(false)
		expect(equationComparisons.haveEquivalentSidesAllowingSwitch('5=x', 'x=5')).toBe(true)
	})

	test('compares numeric equations, equivalence, and multiples', () => {
		expect(equationComparisons.haveEqualNumericValue('1/2=2', '0.5=2')).toBe(true)
		expect(equationComparisons.areEquivalent('2*x=6', '4*x=12')).toBe(true)
		expect(equationComparisons.areIntegerMultiples('4*x=12', '2*x=6')).toBe(true)
		expect(equationComparisons.areConstantMultiples('π*x=3*π', '2*x=6')).toBe(true)
	})
})
