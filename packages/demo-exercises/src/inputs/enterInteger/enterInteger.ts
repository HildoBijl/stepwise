import { getRandomInteger } from '@step-wise/js-utils'
import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

export default buildSimpleExercise({
	metaData: {
		skill: 'enterInteger',
	},

	generateState(example) {
		const limit = example ? 20 : 100
		return { x: getRandomInteger(-limit, limit) }
	},

	getSolution({ x }) {
		return { ans: x }
	},

	checkInput(data) {
		return compare('ans', data)
	},
})
