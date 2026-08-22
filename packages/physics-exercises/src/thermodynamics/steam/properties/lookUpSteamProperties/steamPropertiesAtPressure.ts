import { randomInteger } from '@step-wise/js-utils'
import { tableInterpolate } from '@step-wise/interpolation'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { saturatedSteamByPressure } from '@step-wise/physics-data'

export default buildMonoExercise({
	metadata: {
		skill: 'lookUpSteamProperties',
		compare: { FloatUnit: { float: { relativeTolerance: 0.001 } } },
	},

	generateParameters() {
		const pressureRange = saturatedSteamByPressure.inputValues[0]
		const p = pressureRange[randomInteger(0, Math.min(25, pressureRange.length))]
		const type = randomInteger(1, 2)
		return { p, type }
	},

	getSolution({ p, type }) {
		const T = tableInterpolate(p, saturatedSteamByPressure, 'boilingTemperature')
		const h = tableInterpolate(p, saturatedSteamByPressure, type === 1 ? 'enthalpyLiquid' : 'enthalpyVapor')
		const s = tableInterpolate(p, saturatedSteamByPressure, type === 1 ? 'entropyLiquid' : 'entropyVapor')
		return { p, type, T, h, s }
	},

	checkInput(data) {
		return compare(['T', 'h', 's'], data)
	},
})
