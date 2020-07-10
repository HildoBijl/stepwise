const { getRandomInteger } = require('../../util/random')
const { getSimpleExerciseProcessor } = require('../util/exercises')

const data = {
	// ToDo: add data on difficulty.
}

function generateState() {
	return {
		a: getRandomInteger(1,10),
		b: getRandomInteger(1,10),
		c: getRandomInteger(1,10),
		d: getRandomInteger(1,10),
	}
}

function checkInput({ a, b, c, d }, { ans }) {
	return a * b + c * d === ans
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput),
	checkInput,
}
