const { selectRandomly, getRandomBoolean, getRandomInteger } = require('../../../../../util')
const { Sum, Product, Fraction, expressionComparisons } = require('../../../../../CAS')
const { getSimpleExerciseProcessor, selectRandomVariables, filterVariables, performComparison } = require('../../../../../eduTools')

// az(x+y)/(x+y) or (x+y)/(az(x+y)).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a']

const metaData = {
	skill: 'addRemoveFractionFactors',
	comparison: expressionComparisons.onlyOrderChanges,
}

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: getRandomInteger(2, 12),
		front: getRandomBoolean(),
		upper: getRandomBoolean(),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const { a, x, y, z } = variables
	const sum = new Sum(x, y)
	const term = new Product(a, z)
	const product = new Product(state.front ? [term, sum] : [sum, term])
	const expression = new Fraction(...(state.upper ? [product, sum] : [sum, product]))
	const ans = expression.regularClean()
	return { ...state, variables, sum, term, product, expression, ans }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
