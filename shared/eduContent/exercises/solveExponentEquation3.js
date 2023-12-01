const { getRandomFloat, getRandomExponentialFloat } = require('../../inputTypes')
const { getSimpleExerciseProcessor } = require('../../eduTools')

// a*x^c = b*x^d

const data = {
	skill: 'solveExponentEquation',
	comparison: { significantDigitMargin: 2 },
}

function generateState() {
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

function getSolution({ a, b, c, d }) {
	return b.divide(a).toPower(c.subtract(d).invert())
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