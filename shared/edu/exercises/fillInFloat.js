const { getRandomInteger } = require('../util/inputTypes/Integer')
const { getRandomFloat } = require('../util/inputTypes/Float')
const { getSimpleExerciseProcessor } = require('../util/exercises/simpleExercise')

const data = {
	// ToDo: add data on difficulty.
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
	processAction: getSimpleExerciseProcessor(checkInput),
	checkInput,
}