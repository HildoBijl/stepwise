import { getRandomInteger } from '@step-wise/js-utils'
import { tableInterpolate } from '@step-wise/interpolation'
import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { saturatedSteamByTemperature } from '@step-wise/physics-data'

export default buildSimpleExercise({
	metaData: {
		skill: 'lookUpSteamProperties',
		compare: { FloatUnit: { float: { relativeTolerance: 0.001 } } },
	},

	generateState() {
		const temperatureRange = saturatedSteamByTemperature.inputValues[0]
		const T = temperatureRange[getRandomInteger(0, Math.min(25, temperatureRange.length))]
		const type = getRandomInteger(1, 2)
		return { T, type }
	},

	getSolution({ T, type }) {
		const p = tableInterpolate(T, saturatedSteamByTemperature, 'boilingPressure')
		const h = tableInterpolate(T, saturatedSteamByTemperature, type === 1 ? 'enthalpyLiquid' : 'enthalpyVapor')
		const s = tableInterpolate(T, saturatedSteamByTemperature, type === 1 ? 'entropyLiquid' : 'entropyVapor')
		return { T, type, p, h, s }
	},

	checkInput(data) {
		return compare(['p', 'h', 's'], data)
	},
})
