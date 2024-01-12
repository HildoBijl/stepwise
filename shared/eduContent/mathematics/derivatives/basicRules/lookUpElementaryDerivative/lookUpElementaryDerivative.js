const { selectRandomly } = require('../../../../../util')
const { expressionComparisons } = require('../../../../../CAS')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../eduTools')

const { getRandomElementaryFunction } = require('../../tools')

const variableSet = ['x', 'y', 't']
const functionSet = ['f', 'g', 'h']

const metaData = {
	skill: 'lookUpElementaryDerivative',
	comparison: expressionComparisons.equivalent,
}

function generateState() {
	const func = getRandomElementaryFunction(true)
	const x = selectRandomly(variableSet)
	return {
		x,
		f: selectRandomly(functionSet),
		func: func.substitute('x', x),
	}
}

function getSolution(state) {
	return { ...state, derivative: state.func.getDerivative().regularClean() }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'derivative')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
