import { randomInteger } from '@step-wise/js-utils'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

export default buildMonoExercise({
	metadata: {
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
		const given = data.input.ans as number
		const expected = data.solution!.ans as number
		const correct = compareInputs('ans', data)
		return {
			correct,
			report: {
				ans: {
					correct,
					compare: given < expected ? -1 : given > expected ? 1 : 0,
				},
			},
		}
	},
})
