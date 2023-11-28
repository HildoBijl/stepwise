const { getRandomInteger, getRandomExponentialFloat } = require('../../../inputTypes')
const { getSimpleExerciseProcessor } = require('../../../eduTools')

const data = {
	skill: 'solveLinearEquation',
	comparison: { significantDigitMargin: 1 },
}

function generateState() {
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

function getSolution({ a, b, c, d }) {
	return (c.multiply(d)).divide(a.multiply(b))
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