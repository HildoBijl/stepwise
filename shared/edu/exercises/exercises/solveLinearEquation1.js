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
			min: 1e-3,
			max: 1e3,
			randomSign: true,
			significantDigits: getRandomInteger(2, 4),
		}),
		b: getRandomExponentialFloat({
			min: 1e-2,
			max: 1e4,
			randomSign: true,
			significantDigits: getRandomInteger(2, 4),
		}),
	}
}

function getCorrect({ a, b }) {
	return b.divide(a)
}

function checkInput(state, { ans }) {
	return getCorrect(state).equals(ans, { ...data.equalityOptions })
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}