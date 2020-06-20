const { getRandomInteger } = require('../../util/random')
const { getSimpleExerciseProcessor } = require('../util/exercises')

const data = {
	// ToDo: add data on difficulty.
}

function generateState() {
	return {
		a: getRandomInteger(1,10),
		b: getRandomInteger(1,10),
		c: getRandomInteger(1,100),
	}
}

function checkInput({ a, b, c }, { ans }) {
	return a * b + c === ans
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput),
}