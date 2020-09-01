const { getRandomInteger } = require('../util/inputTypes/Integer')
const { getSimpleExerciseProcessor } = require('../util/exercises/simpleExercise')

const data = {
	skill: 'multiplication',
}

function generateState() {
	return {
		a: getRandomInteger(1,10),
		b: getRandomInteger(1,10),
	}
}

function checkInput({ a, b }, { ans }) {
	return a * b === ans
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
}