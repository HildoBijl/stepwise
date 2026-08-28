import { describe, expect, it } from 'vitest'

import { Quantity } from '@step-wise/physics-core'

import { barToPascalFactor, celsiusToKelvinOffset, cubicMetersToCubicCentimetersFactor, cubicMetersToLitersFactor, kilogramsToGramsFactor } from './unitConversions.ts'

describe('unit conversions', () => {
	it('provides exact conversion factors and offsets', () => {
		for (const conversion of [barToPascalFactor, celsiusToKelvinOffset, kilogramsToGramsFactor, cubicMetersToLitersFactor, cubicMetersToCubicCentimetersFactor]) expect(conversion.value.significantDigits).toBe(Infinity)
	})

	it('converts in the documented direction', () => {
		expect(new Quantity('2 bar').multiply(barToPascalFactor).setUnit('Pa').number).toBe(200000)
		expect(new Quantity('2 kg').multiply(kilogramsToGramsFactor).setUnit('g').number).toBe(2000)
		expect(new Quantity('2 m^3').multiply(cubicMetersToLitersFactor).setUnit('l').number).toBe(2000)
		expect(new Quantity('2 m^3').multiply(cubicMetersToCubicCentimetersFactor).setUnit('cm^3').number).toBe(2000000)
		expect(celsiusToKelvinOffset.setUnit('K').number).toBe(273.15)
	})
})
