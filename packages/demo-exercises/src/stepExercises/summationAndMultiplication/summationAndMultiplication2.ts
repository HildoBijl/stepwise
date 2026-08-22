import { randomInteger } from '@step-wise/js-utils'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

export default buildStepExercise({
	metadata: {
		skill: 'summationAndMultiplication',
		...createStepExerciseMetadata([undefined, ['multiplication', 'multiplication'], 'summation']),
		weight: 2, // This exercise has more variation so can count as two separate copies of this exercise.
	},

	generateParameters(example) {
		return {
			a: randomInteger(2, example ? 6 : 10),
			b: randomInteger(2, example ? 6 : 10),
			c: randomInteger(2, example ? 6 : 10),
			d: randomInteger(2, example ? 6 : 10),
		}
	},

	getSolution({ a, b, c, d }) {
		const order = 1
		const ab = a * b
		const cd = c * d
		const ans = ab + cd
		return { order, ab, cd, ans }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1: return compare('order', data)
			case 2:
				switch (substep) {
					case 1: return compare('ab', data)
					case 2: return compare('cd', data)
				}
			default: return compare('ans', data)
		}
	},
})
