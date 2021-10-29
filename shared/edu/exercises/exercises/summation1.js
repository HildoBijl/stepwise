import { getRandomInteger } from '../../../inputTypes/Integer'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'

export const data = {
	skill: 'summation',
}

export function generateState() {
	return {
		a: getRandomInteger(1,100),
		b: getRandomInteger(1,100),
	}
}

export function checkInput({ a, b }, { ans }) {
	return a + b === ans
}

export default {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
}
