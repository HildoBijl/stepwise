import { randomInteger } from '@step-wise/js-utils'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

export default buildMonoExercise({
	metaData: {
		skill: 'summation',
	},

	generateParameters(example) {
		return {
			a: randomInteger(8, example ? 30 : 100),
			b: randomInteger(8, example ? 30 : 100),
		}
	},

	getSolution({ a, b }) {
		return { ans: a + b }
	},

	checkInput(data) {
		return compare('ans', data)
	},
})
