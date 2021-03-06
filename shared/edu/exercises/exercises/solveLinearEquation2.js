const { getRandomInteger } = require('../../../inputTypes/Integer')
const { getRandomExponentialFloat } = require('../../../inputTypes/Float')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const data = {
	skill: 'solveLinearEquation',
	equalityOptions: { significantDigitMargin: 1 },
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

function getCorrect({ a, b, c, d }) {
	return (c.multiply(d)).divide(a.multiply(b))
}

function checkInput(state, { ans }) {
	return getCorrect(state).equals(ans, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}