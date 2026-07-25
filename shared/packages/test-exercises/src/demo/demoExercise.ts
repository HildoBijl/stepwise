import { getRandomInteger } from '@step-wise/utils'
import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

export default buildSimpleExercise({
	metaData: {
		skill: 'demo',
	},

	generateState() {
		return { x: getRandomInteger(-100, 100) }
	},

	getSolution({ x }) {
		return { ans: x }
	},

	checkInput(data) {
		return compare('ans', data)
	},
})
