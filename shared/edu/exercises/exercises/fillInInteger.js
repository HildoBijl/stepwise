const { getRandomInteger } = require('../../../inputTypes/Integer')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { checkParameter } = require('../util/check')

const data = {
	skill: 'fillInInteger',
	equalityOptions: {},
}

function generateState() {
	return { x: getRandomInteger(-100, 100) }
}

function getSolution({ x }) {
	return { ans: x }
}

function checkInput(state, input) {
	return checkParameter('ans', getSolution(state), input, data.equalityOptions) // Basically returns whether state.ans === input.ans in a very convoluted but generalized way.
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
