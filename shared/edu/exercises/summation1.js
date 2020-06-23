const { getRandomInteger } = require('../../util/random')
const { getSimpleExerciseProcessor, getSimpleExerciseFeedbackFunction } = require('../util/exercises')

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