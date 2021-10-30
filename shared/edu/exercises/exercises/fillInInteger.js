import { getRandomInteger } from '../../../inputTypes/Integer'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'
import { checkParameter } from '../util/check'

export const data = {
	skill: 'fillInInteger',
	equalityOptions: {},
}

export function generateState() {
	return { x: getRandomInteger(-100, 100) }
}

export function getCorrect({ x }) {
	return { ans: x }
}

export function checkInput(state, input) {
	return checkParameter('ans', getCorrect(state), input, data.equalityOptions) // Basically returns whether state.ans === input.ans in a very convoluted but generalized way.
}

export const processAction = getSimpleExerciseProcessor(checkInput, data)
