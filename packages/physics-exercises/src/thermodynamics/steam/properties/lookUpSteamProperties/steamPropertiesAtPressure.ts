import { getRandomInteger } from '@step-wise/utils'
import { tableInterpolate } from '@step-wise/interpolation'
import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { saturatedSteamByPressure } from '@step-wise/physics-data'

export default buildSimpleExercise({
	metaData: {
		skill: 'lookUpSteamProperties',
		compare: { FloatUnit: { float: { relativeTolerance: 0.001 } } },
	},

	generateState() {
		const pressureRange = saturatedSteamByPressure.inputValues[0]
		const p = pressureRange[getRandomInteger(0, Math.min(25, pressureRange.length))]
		const type = getRandomInteger(1, 2)
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
