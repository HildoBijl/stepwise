const { getRandomInteger } = require('../../../inputTypes/Integer')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const data = {
	skill: 'recognizeProcessTypes',
}

function generateState() {
	return {
		type: getRandomInteger(0, 4),
	}
}

function checkInput({ type }, { ans }) {
	return type === ans
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
}