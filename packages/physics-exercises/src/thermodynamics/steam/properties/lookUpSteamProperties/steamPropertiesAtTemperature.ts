import { randomInteger } from '@step-wise/js-utils'
import { interpolateTable } from '@step-wise/interpolation'
import { compareInputs } from '@step-wise/exercise-grading'
import { saturatedSteamPropertiesByTemperature } from '@step-wise/physics-data'

import { buildMonoExercise } from '#physicsExerciseBuilding'

export default buildMonoExercise({
	metadata: {
		skill: 'lookUpSteamProperties',
		comparisons: { Quantity: { value: { relativeTolerance: 0.001 } } },
	},

	generateParameters() {
		const temperatureRange = saturatedSteamPropertiesByTemperature.inputAxes[0]
		const T = temperatureRange[randomInteger(0, Math.min(25, temperatureRange.length))]
		const type = randomInteger(1, 2)
		return { T, type }
	},

	getSolution({ T, type }) {
		const p = interpolateTable(T, saturatedSteamPropertiesByTemperature, 'boilingPressure')
		const h = interpolateTable(T, saturatedSteamPropertiesByTemperature, type === 1 ? 'enthalpyLiquid' : 'enthalpyVapor')
		const s = interpolateTable(T, saturatedSteamPropertiesByTemperature, type === 1 ? 'entropyLiquid' : 'entropyVapor')
		return { T, type, p, h, s }
	},

	checkInput(data) {
		return compareInputs(['p', 'h', 's'], data)
	},
})
