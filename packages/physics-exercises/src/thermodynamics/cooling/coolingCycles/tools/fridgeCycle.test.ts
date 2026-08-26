import { getTemperatures } from './fridgeCycle'

describe('getTemperatures', () => {
	it('generates temperatures and temperature differences within their configured ranges', () => {
		const { TCold, TWarm, dTCold, dTWarm } = getTemperatures()

		expect(TCold.number).toBeGreaterThanOrEqual(-4)
		expect(TCold.number).toBeLessThanOrEqual(6)
		expect(TWarm.number).toBeGreaterThanOrEqual(18)
		expect(TWarm.number).toBeLessThanOrEqual(28)
		expect(dTCold.number).toBeGreaterThanOrEqual(6)
		expect(dTCold.number).toBeLessThanOrEqual(16)
		expect(dTWarm.number).toBeGreaterThanOrEqual(6)
		expect(dTWarm.number).toBeLessThanOrEqual(16)
	})

	it('derives the evaporation and condensation temperatures', () => {
		const { TCold, TWarm, dTCold, dTWarm, TEvap, TCond } = getTemperatures()

		expect(TEvap.compare(TCold.subtract(dTCold))).toBe(0)
		expect(TCond.compare(TWarm.add(dTWarm))).toBe(0)
	})
})
