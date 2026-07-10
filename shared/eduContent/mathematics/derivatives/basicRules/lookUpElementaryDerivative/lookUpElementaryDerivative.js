const { sample } = require('@step-wise/utils')
const { expressionComparisons } = require('@step-wise/cas')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const { getRandomElementaryFunction } = require('../../tools')

const variableSet = ['x', 'y', 't']
const functionSet = ['f', 'g', 'h']

const metaData = {
	skill: 'lookUpElementaryDerivative',
	compare: { Expression: expressionComparisons.equivalent },
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

function checkInput(data) {
	return compare('derivative', data)
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })
