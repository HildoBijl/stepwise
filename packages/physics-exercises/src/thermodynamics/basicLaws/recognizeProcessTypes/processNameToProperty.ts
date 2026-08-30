import { randomInteger } from '@step-wise/js-utils'
import { compareInputs } from '@step-wise/exercise-grading'

import { buildMonoExercise, generateMultipleChoiceMapping } from '#exerciseBuilding'

export default buildMonoExercise({
	metadata: {
		skill: 'recognizeProcessTypes',
	},

	generateParameters() {
		const numChoices = 6
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
		return compareInputs('ans', data)
	},
})
