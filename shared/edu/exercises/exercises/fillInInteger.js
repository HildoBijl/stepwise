const { getRandomInteger } = require('../../../inputTypes/Integer')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const data = {
	skill: 'fillInInteger',
}

function generateState() {
	return { x: getRandomInteger({ min: -100, max: 100 }) }
}

function checkInput({ x }, { ans }) {
	return x.number === ans.number
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
}