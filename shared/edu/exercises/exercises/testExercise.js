const { getRandomInteger } = require('../../../inputTypes/Integer')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performComparison } = require('../util/check')

const { Vector } = require('../../../CAS/linearAlgebra')
const { asExpression, asEquation } = require('../../../CAS')

const data = {
	skill: 'test',
	equalityOptions: {},
}

function generateState() {
	const eq = asEquation('2x=5sin(y)')
	const ex = asExpression('cos(z)')
	return {
		someParameter: new Vector([100, 200]),
		someExpression: ex,
		someEquation: eq,
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
