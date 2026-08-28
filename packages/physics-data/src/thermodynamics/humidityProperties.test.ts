import { describe, expect, it } from 'vitest'

import { interpolateTable, interpolateTableInput } from '@step-wise/interpolation'
import { Quantity } from '@step-wise/physics-core'

import { maximumHumidityByTemperature } from './humidityProperties.ts'

describe('maximumHumidityByTemperature', () => {
	it('contains the expected table contract and reference values', () => {
		expect(maximumHumidityByTemperature.inputLabels).toEqual(['temperature'])
		expect(maximumHumidityByTemperature.outputLabels).toEqual(['maximumHumidity'])
		expect(interpolateTable(new Quantity('-10 dC'), maximumHumidityByTemperature)?.setUnit('g/kg').number).toBeCloseTo(1.77225)
		expect(interpolateTable(new Quantity('35 dC'), maximumHumidityByTemperature)?.setUnit('g/kg').number).toBeCloseTo(36.56045)
	})

	it('supports forward and inverse interpolation', () => {
		const humidity = interpolateTable(new Quantity('20.5 dC'), maximumHumidityByTemperature)
		expect(humidity?.setUnit('g/kg').number).toBeCloseTo((14.68912 + 15.64759) / 2)
		expect(interpolateTableInput(humidity!, maximumHumidityByTemperature)?.setUnit('dC').number).toBeCloseTo(20.5)
	})

	it('returns undefined outside the table', () => {
		expect(interpolateTable(new Quantity('-11 dC'), maximumHumidityByTemperature)).toBeUndefined()
		expect(interpolateTable(new Quantity('36 dC'), maximumHumidityByTemperature)).toBeUndefined()
	})
})
