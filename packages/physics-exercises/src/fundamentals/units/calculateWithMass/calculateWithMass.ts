import { sample, randomInteger } from '@step-wise/js-utils'
import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomExponentialFloatUnit } from '@step-wise/physics-core'

// Type 0: from (mu/m/./M)g to kg.
// Type 1: from (mu/m/./M)g to SI (so kg: which it may already be in).
// Type 2: from kg to (mu/m/./M)g.

export default buildSimpleExercise({
	metaData: {
		skill: 'calculateWithMass',
		compare: {
			FloatUnit: {
				float: {
					relativeTolerance: 0.001,
					significantDigitTolerance: 0,
				},
				unit: {
					target: 'unchanged',
				},
			},
		},
	},

	generateState() {
		const type = randomInteger(0, 2)
		const prefix = sample(['mu', 'm', '', 'M'])

		let m = getRandomExponentialFloatUnit({
			min: 1e-1,
			max: 1e3,
			significantDigits: randomInteger(2, 3),
			unit: `${prefix}g`,
		})

		if (type === 2) m = m.setUnit('kg')

		return { m, type, prefix }
	},

	getSolution(state) {
		return { ...state, ans: state.type === 2 ? state.m.setUnit(`${state.prefix}g`) : state.m.setUnit('kg') }
	},

	checkInput(data) {
		return compare('ans', data)
	},
})
