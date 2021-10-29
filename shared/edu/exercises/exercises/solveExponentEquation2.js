import { getRandomFloat, getRandomExponentialFloat } from '../../../inputTypes/Float'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'

// a + b*x^p = c

export const data = {
	skill: 'solveExponentEquation',
	equalityOptions: { significantDigitMargin: 2 },
}

export function generateState() {
	const a = getRandomFloat({
		min: -20,
		max: 20,
		significantDigits: 2,
		prevent: 0,
	})
	const c = getRandomFloat({
		min: -20,
		max: 20,
		significantDigits: 2,
		prevent: [0, a.number],
	})
	const x = getRandomExponentialFloat({
		min: 0.2,
		max: 40,
		prevent: 1,
	})
	const p = getRandomFloat({
		min: -3,
		max: 3,
		significantDigits: 2,
		prevent: 0,
	})

	const b = c.subtract(a).divide(x.toPower(p)).setSignificantDigits(2).roundToPrecision()

	return { a, b, p, c }
}

export function getCorrect({ a, b, p, c }) {
	return c.subtract(a).divide(b).toPower(p.invert())
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
