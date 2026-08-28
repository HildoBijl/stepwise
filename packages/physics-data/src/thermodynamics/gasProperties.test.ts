import { describe, expect, it } from 'vitest'

import { gasProperties } from './gasProperties.ts'

describe('gasProperties', () => {
	it('contains all supported gases', () => {
		expect(Object.keys(gasProperties)).toEqual(['air', 'argon', 'carbonDioxide', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen'])
	})

	it('derives heat capacities consistently', () => {
		for (const { Rs, k, cv, cp } of Object.values(gasProperties)) {
			expect(cp.subtract(cv).setUnit('J/kg*K').number).toBeCloseTo(Rs.setUnit('J/kg*K').number, 8)
			expect(cp.divide(cv).number).toBeCloseTo(k.number, 8)
		}
	})

	it('contains representative reference values', () => {
		expect(gasProperties.air.Rs.setUnit('J/kg*K').number).toBeCloseTo(287.05)
		expect(gasProperties.helium.k.number).toBeCloseTo(1.667)
		expect(gasProperties.carbonDioxide.Rs.setUnit('J/kg*K').number).toBeCloseTo(188.92)
	})
})
