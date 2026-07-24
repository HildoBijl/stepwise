import { getRandomInteger } from '@step-wise/utils'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

export default buildStepExercise({
	metaData: {
		skill: 'summationAndMultiplication',
		...stepsToSetup([undefined, 'multiplication', 'summation']),
	},

	generateState(example) {
		return {
			a: getRandomInteger(2, example ? 6 : 10),
			b: getRandomInteger(2, example ? 6 : 10),
			c: getRandomInteger(8, example ? 30 : 100),
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
			case 1: return compare('order', data)
			case 2: return compare('ab', data)
			default: return compare('ans', data)
		}
	},
})
