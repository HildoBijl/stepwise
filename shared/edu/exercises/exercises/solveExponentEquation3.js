import { getRandomFloat, getRandomExponentialFloat } from '../../../inputTypes/Float'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'

// a*x^c = b*x^d

export const data = {
	skill: 'solveExponentEquation',
	equalityOptions: { significantDigitMargin: 2 },
}

export function generateState() {
	const x = getRandomExponentialFloat({
		min: 0.1,
		max: 10,
		prevent: 1,
	})
	const a = getRandomExponentialFloat({
		min: 0.1,
		max: 10,
		significantDigits: 2,
	})
	const c = getRandomFloat({
		min: -3,
		max: 3,
		decimals: 1,
		prevent: 0,
	})
	const d = getRandomFloat({
		min: -3,
		max: 3,
		decimals: 1,
		prevent: [0, c.number],
	})

	const b = a.multiply(x.toPower(c.subtract(d))).setSignificantDigits(2).roundToPrecision()

	return { a, b, c, d }
}

export function getCorrect({ a, b, c, d }) {
	return b.divide(a).toPower(c.subtract(d).invert())
}

export function checkInput(state, { ans }) {
	return getCorrect(state).equals(ans, data.equalityOptions)
}

export const processAction = getSimpleExerciseProcessor(checkInput, data)
