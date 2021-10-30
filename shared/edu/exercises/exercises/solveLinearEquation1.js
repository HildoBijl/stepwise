import { getRandomInteger } from '../../../inputTypes/Integer'
import { getRandomExponentialFloat } from '../../../inputTypes/Float'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'

export const data = {
	skill: 'solveLinearEquation',
	equalityOptions: { significantDigitMargin: 1 },
}

export function generateState() {
	return {
		a: getRandomExponentialFloat({
			min: 1e-3,
			max: 1e3,
			randomSign: true,
			significantDigits: getRandomInteger(2, 3),
		}),
		b: getRandomExponentialFloat({
			min: 1e-2,
			max: 1e4,
			randomSign: true,
			significantDigits: getRandomInteger(2, 3),
		}),
	}
}

export function getCorrect({ a, b }) {
	return b.divide(a)
}

export function checkInput(state, { ans }) {
	return getCorrect(state).equals(ans, data.equalityOptions)
}

export const processAction = getSimpleExerciseProcessor(checkInput, data)
