const { getRandomInteger } = require('../../util/random')
const { getSimpleExerciseProcessor } = require('../util/exercises')

const data = {
	// ToDo: add data on difficulty.
}

function generateState() {
	const a = getRandomInteger(1,10)
	const x = getRandomInteger(1,10)
	return {
		a,
		b: a*x,
	}
}

function checkInput({ a, b }, { x }) {
	return a * x === b
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput),
}