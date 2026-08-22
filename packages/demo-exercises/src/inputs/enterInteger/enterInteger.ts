import { randomInteger } from '@step-wise/js-utils'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

export default buildMonoExercise({
	metaData: {
		skill: 'enterInteger',
	},

	generateParameters(example) {
		const limit = example ? 20 : 100
		return { x: randomInteger(-limit, limit) }
	},

	getSolution({ x }) {
		return { ans: x }
	},

	checkInput(data) {
		return compare('ans', data)
	},
})
