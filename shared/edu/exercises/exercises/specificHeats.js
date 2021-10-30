import { selectRandomly } from '../../../util/random'
import gasProperties from '../../../data/gasProperties'

import { getSimpleExerciseProcessor } from '../util/simpleExercise'
import { checkParameter } from '../util/check'

export const data = {
	skill: 'specificHeats',
	equalityOptions: {
		default: {
			relativeMargin: 0.02,
		},
	}
}

export function generateState() {
	return { medium: selectRandomly(['air', 'argon', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen']) }
}

export function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter(['cv', 'cp'], correct, input, data.equalityOptions)
}

export function getCorrect({ medium }) {
	return gasProperties[medium]
}

export const processAction = getSimpleExerciseProcessor(checkInput, data)
