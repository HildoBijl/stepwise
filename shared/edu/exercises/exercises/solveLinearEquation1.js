const { getRandomInteger, getRandomExponentialFloat } = require('../../../inputTypes')
const { getSimpleExerciseProcessor } = require('../../../eduTools')

const data = {
	skill: 'solveLinearEquation',
	comparison: { significantDigitMargin: 1 },
}

function generateState() {
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

function getSolution({ a, b }) {
	return b.divide(a)
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