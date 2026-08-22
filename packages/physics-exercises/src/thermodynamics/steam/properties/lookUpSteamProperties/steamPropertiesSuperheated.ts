import { randomInteger } from '@step-wise/js-utils'
import { tableInterpolate } from '@step-wise/interpolation'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { superheatedSteam } from '@step-wise/physics-data'

export default buildMonoExercise({
	metaData: {
		skill: 'lookUpSteamProperties',
		weight: 2,
		compare: { FloatUnit: { float: { relativeTolerance: 0.001 } } },
	},

	generateParameters() {
		const pressureRange = superheatedSteam.inputValues[0]
		const p = pressureRange[randomInteger(3, Math.min(20, pressureRange.length))]
		const temperatureRange = superheatedSteam.inputValues[1]
		const T = temperatureRange[randomInteger(6, Math.min(24, temperatureRange.length))]
		return { p, T }
	},

	getSolution({ p, T }) {
		const h = tableInterpolate([p, T], superheatedSteam, 'enthalpy')
		const s = tableInterpolate([p, T], superheatedSteam, 'entropy')
		return { p, T, h, s }
	},

	checkInput(data) {
		return compare(['h', 's'], data)
	},
})
