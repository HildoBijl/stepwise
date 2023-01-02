const { selectRandomly } = require('../../../util/random')
const { expressionComparisons } = require('../../../CAS')

const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performComparison } = require('../util/comparison')

const { getRandomElementaryFunction } = require('./support/derivatives')

const { equivalent } = expressionComparisons

const variableSet = ['x', 'y', 't']
const functionSet = ['f', 'g', 'h']

const data = {
	skill: 'lookUpElementaryDerivative',
	comparison: equivalent,
}

function generateState() {
	const func = getRandomElementaryFunction(true)
	const x = selectRandomly(variableSet)
	return {
		f: selectRandomly(functionSet),
		func: func.substitute('x', x),
	}
}

function getSolution(state) {
	const x = state.func.getVariables()[0]
	return { ...state, x, derivative: state.func.getDerivative().advancedClean() }
}

function checkInput(state, input) {
	return performComparison('derivative', input, getSolution(state), data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}
