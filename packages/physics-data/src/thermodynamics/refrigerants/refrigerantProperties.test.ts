import { describe, expect, it } from 'vitest'

import { Quantity } from '@step-wise/physics-core'

import { getRefrigerantPropertiesFromPressureAndEnthalpy, getRefrigerantPropertiesFromPressureAndEntropy, getRefrigerantPropertiesFromPressureAndTemperature, getSaturatedLiquidPropertiesFromTemperature, getSaturatedMixturePropertiesFromPressure, getSaturatedVaporPropertiesFromPressure, getSaturationPressure, getSaturationTemperature } from './refrigerantProperties.ts'
import { refrigerantDatasets } from '.'

const data = refrigerantDatasets.R134A

describe('R134A saturation properties', () => {
	it('converts between saturation temperature and pressure', () => {
		const pressure = getSaturationPressure(data, new Quantity('0 dC'))
		expect(pressure?.setUnit('bar').number).toBeCloseTo(2.928)
		expect(getSaturationTemperature(data, pressure!)?.setUnit('dC').number).toBeCloseTo(0)
	})

	it('returns the liquid and vapor saturation lines', () => {
		const liquid = getSaturatedLiquidPropertiesFromTemperature(data, new Quantity('0 dC'))
		const vapor = getSaturatedVaporPropertiesFromPressure(data, new Quantity('2.928 bar'))
		expect(liquid?.phase).toBe('liquid')
		expect(liquid?.enthalpy.setUnit('kJ/kg').number).toBeCloseTo(200)
		expect(vapor?.phase).toBe('vapor')
		expect(vapor?.enthalpy.setUnit('kJ/kg').number).toBeCloseTo(398.6)
	})

	it('interpolates mixtures and validates the vapor fraction', () => {
		const mixture = getSaturatedMixturePropertiesFromPressure(data, new Quantity('2.928 bar'), new Quantity(0.5))
		expect(mixture?.phase).toBe('mixture')
		expect(mixture?.vaporFraction?.number).toBe(0.5)
		expect(mixture?.enthalpy.setUnit('kJ/kg').number).toBeCloseTo((200 + 398.6) / 2)
		expect(getSaturatedMixturePropertiesFromPressure(data, new Quantity('2.928 bar'), new Quantity(0))?.phase).toBe('liquid')
		expect(getSaturatedMixturePropertiesFromPressure(data, new Quantity('2.928 bar'), new Quantity(1))?.phase).toBe('vapor')
		expect(() => getSaturatedMixturePropertiesFromPressure(data, new Quantity('2.928 bar'), new Quantity(1.1))).toThrow('Invalid vapor fraction')
	})
})

describe('R134A single-phase properties', () => {
	it('looks up liquid and vapor states and leaves the saturation discontinuity undefined', () => {
		const liquid = getRefrigerantPropertiesFromPressureAndTemperature(data, new Quantity('0.6 bar'), new Quantity('-38 dC'))
		const vapor = getRefrigerantPropertiesFromPressureAndTemperature(data, new Quantity('0.5 bar'), new Quantity('160 dC'))
		expect(liquid?.phase).toBe('liquid')
		expect(liquid?.enthalpy.setUnit('kJ/kg').number).toBeCloseTo(150.5773, 3)
		expect(vapor?.phase).toBe('vapor')
		expect(vapor?.enthalpy.setUnit('kJ/kg').number).toBeCloseTo(553.96)
		const saturationTemperature = getSaturationTemperature(data, new Quantity('1 bar'))!
		expect(getRefrigerantPropertiesFromPressureAndTemperature(data, new Quantity('1 bar'), saturationTemperature)).toBeUndefined()
	})

	it('inverts enthalpy and entropy back to temperature', () => {
		const original = getRefrigerantPropertiesFromPressureAndTemperature(data, new Quantity('4 bar'), new Quantity('80 dC'))!
		const fromEnthalpy = getRefrigerantPropertiesFromPressureAndEnthalpy(data, original.pressure, original.enthalpy)
		const fromEntropy = getRefrigerantPropertiesFromPressureAndEntropy(data, original.pressure, original.entropy)
		expect(fromEnthalpy?.temperature.setUnit('dC').number).toBeCloseTo(80, 4)
		expect(fromEntropy?.temperature.setUnit('dC').number).toBeCloseTo(80, 4)
	})

	it('returns undefined outside the supported pressure and temperature region', () => {
		expect(getRefrigerantPropertiesFromPressureAndTemperature(data, new Quantity('0.4 bar'), new Quantity('0 dC'))).toBeUndefined()
		expect(getRefrigerantPropertiesFromPressureAndTemperature(data, new Quantity('1 bar'), new Quantity('170 dC'))).toBeUndefined()
	})
})
