import { sample, getRandomInteger } from '@step-wise/utils'
import { getRandomExponentialFloatUnit } from '@step-wise/physics-core'
import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

// Type 0: from (c/d/.)m^3 to liter.
// Type 1: from (c/d/.)m^3 to SI (so m^3: which it may already be in).
// Type 2: from liter to m^3.
// Type 3: from liter to SI (so m^3).

export default buildSimpleExercise({
	metaData: {
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

	generateState() {
		let V = getRandomExponentialFloatUnit({
			min: 1e-5,
			max: 1e2,
			significantDigits: getRandomInteger(2, 3),
			unit: 'm^3',
		})

		const type = getRandomInteger(0, 3)
		if (type < 2) {
			const prefix = sample(['', 'd', 'c'])
			V = V.setUnit(`${prefix}m^3`)
		} else {
			V = V.setUnit('l')
		}

		return { V, type }
	},

	getSolution(state) {
		const V = state.V.simplify()
		return { ...state, ans: state.type === 0 ? V.setUnit('l') : V }
	},

	checkInput(data) {
		return compare('ans', data)
	},
})
