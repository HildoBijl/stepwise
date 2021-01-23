const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { checkParameter } = require('../util/check')

const data = {
	skill: 'calculateWithSpecificQuantities',
	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	const rho = getRandomFloatUnit({
		min: 0.4,
		max: 1.2,
		unit: 'kg/m^3',
		significantDigits: 2,
	})

	return { rho }
}

function getCorrect({ rho }) {
	const v = rho.invert()
	return { rho, v }
}

function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter('v', correct, input, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}