import { getRandomFloat, getRandomExponentialFloat } from '../../../inputTypes/Float'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'

// a/x^p = b/c^p (=fraction)

export const data = {
	skill: 'solveExponentEquation',
	equalityOptions: { significantDigitMargin: 2 },
}

export function generateState() {
	const fraction = getRandomExponentialFloat({
		min: 0.1,
		max: 10,
	})
	const p = getRandomFloat({
		min: -3,
		max: 3,
		decimals: 1,
		prevent: 0,
	})
	const x = getRandomExponentialFloat({
		min: 0.1,
		max: 10,
		prevent: 1,
	})
	const c = getRandomExponentialFloat({
		min: 0.1,
		max: 10,
		significantDigits: 2,
	})

	const a = fraction.multiply(x.toPower(p)).setSignificantDigits(2).roundToPrecision()
	const b = fraction.multiply(c.toPower(p)).setSignificantDigits(2).roundToPrecision()

	return { a, b, c, p }
}

export function getCorrect({ a, b, c, p }) {
	return a.divide(b).toPower(p.invert()).multiply(c).setMinimumSignificantDigits(2)
}

export function checkInput(state, { ans }) {
	return getCorrect(state).equals(ans, data.equalityOptions)
}

export const processAction = getSimpleExerciseProcessor(checkInput, data)
