import { Float, getRandomFloat } from '../../../inputTypes/Float'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'

export const data = {
	skill: 'solveLinearEquation',
	equalityOptions: { significantDigitMargin: 1 },
}

export function generateState() {
	const state = {
		a: getRandomFloat({
			min: -30,
			max: 30,
			significantDigits: 2,
		}),
		b: getRandomFloat({
			min: -30,
			max: 30,
			significantDigits: 2,
		}),
		c: getRandomFloat({
			min: -30,
			max: 30,
			significantDigits: 2,
		}),
		d: getRandomFloat({
			min: -30,
			max: 30,
			significantDigits: 2,
		}),
		e: getRandomFloat({
			min: -30,
			max: 30,
			significantDigits: 2,
		}),
	}

	if (state.a.add(state.c).subtract(state.e).number === 0) // Invalid?
		return generateState() // Redo
	return state
}

export function getCorrect({ a, b, c, d, e }) {
	return (d.subtract(b)).divide(a.add(c).subtract(e))
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
