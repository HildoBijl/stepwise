import { getRandomInteger } from '../../../inputTypes/Integer'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'

export const data = {
	skill: 'recognizeProcessTypes',
}

export function generateState() {
	return {
		type: getRandomInteger(0, 5),
	}
}

export function checkInput({ type }, { ans }) {
	return type === ans
}

export const processAction = getSimpleExerciseProcessor(checkInput, data)
