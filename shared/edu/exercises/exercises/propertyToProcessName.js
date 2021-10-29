import { getRandomInteger } from '../../../inputTypes/Integer'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'

export const data = {
	skill: 'recognizeProcessTypes',
}

export function generateState() {
	return {
		type: getRandomInteger(0, 4),
	}
}

export function checkInput({ type }, { ans }) {
	return type === ans
}

export default {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
}
