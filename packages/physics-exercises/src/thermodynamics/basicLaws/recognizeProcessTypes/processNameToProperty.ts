import { getRandomInteger } from '@step-wise/utils'
import { buildSimpleExercise, getMultipleChoiceMapping } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

export default buildSimpleExercise({
	metaData: {
		skill: 'recognizeProcessTypes',
	},

	generateState() {
		const numChoices = 6
		const type = getRandomInteger(0, numChoices - 1)
		return {
			type,
			mapping: getMultipleChoiceMapping({ numChoices, pick: 4, include: type, randomOrder: true }),
		}
	},

	getSolution({ type }) {
		return { ans: type }
	},

	checkInput(data) {
		return compare('ans', data)
	},
})
