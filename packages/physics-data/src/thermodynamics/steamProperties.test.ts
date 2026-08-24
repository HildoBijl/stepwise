import { describe, expect, it } from 'vitest'

import { interpolateTable, interpolateTableOutputs } from '@step-wise/interpolation'
import { Quantity } from '@step-wise/physics-core'

import { saturatedSteamPropertiesByPressure, saturatedSteamPropertiesByTemperature, superheatedSteamProperties } from './steamProperties'

describe('saturated steam properties', () => {
	it('returns tabulated properties by temperature and pressure', () => {
		expect(interpolateTable(new Quantity('100 dC'), saturatedSteamPropertiesByTemperature, 'boilingPressure')?.setUnit('bar').number).toBeCloseTo(1.013)
		expect(interpolateTable(new Quantity('1 bar'), saturatedSteamPropertiesByPressure, 'boilingTemperature')?.setUnit('dC').number).toBeCloseTo(99.6)
	})

	it('interpolates between saturation entries', () => {
		expect(interpolateTable(new Quantity('105 dC'), saturatedSteamPropertiesByTemperature, 'enthalpyLiquid')?.setUnit('kJ/kg').number).toBeCloseTo((418.9 + 461.1) / 2)
	})

	it('returns undefined outside the tables', () => {
		expect(interpolateTable(new Quantity('-1 dC'), saturatedSteamPropertiesByTemperature, 'boilingPressure')).toBeUndefined()
		expect(interpolateTable(new Quantity('211 bar'), saturatedSteamPropertiesByPressure, 'boilingTemperature')).toBeUndefined()
	})
})

describe('superheatedSteamProperties', () => {
	it('returns exact and interpolated two-dimensional table values', () => {
		const exact = interpolateTableOutputs({ pressure: new Quantity('14 bar'), temperature: new Quantity('220 dC') }, superheatedSteamProperties)
		expect(exact.enthalpy?.setUnit('kJ/kg').number).toBeCloseTo(2858.2)
		expect(exact.entropy?.setUnit('kJ/kg * K').number).toBeCloseTo(6.6106)

		const interpolated = interpolateTableOutputs({ pressure: new Quantity('15 bar'), temperature: new Quantity('230 dC') }, superheatedSteamProperties)
		expect(interpolated.enthalpy?.setUnit('kJ/kg').number).toBeCloseTo((2858.2 + 2847.8 + 2905.9 + 2897.7) / 4)
	})

	it('preserves unavailable cells and rejects out-of-range inputs', () => {
		expect(interpolateTableOutputs({ pressure: new Quantity('200 bar'), temperature: new Quantity('220 dC') }, superheatedSteamProperties).enthalpy).toBeUndefined()
		expect(interpolateTableOutputs({ pressure: new Quantity('13 bar'), temperature: new Quantity('220 dC') }, superheatedSteamProperties).enthalpy).toBeUndefined()
	})
})
