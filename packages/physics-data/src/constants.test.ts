import { describe, expect, it } from 'vitest'

import { G, NA, R, c, e, electronMass, g, h, k, neutronMass, protonMass } from './constants.ts'

describe('physical constants', () => {
	it('provides the expected values and units', () => {
		expect(c.setUnit('m/s').number).toBe(299792458)
		expect(G.setUnit('m^3/kg*s^2').number).toBeCloseTo(6.6743015e-11)
		expect(R.setUnit('J/mol*K').number).toBeCloseTo(8.314462618)
		expect(NA.setUnit('/mol').number / 1e23).toBeCloseTo(6.02214076)
		expect(e.setUnit('C').number).toBeCloseTo(1.602176634e-19)
	})

	it('marks only complete defining values as exact', () => {
		for (const constant of [c, h, k, NA, e]) expect(constant.value.significantDigits).toBe(Infinity)
		for (const constant of [g, G, R, electronMass, protonMass, neutronMass]) expect(constant.value.significantDigits).not.toBe(Infinity)
	})
})
