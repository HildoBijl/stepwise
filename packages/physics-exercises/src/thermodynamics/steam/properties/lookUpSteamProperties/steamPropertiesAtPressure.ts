import { randomInteger } from '@step-wise/js-utils'
import { interpolateTable } from '@step-wise/interpolation'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { saturatedSteamByPressure } from '@step-wise/physics-data'

export default buildMonoExercise({
	metadata: {
		skill: 'lookUpSteamProperties',
		comparisons: { Quantity: { value: { relativeTolerance: 0.001 } } },
	},

	generateParameters() {
		const pressureRange = saturatedSteamByPressure.inputAxes[0]
		const p = pressureRange[randomInteger(0, Math.min(25, pressureRange.length))]
		const type = randomInteger(1, 2)
		return { p, type }
	},

	getSolution({ p, type }) {
		const T = interpolateTable(p, saturatedSteamByPressure, 'boilingTemperature')
		const h = interpolateTable(p, saturatedSteamByPressure, type === 1 ? 'enthalpyLiquid' : 'enthalpyVapor')
		const s = interpolateTable(p, saturatedSteamByPressure, type === 1 ? 'entropyLiquid' : 'entropyVapor')
		return { p, type, T, h, s }
	},

	checkInput(data) {
		return compareInputs(['T', 'h', 's'], data)
	},
})
