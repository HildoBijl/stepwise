import { sample, randomInteger } from '@step-wise/js-utils'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomExponentialFloatUnit } from '@step-wise/physics-core'

// Type 0: from (mu/m/./M)g to kg.
// Type 1: from (mu/m/./M)g to SI (so kg: which it may already be in).
// Type 2: from kg to (mu/m/./M)g.

export default buildMonoExercise({
	metadata: {
		skill: 'calculateWithMass',
		comparisons: {
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

	generateParameters() {
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

	getSolution(parameters) {
		return { ...parameters, ans: parameters.type === 2 ? parameters.m.setUnit(`${parameters.prefix}g`) : parameters.m.setUnit('kg') }
	},

	checkInput(data) {
		return compareInputs('ans', data)
	},
})
