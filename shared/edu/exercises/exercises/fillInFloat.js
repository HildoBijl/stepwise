const { getRandomInteger } = require('../../../inputTypes/Integer')
const { getRandomFloat } = require('../../../inputTypes/Float')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const data = {
	skill: 'fillInFloat',
	equalityOptions: { significantDigitMargin: 0, relativeMargin: 0.0001 },
}

function generateState() {
	const power = getRandomInteger(-5, 7)
	const bounds = Math.pow(10, power)
	const significantDigits = getRandomInteger(2, 4)
	return { x: getRandomFloat({ min: -bounds, max: bounds, significantDigits }) }
}

function checkInput({ x }, { ans }) {
	return x.equals(ans, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
}