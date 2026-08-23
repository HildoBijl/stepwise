import { randomInteger } from '@step-wise/js-utils'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'

// Type 0: from K to °C.
// Type 1: from K to SI (so K: which it already is in).
// Type 2: from °C to K.
// Type 3: from °C to SI (so K).

export default buildMonoExercise({
	metadata: {
		skill: 'calculateWithTemperature',
		comparisons: {
			FloatUnit: {
				value: {
					absoluteTolerance: 0.7,
					significantDigitTolerance: 1,
				},
				unit: {
					target: 'unchanged',
				},
			},
		},
	},

	generateParameters() {
		const type = randomInteger(0, 3)
		let T = getRandomFloatUnit({
			min: 0,
			max: 1000,
			decimals: randomInteger(0, 1),
			unit: 'K',
		})
		if (type >= 2) T = T.setUnit('dC').roundToPrecision()
		return { T, type }
	},

	getSolution(parameters) {
		const T = parameters.T.simplify()
		return { ...parameters, ans: parameters.type === 0 ? T.setUnit('dC') : T }
	},

	checkInput(data) {
		return compareInputs('ans', data)
	},
})
