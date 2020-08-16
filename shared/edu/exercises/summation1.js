const { getRandomInteger } = require('../util/inputTypes/Integer')
const { getSimpleExerciseProcessor } = require('../util/exercises/simpleExercise')

const data = {
	// ToDo: add data on difficulty.
}

function generateState() {
	return {
		a: getRandomInteger(1,100),
		b: getRandomInteger(1,100),
	}
}

function checkInput({ a, b }, { ans }) {
	return a + b === ans
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput),
	checkInput,
}