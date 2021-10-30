import { getRandomInteger } from '../../../inputTypes/Integer'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'

export const data = {
	skill: 'multiplication',
}

export function generateState() {
	return {
		a: getRandomInteger(1,10),
		b: getRandomInteger(1,10),
	}
}

export function checkInput({ a, b }, { ans }) {
	return a * b === ans
}

export const processAction = getSimpleExerciseProcessor(checkInput, data)
