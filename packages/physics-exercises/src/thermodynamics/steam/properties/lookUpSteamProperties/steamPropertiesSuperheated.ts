import { randomInteger } from '@step-wise/js-utils'
import { interpolateTable } from '@step-wise/interpolation'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { superheatedSteamProperties } from '@step-wise/physics-data'

export default buildMonoExercise({
	metadata: {
		skill: 'lookUpSteamProperties',
		weight: 2,
		comparisons: { Quantity: { value: { relativeTolerance: 0.001 } } },
	},

	generateParameters() {
		const pressureRange = superheatedSteamProperties.inputAxes[0]
		const p = pressureRange[randomInteger(3, Math.min(20, pressureRange.length))]
		const temperatureRange = superheatedSteamProperties.inputAxes[1]
		const T = temperatureRange[randomInteger(6, Math.min(24, temperatureRange.length))]
		return { p, T }
	},

	getSolution({ p, T }) {
		const h = interpolateTable([p, T], superheatedSteamProperties, 'enthalpy')
		const s = interpolateTable([p, T], superheatedSteamProperties, 'entropy')
		return { p, T, h, s }
	},

	checkInput(data) {
		return compareInputs(['h', 's'], data)
	},
})
