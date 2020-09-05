const { getRandomInteger } = require('../../../inputTypes/Integer')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

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