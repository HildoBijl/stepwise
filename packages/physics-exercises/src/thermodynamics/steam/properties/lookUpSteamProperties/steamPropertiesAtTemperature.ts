import { randomInteger } from '@step-wise/js-utils'
import { interpolateTable } from '@step-wise/interpolation'
import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { saturatedSteamByTemperature } from '@step-wise/physics-data'

export default buildSimpleExercise({
	metaData: {
		skill: 'lookUpSteamProperties',
		compare: { FloatUnit: { float: { relativeTolerance: 0.001 } } },
	},

	generateParameters() {
		const temperatureRange = saturatedSteamByTemperature.inputAxes[0]
		const T = temperatureRange[randomInteger(0, Math.min(25, temperatureRange.length))]
		const type = randomInteger(1, 2)
		return { T, type }
	},

	getSolution({ T, type }) {
		const p = interpolateTable(T, saturatedSteamByTemperature, 'boilingPressure')
		const h = interpolateTable(T, saturatedSteamByTemperature, type === 1 ? 'enthalpyLiquid' : 'enthalpyVapor')
		const s = interpolateTable(T, saturatedSteamByTemperature, type === 1 ? 'entropyLiquid' : 'entropyVapor')
		return { T, type, p, h, s }
	},

	checkInput(data) {
		return compare(['p', 'h', 's'], data)
	},
})
