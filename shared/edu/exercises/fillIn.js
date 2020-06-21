const { getRandomInteger } = require('../../util/random')
const { getSimpleExerciseProcessor, getSimpleExerciseFeedbackFunction } = require('../util/exercises')

const data = {
	// ToDo: add data on difficulty.
}

function generateState() {
	return { x: getRandomInteger(1, 10) }
}

function checkInput({ x }, { ans }) {
	return x === ans
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput),
	getFeedback: getSimpleExerciseFeedbackFunction(checkInput),
}