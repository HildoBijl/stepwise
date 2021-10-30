import { selectRandomly } from '../../../util/random'
import * as constants from '../../../data/constants'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'

export const data = {
	skill: 'lookUpConstant',
	equalityOptions: {
		relativeMargin: 0.0001,
	}
}

export function generateState() {
	return { constant: selectRandomly(['c', 'g', 'R', 'e', 'k', 'G']) }
}

export function checkInput({ constant }, { ans }) {
	return constants[constant].equals(ans, data.equalityOptions)
}

export const processAction = getSimpleExerciseProcessor(checkInput, data)
