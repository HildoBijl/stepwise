import { getRandomInteger } from '@step-wise/utils'
import { getRandomExponentialFloatUnit } from '@step-wise/physics-core'
import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

// Type 0: from Pa to bar.
// Type 1: from Pa to SI (so Pa: which it already is in).
// Type 2: from bar to Pa.
// Type 3: from bar to SI (so Pa).

export default buildSimpleExercise({
	metaData: {
		skill: 'calculateWithPressure',
		compare: {
			FloatUnit: {
				float: {
					relativeTolerance: 0.001,
					significantDigitTolerance: 0,
				},
				unit: {
					target: 'standard',
				},
			},
		},
	},

	generateState() {
		const type = getRandomInteger(0, 3)
		let p = getRandomExponentialFloatUnit({
			min: 1e3,
			max: 2e7,
			significantDigits: getRandomInteger(2, 3),
			unit: 'Pa',
		})
		if (type >= 2) p = p.setUnit('bar')
		return { p, type }
	},

	getSolution(state) {
		const p = state.p.simplify()
		return { ...state, ans: state.type === 0 ? p.setUnit('bar') : p }
	},

	checkInput(data) {
		return compare('ans', data)
	},
})
