const { getRandomInteger } = require('../../util/random')
const { getSimpleExerciseProcessor } = require('../util/exercises/simpleExercise')

const data = {
	// ToDo: add data on difficulty.
}

function generateState() {
	return { x: getRandomInteger(-100, 100) }
}

function checkInput({ x }, { ans }) {
	return x === ans
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput),
	checkInput,
}