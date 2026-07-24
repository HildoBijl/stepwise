import { getRandomInteger } from '@step-wise/utils'
import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

export default buildSimpleExercise({
	metaData: {
		skill: 'summation',
	},

	generateState(example) {
		return {
			a: getRandomInteger(8, example ? 30 : 100),
			b: getRandomInteger(8, example ? 30 : 100),
		}
	},

	getSolution({ a, b }) {
		return { ans: a + b }
	},

	checkInput(data) {
		return compare('ans', data)
	},
})
