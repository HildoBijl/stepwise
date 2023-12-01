const { getRandomFloat } = require('../../inputTypes')
const { getSimpleExerciseProcessor } = require('../../eduTools')

const data = {
	skill: 'solveLinearEquation',
	comparison: { significantDigitMargin: 1 },
}

function generateState() {
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

function getSolution({ a, b, c, d, e }) {
	return (d.subtract(b)).divide(a.add(c).subtract(e))
}

function checkInput(state, { ans }) {
	return getSolution(state).equals(ans, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}