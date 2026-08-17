import { getRandomInteger } from '@step-wise/js-utils'
import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'

// Type 0: from K to °C.
// Type 1: from K to SI (so K: which it already is in).
// Type 2: from °C to K.
// Type 3: from °C to SI (so K).

export default buildSimpleExercise({
	metaData: {
		skill: 'calculateWithTemperature',
		compare: {
			FloatUnit: {
				float: {
					absoluteTolerance: 0.7,
					significantDigitTolerance: 1,
				},
				unit: {
					target: 'unchanged',
				},
			},
		},
	},

	generateState() {
		const type = getRandomInteger(0, 3)
		let T = getRandomFloatUnit({
			min: 0,
			max: 1000,
			decimals: getRandomInteger(0, 1),
			unit: 'K',
		})
		if (type >= 2) T = T.setUnit('dC').roundToPrecision()
		return { T, type }
	},

	getSolution(state) {
		const T = state.T.simplify()
		return { ...state, ans: state.type === 0 ? T.setUnit('dC') : T }
	},

	checkInput(data) {
		return compare('ans', data)
	},
})
