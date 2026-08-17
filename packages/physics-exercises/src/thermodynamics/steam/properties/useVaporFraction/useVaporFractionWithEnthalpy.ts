import { getRandomInteger } from '@step-wise/js-utils'
import { tableInterpolate } from '@step-wise/interpolation'
import { and } from '@step-wise/skill-setup'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { saturatedSteamByTemperature, saturatedSteamByPressure } from '@step-wise/physics-data'

export default buildStepExercise({
	metaData: {
		skill: 'useVaporFraction',
		setup: and('lookUpSteamProperties', 'linearInterpolation'),
		...stepsToSetup(['lookUpSteamProperties', 'linearInterpolation', 'linearInterpolation']),
		compare: {
			FloatUnit: { float: { relativeTolerance: 0.001 } },
			x: { float: { relativeTolerance: 0.002, significantDigitTolerance: 1 } },
			s: { float: { relativeTolerance: 0.002, significantDigitTolerance: 1 } },
		},
	},

	generateState() {
		const type = getRandomInteger(1, 2)
		const x = getRandomFloatUnit({ min: 0.1, max: 0.9, unit: '' })
		if (type === 1) {
			const temperatureRange = saturatedSteamByTemperature.inputValues[0]
			const T = temperatureRange[getRandomInteger(0, Math.min(25, temperatureRange.length))]
			const hx0 = tableInterpolate(T, saturatedSteamByTemperature, 'enthalpyLiquid')!
			const hx1 = tableInterpolate(T, saturatedSteamByTemperature, 'enthalpyVapor')!
			const h = hx0.add(x.multiply(hx1.subtract(hx0))).setDecimals(0).roundToPrecision()
			return { type, T, h }
		}
		const pressureRange = saturatedSteamByPressure.inputValues[0]
		const p = pressureRange[getRandomInteger(0, Math.min(25, pressureRange.length))]
		const hx0 = tableInterpolate(p, saturatedSteamByPressure, 'enthalpyLiquid')!
		const hx1 = tableInterpolate(p, saturatedSteamByPressure, 'enthalpyVapor')!
		const h = hx0.add(x.multiply(hx1.subtract(hx0))).setDecimals(0).roundToPrecision()
		return { type, p, h }
	},

	getSolution({ type, T, p, h }) {
		const value = type === 1 ? T! : p!
		const table = type === 1 ? saturatedSteamByTemperature : saturatedSteamByPressure
		const hx0 = tableInterpolate(value, table, 'enthalpyLiquid')!
		const hx1 = tableInterpolate(value, table, 'enthalpyVapor')!
		const sx0 = tableInterpolate(value, table, 'entropyLiquid')!
		const sx1 = tableInterpolate(value, table, 'entropyVapor')!
		const x = h.subtract(hx0).divide(hx1.subtract(hx0)).setUnit('')
		const s = sx0.add(x.multiply(sx1.subtract(sx0)))
		return { hx0, hx1, x, sx0, sx1, s }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare(['hx0', 'hx1', 'sx0', 'sx1'], data)
			case 2: return compare('x', data)
			default: return compare('s', data)
		}
	},
})
