import { randomInteger } from '@step-wise/js-utils'
import { buildMonoExercise, generateMultipleChoiceMapping } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

export default buildMonoExercise({
	metaData: {
		skill: 'recognizeProcessTypes',
	},

	generateParameters() {
		const numChoices = 5
		const type = randomInteger(0, numChoices - 1)
		return {
			type,
			mapping: generateMultipleChoiceMapping({ numChoices, pick: 4, include: type, randomOrder: true }),
		}
	},

	getSolution({ type }) {
		return { ans: type }
	},

	checkInput(data) {
		return compare('ans', data)
	},
})
