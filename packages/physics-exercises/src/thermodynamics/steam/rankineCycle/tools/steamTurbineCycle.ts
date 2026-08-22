import { integerRange, sample, randomInteger } from '@step-wise/js-utils'
import { interpolateTable } from '@step-wise/interpolation'
import { FloatUnit, getRandomFloatUnit } from '@step-wise/physics-core'
import { saturatedSteamByPressure, superheatedSteam } from '@step-wise/physics-data'

export function getCycle() {
	while (true) {
		// Get pressure in condensor and evaporator.
		const pressureRangeTable1 = saturatedSteamByPressure.inputAxes[0]
		const condenserIndex = randomInteger(3, 8)
		const pc = pressureRangeTable1[condenserIndex]
		const Tc = interpolateTable(pc, saturatedSteamByPressure, 'boilingTemperature')!
		const pressureRangeTable2 = superheatedSteam.inputAxes[superheatedSteam.inputLabels.indexOf('pressure')]
		const evaporatorIndex = randomInteger(13, 19)
		const pe = pressureRangeTable2[evaporatorIndex]
		const Te = interpolateTable(pe, saturatedSteamByPressure, 'boilingTemperature')!
		const x3 = getRandomFloatUnit({ min: 0.95, max: 1, unit: '' })

		// Check which rows (that is, temperatures) from the enthalpy table are suitable. Pick one randomly.
		const temperatureRange = superheatedSteam.inputAxes[superheatedSteam.inputLabels.indexOf('temperature')]
		const temperatureIndexOptions = integerRange(3, 25).filter(temperatureIndex => {
			const T = temperatureRange[temperatureIndex]
			if (T.compare(Te) < 0) return false
			const cycleProperties = getCycleProperties(pc, pe, T, x3)
			if (cycleProperties === undefined) return false
			const { x3p, etai } = cycleProperties
			if (x3p.number >= x3.number) return false
			if (etai.number < 0.8 || etai.number > 1) return false
			return true
		})
		if (temperatureIndexOptions.length === 0) continue
		const T2 = temperatureRange[sample(temperatureIndexOptions)]

		// Find the remaining properties and check requirements.
		const { hx0, hx1, sx0, sx1, h2, s2, s3p, x3p, h3p, s3, h3, etai } = getCycleProperties(pc, pe, T2, x3)!
		if (h2.compare(new FloatUnit('3700 kJ/kg')) > 0) continue

		// Gather remaining properties.
		const h4 = hx0
		const s4 = sx0
		const T4 = Tc
		const p4 = pc
		const h1 = h4
		const s1 = s4
		const T1 = T4
		const p1 = pe
		const p2 = pe
		const p3 = pc
		const T3 = Tc

		// Determine size/efficiency properties.
		const mdot = getRandomFloatUnit({ min: 40, max: 160, decimals: -1, unit: 'kg/s' }).divide(2).setDecimals(0)
		const P = mdot.multiply(h2.subtract(h3)).setUnit('MW')
		const Ph = mdot.multiply(h2.subtract(h1)).setUnit('MW')
		const eta = h2.subtract(h3).divide(h2.subtract(h1)).setUnit('')

		return { pc, Tc, pe, Te, hx0, hx1, sx0, sx1, h1, s1, p1, T1, h2, s2, p2, T2, x3p, h3p, s3p, x3, h3, s3, p3, T3, h4, s4, p4, T4, etai, mdot, P, Ph, eta }
	}
}

function getCycleProperties(pc: FloatUnit, pe: FloatUnit, T2: FloatUnit, x3: FloatUnit) {
	while (true) {
		// Liquid and vapor points.
		const hx0 = interpolateTable(pc, saturatedSteamByPressure, 'enthalpyLiquid')
		const hx1 = interpolateTable(pc, saturatedSteamByPressure, 'enthalpyVapor')
		const sx0 = interpolateTable(pc, saturatedSteamByPressure, 'entropyLiquid')
		const sx1 = interpolateTable(pc, saturatedSteamByPressure, 'entropyVapor')
		if (hx0 === undefined || hx1 === undefined || sx0 === undefined || sx1 === undefined) return undefined

		// Point 2.
		const h2 = interpolateTable([pe, T2], superheatedSteam, 'enthalpy')
		const s2 = interpolateTable([pe, T2], superheatedSteam, 'entropy')
		if (h2 === undefined || s2 === undefined) return undefined

		// Point 3-prime.
		const s3p = s2
		const x3p = s3p.subtract(sx0).divide(sx1.subtract(sx0)).setUnit('')
		const h3p = hx0.add(x3p.multiply(hx1.subtract(hx0)))

		// Point 3.
		const h3 = hx0.add(x3.multiply(hx1.subtract(hx0)))
		const s3 = sx0.add(x3.multiply(sx1.subtract(sx0)))

		// Remaining properties.
		const etai = h2.subtract(h3).divide(h2.subtract(h3p)).setUnit('')
		return { hx0, hx1, sx0, sx1, h2, s2, s3p, x3p, h3p, s3, x3, h3, etai }
	}
}
