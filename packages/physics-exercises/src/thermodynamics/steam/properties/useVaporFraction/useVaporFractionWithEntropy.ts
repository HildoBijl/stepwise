import { randomInteger } from '@step-wise/js-utils'
import { interpolateTable } from '@step-wise/interpolation'
import { and } from '@step-wise/skill-setup'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomQuantity } from '@step-wise/physics-core'
import { saturatedSteamPropertiesByTemperature, saturatedSteamPropertiesByPressure } from '@step-wise/physics-data'

import { buildStepExercise, createStepExerciseMetadata } from '#physicsExerciseBuilding'

export default buildStepExercise({
	metadata: {
		skill: 'useVaporFraction',
		setup: and('lookUpSteamProperties', 'linearInterpolation'),
		...createStepExerciseMetadata(['lookUpSteamProperties', 'linearInterpolation', 'linearInterpolation']),
		comparisons: {
			Quantity: { value: { relativeTolerance: 0.001 } },
			x: { value: { relativeTolerance: 0.002, significantDigitTolerance: 1 } },
			h: { value: { relativeTolerance: 0.002, significantDigitTolerance: 1 } },
		},
	},

	generateParameters() {
		const type = randomInteger(1, 2)
		const x = getRandomQuantity({ min: 0.1, max: 0.9, unit: '' })
		if (type === 1) {
			const temperatureRange = saturatedSteamPropertiesByTemperature.inputAxes[0]
			const T = temperatureRange[randomInteger(0, Math.min(25, temperatureRange.length))]
			const sx0 = interpolateTable(T, saturatedSteamPropertiesByTemperature, 'entropyLiquid')!
			const sx1 = interpolateTable(T, saturatedSteamPropertiesByTemperature, 'entropyVapor')!
			const s = sx0.add(x.multiply(sx1.subtract(sx0))).setDecimals(3).roundToPrecision()
			return { type, T, s }
		}
		const pressureRange = saturatedSteamPropertiesByPressure.inputAxes[0]
		const p = pressureRange[randomInteger(0, Math.min(25, pressureRange.length))]
		const sx0 = interpolateTable(p, saturatedSteamPropertiesByPressure, 'entropyLiquid')!
		const sx1 = interpolateTable(p, saturatedSteamPropertiesByPressure, 'entropyVapor')!
		const s = sx0.add(x.multiply(sx1.subtract(sx0))).setDecimals(3).roundToPrecision()
		return { type, p, s }
	},

	getSolution({ type, T, p, s }) {
		const value = type === 1 ? T! : p!
		const table = type === 1 ? saturatedSteamPropertiesByTemperature : saturatedSteamPropertiesByPressure
		const hx0 = interpolateTable(value, table, 'enthalpyLiquid')!
		const hx1 = interpolateTable(value, table, 'enthalpyVapor')!
		const sx0 = interpolateTable(value, table, 'entropyLiquid')!
		const sx1 = interpolateTable(value, table, 'entropyVapor')!
		const x = s.subtract(sx0).divide(sx1.subtract(sx0)).setUnit('')
		const h = hx0.add(x.multiply(hx1.subtract(hx0)))
		return { sx0, sx1, x, hx0, hx1, h }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs(['hx0', 'hx1', 'sx0', 'sx1'], data)
			case 2: return compareInputs('x', data)
			default: return compareInputs('h', data)
		}
	},
})
