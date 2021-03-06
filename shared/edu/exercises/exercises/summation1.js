const { getRandomInteger } = require('../../../inputTypes/Integer')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const data = {
	skill: 'summation',
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
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
}