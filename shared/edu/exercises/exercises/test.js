const { getRandomInteger } = require('../../../inputTypes/Integer')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performComparison } = require('../util/check')

const data = {
	skill: 'test',
	equalityOptions: {},
}

function generateState() {
	return {}
}

function getSolution({ }) {
	return {}
}

function checkInput(state, input) {
	console.log(state)
	console.log(input)
	return false
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
