import { randomInteger } from '@step-wise/js-utils'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomExponentialFloatUnit } from '@step-wise/physics-core'

// Type 0: from Pa to bar.
// Type 1: from Pa to SI (so Pa: which it already is in).
// Type 2: from bar to Pa.
// Type 3: from bar to SI (so Pa).

export default buildMonoExercise({
	metadata: {
		skill: 'calculateWithPressure',
		comparisons: {
			FloatUnit: {
				value: {
					relativeTolerance: 0.001,
					significantDigitTolerance: 0,
				},
				unit: {
					target: 'standard',
				},
			},
		},
	},

	generateParameters() {
		const type = randomInteger(0, 3)
		let p = getRandomExponentialFloatUnit({
			min: 1e3,
			max: 2e7,
			significantDigits: randomInteger(2, 3),
			unit: 'Pa',
		})
		if (type >= 2) p = p.setUnit('bar')
		return { p, type }
	},

	getSolution(parameters) {
		const p = parameters.p.simplify()
		return { ...parameters, ans: parameters.type === 0 ? p.setUnit('bar') : p }
	},

	checkInput(data) {
		return compareInputs('ans', data)
	},
})
