import { randomInteger } from '@step-wise/js-utils'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

export default buildStepExercise({
	metadata: {
		skill: 'summationAndMultiplication',
		...createStepExerciseMetadata([undefined, 'multiplication', 'summation']),
	},

	generateParameters(example) {
		return {
			a: randomInteger(2, example ? 6 : 10),
			b: randomInteger(2, example ? 6 : 10),
			c: randomInteger(8, example ? 30 : 100),
		}
	},

	getSolution({ a, b, c }) {
		return {
			order: 1,
			ab: a * b,
			ans: a * b + c,
		}
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('order', data)
			case 2: return compareInputs('ab', data)
			default: return compareInputs('ans', data)
		}
	},
})
