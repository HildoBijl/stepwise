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
			min: 1e-1,
			max: 1e2,
			randomSign: true,
			significantDigits: getRandomInteger(2, 3),
		}),
		b: getRandomExponentialFloat({
			min: 1e-1,
			max: 1e2,
			significantDigits: getRandomInteger(2, 3),
		}),
		c: getRandomExponentialFloat({
			min: 1e-1,
			max: 1e2,
			randomSign: true,
			significantDigits: getRandomInteger(2, 3),
		}),
		d: getRandomExponentialFloat({
			min: 1e-1,
			max: 1e2,
			significantDigits: getRandomInteger(2, 3),
		}),
	}
}

export function getCorrect({ a, b, c, d }) {
	return (c.multiply(d)).divide(a.multiply(b))
}

export function checkInput(state, { ans }) {
	return getCorrect(state).equals(ans, data.equalityOptions)
}

export default {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
