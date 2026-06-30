const { sample } = require('@step-wise/utils')
const { expressionComparisons } = require('@step-wise/cas')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

const { getRandomElementaryFunction } = require('../../tools')

const variableSet = ['x', 'y', 't']
const functionSet = ['f', 'g', 'h']

const metaData = {
	skill: 'lookUpElementaryDerivative',
	comparison: expressionComparisons.equivalent,
}

function generateState() {
	const func = getRandomElementaryFunction(true)
	const x = sample(variableSet)
	return {
		x,
		f: sample(functionSet),
		func: func.substitute('x', x),
	}
}

function getSolution(state) {
	return { ...state, derivative: state.func.getDerivative().combine() }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'derivative')
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })
