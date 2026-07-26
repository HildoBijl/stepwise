import { getRandomInteger } from '@step-wise/utils'
import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

export default buildSimpleExercise({
	metaData: {
		skill: 'multiplication',
	},

	generateState(example) {
		return {
			a: getRandomInteger(2, example ? 6 : 10),
			b: getRandomInteger(2, example ? 6 : 10),
		}
	},

	getSolution({ a, b }) {
		return { ans: a * b }
	},

	checkInput(data) {
		return compare('ans', data)
	},
})
