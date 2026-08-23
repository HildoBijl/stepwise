import { randomInteger } from '@step-wise/js-utils'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

export default buildMonoExercise({
	metadata: {
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
		return compareInputs('ans', data)
	},
})
