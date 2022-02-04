const { getRandomInteger } = require('../../../inputTypes/Integer')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performComparison } = require('../util/check')

const { Vector } = require('../../../CAS/linearAlgebra')

const data = {
	skill: 'test',
	equalityOptions: {},
}

function generateState() {
	return {
		someParameter: new Vector([100, 200]),
	}
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
