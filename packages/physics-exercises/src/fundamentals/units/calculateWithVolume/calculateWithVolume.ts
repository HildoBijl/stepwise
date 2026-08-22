import { sample, randomInteger } from '@step-wise/js-utils'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomExponentialFloatUnit } from '@step-wise/physics-core'

// Type 0: from (c/d/.)m^3 to liter.
// Type 1: from (c/d/.)m^3 to SI (so m^3: which it may already be in).
// Type 2: from liter to m^3.
// Type 3: from liter to SI (so m^3).

export default buildMonoExercise({
	metadata: {
		skill: 'calculateWithVolume',
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

	generateParameters() {
		let V = getRandomExponentialFloatUnit({
			min: 1e-5,
			max: 1e2,
			significantDigits: randomInteger(2, 3),
			unit: 'm^3',
		})

		const type = randomInteger(0, 3)
		if (type < 2) {
			const prefix = sample(['', 'd', 'c'])
			V = V.setUnit(`${prefix}m^3`)
		} else {
			V = V.setUnit('l')
		}

		return { V, type }
	},

	getSolution(parameters) {
		const V = parameters.V.simplify()
		return { ...parameters, ans: parameters.type === 0 ? V.setUnit('l') : V }
	},

	checkInput(data) {
		return compare('ans', data)
	},
})
