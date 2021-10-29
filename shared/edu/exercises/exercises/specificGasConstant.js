import { selectRandomly } from '../../../util/random'
import * as gasProperties from '../../../data/gasProperties'

import { getSimpleExerciseProcessor } from '../util/simpleExercise'
import { checkParameter } from '../util/check'

export const data = {
	skill: 'specificGasConstant',
	equalityOptions: {
		relativeMargin: 0.015,
	}
}

export function generateState() {
	return { medium: selectRandomly(['air', 'argon', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen']) }
}

export function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter('Rs', correct, input, data.equalityOptions)
}

export function getCorrect({ medium }) {
	return gasProperties[medium].Rs
}

export default {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
