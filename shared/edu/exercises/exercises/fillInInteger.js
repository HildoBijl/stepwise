const { getRandomInteger } = require('../../../inputTypes/Integer')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const data = {
	skill: 'fillInInteger',
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
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
}